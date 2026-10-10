# 04 — Instruction documents (non-ADR) drift survey

Surveyed 2026-10-10 on branch `feat/appearance-guard` (clean, 785c1ec). Read-only.
Scope: CLAUDE.md ×3, README.md, TLDR.md, `.claude/` (settings, 2 hooks, 3 skills incl. example.css /
counter-example.css), `packages/tsugite/docs/{css-doctrine,INTAKE,component-model}.md`,
`tasks/{parking-lot,plan-fields,plan-prose}.md`, the three package.json script blocks.
No `.claude/agents/`, no `settings.local.json`, no PORTING.md in the repo (only referenced).

Categories: DEAD-PATH · WRONG-COMMAND · STALE-RULE · CONTRADICTION · WRONG-LEDGER · RESOLVED-TODO · LANGUAGE · MISSING.

---

## Worst offenders (ranked)

1. **MISSING — the bench workflow (ADR-0026) is in no instruction doc.** No CLAUDE.md, skill or
   INTAKE mentions `*.bench.astro`, `pnpm --filter tsugite bench` (port 4340), `BENCH_URL`,
   `targetPath(bench)`, or that a new suite needs a bench. INTAKE.md still tells agents that
   `fixtures/` is "the suites' host markup" — the exact thing ADR-0026 §7 / Consequences reversed.
2. **LANGUAGE — `component-model.md` is ~95 % Swedish** (hard rule 1). Worse: INTAKE.md step 6,
   ADR-0022 and ADR-0025 point to its §2.5 as *the field dictionary*, so the one rule every `data-*`
   attribute must pass lives in a Swedish DRAFT that predates `voice`, `*-inline`, `text-box`,
   `test-state-*`. (Also ADR-0001/0002/0003/0005/0006 are Swedish — outside this scope, flagged for
   the ADR survey.)
3. **STALE-RULE — `writing-css/example.css` is partly out of sync with ADR-0024** (header promises a
   `.text` part + `data-text-box`; body shows neither, puts the reading ceiling on `.body`, and its
   law-(d) exemption differs from the one all four typography components ship). ADR-0025 is in sync;
   ADR-0022 cited loosely; ADR-0027 has no component-CSS surface (OK).
4. **WRONG-LEDGER — "capital = root, lowercase = part" is taught as law** by the writing-css skill and
   both example files, but no ADR holds it; parking-lot says "to be written into ADR-0013" and it never
   was. Same for the field-skin decisions living only in `tasks/plan-fields.md`.
5. **RESOLVED-TODO — parking-lot.md carries ~9 struck/resolved rows plus ~5 unstruck rows already
   resolved** (Button dead text engine, CtaLinkButton ghost tokens, ScreenReaderText, data-align,
   uneven e2e shards), against the tasks-folder policy (only live work).
6. **STALE-RULE — `tasks/plan-prose.md` designs against the pre-ADR-0024 engine** (`kernel/css/run.css`,
   `[data-run="block"] > .run`, `components/Prose/…`).
7. **CONTRADICTION — apps/docs/CLAUDE.md "never reach into `engine/`"** vs `apps/docs/src/pages/docs/color.astro`
   importing `tsugite/engine/color-engine.js` (and docs importing `tsugite/fixtures/*` directly).

---

## CLAUDE.md (root)

| Line | Cat | Quote | Truth | Suggested fix |
|---|---|---|---|---|
| 11–13 | MISSING | "`packages/tsugite` — the system: kernel, components, color engine, token generator, conformance suites, ADR ledger" | The package also owns the bench app (`packages/tsugite/bench`, ADR-0026) and the font files (`theme-default/fonts`, ADR-0027). | Add "bench app" to the list. |
| 43–52 | MISSING | "When to read what" table | No row for ADR-0026 / benches; no row for `tasks/` (parking lot + live plans) and its policy (live work only, delete plan on merge) — that policy exists only in user memory. | Add rows: "`components/…/<Name>/<Name>.bench.astro` + ADR-0026 — before writing or moving an e2e suite"; "`tasks/` — live work only; read parking-lot before starting a parked topic". |
| 54–59 | MISSING / WRONG-COMMAND (omission) | Commands list | `bench` exists only as `pnpm --filter tsugite bench` (no root alias); docs has `test:engines` (`playwright test --grep @engines`) nowhere documented; `pnpm preview` undocumented (minor). | Add `pnpm --filter tsugite bench` — bench app on :4340; `pnpm --filter docs test:engines`. Optionally a root `bench` script. |
| 56 | MISSING | "`pnpm dev` / `pnpm build` — docs app" | Docs dev server port is the Astro default 4321; docs Playwright `reuseExistingServer` on 4321 — the very "testing another app on :4321" risk ADR-0026 removed from the package. User runs docs on 4325. | State the port convention (docs 4321/4325, bench 4340) or set an explicit port. |
| 58–59 | OK | `pnpm test` / `pnpm test:e2e` | Match root package.json. Note docs `test:e2e` = `--project=chromium` only. | — |
| 32–35 | OK | Hard rule 4, generated files | Hook pattern `*.generated.css` also covers the new `fonts.generated.css` and `kernel/css/text-box.generated.css`. | Optionally name them. |
| — | (aside) | — | `styles/ui-tokens.css` header (generated) says "Source: src/lib/tokens/seam.ui.tokens.js"; the real source is `theme-default/seam.ui.tokens.js`. Generator strings in `engine/collector.js:133,179,302` carry the same dead `src/lib/tokens/` path. Agents read these headers. | Fix the generator strings, regenerate. |

## packages/tsugite/CLAUDE.md

| Line | Cat | Quote | Truth | Suggested fix |
|---|---|---|---|---|
| 3–4 | MISSING | "The conformance suites in `tests/e2e/` are the durable contract" | Suites now run against per-component benches only (ADR-0026 §1, §5); a suite without a bench has no host. | Add: "each suite runs on its component's `<Name>.bench.astro` (ADR-0026); a new suite brings its bench." |
| 26–27 | STALE-RULE / LANGUAGE | "`data-*` attributes must pass the field dictionary: one word answers one question." | The dictionary is `component-model.md` §2.5 — Swedish, DRAFT, and missing settled words (`voice` ADR-0024 amendment, `grow-inline`/`cap-inline` ADR-0015, `align-inline` ADR-0022, `test-state-*` / `test-debug` ADR-0025, `text-box` ADR-0024). No pointer is given. | Point to where the settled dictionary lives; long term, lift it into an ADR (English). |
| 28–31 | STALE-RULE | "follows `docs/INTAKE.md` verbatim … Test adaptations must be mechanical (selector scoping, targetPath)" | `targetPath()` now takes the bench path (`helpers/target.js`), and INTAKE.md itself is stale (see below). | Update together with INTAKE. |
| 35–39 | MISSING | Verify block | No `pnpm --filter tsugite bench` (4340), no `BENCH_URL` / `TARGET_PATH` env. `pnpm tokens` now also generates fonts (ADR-0027) and the text-box kernel file (ADR-0024) — not stated. | Add bench + env lines; extend the tokens sentence. |
| — | MISSING | — | Test-state twin rule (ADR-0025: `data-test-state-<state>="true"`, benches/tests only, never production markup) appears only in example.css. | One rule line. |

## apps/docs/CLAUDE.md

| Line | Cat | Quote | Truth | Suggested fix |
|---|---|---|---|---|
| 8–11 | CONTRADICTION | "Never reach into package internals (`kernel/`, `engine/`)" | `src/pages/docs/color.astro:17,19` import `tsugite/engine/color-engine.js`; `src/lib/sections.ts` imports `tsugite/fixtures/*.astro` directly (fixtures are arguably contract via manifest, the engine is not). | Either declare the color engine's read API public (export map entry) or move the call behind a package export; log as upstream finding per line 12–14. |
| 8–10 | MISSING | "its components, the generated token CSS, and fixtures mounted via the manifest" | ADR-0026 §6: docs may mount a package bench at `/docs/<slug>/test` (exists: `pages/docs/button/test.astro`); ADR-0027 §5: fonts come from the package's generated file, docs `font.css`/`public/fonts` gone. | Add both to the list of what the app may consume. |
| 20–24 | MISSING | Verify block | `test:e2e` runs Chromium only; `test:engines` (Firefox/WebKit `@engines`) undocumented; docs e2e starts/reuses :4321. | Document `test:engines` and the port. |
| — | (aside) | — | `apps/docs/tests/e2e/input.e2e.test.js` tests a component contract (Input) inside the docs app — contrary to ADR-0026 §1/§5; plan-fields.md presents "/docs/input" as Input's bench. | Flag for the ADR/code survey. |
| — | (aside) | — | `apps/docs/public/fonts/NotoSerif/` survives as an empty untracked dir (`.DS_Store` only). | Delete locally. |

## README.md / TLDR.md

| Line | Cat | Quote | Truth | Suggested fix |
|---|---|---|---|---|
| README 11–12 | STALE-RULE | "`apps/docs` — the documentation site (the argument): the map, the control room, the test bench" | The test bench is the package's (ADR-0026 §5); docs only mounts it at `/docs/<slug>/test`. | "…and a view onto the package's benches". |
| README 14 vs root CLAUDE 14 | CONTRADICTION (minor) | README: "The system's own tables (`theme-default`) are its first consumer"; root CLAUDE.md: "`apps/docs` — … the system's first consumer" | Two different "first consumers". | Pick one wording. |
| README 1 | LANGUAGE (acceptable) | "Tsugite 継手" | Name of the project; not prose. | — |
| TLDR 47 | OK | "`data-variant=\"error\"`" | Still valid: `variant` = look (Notice), voice moved to `data-voice` (ADR-0024 amendment). | — |
| TLDR 117–120 | OK | pointer list | All paths exist. | — |

## .claude/settings.json + hooks

| File:line | Cat | Quote | Truth | Suggested fix |
|---|---|---|---|---|
| settings.json | OK | two PreToolUse hooks | Both scripts exist; matchers right. | — |
| protect-generated.py:13 | OK | `.generated.css`, `.generated.md`, `styles/ui-tokens.css` | Covers fonts + text-box generated files. Does not cover the font binaries in `theme-default/fonts/` (source, not generated — correct). | — |
| protect-git.py:26–49 | OK (open design row) | cwd parsed from `cd`/`git -C` | Matches parking-lot row "The git-flow guard lives in the wrong layer" (still open, live). | — |

## .claude/skills/git-flow/SKILL.md

| Line | Cat | Quote | Truth | Suggested fix |
|---|---|---|---|---|
| 20–22 | MISSING (minor) | "e2e when component contracts changed" | e2e now needs no docs server; package e2e starts the bench app on 4340. CI required check is `test` (ruleset), e2e reports only — not stated. | One line on CI's required check. |
| 23–24 | STALE-RULE (minor) | "run `pnpm tokens` and commit the regenerated CSS" | Also regenerates `tokens.generated.md`, `fonts.generated.css`, `kernel/css/text-box.generated.css`. | "…commit every regenerated file". |
| — | MISSING | — | tasks/ policy (delete finished plan, strike → delete resolved parking rows on merge) is part of the PR routine in practice but not here. | Add a "On merge" bullet. |

## .claude/skills/intake/SKILL.md + packages/tsugite/docs/INTAKE.md

| Line | Cat | Quote | Truth | Suggested fix |
|---|---|---|---|---|
| SKILL 14–17 / INTAKE 16–20 | STALE-RULE | "The suites travel … into `tests/e2e/`" / "A fixture section goes into `fixtures/` (the suites' host markup); the docs app mounts it via the manifest." | ADR-0026: the suite's host is `components/<pillar>/…/<Name>/<Name>.bench.astro`; "a bench is not a section"; `fixtures/` keeps only the docs sections. | Split step 4: (a) bench next to the component, suite calls `targetPath('/<bench path>')`; (b) optional docs section in `fixtures/`. |
| SKILL 14 / INTAKE 3 | MISSING | — | Where the component lands: `components/<pillar>/[fields|typography|buttons]/<Name>` + an export-map entry in `packages/tsugite/package.json` (tree test `tests/components-tree.test.ts`, `apps/docs/tests/manifest-tree.test.ts`). | Add a step. |
| INTAKE 23–24 | LANGUAGE / STALE-RULE | "The data-* vocabulary must pass the field dictionary (component-model.md §2.5)" | §2.5 is Swedish DRAFT and outdated (see packages CLAUDE.md row). | Point to the settled source. |
| INTAKE 15, 25–26 | DEAD-PATH (implicit) | "logged in the porting log (§7)" / "logged and fed back" | The porting log lives outside this repo: `../AstroRefComp/tasks/porting-log.md` (user memory only). `playwright.config.ts:3` also cites a "PORTING.md there" not in the repo. | Name the path once. |
| INTAKE 7–10 | MISSING | — | Since ADR-0017/0018 a native Tsugite component is a recipe + lib + renderers; intake does not say whether an intaken component goes on the table (AffixField and the fields are deliberately not). | One sentence: intake lands off-table; moving onto a recipe is a separate pass. |
| SKILL 23–25 | OK | DoD commands | Valid; the e2e command now runs on benches. | — |

## .claude/skills/writing-css/SKILL.md

| Line | Cat | Quote | Truth | Suggested fix |
|---|---|---|---|---|
| 20–22 | MISSING | "Read the component's table, `packages/tsugite/recipes/<name>.recipe.ts`" | Only 14 recipes exist; the 15 field components, regions, Picture/Prose/etc. have none. No guidance for the off-table case (gate set = what the `.astro` writes). | Add the fallback: "no recipe → the `data-*` the `.astro` always writes is the table". |
| 23–24 | WRONG-LEDGER | "Find the component's slot prefix in ADR-0013 §2's register" | Register lacks `cta` (CtaButton, 77 uses) and `ni` (NavItem, 53 uses). | ADR survey: add the rows. |
| 30–31, 51 | WRONG-LEDGER | "Parts are the recipe's part names, bare lowercase … no `Name-part`" | Settled in discussion 2026-09-25 but in no ADR (ADR-0013 has no class-naming sentence). Live drift: `.Button-icon`, `.CtaButton-icon`, `.NavItem-icon`, `.NavItem-text`, `.Teaser-link`. | Write the ADR-0013 amendment the parking lot promised. |
| 67–69 | STALE-RULE (wording) | "`:where` is right in the run engine's law (d) exemption" | ADR-0024 renamed the run engine the text-box engine. | "text-box engine". |
| 67–71 | CONTRADICTION | "`:where` … wrong as an invitation to be overridden" (+ example.css 89: "the only :where in a component file") | `Button.css:450` `:where(.Button[data-test-debug="true"])` — a second, root-level `:where` (debug overlay, ADR-0025 §4). | Either name the debug exemption in the example or move the rule to kernel `debug.css`. |

## .claude/skills/writing-css/example.css — sync check

Against css-doctrine.md and ADR-0022/0024/0025/0027:

| Line | Cat | Quote | Truth | Suggested fix |
|---|---|---|---|---|
| 18–20 vs 66–96, 137 | STALE-RULE (ADR-0024) | Header: "the component writes data-text-box and a .text part, and never repeats the engine's gate" | Body never shows `.text`, `data-text-box`, or `data-voice`; the run of words is `.title`. ADR-0024 §3 (`[data-text-box="block"] > .text`) and §6 (components read the engine's `lineHeight` slot) are not demonstrated. | Rename the word part to `.text` (or add one), write `data-voice`/`data-text-box` in the header gate list, show `line-height` read from the engine slot. |
| 133–139 | STALE-RULE (ADR-0024 §4, ADR-0021) | `&[data-cap-inline="true"] > .body { max-inline-size: var(--_co-lineLength) }` | Shipping form: `&[data-cap-inline="true"] > .text` (Heading.css:130, Text.css). The ceiling sits on the engine container. | Gate `> .text`. |
| 94 | STALE-RULE (ADR-0024 / code) | `& .title :where(a, span, strong, em):where(:not(:is(.Component [data-voice]), …))` | All four typography doors ship `& > .text :where(a, span, strong, em, b, i):where(…)` — child combinator, `.text`, and `b, i` included. | Copy the shipping selector. |
| 66–69 | CONTRADICTION (with registry rule) | `var(--fontWeight-label-bold, var(--fontWeight-label))` (also doctrine §2 l.59) | `--fontWeight-label-bold` is not in `tokens.generated.md` (only `body-bold`); the same docs say "a name that is not there does not exist". The optional-stop seam is legitimate (ADR-0012 law b) but the registry gives no way to tell an optional stop from an invented name. | Registry: list optional stops per voice (present/absent); or note in example that the seam's first name may be absent from the registry by design. |
| 14, 105–111 | CONTRADICTION (draft-level) | `data-emphasis true \| false` | Draft dictionary (§2.5) says emphasis is "enum, never bool" and records Notice's boolean as an inherited dialect; Button's is the enum. The example teaches the dialect. | Use a different boolean word in the example (e.g. `data-inset`), or leave and note. |
| 46–48 | STALE-RULE (citation) | "Logical properties only … (ADR-0022)" | ADR-0022 is about axis *words and values* (`<property>-<axis>`, `start\|center\|end`), not about CSS properties. The example never shows an `align-inline` gate with logical values. | Cite ADR-0022 at the `data-cap-inline` gate; optionally add a 3-value `data-align-inline` example. Physical-property ban belongs in the doctrine (see below). |
| 166–182 | CONTRADICTION (minor) | comment "bounded at BOTH ends"; last query `@media (min-width: 48.75rem)` | Merges DESKTOP and WIDE (ADR-0001 has 4 tiers); counter-example flags an open-ended tier as a fault. | Add the WIDE tier or say why DESKTOP+WIDE share a cell. |
| 141–157 | IN SYNC (ADR-0025) | `&[data-test-state-hover="true"]`, `&[data-test-state-focus="true"]`, "a combination is two attributes" | Matches ADR-0025 §1–3, §5. No old `data-test-state="…"` left anywhere in components/fixtures/tests. | — (optionally show the combination gate and `data-test-debug`). |
| 26–39 | WRONG-LEDGER (cosmetic) | prefix `--_co-` "claimed in ADR-0013 §2's register" | `co` is not in the register. | Say "a hypothetical prefix". |
| — | IN SYNC (ADR-0027) | — | ADR-0027 changes token generation and font delivery, not component CSS. Nothing to add. | — |

## .claude/skills/writing-css/counter-example.css

| Line | Cat | Quote | Truth | Suggested fix |
|---|---|---|---|---|
| 1 | OK (intentional) | "Port of the old kitchen-sink card — see /legacy/card.scss" | Deliberate provenance fault; `kitchen-sink` is now also a dead page — harmless. | — |
| — | MISSING | — | No fault for the pre-ADR-0025 twin (`data-test-state="hover"` / `~=` token list) or a pre-ADR-0024 private trim copy / `data-run`. Those are the two most likely regressions from older agent memory. | Add two marked faults. |

## packages/tsugite/docs/css-doctrine.md

| Line | Cat | Quote | Truth | Suggested fix |
|---|---|---|---|---|
| 69–81 | MISSING | the no-list | Rules the example and skill enforce but the doctrine never states: logical properties only; no rule on another component's class (ADR-0015); class naming (root/part); test-state twin always paired with its pseudo-class (ADR-0025 §5); no private trim / text-box copy in a component (ADR-0024). The skill says the doctrine is "the rules" and the example follows it — here the example is ahead of the doctrine. | Add these to §3 (and §7 for naming). |
| 46–67 | OK | §2 two seams | Matches ADR-0008 amendment / ADR-0012 law b. Same `--fontWeight-label-bold` registry caveat as example. | — |
| 133–135 | OK / MISSING (minor) | "the nesting gate test proves it" | Exists as `apps/docs/tests/css-nesting-gate.test.ts` — a package rule guarded by a docs-app test (seam points the wrong way, cf. ADR-0026). | Name the file; consider moving it to the package. |
| 3–8 | OK | Status ADOPTED 2026-09-02 | Content amended since (§2, §5, slot rule) without a revision line. | Optional "Amended: …" line. |

## packages/tsugite/docs/component-model.md (DRAFT — contradictions expected, listed for awareness)

| Line | Cat | Quote | Truth | Suggested fix |
|---|---|---|---|---|
| whole file (1–456) | LANGUAGE | "# Komponentmodellen — arbetsdokument" … | Hard rule 1: English everywhere. Only the 2026-09-17 note (457–465) is English. | Translate (or translate §2.5 first, since three docs/ADRs point to it). |
| 80–81 | CONTRADICTION | "Sinken behålls orörd som testbänk … sviterna kan migreras till per-komponent-sidor i frivillig fas 2" | ADR-0026: kitchen sink deleted, every suite on its own bench. | Mark settled → ADR-0026. |
| 369–372 | RESOLVED-TODO | parked Q2 "Kitchen sink-strukturen: sida per komponent (C) …" | Answered by ADR-0026 (per component, package-owned). | Strike with pointer. |
| 360–364 | DEAD-PATH | "kontrollrummets donut-matris (#Themes i kitchen sink)" | Kitchen sink gone; themes bench is `theme-default/Themes.bench.astro`, control room at `/control-room`. | Update pointer. |
| 61 | DEAD-PATH | "Kartan renderas ur docs.manifest.ts" | `apps/docs/src/lib/manifest.ts`. | Fix name. |
| 113–129 | STALE-RULE | Field dictionary: `variant` (genre) … `theme` (*vems röst?*) | ADR-0024 amendment: the voice is `data-voice`; `variant` = look only. Missing settled words: `voice`, `grow-inline`, `cap-inline`, `align-inline`, `text-box`, `test-state-<state>`, `test-debug`, `wrap`, `inline`. Yet INTAKE.md, packages CLAUDE.md, ADR-0022 and ADR-0025 cite §2.5 as the dictionary. | Lift the dictionary into an English ADR (or a non-draft doc) and repoint. |
| 346–348 | STALE-RULE | "Button ställer frågan (`--_backgroundColor: var(--theme-button-backgroundColor-primary, …)`)" | Button slots are `--_bt-*` (ADR-0013). | Update the worked example. |
| 279–281 | DEAD-PATH | "`--TYPE-SCALE` (typography.constant.scss rad 1 …)" | No `.scss` in the repo; tokens are JS (ADR-0003). | Point at `typography.tokens.js`. |
| 25 | STALE (minor) | Primitives list includes ThemeSwitch | ThemeSwitch sits under `primitives/fields/` — consistent with §1 l.43, OK. | — |

## tasks/parking-lot.md

| Line | Cat | Quote | Truth | Suggested fix |
|---|---|---|---|---|
| 3–14 | RESOLVED-TODO | "Button's text engine is dead … `.Button-text` … `--_baselineOffset`" | ADR-0024 Consequences: "Button's dead engine goes"; `Button.css` has no `baselineOffset`/`Button-text` today. | Delete row. |
| 26–30 | RESOLVED-TODO | "CtaLinkButton's ghost tokens — `--fontSize-cta` and `--fontFamily-button` don't exist" | `--fontSize-cta` is gone; `--fontFamily-button` exists (`typography.generated.css:199`), read without fallback (`CtaButton.css:27`). | Delete row. |
| 31–35 | DEAD-PATH | "(notes-typography-components.md)" | File not in the repo. | Drop the pointer. |
| 39–41 | RESOLVED-TODO / STALE | "Heading owns alignment via data-align" | ADR-0022: `data-align-inline`, logical values. The page-local text-align sweep question may remain. | Rewrite to the remaining question or delete. |
| 45–54, 108–140, 173–185, 197–203, 339–397, 429–431 | RESOLVED-TODO | struck rows ("~~…~~ — resolved/done/built …") | Tasks policy: only live work stays in `tasks/`. Several also cite deleted plan files (`tasks/plan-toggletip.md`, `tasks/plan-datefields-popup-anchor.md`, `tasks/plan-button-slots.md`) — DEAD-PATH. | Delete struck rows (the ADRs/PRs are the record). |
| 186–220 | RESOLVED-TODO (partial) | Button next spike: "*ScreenReaderText is a component …*"; label-as-run "dead baseline engine replaced by the kernel run engine" | ScreenReaderText built (PR #79, exported); Button's label is `.text` on the text-box engine (ADR-0024). Still live: `iconStart`/`iconEnd` — and note `button.recipe.ts:38` `iconPosition: ["left","right"]` violates ADR-0022's logical values. | Strike the done sub-bullets; keep icon slots (mention the ADR-0022 debt). |
| 327–338 | STALE + WRONG-LEDGER | Class naming census: "nine components carry a prefix — `Button-text`, `CtaButton-text`, … `caption-content`, `heading-text`, …"; "to be written into ADR-0013" | Today only `.Button-icon`, `.CtaButton-icon`, `.NavItem-icon`, `.NavItem-text`, `.Teaser-link` remain; ADR-0013 still lacks the sentence while the writing-css skill already enforces it. | Update census; land the ADR sentence. |
| 408–425 | STALE-RULE | "Open, and tied to the run-engine job … Decide there, not here." | The run-engine job closed (ADR-0024, §1 keeps the ceiling in components on `.text`); the pointer leads nowhere. | Re-home the `context` alignment question as its own open item. |
| 446–449 | RESOLVED-TODO | "The e2e shards are uneven … shard 3/3 took 12m14s" | Measured against the kitchen sink; ADR-0026 moved every suite to benches (#110–#121), user memory marks it superseded. | Delete or re-measure. |
| 99, 36 | (note) | "Direction Nicklas sketched", "Nicklas: own component" | The no-people rule covers commits/PRs only; acceptable in task notes, but inconsistent with the record voice. | Optional. |
| 201 | LANGUAGE (acceptable) | "Sida 3 av 12", "Torsdag 14 maj" | Demo strings illustrating a localisation case. | — |
| Still live (verified) | — | `--MOBILE/DESKTOP-BREAKPOINT` unused (still in `site.tokens.js`); px twins (36 in `base.generated.css`); AffixField off-table + `data-align="end"`; Caption weight axis absent; no shape/shadow tokens; Teaser still picks Picture groups (8 refs); `fixtures/states/button.states.ts` exists; git guard row. | Keep. |

## tasks/plan-fields.md

| Line | Cat | Quote | Truth | Suggested fix |
|---|---|---|---|---|
| 13–33, 82–88, 99–101 | WRONG-LEDGER | "Settled in discussion (2026-10-07)" … "decided 2026-10-07: `aria-invalid`, set by a kernel script" … "Decided: the state order" | Hard rule 2: decisions live in the ADR ledger. These are built on (Input, `kernel/js/field-validity.ts`, `field` voice) with no ADR; the file says the ADR waits for "the model complete". | Acceptable if intentional, but an agent reading only CLAUDE.md will not find these decisions; at minimum reference plan-fields from root CLAUDE.md, or land a partial ADR. |
| 37–38, 104–105 | CONTRADICTION (terminology / ADR-0026) | "drawn as a matrix on the Input bench" / "the bench at /docs/input" | "Bench" now means the package's `<Name>.bench.astro` (ADR-0026). Input has no package bench; its contract tests live in `apps/docs/tests/e2e/input.e2e.test.js` (docs app), against ADR-0026 §1/§5. | Say "the Input docs page"; plan Input's move to a package bench. |
| 104 | STALE (minor) | "Input (in progress, 2026-10-07 …)" | Input primitive merged (f12862e, 442fced, 466bc2a); Select/Textarea/TextField not started. | Mark Input done, next = Select. |
| 32–33 | OK | three-engine projects | `apps/docs/playwright.config.ts` has `engines-firefox` / `engines-webkit`; `test:engines` script exists. | — |

## tasks/plan-prose.md

| Line | Cat | Quote | Truth | Suggested fix |
|---|---|---|---|---|
| 11 | DEAD-PATH | "`components/Prose/Prose.astro`" | `components/primitives/Prose/Prose.astro` (pillar tree). | Fix path. Drift itself still present (`PROSE SYSTEM` block l.268, owl l.276). |
| 53–55 | STALE-RULE | "Once the run engine is one shared file (`kernel/css/run.css` …) … `[data-run="block"] > .run`" | ADR-0024: `kernel/css/text-box.generated.css`, gate `[data-text-box="block"] > .text`, voice cells `[data-voice=…]`. ADR-0024 explicitly left Prose out of scope. | Rewrite against ADR-0024: Prose's element list as a second emission of the text-box generator. |
| 47 | WRONG-LEDGER | "`--_pr-fontSize` …" | `pr` not in the ADR-0013 register. | Claim it when built. |
| 100 | STALE-RULE | "`<Heading element=\"h2\" size=\"2\">`" | Heading's axes are now `voice` + `size` with a door law (ADR-0023: Heading = loud voices only); check exact prop names when the test is written. | Re-spell with current props. |
| 116–119 | OK | reset no longer sets text-wrap/overflow-wrap | Verified (`styles/base/reset.css:36` comment). | — |

## package.json scripts

| File | Cat | Note |
|---|---|---|
| root | MISSING | No `bench` alias; every doc would have to spell `pnpm --filter tsugite bench`. |
| packages/tsugite | OK | `bench` = `cd bench && astro dev --port 4340`; Playwright config starts it (`BENCH_URL` override). |
| apps/docs | OK / MISSING | `test:engines` exists, documented nowhere. `tokens` + `predev`/`prebuild` match the CLAUDE.md claim. |

---

## Paths verified to exist

All CLAUDE.md "When to read what" paths; `.browserslistrc` (root); `apps/docs/src/lib/manifest.ts`;
`kernel/css/text-box.generated.css`; `styles/tokens/typography/fonts.generated.css`;
`theme-default/fonts/`; `fixtures/states/{button,field}.states.ts`, `StateMatrix.astro`;
`tests/state-maps.test.ts`; `apps/docs/src/pages/lab/{grid,field-states}.astro`;
19 component benches + `theme-default/Themes.bench.astro`; every token used by example.css except
`--fontWeight-label-bold` (optional stop, see above).
