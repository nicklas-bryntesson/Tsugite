# ADR-0019: An invalid value on a closed axis is an error

**Status:** Accepted · 2026-09-17. Policy only; no proof needed beyond the
fixtures that already assert it for Card.

## Context

Card raises a dev error on an invalid `padding`. Button dropped an
invalid `emphasis` silently and a `TODO(decide)` in `lib/button.ts`
recorded the disagreement. Astro adds a third behaviour by accident:
an unknown prop such as `intent` on a `LinkButton` is spread onto the
element and leaks out as an `intent="…"` attribute. Three policies for
one situation.

ADR-0018 makes recipes data and could have given every axis an
`onInvalid` field. It would be set to the same value everywhere and
differ only by mistake.

## Decision

1. **A closed axis given a value outside its set resolves to
   `mode: "error"`.** One rule for the system, no field in the schema.
   A Button with no `data-emphasis` is a state the CSS has no answer for,
   and a deterministic system does not render unknown states. Silently
   dropping the attribute, or silently substituting the default, both
   render something nobody asked for.
2. **Element falls back to its default.** Not an exception to the rule:
   element is not an axis in the same sense, and the fallback (`div`,
   `article`) is always an honest answer.
3. **An axis that does not exist for the given element is an error**
   under the same rule — `intent` on a link is not ignored and not
   leaked; it is refused.
4. **Two messages for two kinds of invalid**: *not in the system*
   (`padding="huge"`) and *closed in this project's configuration —
   permitted here: none | sm*. The recipe knows which, and says so.
5. **The consequence is the host's, not the recipe's.** Development is
   always loud (`DevError`, or each host's equivalent). In production an
   Astro static build fails, so the error never ships; a .NET runtime
   suppresses the component, as its `RenderError` already does. The
   recipe says `error` and stops there.

## Consequences

- Button's silent drop becomes an error; the `TODO(decide)` closes.
- One docs example changes: `apps/docs/src/examples/button/Intent.astro`
  passes `intent="destructive"` to a `LinkButton` to show that a link
  ignores it. Today that prop is not consumed by the renderer and leaks
  onto the `<a>` as an `intent` attribute, which the example's own
  comment does not know. Under this rule the example becomes a refusal,
  and the page says so instead.
- The `[key: string]: unknown` pass-through in the Astro renderers stays
  (it carries `id`, `style`, `aria-*`), but a recipe's own gated axes are
  consumed before the spread, so they cannot leak.
- Fixture files carry the error cases with their messages; the messages
  are courtesy, the mode is the contract, and a port may compare on
  prefix.
