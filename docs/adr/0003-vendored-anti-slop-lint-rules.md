# Vendored anti-slop lint rules

`config/oxlintrc.json` registers a local Oxlint plugin, `anti-slop`, copied from `dmmulroy/anti-slop` into `tools/oxlint/anti-slop`. The rules reject low-evidence TypeScript: `unknown` inputs and returns, open `Record<string, unknown>` dictionaries, `typeof` narrowing, module mocking, `Reflect.apply`/`Reflect.get`, chained assertions, and widening a known value into `unknown` before asserting it back. The vendored copy records its upstream revision in `tools/oxlint/anti-slop/UPSTREAM.md`; `@oxlint/plugins` is pinned to the exact `oxlint` version so the pair moves together.

The plugin is vendored, not installed from npm, because the rules are policy: we expect to edit them. Lint, oxfmt, and fallow ignore `tools/oxlint/anti-slop` so upstream code is neither reformatted nor treated as project source. The Effect rule group is vendored but not registered, because this repository does not depend on Effect.

Two local choices. Generated OpenAPI types (`src/shared/api/schema.d.ts`) are skipped by lint, since `bun run api:generate` owns that file. The hand-written EDN reader (`scripts/diagram/edn.ts`) allows `typeof` inside type predicates: it is the parser's boundary, and rewriting it with Zod would be noise. `typescript/consistent-type-assertions: never` already bans every assertion, so `no-chained-type-assertions` and `require-safety-comment-for-type-assertion` are inert here; they stay enabled so the policy survives if that TypeScript rule is ever relaxed.

Trade-off: these rules read the AST and lexical scope, not the type checker, so they miss imported type aliases and cross-file signatures. They are a floor on evidence, not a proof of type safety.
