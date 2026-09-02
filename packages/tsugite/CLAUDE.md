# tsugite — the system side (the proof)

Everything here is contract-first. The conformance suites in `tests/e2e/`
are the durable contract; green suites are the definition of done.

## Rules

- Read `docs/css-doctrine.md` before writing or changing any CSS — it
  is the anti-drift contract (gate pattern, resolution chain, the
  no-list).
- Read the relevant ADR in `docs/adr/` before touching `kernel/`,
  `engine/`, or the token grammar. The ledger is law: a change that
  contradicts an ADR requires a new ADR, agreed with the user, before
  any code.
- Tokens are authored in JS (`theme-default/*.tokens.js`) and delivered
  as generated CSS (ADR-0003). Never hand-edit `*.generated.css` or
  `styles/ui-tokens.css` — run `pnpm tokens` after changing sources.
- New CSS vocabulary means a new primitive. Ask "who owns the
  vocabulary?" before adding any; compositions own no vocabulary
  (ADR-0005).
- `data-*` attributes must pass the field dictionary: one word answers
  one question.
- Converting a component from reference-components follows
  `docs/INTAKE.md` verbatim (or invoke the `intake` skill). Test
  adaptations must be mechanical (selector scoping, targetPath) and each
  one is logged as feedback upstream.
- `docs/component-model.md` is DRAFT discussion memory — never treat it
  as decided (hard rule 3 in the root CLAUDE.md).

## Verify

- `pnpm --filter tsugite test` — vitest: unit tests plus the token
  assertions (coverage, ΔE fidelity, WCAG contrast)
- `pnpm --filter tsugite test:e2e` — playwright conformance suites
