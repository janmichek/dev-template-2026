import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { router } from './routes';

// Reference data rarely changes; without staleTime every route switch refetches
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000 } },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
