import { Link, Outlet } from '@tanstack/react-router';

export function Layout() {
  return (
    <div className="container">
      <nav className="nav" aria-label="Primary">
        <Link
          to="/"
          className="nav__link"
          activeOptions={{ exact: true }}
          activeProps={{ className: 'nav__link nav__link--active' }}
        >
          Dashboard
        </Link>
        <Link
          to="/cars/{-$carId}"
          className="nav__link"
          activeProps={{ className: 'nav__link nav__link--active' }}
        >
          Cars
        </Link>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
