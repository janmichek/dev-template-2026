import { Heading } from '@radix-ui/themes';
import type { ReactNode } from 'react';

export function PageHeading({ children }: { children: ReactNode }) {
  return (
    <Heading as="h1" size="7" my="4">
      {children}
    </Heading>
  );
}
