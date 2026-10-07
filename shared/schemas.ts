import { z } from 'zod';

// wires what the API sends and frontend can trust.
// types are derived from the schemas, so they can't drift
export const avatarColorSchema = z.enum([
  'gray',
  'amber',
  'orange',
  'iris',
  'blue',
  'teal',
  'purple',
  'indigo',
]);

export const transactionSchema = z.object({
  id: z.number(),
  date: z.iso.datetime(),
  type: z.enum(['deposit', 'withdrawal', 'transfer']),
  from: z.string(),
  to: z.string(),
  amount: z.number(),
  currency: z.string(),
  valueUsd: z.number(),
});

export const currencySchema = z.object({
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

export type Transaction = z.infer<typeof transactionSchema>;
export type Currency = z.infer<typeof currencySchema>;
export type Country = z.infer<typeof countrySchema>;
