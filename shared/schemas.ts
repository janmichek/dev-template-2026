import { z } from 'zod';

// wires what the API sends and frontend can trust.
// types are derived from the schemas, so they can't drift.
// `bun run api:generate` turns these into shared/openapi.json and the typed client.
const avatarColorSchema = z.enum([
  'gray',
  'amber',
  'orange',
  'iris',
  'blue',
  'teal',
  'purple',
  'indigo',
]);

export const carSchema = z.object({
  id: z.number(),
  date: z.iso.datetime(),
  type: z.enum(['acquired', 'sold', 'moved']),
  from: z.string(),
  to: z.string(),
  amount: z.number(),
  make: z.string(),
  valueUsd: z.number(),
});

export const makeSchema = z.object({
  code: z.string(),
  name: z.string(),
  symbol: z.string(),
  color: avatarColorSchema,
});

export const countrySchema = z.object({
  code: z.string(),
  name: z.string(),
  flag: z.string(),
  tax: z.object({
    capitalGainsTax: z.number(),
    holdingPeriodMonths: z.number().nullable(),
  }),
});

export type Car = z.infer<typeof carSchema>;
export type Make = z.infer<typeof makeSchema>;
export type Country = z.infer<typeof countrySchema>;
