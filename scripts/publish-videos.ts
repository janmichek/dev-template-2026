import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { z } from 'zod';

type Video = { title: string; path: string };

type Host = { name: string; endpoint: string };

// x0.at is the primary host; temp.sh takes over when it is down or refuses a runner.
const hosts: Host[] = [
  { name: 'x0.at', endpoint: 'https://x0.at' },
  { name: 'temp.sh', endpoint: 'https://temp.sh/upload' },
];

const attemptsPerHost = 2;
const retryDelayMs = 2000;

const reportPath = process.env['PLAYWRIGHT_JSON_OUTPUT_NAME'] ?? 'test-results/report.json';

async function send(
  host: Host,
  bytes: Uint8Array<ArrayBuffer>,
  filename: string
): Promise<string | undefined> {
  const payload = new FormData();
  payload.append('file', new Blob([bytes], { type: 'video/webm' }), filename);

  const response = await fetch(host.endpoint, { method: 'POST', body: payload });
  const answer = (await response.text()).trim();

  if (response.ok && answer.startsWith('https://')) return answer;

  console.error(
    `${host.name} rejected ${filename}: HTTP ${response.status} ${answer.slice(0, 200)}`
  );

  return undefined;
}

async function tryHost(
  host: Host,
  bytes: Uint8Array<ArrayBuffer>,
  filename: string
): Promise<string | undefined> {
  try {
    return await send(host, bytes, filename);
  } catch (error) {
    console.error(`${host.name} failed ${filename}: ${String(error)}`);

    return undefined;
  }
}

async function uploadTo(
  host: Host,
  bytes: Uint8Array<ArrayBuffer>,
  filename: string
): Promise<string | undefined> {
  for (let attempt = 1; attempt <= attemptsPerHost; attempt++) {
    const url = await tryHost(host, bytes, filename);

    if (url !== undefined) return url;

    if (attempt < attemptsPerHost) {
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs * attempt));
    }
  }

  return undefined;
}

// Videos are evidence for the preview comment, not a gate: a host outage costs
// the links, never the job. Every miss is logged so the failure stays visible.
async function upload(path: string): Promise<string | undefined> {
  const bytes = new Uint8Array(await readFile(path));
  const filename = basename(path);

  for (const host of hosts) {
    const url = await uploadTo(host, bytes, filename);

    if (url !== undefined) return url;
  }

  return undefined;
}

// The Playwright JSON report is an external contract, so it is parsed before use.
const attachmentSchema = z.object({ name: z.string(), path: z.string() });

const testSchema = z.object({
  results: z.array(z.object({ attachments: z.array(attachmentSchema) })).default([]),
});

type Test = z.infer<typeof testSchema>;

const specSchema = z.object({
  title: z.string(),
  tests: z.array(testSchema).default([]),
});

type Spec = z.infer<typeof specSchema>;

type Suite = { specs: Spec[]; suites: Suite[] };

const suiteSchema: z.ZodType<Suite> = z.object({
  specs: z.array(specSchema).default([]),
  suites: z.array(z.lazy(() => suiteSchema)).default([]),
});

const reportSchema = z.object({ suites: z.array(suiteSchema).default([]) });

function videoPath(test: Test): string | undefined {
  for (const result of test.results) {
    const video = result.attachments.find((attachment) => attachment.name === 'video');

    if (video !== undefined) return video.path;
  }

  return undefined;
}

function collectSuite(suite: Suite, videos: Video[]): void {
  for (const spec of suite.specs) {
    for (const test of spec.tests) {
      const path = videoPath(test);

      if (path !== undefined) videos.push({ title: spec.title, path });
    }
  }

  for (const child of suite.suites) collectSuite(child, videos);
}

const report = reportSchema.parse(JSON.parse(await readFile(reportPath, 'utf8')));
const videos: Video[] = [];

report.suites.forEach((suite) => collectSuite(suite, videos));

const unpublished: string[] = [];

for (const video of new Map(videos.map((item) => [item.title, item])).values()) {
  const url = await upload(video.path);

  if (url === undefined) {
    unpublished.push(video.title);
    continue;
  }

  console.log(`- [${video.title}](${url})`);
}

if (unpublished.length > 0) {
  console.error(
    `::warning::Could not publish ${unpublished.length} video(s): ${unpublished.join(', ')}`
  );
}
