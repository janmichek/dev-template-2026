## Architecture Write-Up

A reduced Feature-Sliced Design: layers ordered by responsibility, `app → pages → features → shared`.
A layer may only import from layers below it. Features never import each other - a page composes them.

**Why these layers**

- One import direction - a change in a feature cannot break `shared` or a sibling feature.
- `features` are slices by product (`transactions`, `currencies`, `countries`), each behind an `index.ts`.
- Features ignore routing. URL params and cross-feature composition live in `pages`.
- `app` holds what exists once: providers, router. Nothing imports it.
- Root `shared/` (contract) is outside `src/` because the server imports it too. Types are derived from the Zod schemas, so server and frontend cannot drift.

**Project structure**

- [`server/`](./server/) - Hono stub. Validates via contract.
- [`fixtures/`](./fixtures/) - Stub records. Server, tests, and Storybook import these. Product code does not.
- [`shared/`](./shared/) - Zod API schemas (zod only). Imported by both sides.
- [`src/shared/`](./src/shared/) - Frontend helpers: [`api/`](./src/shared/api/) + `ui/` primitives.
- [`src/app`](./src/app/) - Providers, routes, shell. Mounted from the entry [`src/index.tsx`](./src/index.tsx#L6).
- [`src/pages`](./src/pages/) - Per-route composition: URL state + features ([`TransactionsPage.tsx`](./src/pages/TransactionsPage.tsx#L10-L32)).
- [`src/features`](./src/features/) - Product slices: `api/` + `ui/`, public via `index.ts`.
- Each `index.ts` exports: query factory, hook, and UI. Add a `lib/` only when a page needs a pure function like in ([`transactions/index.ts`](./src/features/transactions/index.ts)).
- `src/features/<slice>/`: `api/` (query factories + hooks, built on [`src/shared/api`](./src/shared/api/client.ts)), `ui/` (components), optional `lib/`.
- Data flow via TanStack Query ([`App.tsx`](./src/app/App.tsx#L14)) and TanStack Router ([`routes.tsx`](./src/app/routes.tsx#L15)).
- Boundary enforcement in oxlint (`app → pages → features → shared`, `shared` imports nothing above it) - [`.oxlintrc.json`](./.oxlintrc.json#L99).

- New screen → `pages/` + route. New behaviour → `features/`. Shared generic → `shared/`. New endpoint → schema in `shared/` ([`shared/schemas.ts`](./shared/schemas.ts#L16)).

**API layer**

- App fetches from a mock Hono server [`server/index.ts`](./server/index.ts#L7-L12). Frontend data is cached with TanStack Query (60s `staleTime`, [`App.tsx`](./src/app/App.tsx#L6-L9)) via [`transactionQueries.ts`](./src/features/transactions/api/transactionQueries.ts#L6-L13) + [`useTransactions.ts`](./src/features/transactions/api/useTransactions.ts#L6-L8).
- Zod schema [`shared/schemas.ts`](./shared/schemas.ts#L16-L25) is the single source of truth for API and FE types.
- Stub records live in [`fixtures/data.ts`](./fixtures/data.ts#L4-L37), validated on the way out in [`server/index.ts`](./server/index.ts#L10-L12).

**Routing**

- TanStack Router in [`src/app/routes.tsx`](./src/app/routes.tsx#L15-L19). On `/transactions`, opening `/transactions/{-$txId}` expands the matching detail row on load. The page reads the param ([`TransactionsPage.tsx`](./src/pages/TransactionsPage.tsx#L10)) and passes it to the table as a prop.
- Per-feature route splitting - no split yet by design; central tree lives in [`routes.tsx`](./src/app/routes.tsx#L27-L29). Split out if a subpage outgrows the shared router.

**UI foundation**

- Radix Themes, props-based styling in [`Layout.tsx`](./src/app/Layout.tsx#L10-L11)
- Primitives: e.g. [`PageHeading.tsx`](./src/shared/ui/PageHeading.tsx#L4-L10) - thin wrappers over @radix-ui/themes.
- Product: `src/features/<slice>/ui/*` (e.g. [`TransactionsTable.tsx`](./src/features/transactions/ui/TransactionsTable.tsx#L14)).

## What stops the structure from eroding as the codebase grows

- Feature/page/shared separation with enforced boundaries [`.oxlintrc.json`](./.oxlintrc.json#L99-L173).
- TypeScript - [`tsconfig.json`](./tsconfig.json#L3-L10) - catches type errors at compile time.
- Oxlint - [`.oxlintrc.json`](./.oxlintrc.json#L19-L61) - extra rules for TS and React, plus [boundaries](./.oxlintrc.json#L99-L126).
- Oxfmt - [`.oxfmtrc.json`](./.oxfmtrc.json#L1-L5) - auto-formats code.
- Vitest - [`vite.config.ts`](./vite.config.ts#L16-L22) - unit tests for components and logic.
- Playwright - [`playwright.config.ts`](./playwright.config.ts#L3-L9) - end-to-end UI tests, `*.spec.ts` next to their page ([`TransactionsPage.spec.ts`](./src/pages/TransactionsPage.spec.ts)).
- Storybook - [`.storybook/main.ts`](./.storybook/main.ts#L4-L10) - UI component library.
- Chromatic - [`.github/workflows/chromatic.yml`](./.github/workflows/chromatic.yml#L13-L24) - visual regression testing (in CI).
- Sentry - [`src/index.tsx`](./src/index.tsx#L8-L12) - error tracking.
- Zod - [`shared/schemas.ts`](./shared/schemas.ts#L1) - schema validation, keeps API and UI in sync.

## What was deliberately skipped and what to add next

- FSD `widgets` and `entities` are left out - at this size they would be empty folders. Add `entities` when two features need the same domain model.
- Tailwind - skipped, Radix covers styling .
- TanStack DevTools - for data-flow inspection.
- wagmi + viem (or Privy / Web3Modal) - for wallet connections.
- plausible - for analytics (careful with finance data).
- eslint-plugin-boundaries - extra boundary hardening.
- i18n - for multilingual support.
- Web Vitals - for performance tracking.
- Bonus UX: Recently I published browser extension [Coinline](https://chromewebstore.google.com/detail/coinline/dafllilkihbickomgiohcjhabcdfeckf) for easy converting of crypto/fiat values. It can be fully integrated in the production Koinly for nice UX.
