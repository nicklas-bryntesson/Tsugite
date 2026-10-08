# ADR-0025: A test state is one boolean attribute per state

**Status:** Accepted · 2026-10-08 — agreed in discussion 2026-10-08; lands with
Button and the state maps first, the rest one component at a time.

## Context

A state the browser owns (`:hover`, `:active`, `:focus-visible`, …) cannot
be held still on a bench or in a test, so every state gate has a twin the
bench can set: today `[data-test-state="hover"]` beside `:hover`. The
form grew one value at a time and was never decided.

The button state map (PR #106) needed two states at once, so the twin
became a space-separated token list read with `~=`:
`data-test-state="active focus"`, gated by
`[data-test-state~="focus"][data-test-state~="active"]`. That works, but
it raises three problems:

- **One attribute answers many questions.** `data-test-state` answers
  hover, active, focus, disabled, autofill, read-only, and also `debug`,
  which is not a state at all. The field dictionary (`component-model.md`
  §2.5, DRAFT; settled parts in ADR-0015 and ADR-0022) says one word
  answers one question.
- **The value set is open.** A token list accepts anything: `"hovr"` is
  taken without a word and lights nothing. No table closes it.
- **A repeated attribute is not two states.**
  `<button data-test-state="active" data-test-state="focus">` looks like
  two states, but the HTML parser keeps the first attribute and silently
  drops the second. So the only way to write a combination is the list
  form, which is the least explicit one.

The CSS is deterministic in either form. What is not closed is what gets
written *into* the markup.

## Decision

1. **One attribute per state, mirroring one pseudo-class.** A test state
   is `data-test-state-<state>="true"`: `data-test-state-hover`,
   `data-test-state-active`, `data-test-state-focus` (the twin of
   `:focus-visible`), `data-test-state-disabled`,
   `data-test-state-autofill`, `data-test-state-readonly`. Each answers
   one question, as a pseudo-class does.

2. **Booleans are written `="true"`**, as every other boolean in the
   system (`data-pill="true"`, `data-grow-inline="true"`). The gate reads
   `[data-test-state-hover="true"]`. Absent means not in that state.

3. **A combination is two attributes.** Focus-visible and active at once
   is `data-test-state-focus="true" data-test-state-active="true"`, gated
   by both twins: `&[data-test-state-focus="true"][data-test-state-active="true"]`
   beside `&:focus-visible:active`. You opt into exactly what you write.

4. **Debug is not a state.** The measuring overlays move to their own
   attribute, `data-test-debug="true"` (kernel `debug.css`, the docs
   instruments).

5. **The twin is for benches and tests only.** It is written by state
   maps, fixtures and e2e tests. Production markup never carries it, and
   the twin's selector sits beside the real pseudo-class, always as a
   pair, as the writing-css example already teaches.

6. **The state maps write the attributes.** A `State`'s `props` in
   `fixtures/states/` sets its own attribute (`{ "data-test-state-hover": "true" }`),
   so `propsFor` merges props instead of joining tokens. A combination
   cell is the union of its states' props.

## Alternatives rejected

- **The token list with `~=`** (today, since PR #106). Combinations come
  for free, but one attribute answers many questions, the value set is
  open, and a misspelling is silent.
- **One value per combination** (`data-test-state="hover-active"`). One
  selector per cell; the number of gates grows with the square of the
  states. Rejected in the button states spike (2026-09-23).
- **Bare presence attributes** (`data-test-state-hover`). Shorter, but
  every other boolean in the system is written `="true"`. The twin would
  be the only exception, and the exception would be in the place meant to
  be read most literally.
- **A test that every written twin is gated** (a fixture writing
  `data-test-state-hovr`, or `-readonly` on a Button, would fail). It
  would close the write side as the gates close the read side. Not now:
  the twins are written by state maps and by agents reading the
  component's contract, and a miss shows on the bench as a cell that
  looks idle.
- **A shorter word** (`data-test-hover`). Loses the grouping: the
  `data-test-state-` prefix is what says "a twin of a browser state", as
  against `data-test-debug` or `data-test-text-box`.

## Consequences

- Every gate with a twin changes its twin selector: Button, CtaButton,
  NavItem, Input, RangeField, and the field components that carry
  state CSS in their `.astro` (DateField, Picklist, ThemeSwitch, …).
  The real pseudo-class side does not change, so nothing moves on screen.
- Components that forward the twin to an inner element (the fields)
  forward the new attributes.
- `fixtures/states/types.ts` loses the token join in `propsFor`; the
  field and button maps write the new attributes. The state-map test
  holds them complete as before.
- The e2e tests that set `data-test-state` (RangeField, RangeScale) and
  the button unit test move to the new attributes.
- The writing-css `example.css` shows the new form, in the same PR
  (its own rule: an example that lags teaches the wrong thing).
- Migration order: Button and the state maps first, where the
  combinations live; then the rest, one component at a time.
