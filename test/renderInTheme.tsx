import { Theme } from '@radix-ui/themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { afterEach } from 'vitest';
import { stubApi } from './stubApi';

// vitest globals are off, so RTL can't register its own cleanup.
// registered here so every test file that renders also unmounts
afterEach(cleanup);

// Mirrors App.tsx wrappers; fetch serves mocked data (makes, countries).
export function renderInTheme(ui: ReactElement) {
  stubApi();
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <Theme>
      <QueryClientProvider client={client}>{ui}</QueryClientProvider>
    </Theme>
  );
}
