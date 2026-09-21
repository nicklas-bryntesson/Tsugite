# ADR-0021: Line length is a bundle metric; the cap reads it through the chain

**Status:** Accepted · 2026-09-21

## Context

Nothing in the system said how long a line of text may be. The typography
family sets a run's face, weight, size, leading and tracking per voice and
stop, and then lets the line run as wide as the column. On a wide screen a
paragraph in the container's main column is a hundred and forty characters
long; a docs page shows it. The taste of the trade is sixty to seventy-five
for reading text and shorter for headings.

Four components capped their own inline size with hand-set values in rem
(Notice 50rem, Quote 48rem, ChoiceGroup 30rem, Surface's content slot).
A rem ceiling knows nothing of the text it caps: the same 50rem is forty
characters of a display face and ninety of a small label. ADR-0015 named
the word for the toggle, `data-cap-inline`, and left the value to "later a
step of a measure scale". ADR-0005 fixed the shape of every claim chain and
said the `--custom-*` level enters "when a real case requires it".

The alternative discussed was a free number per instance, the way a visual
site builder lets a designer set every heading's width at every breakpoint.
That is the override at the bottom of the stylesheet, moved into markup: it
solves the one case and breaks the system's one-truth thesis for every case
after.

## Decision

1. **Line length is a metric of the typography table, per size stop, in ch.**
   `typeLineLengths` in `theme-default/typography.tokens.js` carries one
   value per stop in `typeSizes`; the factory emits `--lineLength-<stop>`
   beside `--fontSize-<stop>`. A stop without a line length refuses to
   build; a unit other than `ch` refuses to build. One value serves all
   tiers: a ch is measured in the stop's own face at the tier's own size,
   so the ceiling steps with the ramp and survives a rebrand without a new
   number. Two ceilings meet in a column, the grid's in rem and the text's
   in ch, and the lower wins; nothing couples them.

2. **The word stays `cap-inline`; the value is `lineLength`.** The boolean
   asks whether there is a ceiling (ADR-0015); the token says how long a
   line is. Heading, Text and TextBlock carry `capInline` as a boolean axis,
   default `true`; Prose carries the same prop and attribute until it moves
   onto the table. The CSS applies the ceiling behind the `data-run="block"`
   gate: an inline run has no inline size to cap, its gate is written and
   means nothing. `false` is the release, `max-inline-size: none`. The name
   `measure` was rejected: the typographer's term for line length reads as
   "measurement" to everyone else, and the docs app already uses
   `data-measure` for live measurement.

3. **The custom level of the ownership chain activates, for this property
   first.** Each component reads its ceiling as
   `var(--custom-<component>-lineLength, var(--_lineLength))`, the chain of
   ADR-0005 with the instance level live and the component and theme levels
   still dormant (rule 3: at first real need). An instance claims by setting
   the variable in its `style` attribute, as a pointer to another stop's
   token, never as a number. ADR-0005 rule 2 (claims are pointers) holds for
   line length exactly as for colour; the reason differs (no appearance
   modes to break, but the steps stay a vocabulary and the knob keeps its
   detents) and the outcome is the same. A raw ch value on the custom level
   is not forbidden by the CSS, but it is not the sanctioned form and a
   review may refuse it.

4. **The tiers are the wall.** A ceiling that differs per viewport tier is a
   token row, decided for every instance of the stop, or nothing. There is
   no per-instance, per-tier lever and none is planned; that is where the
   site builder's "every heading at every breakpoint" ends and this system
   begins.

5. **`align` moves the box.** Once a run has a ceiling, `center` and `right`
   must place the capped box in the column as well as the words in the
   box: `margin-inline: auto` and `margin-inline-start: auto`. Before the
   ceiling the box filled the column and the distinction did not exist.

## Consequences

- Every Heading, Text, TextBlock and Prose on every page is capped from this
  commit; the docs pages change shape, which is the point.
- Caption (the UI voices) does not cap yet: labels, legends and buttons'
  words sit in boxes their fields size. Their stops carry nominal line
  lengths so the table is complete; the axis enters Caption when a case
  arrives.
- The four rem ceilings (Notice, Quote, ChoiceGroup, Surface content) are
  not typography and stay as they are; they are boxes, not lines. Whether
  Quote's should become the body stop's line length is a later pass.
- The interpreter's `when` gate takes one element or one part; "every block
  run" is not expressible, so the axis is ungated in the table and gated in
  the CSS. If a second axis needs "when the run is block", the gate grows a
  `run` form (a derived value) and this axis moves behind it.
- ADR-0005 and ADR-0015 are amended by pointer, not rewritten.
