---
name: intake
description: Convert a reference-components component into Tsugite following the proven intake routine. Use when asked to bring in, convert, or intake a component from reference-components.
---

# Component intake

Read `packages/tsugite/docs/INTAKE.md` and follow its seven steps
verbatim — it is the proven routine (18 components, zero component-code
changes). In short:

1. `canonical()` output is the markup truth for the `.astro` component.
2. The TS travels verbatim; keep the init-gate, adjust only import paths.
3. The e2e suites travel with the component into `tests/e2e/`;
   adaptations must be mechanical and each one is logged as upstream
   feedback.
4. A fixture section goes into `fixtures/`.
5. A manifest row in `apps/docs/src/lib/manifest.ts` puts it on the map.
6. The `data-*` vocabulary must pass the field dictionary.
7. Findings flow back to reference-components — log anything unclear or
   drifted.

Definition of done: the component's conformance suite is green
(`pnpm --filter tsugite test:e2e`) and the docs manifest test passes
(`pnpm --filter docs test`).
