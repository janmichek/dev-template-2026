import { Theme } from '@radix-ui/themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { router } from './routes';

// Reference data rarely changes; without staleTime every route switch refetches
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000 } },
});

export function App() {
  return (
    // tanstack query wrapper
    <QueryClientProvider client={queryClient}>
      <Theme appearance="dark" accentColor="iris" grayColor="slate">
        <RouterProvider router={router} />
      </Theme>
    </QueryClientProvider>
  );
}
