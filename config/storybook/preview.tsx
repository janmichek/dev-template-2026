import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Preview } from '@storybook/react-vite';
import { makes } from '../../server/data';
import { makeQueries } from '../../src/entities/make';

// no API in a static Storybook build (Chromatic), so the cache is seeded and never refetched
const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity } } });
queryClient.setQueryData(makeQueries.list().queryKey, makes);

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
