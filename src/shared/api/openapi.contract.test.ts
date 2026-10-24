import { expect, test } from 'vitest';
import type { Car, Make } from '@shared/schemas';
import type { operations } from './schema';

/* oxlint-disable typescript/no-unnecessary-type-parameters -- equality probe uses the parameter once, by position */
type Equal<Left, Right> =
  (<T>() => T extends Left ? 1 : 2) extends <T>() => T extends Right ? 1 : 2 ? true : false;
/* oxlint-enable typescript/no-unnecessary-type-parameters */

type Expect<T extends true> = T;
type ExpectFalse<T extends false> = T;

type Json200<Operation> = Operation extends {
  responses: { 200: { content: { 'application/json': infer Body } } };
}
  ? Body
  : never;

const carsMatch: Expect<Equal<Json200<operations['listCars']>, Car[]>> = true;
const makesMatch: Expect<Equal<Json200<operations['listMakes']>, Make[]>> = true;
const reserveMatch: Expect<Equal<Json200<operations['reserveCar']>, Car>> = true;

const stringIsNotNumber: ExpectFalse<Equal<string, number>> = false;

test('generated OpenAPI types match the Zod schemas', () => {
  expect(carsMatch).toBe(true);
  expect(makesMatch).toBe(true);
  expect(reserveMatch).toBe(true);
  expect(stringIsNotNumber).toBe(false);
});
