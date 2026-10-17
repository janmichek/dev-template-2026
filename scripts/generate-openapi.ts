import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { countrySchema, currencySchema, transactionSchema } from '../shared/schemas';

const root = fileURLToPath(new URL('..', import.meta.url));

function responseSchema(schema: z.ZodType) {
  const generated: Record<string, unknown> = { ...z.toJSONSchema(schema) };
  delete generated['$schema'];
  return generated;
}

function ok(description: string, schema: z.ZodType) {
  return {
    description,
    content: { 'application/json': { schema: responseSchema(schema) } },
  };
}

const document = {
  openapi: '3.1.0',
  info: { title: 'Koinly stub API', version: '0.1.0' },
  paths: {
    '/api/transactions': {
      get: {
        operationId: 'listTransactions',
        responses: { 200: ok('Transactions', z.array(transactionSchema)) },
      },
    },
    '/api/currencies': {
      get: {
        operationId: 'listCurrencies',
        responses: { 200: ok('Currencies', z.array(currencySchema)) },
      },
    },
    '/api/countries': {
      get: {
        operationId: 'listCountries',
        responses: { 200: ok('Countries', z.array(countrySchema)) },
      },
    },
  },
};

const openapiPath = fileURLToPath(new URL('../shared/openapi.json', import.meta.url));
const schemaPath = fileURLToPath(new URL('../src/shared/api/schema.d.ts', import.meta.url));

writeFileSync(openapiPath, `${JSON.stringify(document, null, 2)}\n`);

execFileSync(
  fileURLToPath(new URL('../node_modules/.bin/openapi-typescript', import.meta.url)),
  [openapiPath, '-o', schemaPath],
  {
    cwd: root,
    stdio: 'inherit',
  }
);
