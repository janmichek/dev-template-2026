import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Preview } from '@storybook/react-vite';
import { makes } from '../../server/data';
import { makeQueries } from '../../src/entities/make';
import '../../src/index.css';

// no API in a static Storybook build (Chromatic), so the cache is seeded and never refetched
const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity } } });

queryClient.setQueryData(makeQueries.list().queryKey, makes);

const preview: Preview = {
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
};

export default preview;
