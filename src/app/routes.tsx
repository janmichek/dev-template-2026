import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { DashboardPage } from '../pages/dashboard';
import { SettingsPage } from '../pages/settings';
import { CarsPage } from '../pages/cars';
import { Layout } from './Layout';

const rootRoute = createRootRoute({ component: Layout });

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
});

const carsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cars/{-$carId}',
  component: CarsPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
});

export const router = createRouter({
  routeTree: rootRoute.addChildren([dashboardRoute, carsRoute, settingsRoute]),
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
