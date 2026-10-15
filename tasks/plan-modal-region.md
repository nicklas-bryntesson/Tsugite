# Plan — the modal region

Live plan. Deleted when the job's last PR merges; the decisions move to an ADR (ADR-0029,
"a region hears its children through channels") once the spikes below have held.

## Scope

1. A `Modal` region on native `<dialog>`: one slot, no assumptions about its content.
2. A generic, framework-agnostic channel contract from child to region: `title`, `description`,
   `close`.
3. Stop. Then the consent banner as a composition (ThemeSwitch pattern), and the React/Vue
   adapters.

## Settled in discussion (2026-10-14 – 2026-10-15)

- **The region never opens itself.** It exposes `show-modal` and `close` only — as invoker
  commands (`command` + `commandfor`) and through the native `showModal()` / `close()`. Whoever
  calls it decides when: a button, a script, or a kernel decision.
- **The region owns the mechanics:** a `dismiss` prop (`any | request | none`, mapping to
  `closedby`), placement, scroll (content scrolls inside, the page is locked), the box's cap
  against the viewport, the backdrop, and enter/exit/backdrop timelines as slots.
- **The region owns no grid.** One slot takes any nested tree (`dialog > grid > Card > form`).
  A grid is its own component, placed inside by the consumer.
- **`role` prop**, `dialog` by default, `alertdialog` opt-in — independent of `dismiss` (a consent
  banner cannot be dismissed but is not an alert).
- **The region owns zero strings.** Channels point at markup the child already renders, so they
  inherit its `lang`. The `label` prop (`aria-label`, no `lang` of its own) is the one string, and
  the caller passes it in the page language.
- **Channels travel through the DOM, not props.** One attribute with a closed value set,
  `data-channel="title | description | close"`. The kernel wires them when the region opens:
  `title` → `aria-labelledby`, `description` → `aria-describedby`, `close` → `command="close"` +
  `commandfor` (the button's `value` becomes `returnValue`). One implementation in the kernel
  works in Astro, React, Vue, Svelte, Solid and Preact alike; Astro has no runtime context, so a
  prop-passed id would mean one implementation per framework.
- **The nearest region above a marker owns it.** Modals inside modals are avoided, but a chip
  popup or mega menu inside a modal is still a region inside a region.
- **Exit motion is Chromium-only.** It needs `overlay`; Firefox and Safari close without exit
  motion. No JS timeline. Enter motion uses `@starting-style`; Chrome 109 gets none.
- **Gates (business rules) belong to the child.** A type-to-confirm alert disables its own close
  button until the text matches; the region knows nothing about it.
- **The consent banner follows the ThemeSwitch pattern exactly:** a pure kernel decision
  (`kernel/js/consent-preference.ts`, like `theme-preference.ts`), a `<head>` guard that acts
  before first paint, a component that holds the storage key. A signup popup has no decision —
  its button opens it.

## To stress-test before the ADR

- **A region = `closest('dialog, [popover]')`, no marker of its own.** Already under pressure:
  ToggleTip is a rail variant *without* the Popover API, because Popover needs Chrome 114 and
  `.browserslistrc` reaches Chrome 109 (see `ToggleTip.astro` header). Test against ToggleTip,
  a mega menu, and a popover inside a dialog. If it fails, the alternative is a region marker.

## Platform support (caniuse, 2026-10-15, against `defaults` → Chrome 109)

| Feature | Chrome | Firefox | Safari | Consequence |
|---|---|---|---|---|
| `showModal()` | ✓ | ✓ | ✓ | none |
| `command` / `commandfor` | 135 | 144 | 26.2 | kernel fallback, feature-detected |
| `closedby` | 134 | 141 | none | kernel fallback: `cancel` (none), backdrop click (any) |
| `@starting-style` | 117 | 129 | 17.5 | enter motion is an enhancement |
| `overlay` | 117 | none | none | exit motion Chromium-only (settled) |
| Popover API | 114 | 125 | 17 | below the floor — see the stress test |

## Dependency graph

```
spikes (probe page, three engines) ── region-recognition stress test
        │
     ADR-0029 (channels + region contract)
        │
  kernel/js/region-channels.ts  (pure resolution + DOM wiring, command/closedby fallbacks)
        │
  Modal.astro + Modal.css  (open/close, dismiss)
        │
  ├── close channel ── title/description channels + label + DevError ── role
  ├── placement + scroll lock + viewport cap
  └── backdrop + motion slots
        │
  docs page + manifest
        │
  (next job) consent banner · React/Vue adapters
```

## Risks

- **Three engines are not in CI yet.** `closedby` and `command` fallbacks matter most in WebKit
  and Firefox; the `@engines` Playwright projects are proposed in `plan-fields.md` but not built.
  The spike runs them locally until they exist.
- **The region-recognition rule may fail** (see above) — it gates the ADR, so it runs first.
- **Wiring on open vs. content that renders later.** A framework child may mount after
  `showModal()`. The spike checks whether wiring at open is enough or a `MutationObserver` on the
  open region is needed.
- **Slot names for motion and backdrop** must come from the registry; missing tokens are left as
  `TODO(token)`, never invented.

## Open questions

- The exact attribute name (`data-channel` is the working name) — confirm against the field
  dictionary in the ADR.
- `dismiss` default: `request` (Esc closes) is assumed.
