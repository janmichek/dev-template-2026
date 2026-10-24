import { z } from 'zod';

// wires what the API sends and frontend can trust.
// types are derived from the schemas, so they can't drift.
// `bun run api:generate` turns these into shared/openapi.json and the typed client.
const avatarColorSchema = z.enum(['gray', 'orange', 'iris', 'blue', 'teal']);

export const carSchema = z.object({
  id: z.number(),
  make: z.string(),
  model: z.string(),
  year: z.number(),
  mileageKm: z.number(),
  priceUsd: z.number(),
  status: z.enum(['available', 'reserved', 'sold']),
  listedAt: z.iso.datetime(),
});

export const makeSchema = z.object({
  code: z.string(),
  name: z.string(),
  symbol: z.string(),
  color: avatarColorSchema,
});

export type Car = z.infer<typeof carSchema>;
export type Make = z.infer<typeof makeSchema>;
