import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function items(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function videoPath(test: Record<string, unknown>): string | undefined {
  const attachments = items(test['results']).flatMap((result) => items(result['attachments']));
  const video = attachments.find((attachment) => attachment['name'] === 'video');
  return typeof video?.['path'] === 'string' ? video['path'] : undefined;
}

function collect(node: unknown, videos: Video[]): void {
  if (!isRecord(node)) return;
  for (const spec of items(node['specs'])) {
    const title = spec['title'];
    if (typeof title !== 'string') continue;
    for (const test of items(spec['tests'])) {
      const path = videoPath(test);
      if (path) videos.push({ title, path });
    }
  }
  for (const suite of items(node['suites'])) collect(suite, videos);
}

const report: unknown = JSON.parse(await readFile(reportPath, 'utf8'));
const videos: Video[] = [];
collect(report, videos);

for (const video of new Map(videos.map((item) => [item.title, item])).values()) {
  const url = await upload(video.path);
  console.log(`- [${video.title}](${url})`);
}
