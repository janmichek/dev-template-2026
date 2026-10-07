import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Preview } from '@storybook/react-vite';
import { countries, currencies } from '@fixtures/data';
import { countryQueries } from '../src/features/countries';
import { currencyQueries } from '../src/features/currencies';

// no API in a static Storybook build (Chromatic), so the cache is seeded and never refetched
const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity } } });
queryClient.setQueryData(countryQueries.list().queryKey, countries);
queryClient.setQueryData(currencyQueries.list().queryKey, currencies);

// same wrapper as App.tsx, so a story looks like the component does in the app
const preview: Preview = {
  decorators: [
    (Story) => (
      <Theme>
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      </Theme>
    ),
  ],
};

export default preview;
