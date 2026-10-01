# ADR-0024: The text-box engine is one generated kernel file; the mode is intent

**Status:** Accepted · 2026-10-01 — decided in discussion after the run-engine
lab (PR #82); the build follows. Amends ADR-0012 §3 by pointer.

## Context

The trim engine exists in four copies — Heading, Text, Caption and TextBlock —
identical but for the container class (`heading-text`, `heading-link`,
`text-content`, `caption-content`, `textblock-content`) and the slot prefix
(`--_`, `--_hd-`, `--_cp-`). Button carries a fifth, dead one (`Button-text`).
Every copy maps the voice's metric tokens into private slots and runs the same
fallback formula against them.

ADR-0012 §3 gates the engine on `data-run="block | inline"`, derived from the
element (`span` → inline). Two things went wrong with that:

- **The word.** `data-run` reads as "makes the component block". It gates the
  container's mode, not the root's display.
- **The derivation.** An author who wants text inside a line must know that
  `element="span"` happens to mean "flows on the line", and what that does to
  the inner element. One component writes two elements; the author should not
  have to know.

The lab (`/lab/run`) showed the kernel candidate renders the same pixels as
Text.css's own copy, and that the fallback formula reads variables only — no
magic numbers — so it can be written by code.

## Decision

1. **The engine owns the box and the trim, nothing else.** In block mode the
   container is `display: block` and trimmed cap to baseline (native
   `text-box-trim`, margin fallback). The reading ceiling (`cap-inline`,
   ADR-0021) and the box move under alignment stay in the components: they
   exist on some doors only and carry per-door values.

2. **One generated file.** `engine/text-box.js` (`generateTextBoxStylesheet()`)
   writes `kernel/css/text-box.generated.css`, run by `pnpm tokens` beside the
   other generated sheets, with a freshness test. Its input is `typeVoices` in
   `theme-default/typography.tokens.js`; voices without block metrics are
   skipped. It emits:
   - **one cell per voice**, `[data-variant="<voice>"]`, filling the engine's
     slots: `emBox`, `capGap`, `descent`, `baselineOffset`, `lineHeight`. All
     five are per voice, not per size. Font size is not an input: the formula
     multiplies by `1em`, the container's own inherited size;
   - **both mode gates**, `block` and `inline` — inline is a gate of its own,
     not the absence of one;
   - **three mutually exclusive trim blocks** from one formula: native under
     `@supports`, excluding forced regions; fallback under `@supports not`;
     fallback again under `[data-test-text-box="fallback"]` on an ancestor. The
     forced block excludes the native one; it never wins by source order. The
     duplication lives in the output, not the source.

3. **The gate is a data attribute, the container a class.**
   `[data-text-box="block"] > .text`. The attribute names the mode, the class
   names the part (class naming: capital = root, lowercase = part). Every
   container dialect becomes `.text`; Heading's link is `<a class="text">`.

   ```html
   <p class="Text" data-variant="body" data-text-box="block">
     <span class="text">…</span>
   </p>
   <button class="Button" data-variant="button" data-text-box="block">
     <span class="text">Save</span>
   </button>
   ```

4. **The mode is intent; the element follows** — reverses ADR-0012 §3's "it is
   not an author prop". `<Text inline />`, boolean, default false: the author
   says "this text sits in a line" and the component picks the root element,
   the container and the gate. Forbidden cells: `inline` with a block-only
   element (p, div, h1–h6, legend, figcaption); `inline` with `cap-inline`.
   With that cell closed, the components' ceiling and alignment selectors drop
   the mode (`[data-cap-inline="true"] > .text`). `element="span"` without
   `inline` is a block — new behaviour, allowed. `inline` is the prop; the
   attribute keeps its own word because `-inline` is the logical-axis suffix
   (`align-inline`, `grow-inline`, `cap-inline`).

5. **Components with one mode write it anyway.** Button and TextBlock always
   project `data-text-box="block"`, so markup reads the same everywhere and the
   engine never keys on presence or on component names. Button carries
   `data-variant="button"` to reach its voice cell.

6. **Components read the engine's `lineHeight`.** The voice cell is the one
   truth; the component's `line-height` reads that slot instead of mapping its
   own copy.

## Alternatives rejected

- **Components fill the engine's slots** (option A). Smallest step, but the
  voice → metrics mapping stays in four copies and every new door must
  remember it.
- **Key the engine on component classes** (`.Button > .text`). The kernel file
  would have to know component names.
- **No attribute; the element decides** (`:not(span)`). Ties the engine to
  tag names, which say nothing about mode on Heading's `<a>` or on Button.
- **`data-flow`.** Better than `run`, but collides with CSS's own flow layout
  and says nothing about the trim.
- **`data-test-text-trim="false"`.** Reads as "no trim"; the fallback trims too.

## Consequences

- Heading, Text, Caption, TextBlock lose their trim copies, voice metric
  mappings and container dialects; Button's dead engine goes. `runOf(tag)` in
  `lib/typographyFamily.ts` gives way to the `inline` prop; the family test
  gains the forbidden cells.
- Button's markup gains `data-variant="button"` and `data-text-box="block"`;
  its padding is recalibrated against the trimmed label (lab D).
- `data-test-text-box="fallback"` lets control room show native and fallback
  side by side in one modern browser. The correct lab demos (A, D, G, what
  holds of F) move there as permanent benches; `/lab/run` is deleted in the
  same job.
- Prose is out of scope: it controls neither markup nor classes, and gets its
  own answer.

## Open

- ADR-0012 §4 (voice sovereignty) and law (b)'s selectors are rewritten later,
  after the selector is rethought (TODOS(?) in Caption.css).
- The `code` voice's `inline: true` means "no block metrics" — a different
  thing from the prop; renamed when Prose is taken up.
