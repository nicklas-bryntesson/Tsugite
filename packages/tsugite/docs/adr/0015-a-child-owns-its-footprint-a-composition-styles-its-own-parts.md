# ADR-0015: A child owns its footprint; a composition styles its own parts

**Status:** Accepted · 2026-09-10 — proposed the same day, accepted after Teaser, a
composition with real layout logic of its own, was rebuilt on it: zero rules on a
child's class remain, and the button sits where it did in both container states.

## Context

Nothing said who owns a component's visual footprint inside another
component. Teaser positioned its button with a rule on the button's
class (`& .Button { margin-inline-start: auto }`); Notice, ChoiceGroup and
Picklist capped their own inline size with raw private values, and a
consumer who wanted them fluid had to write CSS on the child or inject
the slot. Every such rule is a second truth the child does not know about.

Tone already has a language: the ownership chain (ADR-0005) lets a
containing component claim a child's colour slots without touching its
CSS. Footprint had none. The field dictionary (`component-model.md`
§2.5, DRAFT) says new `data-*` axes take a word that answers one question
or extend the dictionary deliberately; this ADR extends it, with the
user's explicit sign-off (hard rule 3).

What a box can want on its inline axis turned out to be two independent
questions, not one enumeration: may it take more room than its content,
and is there a ceiling. All four combinations are meaningful (a validation
summary: grow, no cap; an inline notice with a long message: no grow, cap;
today's Notice: both; a button: neither), so an enum of three values
cannot express them and two booleans can.

## Decision

1. **Two dictionary words, boolean, inline axis, the axis in the name:**
   - `data-grow-inline="true|false"` — *may the box take more inline
     space than its content?*
   - `data-cap-inline="true|false"` — *is there a reading ceiling on its
     inline size?* The ceiling's value is the component's own slot
     (`--_nt-maxInlineSize`), later a step of a measure scale; the boolean
     toggles it and never picks it.
   Property first, axis after, as CSS names its logical properties
   (`margin-inline`, `overflow-inline`). The block axis gets no words now;
   its form is reserved (`grow-block`, `cap-block`) and activates at first
   real need (ADR-0005 rule 3). On the block axis the parent almost always
   decides through its own alignment, and a cap that clips text is a bug.
2. **The child owns its footprint axes**, declares both gates for each
   (off value first, ADR-0013's gate rule) and its own default. Forbidden
   combinations on these axes (an icon-only button that grows, say) are
   refused in the child, as a negative list that will come from the
   theme.
3. **A composition styles its own parts, never a child's class.** Where a
   child sits in the parent's flow is the parent's decision, expressed on
   a part the parent owns (a region, a slot wrapper), not by selecting
   `.Button`. What the child does inside its box is set through the
   child's props.
4. **Tone keeps going through the claim chain** (ADR-0005), unchanged.

## Addendum 2026-09-10: permission and allocation

The footprint booleans are static, and a design often wants different
footprints per context — a Teaser's button spanning the row in its
one-column state and fitting its label beside media. That is not a
per-state prop value. The child's boolean is a **permission**: `true`
means "I fill what I am given", `false` means "never". What the child is
given is the parent's **allocation**, decided in the parent's own region
per container state, viewport tier or user preference:

```css
& .Actions { display: grid; }
@container (max-width: 24.999rem) { & .Actions { grid-template-columns: 1fr; } }
@container (min-width: 25rem)     { & .Actions { grid-template-columns: max-content; justify-content: end; } }
```

The button is `grow-inline="true"` in both states and never learns which
state it is in. (The example shows the mechanism; what Teaser ships is a
`max-content` track in both states, start-aligned stacked and end-aligned
beside media. Whether the button ever spans the row, and on which axis —
the stacked state is not it, a 3-up desktop grid is stacked too — is an open
`TODO(decide)` in Teaser, to be settled with a real design in front of us.) Three kinds of lever follow, and only the first is props:
the author's choice per instance (`data-*`, static); the design's choice
per context (tokens, and CSS gates in the composition's regions); the
user's choice (media gates, never props). **A prop never carries a
context condition** — no `grow="sm:true lg:false"`. That is ADR-0001's
rule for tiers applied to every axis, and it is what keeps this system
from becoming utility classes as data attributes. A composition that
wants a page to choose between behaviours exposes an axis of its own,
or refuses.

## Alternatives rejected

- **One enum** (`data-width="fit | measure | stretch"`): cannot express
  grow-with-cap versus grow-without-cap; conflates two questions.
- **`fill`, `expand`, `measure`, `stretch` as words:** `fill` is taken by
  RangeScale's track fill; `expand` says nothing about the limit;
  `measure` and `stretch` name a value, not a question.
- **Axis-first naming** (`inline-grow`): groups by axis; the dictionary
  groups by question, and `grow-inline` / `grow-block` sit together when
  one looks for "may it grow".
- **Letting the composition write CSS on the child.** The status quo, and
  the drift this ADR exists to stop.

## Consequences

- Notice takes both axes with this ADR (defaults grow + cap); its
  `max-inline-size` moves out of the base into the cap gates. Docs get a
  Footprint example.
- Teaser must compose Button as a component before `grow-inline` can be a
  prop there; today it builds `<a class="Button" …>` as a string. Its
  `& .Button` rule moves to a Teaser-owned actions region in that pass.
- ChoiceGroup and Picklist take the axes when their cleanup turn comes.
- A measure scale in the token factory is the natural home for the cap
  values (50rem, 30rem today); the registry has none yet.
- `component-model.md` §2.5 gains the two words when it is next revised;
  until then this ADR is the record.
