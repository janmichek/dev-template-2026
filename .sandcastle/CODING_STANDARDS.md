# Coding Standards

The reviewer agent loads this file during code review.

## Architecture

- Feature-Sliced layers: `app > pages > widgets > features > entities > shared`. Imports go downward only.
- A slice is imported through its `index.ts`. Cross-slice imports are relative.
- `shared/schemas.ts` is the API contract. Run `bun run api:generate` after changing it; never hand-edit `shared/openapi.json` or `src/shared/api/schema.d.ts`.
- Use the words in `GLOSSARY.md`. Decisions are in `docs/adr/`.

## Style

- TypeScript strict. No `any`; avoid `as` casts on untrusted input (parse with Zod).
- Formatting is `oxfmt`, linting is `oxlint`. Both must pass.
- Delete dead code instead of commenting it out.

## Testing

- Tests live next to the code. Every new model or lib function gets a unit test.
- Prefer testing behaviour through the public interface of a slice.
