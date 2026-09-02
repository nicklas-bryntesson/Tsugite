# Tsugite — monorepo guide

Tsugite is a direct attempt to determine whether deterministic front-end
systems can be built, and what they should look like when they are. It
deliberately discards legacy doctrine — mobile-first cascades,
base-plus-override, utility classes — and builds so that **exactly one
truth is active at a time**.

Two workspaces, one seam:

- `packages/tsugite` — the system: kernel, components, color engine,
  token generator, conformance suites, ADR ledger. Strictest rules —
  see its CLAUDE.md.
- `apps/docs` — the documentation site and the system's first consumer.
  Consumes the package only through its public contract — see its
  CLAUDE.md.

Decide which side of the seam you are on before changing anything.

## Hard rules (repo level)

1. **English everywhere.** ADRs, commit messages, code comments, docs.
   Sole exception: component demo *content* where localization itself is
   what is being demonstrated (e.g. Swedish strings in a JSON
   localization demo).
2. **Decisions live in the ADR ledger** (`packages/tsugite/docs/adr/`).
   Work that produces a decision produces an ADR — not a commit message.
3. **`packages/tsugite/docs/component-model.md` is a DRAFT** — the
   memory of an ongoing discussion, not settled ground. Nothing is built
   on its unsettled sections without explicit user sign-off: stop and
   ask first. Settled parts are the ones already moved to the ADR ledger.
4. **Generated files are never edited by hand** (`*.generated.css`,
   `packages/tsugite/styles/ui-tokens.css`). Author tokens in
   `packages/tsugite/theme-default/*.tokens.js`, regenerate with
   `pnpm tokens`. Enforced by a PreToolUse hook.
5. **Git flow.** All work happens on branches (`feat/`, `fix/`,
   `chore/`, `docs/`); nothing is committed directly to `main` —
   changes reach it through pull requests. Never force-push, never
   rewrite pushed history, stage explicitly (no `git add -A`/`.`).
   The commit/PR routine lives in the `git-flow` skill. Commits to
   `main` and force-pushes are blocked by a PreToolUse hook.

## When to read what

| Document | When to read |
|----------|--------------|
| `packages/tsugite/docs/css-doctrine.md` | Before writing or changing any CSS — the anti-drift contract |
| `packages/tsugite/docs/adr/` | Before touching kernel, engine, or token grammar |
| `packages/tsugite/docs/INTAKE.md` | Before converting a component from reference-components (or invoke the `intake` skill) |
| `packages/tsugite/docs/component-model.md` | Background only — DRAFT, see hard rule 3 |
| `apps/docs/src/lib/manifest.ts` | Before putting a component on the docs app's map |

## Commands (from repo root)

- `pnpm dev` / `pnpm build` — docs app (both regenerate tokens first)
- `pnpm tokens` — regenerate token CSS from `theme-default`
- `pnpm test` — vitest in both workspaces
- `pnpm test:e2e` — playwright in both workspaces
