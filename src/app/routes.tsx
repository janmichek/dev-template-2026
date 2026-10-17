import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { DashboardPage } from '../pages/dashboard';
import { SettingsPage } from '../pages/settings';
import { TransactionsPage } from '../pages/transactions';
import { Layout } from './Layout';

const rootRoute = createRootRoute({ component: Layout });

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
});

const transactionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/transactions/{-$txId}',
  component: TransactionsPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
});

export const router = createRouter({
  routeTree: rootRoute.addChildren([dashboardRoute, transactionsRoute, settingsRoute]),
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
