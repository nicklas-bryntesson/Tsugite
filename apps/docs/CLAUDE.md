# docs — the consumer side (the argument)

This app is the system's first consumer and its stress test. It makes
the case for the system; it must never blur the seam.

## Rules

- Consume `tsugite` only through its public contract: its components,
  the generated token CSS, and fixtures mounted via the manifest
  (`src/lib/manifest.ts`). Never reach into package internals
  (`kernel/`, `engine/`) and never copy package code locally.
- If the app needs something the system does not expose, that is an
  upstream finding: log it and raise it with the user — never patch
  locally or work around the seam.
- The manifest is the map: a component appears in the app via its
  manifest row (slug, pillar, family badge, suite pointer).
- Demo content is the only place non-English strings may appear, and
  only when localization itself is the demo (root hard rule 1).

## Verify

- `pnpm --filter docs test` — vitest, including the manifest test
- `pnpm --filter docs test:e2e` — playwright
- `pnpm dev` / `pnpm build` regenerate tokens first via pre-hooks
