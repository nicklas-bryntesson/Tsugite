# ADR-0012: The run engine laws — chaining voices becomes possible, and lawful

**Status:** Accepted · 2026-09-03 (recorded 2026-09-04)

## Context

The typography family (Heading, Text, TextBlock) shares one engine: the
root element carries the voice (`data-variant`) and size (`data-size`),
and an inner container (`.heading-text` / `.heading-link`,
`.text-content`, `.textblock-content`) receives the resolved font-size
and line-height and the cap-to-baseline trim (native `text-box-trim`, or
the margin fallback under `@supports not`). The door law
(`lib/typographyFamily.ts`, ADR-0006 §6's voiceMatrix move) already
guaranteed one component per voice × element × input shape.

A callout in the DN material exposed what the engine did not yet say: a
bold lead-in beside normal text on one line — and the monkey wrench, two
*families* on one line (an Inter label beside Noto Serif body). Four gaps
followed. Heading rendered slot children bare, outside the engine
container, and a test asserted that bypass as contract. Nothing stated
what `<strong>`/`<em>` inside a run should do. Nothing distinguished a
run that IS the line from a run that flows ON a line, so trim — a block
concept — had no lawful place to stop. And nothing said what happens
when a voiced component is nested inside another's run.

Commit `cd44866` (2026-09-03) closed the gaps with four laws, recorded in
the commit message and in `lib/typographyFamily.ts`. Hard rule 2 puts
decisions in the ledger; this ADR moves them there unchanged.

## Decision

1. **Child content passes through the engine container.** Prop text and
   slot children render inside the same inner container; no path
   bypasses size, leading or trim. (Heading's old bare-children contract
   is reversed; `tests/heading.test.ts` now asserts the wrapper.)
2. **Inline emphasis semantics are declared per family member** — the
   `emphasis` field of `FamilyMember`. The quiet voices (Text: body,
   label) keep the semantics: `strong`/`b` take the role convention's
   strong weight (`--fontWeight-body-bold`, the F2 decision in
   `tasks/typography-map.md` — no new weight stop), `em`/`i` stay
   italic. The loud voices (Heading) **flatten**: emphasis elements
   inherit the run's font; partial bolding of a heading is drift. The
   plaintext contract (TextBlock) declares `none` — markup is
   unrepresentable there, and `tests/typographyFamily.test.ts` proves
   plaintext ⇒ none and authored ⇒ a declared law.
3. **Run mode follows element shape, gated on `data-run`.** A `span` is
   an **inline run**: it flows on the line and steps out of trim — the
   line host and the browser's baseline negotiate its metrics. Every
   other element is a **block run** that owns its display and its trim.
   The component derives the value (`element === "span" ? "inline" :
   "block"`); it is not an author prop. The engine gates on the root
   attribute with the direct-child combinator, so an inner container is
   trimmed only when its own root is a block run:

   ```css
   &[data-run="block"] > .heading-text { display: block; }
   @supports (text-box-trim: trim-both) and (text-box-edge: cap alphabetic) {
     &[data-run="block"] > .heading-text { text-box-trim: trim-both; … }
   }
   ```

   Both trim branches (`@supports` and `@supports not`) sit behind the
   same gate; an inline run receives neither — absence is the contract.
4. **Voice sovereignty by inheritance, never by specificity.** Inside a
   run, an *unvoiced* inline element (`a, span, strong, em, b, i` without
   `data-variant`) inherits the run's metrics via `font: inherit;
   line-height: inherit; letter-spacing: inherit`. A *voiced* child (any
   element carrying `data-variant`) — and its whole subtree — is exempt
   from that reset at zero added specificity
   (`:where(:not([data-variant], [data-variant] *))`), so it owns its
   own bundle by the ordinary cascade of its own root. Nearest voice
   wins because inheritance says so, not because a selector outranks
   another.

Evidence: `fixtures/TextSection.astro` — the DN line in one voice
(`<strong>` inside a body run), the two-family chain (an Inter label
`span` run inside a Noto Serif body `p` host, sharing one line), and the
sovereignty proof (an unvoiced span inherits, a voiced child owns its
bundle).

## Alternatives rejected

- **Rendering children bare** (the pre-`cd44866` Heading contract).
  Rejected: it was the one path around the engine, and the test that
  protected it protected drift.
- **Semantic emphasis in the loud voices.** Rejected: a heading with a
  bold word is not a heading with emphasis, it is two weights where the
  voice promised one.
- **Winning the nested-voice contest by specificity.** Rejected: any
  selector strong enough to override the parent's reset would need an
  even stronger one the next level down. Exempting the voiced subtree
  from the reset removes the contest instead of escalating it.

## Consequences

- `data-run` joins the field dictionary: one word, one question — how
  does this run flow on the page? Values `block` | `inline`.
- Trim stays a feature layer that is removable in one sweep (ADR-0009);
  law 3 adds that it is also *scoped* in one place — the block gate.
  Anything that reasons about trim (the capability probes, the fallback
  math) reasons about `[data-run="block"] > <container>` and nothing
  else.
- Chaining is now a supported authoring form: a block run hosts inline
  runs of other voices, each carrying its own bundle. The fixture is the
  reference for what a lawful chain looks like.
- The `emphasis` field is part of the family contract; a new authored
  member must declare `semantic` or `flattened`, and the test refuses a
  plaintext member that declares anything but `none`.

## Open

- **Emphasis is declared per component, not per voice.** Heading also
  speaks the quiet `body` voice on h1–h6/legend/figcaption, and as a
  member it is `flattened` — so a body-voiced Heading flattens `strong`
  while a body-voiced Text keeps it. The commit message frames law 2 by
  voice ("quiet voices keep the semantics"); the code frames it by
  component. Which framing is the intended one is not settled here.
- **TextBlock carries `data-run="block"` but does not gate on it.** Its
  container and trim rules are ungated (`> .textblock-content`), which
  is equivalent today because TextBlock's farm is p/div only. Whether
  the attribute is a contract (and the selectors should match Heading
  and Text) or documentation is undecided.
- **The unvoiced inline list is closed** (`a, span, strong, em, b, i`).
  Other inline elements (`mark` from Heading's highlight, `code`,
  `small`, `sub`, `sup`) fall outside the reset. No source says whether
  the list is exhaustive by intent.
- **"Defaults owned by the component"** (commit message) — the run mode
  is derived, with no override. Whether an author-facing override is
  foreseen or excluded is not stated.
