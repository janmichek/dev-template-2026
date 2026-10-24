import { Container, Flex } from '@radix-ui/themes';
import { Link, Outlet } from '@tanstack/react-router';

// Radix Themes props accept strings, no Tailwind needed in this case
const activeStyle = { textDecoration: 'underline' };
const inactiveStyle = { textDecoration: 'none' };

export function Layout() {
  return (
    <Container size="4" px="4">
      <Flex asChild gap="5" py="3">
        <nav>
          <Link
            to="/"
            activeOptions={{ exact: true }}
            activeProps={{ style: activeStyle }}
            inactiveProps={{ style: inactiveStyle }}
          >
            Dashboard
          </Link>
          <Link
            to="/cars/{-$carId}"
            activeProps={{ style: activeStyle }}
            inactiveProps={{ style: inactiveStyle }}
          >
            Cars
          </Link>
        </nav>
      </Flex>
      <Outlet />
    </Container>
  );
}
