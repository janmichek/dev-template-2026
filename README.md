# Staff Frontend Engineer — Take-Home Assignment

## Context

Imagine a crypto tax reporting product. Users connect wallets and
exchanges, the product imports their transactions, and they can review their portfolio and
generate tax reports.

You're laying the technical foundation for a brand-new frontend for such a product.
Before any business logic gets written, the architecture needs to be in
place: how code is organized, where the boundaries are, and what keeps quality high as
the team and codebase grow.

That foundation is what we want you to build.

## The Task

Create the **architectural skeleton** of a frontend application for a crypto-tax product.

We are explicitly **not** interested in business logic. Placeholder data and stubbed
pages are fine — what matters is the internal architecture and dependency structure.

Your skeleton should show:

- **Project structure** — how features, shared components, and cross-cutting concerns
  are organized; a new developer should know where new code belongs.
- **Dependency boundaries** — which layers exist, which direction imports may flow, and
  how that is enforced (not just documented).
- **API layer** — how the app fetches, caches, and types server data. Mock the backend
  however you like (stub server, MSW, fixtures).
- **Routing** — a few representative routes (e.g. dashboard, transactions, settings).
- **UI foundation** — how design-system primitives are separated from product code.
- **Quality tooling** — TypeScript config, linting, and 1–2 example tests showing how
  testing is meant to work here.

Include **one thin example page** (e.g. a transactions list backed by the mocked API) —
just enough real code to show the conventions in action. Everything else can be a stub.

## Constraints

- **TypeScript**. The rest of the toolchain is your call.
- It must start with a single command: ``docker compose up`` and then be reachable in a browser. No other setup beyond Docker.

## The Write-Up

Add a short `ARCHITECTURE.md` (one page is enough) covering:

- The layers/boundaries you chose and why.
- What stops the structure from eroding as the codebase grows.
- What you deliberately skipped and would add next.

## What We Evaluate

1. Clarity of the structure — could a new hire find their way around without a tour?
2. Are the boundaries real (enforced by tooling) or just folder names?
3. Sound choices at the seams: API layer, state, routing, design system.
4. Pragmatism — over-engineering is as much of a red flag as no structure at all.
5. The reasoning in `ARCHITECTURE.md`.

## Scope & Time

This should take about **3-4 hours**. Cut scope deliberately and say so in the write-up —
that's a senior move, not a shortcut. Using AI tools is fine, but you own every line:
in the follow-up interview we'll walk through the code together and extend it a bit.

## Submission

1. Create your own copy of this repository using the **"Use this template"** button
   (please do not fork).
2. Push your solution there, including a README covering how to run it.
3. Send us the link when you're done.