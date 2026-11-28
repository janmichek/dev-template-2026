import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { agentDocuments, contextFindings, repoPathExists } from './agent-context';

const indexSource = readFileSync(join(process.cwd(), 'src/shared/api/index.ts'), 'utf8');
const findings = contextFindings(agentDocuments(), indexSource, repoPathExists);

if (findings.length > 0) {
  for (const finding of findings) console.error(finding);
  process.exit(1);
}

console.log('Agent context matches the repo.');
