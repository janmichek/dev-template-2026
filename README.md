# Koinly - Staff Frontend Take-Home

Architectural skeleton for a crypto-tax frontend.

See [ASSIGNMENT.md](./ASSIGNMENT.md) for the brief, [ARCHITECTURE.md](./ARCHITECTURE.md) for decisions.

## Prerequisite:

Docker

## Run

Open Docker

```sh
npm run dev
```

Open http://localhost:3001 - one container serves API + UI

## Scripts

Local development only, needs [Bun](https://bun.sh).

```sh
bun run typecheck  # tsc
bun run lint       # oxlint
bun run fmt        # oxfmt
bun run test:unit  # vitest
bun run test:e2e   # playwright
bun run storybook  # :6006
```

`cp .env.example .env` only needed for Sentry / Chromatic tokens - app runs without them.
