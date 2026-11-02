import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { z } from 'zod';

type Video = { title: string; path: string };

const reportPath = process.env['PLAYWRIGHT_JSON_OUTPUT_NAME'] ?? 'test-results/report.json';

async function upload(path: string): Promise<string> {
  const bytes = await readFile(path);

  for (let attempt = 0; attempt < 3; attempt++) {
    const body = new FormData();
    body.append('file', new Blob([bytes], { type: 'video/webm' }), basename(path));

    try {
      const response = await fetch('https://x0.at', { method: 'POST', body });
      const url = (await response.text()).trim();

      if (response.ok && url.startsWith('https://')) return url;
    } catch {
      // retry
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error(`Could not publish ${path}`);
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

for (const video of new Map(videos.map((item) => [item.title, item])).values()) {
  const url = await upload(video.path);
  console.log(`- [${video.title}](${url})`);
}
