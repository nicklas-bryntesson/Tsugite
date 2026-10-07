# Plan — the fields job

Live plan. Deleted when the job's last PR merges; the decisions move to an ADR ("the field
skin") once the model for typography, padding and states is complete.

## Scope

1. The base fields get one model for typography, padding and states.
2. AffixField moves onto that model and into the family.
3. Stop. Then either the complex inputs (date, time, …) on the same model, or table them and
   bring ToggleTip onto the recipe table instead.

## Settled in discussion (2026-10-07)

- **Wrapperless base fields.** The skin — typography, padding, border, background, states — sits
  directly on `<input>`, `<select>`, `<textarea>`. It works for every `type`, native date and time
  included. Every state lives on the element, so nothing mirrors it.
- **Hidden fields, name grouping, tokens and the like are composition level** (the form, the
  Field group). A Field group root, when it renders label, hint and error, stacks siblings and
  wires `aria-describedby`; it draws nothing around the control.
- **The one seam is AffixField** (later the custom date fields): its box takes border and
  background, the inner input goes bare, the box reads states through `:has()`.
- **A voice of its own: `field`.** Value, placeholder, affix and, in time, the type inside the
  custom overlays. It starts at button's values; the engine gets a `field` cell. Colours are
  roles, not voice: `--color-field-*` (text, placeholder, affix, autofill tone, border per state).
  "value" is a manner on top (tabular, nowrap, no ligatures).
- **Height = Button md, by construction.** The field takes button's padding and its 1px border;
  an input needs no trim, its content is one line, so `lineHeight × size + 2 × padding + 2 ×
  border` is button's height. Fields come in md only (lg maybe, no sm).
- **Autofill is an owned state** with a tone from the tokens, painted over the engine's own
  (inset box-shadow, `-webkit-text-fill-color`, `caret-color`; Firefox's filter reset).
- **Three engines.** A Playwright project per engine (Chromium, Firefox, WebKit) runs only tests
  tagged `@engines`, as its own CI job, not required.

## The state map — the spec for the probe

The map now lives as data, `packages/tsugite/fixtures/states/field.states.ts`, drawn as a matrix
on the Input bench (`fixtures/states/StateMatrix.astro`) and held complete by
`tests/state-maps.test.ts`. The table below is its first draft.

Eight conditions: hover, focus (focus-visible), invalid, disabled, read-only, autofill, empty
(`:placeholder-shown`), and invalid carried by `aria-invalid` alone.

| | hover | focus | invalid | disabled | read-only | autofill | empty |
|---|---|---|---|---|---|---|---|
| **hover** | – | yes | yes | yes? | yes | yes | yes |
| **focus** | | – | yes | **no** | yes | yes | yes |
| **invalid** | | | – | aria | aria | yes | yes |
| **disabled** | | | | – | yes | ? | yes |
| **read-only** | | | | | – | ? | yes |
| **autofill** | | | | | | – | **no** |

- **no** — unreachable: a disabled field takes no focus; an autofilled field has a value.
- **aria** — disabled and read-only fields are barred from constraint validation, so `:invalid`
  never matches, but `aria-invalid="true"` can still be set by a server or a script.
- **yes?** — `:hover` on a disabled field is expected to differ between engines.
- **?** — unknown: does an engine autofill a disabled or read-only field, and does `:autofill`
  survive a script disabling the field afterwards?

21 pairs: 2 unreachable, 2 by aria only, 3 unknown, 14 sure. Triples that matter: hover + focus
+ invalid (pointing at the field being corrected), focus + invalid + autofill, hover + focus +
autofill.

**The `:invalid` trap.** `:invalid` matches at load for an empty required field, so a form is red
before anyone typed. `:user-invalid` fixes that but needs Chrome 119; the floor is 109. The
invalid state is likely driven by `aria-invalid` (server or script), not a pseudo-class — a
decision for after the probe.

**The rig.** `data-test-state` must carry several states at once (space-separated, read with
`~=`), the same change Button.css's `TODO(investigate)` asks for.

## The probe's first reading (2026-10-07, Playwright's current Chromium, Firefox, WebKit)

Identical in all three engines:

- **`:disabled` also matches `:read-only`.** A disabled input is not mutable, so it is read-only
  to the selector. A read-only gate must exclude disabled, or disabled must come after it. Not in
  the map; the main finding.
- **`:hover` matches on a disabled input** — the "yes?" cell is yes.
- **The aria cells hold:** disabled + required and read-only + required never match `:invalid`;
  `aria-invalid` stays on both.
- **The `:invalid` trap holds:** an empty required input is `:invalid` at load.
- **A disabled input takes no focus** (asserted).

**The invalid source — decided 2026-10-07: `aria-invalid`, set by a kernel script.** The skin
reads `aria-invalid="true"` only, never `:invalid` or `:user-invalid`: what is seen and what is
announced are one truth. A small kernel script runs `checkValidity()` when a field is left and
when its form is submitted, sets `aria-invalid` and wires the error message
(`aria-describedby`); a server sets the same attribute without any script. That gives
`:user-invalid`'s timing in every engine above the floor, and the server's own rules ("this
address is taken") land in the same state.

Still open: the autofill cells (manual, by hand on `/lab/field-states`), and the floor — these
are current engines, not Chrome 109.

## Steps

1. **Probe** (done, first reading above) — `/lab/field-states`: one native input per configuration (disabled, read-only,
   required, `aria-invalid`, empty or filled); an `@engines` test drives hover and keyboard focus
   and records which pseudo-classes match, per engine, as a report. It decides the `?` cells;
   autofill cannot be driven by Playwright and stays a manual reading.
2. **Decided:** the state order, lowest first: rest → hover → autofill → focus → invalid →
   read-only (excluding disabled) → disabled; `:active` is not a field state. The invalid source
   is `aria-invalid`.
3. The `field` voice (done: md only, button's values, a text-box cell) and the `--color-field-*`
   roles in the theme.
4. **Input** (in progress, 2026-10-07: the primitive, its skin in the decided order, the kernel's
   field-validity script, the bench at /docs/input, height and validity tested @engines). Then
   the skin on the other base fields (Select, Textarea), then TextField, the height contract rewritten to
   field == Button md (native and forced fallback, 0.1px), tagged `@engines`.
5. AffixField onto the model. Stop.
