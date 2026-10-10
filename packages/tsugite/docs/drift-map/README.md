# Drift map — where the written record and the code disagree

**A survey, dated 2026-10-10, measured at `main` 4507842 (+ open PR #122).** It is evidence,
not a contract: nothing here is a decision, and it goes stale the moment fixes land. It is the
input to the docs-ledger work: keep the ADR ledger as the record of decisions, and stop that
record bleeding into code, docs and tests as copies that drift.

Five read-only surveys, one per corner:

| File | Corner | Headline |
|---|---|---|
| [01-ledger.md](01-ledger.md) | the ADR ledger itself | ~28 in-place revisions, most invisible from the revised ADR; greppable stale terms |
| [02-package-source.md](02-package-source.md) | `packages/tsugite` source | 323 ADR refs, ~257 OK; 35 wrong-ledger, 5 stale paraphrases, 19 fluff |
| [03-docs-and-tests.md](03-docs-and-tests.md) | `apps/docs` + every test | 120 ADR refs, 94 OK; 14 ADR numbers in reader-facing text; 44 other stale items |
| [04-instruction-docs.md](04-instruction-docs.md) | CLAUDE.md, skills, hooks, doctrine, INTAKE, `tasks/` | the bench workflow is in no instruction doc; `example.css` lags ADR-0024 |
| [05-conformance-gates.md](05-conformance-gates.md) + [scan.mjs](scan.mjs) | what can be checked mechanically | 1,096 current CSS-rule violations; a ratchet design |

## What the map shows

**1. The ledger revises itself silently.** Decisions are revised in place (amendments, "reverses
§n", partial supersession), and every ADR still reads *Accepted*. The *revising* ADR knows; the
*revised* one usually does not point forward. ADR-0012 law 3 still teaches `data-run`
(reversed by ADR-0024 §4); ADR-0021 still gates the cap on `data-run="block"`; ADR-0023 still
says `variant="body"`. An agent that reads the cited ADR — the right behaviour — learns the old
rule. (01 §B lists every revision with a "pointer in revised ADR?" column.)

**2. Decisions live outside the ledger.** The code moved without an ADR: `:dir()` for the
direction sign, the root-scoped law (d) selector, the ADR-0018 schema growth (`when.axis`,
`unwritten`, `valuesBy`, `required`, `hole`, `promise`, `refuses`), ScreenReaderText owning
hidden text, the "capital = root, lowercase = part" class rule (taught by the writing-css skill
as law), the field-skin decisions (only in `tasks/plan-fields.md`), the field dictionary (only
in the Swedish DRAFT `component-model.md` §2.5, which INTAKE and two ADRs point to).

**3. Two ledgers share one number space.** Ports from reference-components cite *its* ADRs bare;
its 0001–0032 overlap ours. ~50 such references across package source, tests and docs
(Picklist alone 12), plus 5 citations of an ADR-0029 that only exists there. The `ref-lib
ADR-NNNN` form (PR #122) is the fix, but nothing enforces it.

**4. Paraphrase is the drift surface, not the number.** A bare `ADR-NNNN` pointer is checkable
and cheap. What goes stale is the restated rule next to it: 17 copies of the "One root, one tree
(ADR-0010)…" header, the line-length "a project's ceiling" comments (ADR-0021 §3 says instance
claim), the token generator's comment that every slot is declared on the root (ADR-0013 §3
says carriers have no root default) — emitted into the generated registry.

**5. Deleted things are still described.** Kitchen sink (9 bench headers, test names, a dead
`kitchenSink.css` whose `.text` selector collides with the text-box engine), the lab, `/theme-lab`,
`lib/card.ts`, the header suite (`themeswitch.e2e` claims header coverage that no longer exists),
the generator writing `src/lib/tokens/…` and `npm run tokens` into every generated header.

**6. Instruction docs lag the most, and agents read them first.** No CLAUDE.md, skill or INTAKE
step mentions benches (ADR-0026); INTAKE still calls `fixtures/` the suites' host. The skill's
`example.css` — the file every stylesheet is compared against — lags ADR-0024. Five ADRs and the
DRAFT are in Swedish (hard rule 1). `tasks/parking-lot.md` carries ~14 resolved rows.

**7. Reader-facing text cites ADRs.** 14 ADR numbers in docs page leads and example comments
(shown in the Code panel), against the docs app's own rule (`DocPage.astro:17`). Two docs pages
state rules that are wrong today (`align: left|center|right` vs ADR-0022; NavItem refusals
"render nothing" vs ADR-0019 §5 — code and ADR disagree, one must change).

**8. Rules without gates.** Nothing checks that a `var()` name is in the registry (ADR-0014's
whole point), the ADR-0013 prefix register, recipe ↔ gate coverage, or logical properties. The
one ratchet-shaped gate (typography) never tightens. The scan finds 1,096 violations; four date
fields hold 459 of them; Text, TextBlock, Caption, Input, Surface and Picture are clean.

## Direction (proposals, not decisions)

- **A pointer, not a paraphrase.** Code and tests cite `ADR-NNNN §n` and say only what is
  *local* (why this line). The rule itself lives once, in the ledger.
- **Forward pointers are part of a revision.** An ADR that revises another adds a one-line
  amendment to the revised one in the same PR. The ledger reads correctly from either end.
- **External ledgers are always qualified** (`ref-lib ADR-NNNN`).
- **One ratchet runner** (05 §5): per (rule, file) counts in a committed baseline; a file with
  no entry gets zero; counts can only fall (`--tighten`); runs inside the required `test` job,
  plus a PostToolUse hook so agents hear about a violation on the edit that made it. First
  rules: token registry, RAW tokens, fallback seams, ADR-exists, ref-lib qualification.
- **Agent-facing docs first** when sweeping: CLAUDE.md, skills, INTAKE, `example.css`.

## Cheapest first moves

1. ADR-0013 register rows `cta` and `ni` (55 scan hits → 0).
2. Forward-pointer amendments in 0012, 0017, 0021, 0023 (01 §G).
3. Benches into root/package CLAUDE.md and INTAKE.
4. Generator header path (`engine/collector.js`) — fixes every generated file at once.
5. `ref-lib` qualification of the ~50 bare reference-components citations.

## Re-measuring

`node packages/tsugite/docs/drift-map/scan.mjs [repoRoot] [--json out.json]` re-runs the CSS
scan (needs an installed checkout; `repoRoot` defaults to this one). The ADR, docs and
instruction surveys were agent reads; re-run them the same way, one corner each.
