import type { Car, Make } from '@shared/schemas';

// oxfmt-ignore
export const cars: Car[] = [
  { id: 1, make: 'TOY', model: 'Corolla', year: 2019, mileageKm: 64000, priceUsd: 14500, status: 'sold', listedAt: '2025-01-06T09:14:00Z' },
  { id: 2, make: 'BMW', model: '320i', year: 2018, mileageKm: 88000, priceUsd: 17900, status: 'sold', listedAt: '2025-02-03T11:47:00Z' },
  { id: 3, make: 'TES', model: 'Model 3', year: 2021, mileageKm: 41000, priceUsd: 26900, status: 'available', listedAt: '2025-03-19T13:05:00Z' },
  { id: 4, make: 'HON', model: 'Civic', year: 2020, mileageKm: 52000, priceUsd: 16800, status: 'reserved', listedAt: '2025-04-07T07:58:00Z' },
  { id: 5, make: 'FOR', model: 'Focus', year: 2017, mileageKm: 112000, priceUsd: 8900, status: 'available', listedAt: '2025-05-09T10:11:00Z' },
  { id: 6, make: 'TOY', model: 'RAV4', year: 2022, mileageKm: 23000, priceUsd: 29500, status: 'available', listedAt: '2025-06-12T12:26:00Z' },
  { id: 7, make: 'BMW', model: 'X3', year: 2020, mileageKm: 58000, priceUsd: 31200, status: 'sold', listedAt: '2025-07-15T09:51:00Z' },
  { id: 8, make: 'TES', model: 'Model Y', year: 2023, mileageKm: 12000, priceUsd: 38400, status: 'reserved', listedAt: '2025-09-25T17:20:00Z' },
  { id: 9, make: 'HON', model: 'CR-V', year: 2019, mileageKm: 71000, priceUsd: 21300, status: 'available', listedAt: '2025-11-02T20:48:00Z' },
  { id: 10, make: 'FOR', model: 'Mustang', year: 2016, mileageKm: 95000, priceUsd: 19700, status: 'sold', listedAt: '2026-01-09T10:27:00Z' },
  { id: 11, make: 'TOY', model: 'Yaris', year: 2021, mileageKm: 34000, priceUsd: 13200, status: 'available', listedAt: '2026-02-11T16:41:00Z' },
  { id: 12, make: 'BMW', model: 'i4', year: 2024, mileageKm: 8000, priceUsd: 47800, status: 'available', listedAt: '2026-03-18T10:52:00Z' },
];

// oxfmt-ignore
export const makes: Make[] = [
  { code: 'TOY', name: 'Toyota', symbol: 'T', color: 'orange' },
  { code: 'BMW', name: 'BMW', symbol: 'B', color: 'iris' },
  { code: 'TES', name: 'Tesla', symbol: '⚡', color: 'teal' },
  { code: 'HON', name: 'Honda', symbol: 'H', color: 'blue' },
  { code: 'FOR', name: 'Ford', symbol: 'F', color: 'gray' },
];
