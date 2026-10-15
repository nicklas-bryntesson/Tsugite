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

## Region recognition (settled after the stress test, 2026-10-15)

- **A region carries a marker of its own** (alternative (b) below). The native-only rule
  `closest('dialog, [popover]')` failed: every popup region in the package is a
  `div role="dialog"`, and a mega menu is neither. The kernel resolves a channel to
  `closest('<marker>')`. Open: the marker's name, and how a non-native region (no `close()`)
  hears `close`.

## Spike results (2026-10-15)

Run with Playwright 1.62.1: Chromium 151, Firefox 153, WebKit 26.5. All three are newer than the
floor, so the fallback paths were forced on modern engines (attributes left off), not run on
Chrome 109 or an older Safari.

**Task 1 — platform probe.**
- Holds in all three: `command="show-modal"` opens, `command="close"` closes with the button's
  `value` as `returnValue`, Esc closes under `closerequest`, focus returns to the opener
  (keyboard activation — WebKit does not focus a button on mouse click, as on macOS).
- `closedby` fallbacks hold in all three: `cancel` + `preventDefault` keeps `none` open on
  repeated Esc; a click whose target is the dialog and lies outside its box closes `any`.
- WebKit 26.5 already has `closedby` (caniuse lists Safari as unsupported) — a release is coming.
- `overlay`: Chromium only, as expected. `@starting-style` everywhere.
- Scroll lock via `:root:has(dialog:modal) { overflow: hidden }` holds in all three when the
  pointer is over the page. One WebKit run with the pointer at 0,0 scrolled; not reproduced, to
  recheck in real Safari.
- **Finding: a close button inside a `<form>` is a submit button.** Delegated click handling lets
  the form submit (the page reloads). With `command` on a submit-type button nothing happens at
  all — no submit, no close — in every engine. With `type="button"` it closes with the right
  `returnValue`. So the kernel sets `type="button"` on a close channel (or the child must),
  and the fallback path calls `preventDefault`.
- **Finding: delegation covers late children.** A close channel mounted after `showModal()`
  closes through one document-level listener. Close needs no observer; `title`/`description`
  wiring still happens at open and must be re-checked for late mounts.

**Task 2 — region-recognition stress test. `closest('dialog, [popover]')` FAILS.**
- Every existing popup region in the package is a `div role="dialog"`: ToggleTip (rail, no
  Popover API because of the Chrome 109 floor) and the DateField, TimeField, WeekField,
  MonthField and DateTimeField pickers.
- A picker inside a modal form is a likely case (a signup with a date). A close channel inside
  the picker would find the Modal, not the picker, and close the wrong region.
- A mega menu is usually an in-flow disclosure: neither dialog, popover nor `role="dialog"`.
- A non-native region (a `div`) has no `close()`; the kernel cannot close it directly, so the
  channel must reach it some other way (an event the region handles).
- Alternatives for discussion: (a) widen the selector to native + ARIA
  (`dialog, [popover], [role=dialog], [role=alertdialog]`) — covers every region in the package
  today, still misses the mega menu; (b) a region marker of its own on any element that hears
  channels — explicit, covers all cases, one more attribute in the field dictionary.

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
