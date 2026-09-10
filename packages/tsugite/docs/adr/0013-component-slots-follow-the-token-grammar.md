# ADR-0013: Component slots follow the token grammar

**Status:** Accepted · 2026-09-09

## Context

Three codebases were merged into this package. Two of them named their
private component slots (`--_*`, ADR-0007) differently:

- The reference-components lineage (all Field components, ChoiceField,
  ChoiceGroup, Picklist, Range*, ScrollArea, ThemeSwitch, ToggleTip,
  Notice): a two- or three-letter component prefix followed by
  kebab-case — `--_nt-border-width`, `--_df-segments-border-color-hover`.
  268 distinct slots, and nine runtime files read or set them from JS.
- The AiPoc lineage (Button, Card, Heading, Prose, Teaser) and the
  typography family (Text, TextBlock): unprefixed camelCase —
  `--_borderColor`, `--_fontFamily`. Card and Button both declared
  `--_borderColor` with different meanings, and Teaser nests one inside
  the other.

The doctrine (`docs/css-doctrine.md` §1) says slots are `--_*` and
nothing more. A name is a decision, so it belongs here.

The public token layers already have a grammar (ADR-0004), and every
layer follows it: `--fontSize-h1`, `--fontEmBox-heading`,
`--color-feedback-onError`, `--theme-button-backgroundColor-primary-hover`.
The CSS property is written as its JS name (camelCase); segments are
separated by hyphens. A slot is the last link of the same chain
(ADR-0008), so the chain should read in one grammar:

```
--_cd-borderColor: var(--theme-border, var(--color-border-default));
```

## Decision

1. **Form:** `--_<prefix>-[<part>-]<propertyCamel>[-<state>]`.
   The prefix is two or three lowercase letters unique to the component.
   The property is the CSS property's JS name, spelled out: `backgroundColor`,
   never `bg`; `color`, never `fg`. An optional part precedes it, an optional
   state follows it, and the state is always last:
   `--_pl-chip-borderColor-hover`, `--_nt-maxInlineSize`.
2. **Prefix register.** One prefix per component, never reused:

   | Prefix | Component | | Prefix | Component |
   |---|---|---|---|---|
   | `af` | AffixField | | `rf` | RangeField |
   | `cd` | Card | | `rg` | RangeGroup |
   | `cf` | ChoiceField | | `rs` | RangeScale |
   | `cg` | ChoiceGroup | | `sb` `sc` | ScrollArea (bar, container) |
   | `df` | DateField | | `tf` | TimeField |
   | `dtf` | DateTimeField | | `ts` | ThemeSwitch |
   | `fu` | FileUpload | | `tt` | ToggleTip |
   | `mf` | MonthField | | `wf` | WeekField |
   | `nt` | Notice | | `pl` | Picklist |
   | `te` | Teaser | | `sf` | Surface |

   A new component claims its prefix by adding a row here.
3. **Two kinds of slot, both on the root's terms.**
   - A *design knob* is declared on the component root with its default,
     whichever gate consumes it (`--_cd-borderWidth: 1px`). The root is
     the component's injection surface: a consumer or theme sets the
     knob on the root and every part below follows.
   - An *axis carrier* is set by the gates of one axis and read by a
     shared consumer (`--_lineHeight` set per voice, read by the engine
     container). It has no root default because it has no meaning
     outside a gate.
   This refines doctrine §1's "slots carry no value in the base": a knob's
   root value is its default, not a base-then-override; a carrier follows
   §1 as written.

## Alternatives rejected

- **Kebab-case throughout** (`--_cd-border-width`), the larger lineage's
  form. Rejected: it breaks the token grammar in the last link of the
  chain, and consistency with the design system's own layers outweighs
  the head count of the inherited slots.
- **Unprefixed** slots. Rejected: nesting collides (Card inside Teaser
  inside a page with Button), and the slot stops being searchable.

## Consequences

- Card and Notice convert with this ADR.
- Button (18 slots), Teaser (1) and Prose (1) need the prefix only;
  their property names already have the right form. Own passes.
- The reference-components lineage (268 slots, 9 runtime files, 4 e2e
  suites) converts in one dedicated pass with green suites before and
  after; until then it carries the old form knowingly.
- Heading, Text and TextBlock share one engine vocabulary (`--_fontSize`,
  `--_lineHeight`, ...). Whether that engine gets a family prefix or is
  extracted to a shared file is open; not decided here.
- `docs/css-doctrine.md` §1 should gain a pointer to this ADR.
