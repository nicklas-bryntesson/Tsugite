# ADR-0023: Heading speaks the loud voices only; body on a heading shape is Text's cell

**Status:** Accepted · 2026-09-23 — pinned 2026-09-21 as a suspected cross-wiring,
decided and landed together.

## Context

The typography family assigns voices to doors (`lib/typographyFamily.ts`):
for any voice × element × input there is exactly one component. Heading
held three voices — heading, display and body — where body was allowed on
the heading shapes h1–h6 only, with five absent cells refusing it on span,
div, p, legend and figcaption. Text held body on everything else. The
door law was satisfied, so the wiring passed the test, and it was still
wrong in two ways that the test could not see:

- **The emphasis law follows the component, but it should follow the
  voice.** Heading flattens inline emphasis (ADR-0012 law b), which is the
  loud voices' law: partial bolding of a heading is drift. A body-voiced
  h3 rendered through Heading therefore flattened a *quiet* voice, whose
  law is the opposite — strong takes the body-bold weight, em stays
  italic. Text already implements that law; on Heading it did not exist.
- **The size hole had a special case.** Heading's default size is filled
  from the element (h2 → 2). Body's sizes are sm | md | lg, so the hole
  needed a second branch for body (`md`). On Text, md is the default and
  the element never decides the size.

The precedent was already in the family: Caption's farm includes h1–h6,
so a legend that must be a heading but look like a label has its cell.
The same shape for the reading voice was missing.

## Decision

1. **Heading speaks heading and display, nothing else.** Its promise is
   "one run of words in a loud voice". The body voice, the five absent
   cells and the body branch of the size hole are gone; a `variant="body"`
   on Heading is now an invalid value on a closed axis and is refused in
   development (ADR-0019).

2. **Text's farm gains h1–h6.** "One run of reading text in the body
   voice, on a text shape, a caption or a heading shape." Twelve elements,
   no absent cells; md by default whatever the element, as before. The
   markup for a heading that should read like text is
   `<Text element="h3" size="lg" text="…" />`.

3. **The rule behind it:** a voice's emphasis law travels with the voice.
   A component's door list is chosen so that every voice through it shares
   the component's law. Heading: flattened. Text and Caption: semantic.
   TextBlock: none (plaintext). A voice cannot sit behind a door whose law
   is not its own.

## Alternatives rejected

- **Keep body on Heading and special-case its emphasis** (a
  `[data-variant="body"]` exemption from the flatten rule). Two laws in
  one engine file, selected by voice — the cross-wiring made explicit
  instead of removed.
- **A third component for body-on-heading.** Nothing distinguishes it
  from Text but the element, and the element is already an axis.

## Consequences

- `lib/typographyFamily.ts`: Heading's voices are heading and display;
  `TEXT_FARM` includes the heading shapes. The family test holds both
  recipes to it.
- `recipes/heading.recipe.ts`, `lib/heading.ts`, `Heading.css`: the body
  voice, its absent cells, its size branch and its CSS block are removed.
  Heading refuses the quiet voice by name.
- `recipes/text.recipe.ts`: element gains h1–h6. `Text.css` needs no
  change — `margin-block: 0` on the root already neutralises the UA's
  heading margins, and the bundle is set by the voice, not the element.
- **Every fixture section title moves.** 158 `<Heading … variant="body">`
  in 26 files — the test-bench section headers, the docs app's Example
  title, the Typography fixture's body row — become `<Text element="h3|h4"
  size="lg|md">`. Their wrap default changes from Heading's `balance` to
  Text's `pretty`; the words are single lines and the bundle is the same,
  so nothing visible moves on a wide viewport.
- Docs: the Body example leaves `/docs/heading` and returns on
  `/docs/text` as "Body on a heading shape", with a `<strong>` that stays
  bold to show the law that motivated the move.
- `tiers.astro` already rendered the body specimens through Text; it is
  unchanged.
