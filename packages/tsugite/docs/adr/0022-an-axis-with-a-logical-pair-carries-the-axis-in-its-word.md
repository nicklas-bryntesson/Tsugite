# ADR-0022: An axis with a logical pair carries the axis in its word and takes logical values

**Status:** Accepted · 2026-09-23 — agreed in discussion 2026-09-22, landed with the
typography family's `align` renamed.

## Context

Typography's alignment axis was `data-align="left | center | right"` on
Heading, Text, TextBlock and Caption. The word names no axis, and the
values are physical: in a right-to-left run "left" is the end of the
line, and the gate says `text-align: left` where the system elsewhere
speaks in `margin-inline`, `inline-size` and `padding-block`.

ADR-0015 had already set the form for one such pair: `data-grow-inline`
and `data-cap-inline`, property first, axis after, as CSS names its
logical properties. The rule was implied there for two words and stated
nowhere. The grid lab (PR #69) then needed the block axis as well and
wrote `data-align-block` and `data-align-inline` on its own, which
showed the gap: without the rule, a component reaches for the physical
word because it is shorter.

The field dictionary (`component-model.md` §2.5, DRAFT) says a new
`data-*` axis takes a word that answers one question or extends the
dictionary deliberately. This ADR extends it with a rule about the word's
form, not a new word.

## Decision

1. **When a property has a logical pair, the axis is in the word.** An
   axis that could exist on both the inline and the block axis is named
   `<property>-<axis>`: `align-inline`, `grow-inline`, `cap-inline`,
   later `align-block` where a component owns its place on that axis. A
   bare `align` is not a dictionary word.

2. **Its values are logical.** `start | center | end`, never
   `left | right`, `top | bottom`. The gate sets the logical CSS value
   (`text-align: start`), so the same markup reads correctly in either
   direction (ADR-0011's `--dir` sign is not needed for this).

3. **An axis without a pair keeps a bare word.** `wrap` has no block
   variant and stays `wrap`; `size`, `emphasis`, `intent` are not
   spatial. Adding the axis suffix where there is no pair would be
   noise.

4. **Typography owns the inline axis only.** A run owns its line; the
   composition owns its place in the block. Heading, Text, TextBlock and
   Caption get `align-inline` and no `align-block`. A block axis word
   belongs to the composition or region that places children (the grid
   lab's `data-align-block` on its copy cell is the first sighting; its
   home is decided with the grid-region spike).

5. **Note on CSS itself.** `justify-*` is the inline axis and `align-*`
   the block axis in the box-alignment properties; `text-align` is the
   older physical exception typography inherited. The dictionary word
   `align-inline` is chosen for the question it answers — *where on the
   inline axis?* — and does not follow the box-alignment split.

## Alternatives rejected

- **Keep `align` with logical values** (`align="start"`). Fixes the
  direction problem, leaves the word ambiguous the day a block axis
  arrives on the same component.
- **Axis-first** (`inline-align`). Rejected in ADR-0015 for the same
  reason: the dictionary groups by question, and `align-inline` /
  `align-block` sit together when one looks for "where does it align".
- **Physical values behind a logical word** (`align-inline="left"`).
  Contradicts itself.

## Consequences

- Heading, Text, TextBlock and Caption: recipe axis `alignInline`
  (`start | center | end`, default `start`), attribute
  `data-align-inline`, gates set `text-align: start | center | end`.
  Fixtures, the heading contract test and the docs examples follow. In a
  left-to-right document nothing moves.
- The invalid-value error (ADR-0019) now reads
  `invalid alignInline "middle" — expected start | center | end`.
- Known dialect, left as is: AffixField's `data-align="end"` on its
  input (reference-components contract, the field family's frozen API,
  see the porting log). It already takes a logical value; the word is
  the upstream's.
- The docs app's DummyText (`data-align="start | center"`) is the docs
  app's own sketch component, not on the system's table; it takes the
  word when it is next touched.
- The dictionary in `component-model.md` §2.5 stays DRAFT; this ADR is
  the settled part of it for spatial axes, as ADR-0015 was for the two
  footprint words.
