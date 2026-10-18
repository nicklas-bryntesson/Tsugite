# ADR-0030: A control's size is one knob

**Status:** Accepted · 2026-10-18 — agreed in discussion 2026-10-17/18, after the
Button em lab (`apps/docs/src/pages/lab/button-em.astro`, PR #155), recorded in
`docs/seams.md` §4.

## Context

A Button's size is a stop on the button voice's font-size ramp (sm, md, lg), and every
other size slot — block and inline padding, icon, gap — was set per stop by hand. The lab
measured what that produced:

- **The font size sat on the label, not on the button.** Every em on the root therefore
  resolved against the page's 16px: `paddingInline: 1.4em` was 22.4px on sm and md alike,
  lg's `paddingBlock: 0.8em` was 12.8px, the radius was page-relative, and the text-box
  formula multiplied by `var(--_bt-fontSize)` by hand to reach the label's size. Em that
  behaved as rem.
- **The stops followed no scale.** In em of each button's size the block slot was sm 0.59,
  md 0.44, lg 0.58 — piecewise.
- **Icon and gap were proportional all along**, written in rem: 1.33em and about 0.67em.

An exception that wanted "this button one size up in this range" had to restate five
slots; a site builder that wanted knobs for its controls had nothing regular to turn.

## Decision

1. **The size lives on the control itself.** Button sets `font-size: var(--_bt-fontSize)`
   on the `a`/`button`; the label inherits it. Every em in the button is the button's em.
2. **A size axis sets the font-size stop and nothing else.** The other size slots are in em
   of it, declared once on the root:
   ```css
   --_bt-paddingBlock:  var(--custom-button-paddingBlock, calc(0.25rem + 0.3em));
   --_bt-paddingInline: var(--custom-button-paddingInline, 1.4em);
   --_bt-iconSize:      var(--custom-button-iconSize, 1.33em);
   --_bt-iconMargin:    var(--custom-button-iconMargin, 0.67em);
   ```
3. **The block slot is affine:** a fixed part plus a part that follows the size. The fixed
   part gives small sizes relatively more air (optical compensation); the proportional part
   keeps the scale one knob — an exception that fills only `--custom-button-fontSize`
   carries every other slot with it.
4. **A field shares the block slot.** Input's `--_in-paddingBlock` is the same formula in
   the field's em, so a field and a button at the same size stand at the same height by
   construction (the field contract, now a property of the formula).
5. **Button is a control; CtaButton is the expression.** Button aligns with fields and
   choices, so this scale rules it, and its lg is a larger control, not a hero. A large call
   to action is CtaButton's: named, project-extensible variants free to carry their own
   geometry. The expression gets a room of its own instead of bending the control's scale.

## Consequences

- Measured: floor sm 32.8 / md 38.5 / lg 42.3px; mobile 32.8 / 40.4 / 48px; desktop 35.9 /
  44.2 / 51.8px. md on desktop grows about 3px (41.4 → 44.2); sm on the smallest tier stays
  above the 24px target size (WCAG 2.5.8), so no floor is needed. Input follows md.
- The radius (`0.375em`, the pill's `3em`) and the inline padding now scale with the size,
  as their units always said.
- The text-box formula reads `1em` where it multiplied by `var(--_bt-fontSize)`.
- Input gained the size axis in a follow-up (sm, md, lg on `field-small`, `field`,
  `field-large`, Button's stops), so a field and a button match at every size.
- Not yet: FileUpload and NavItem keep their
  own `--size-sm` slots; CtaButton keeps its own geometry and its comment that it "stands
  on Button's height" no longer holds — a pass of its own.
