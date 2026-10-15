# ADR-0029: A region hears its children through channels

**Status:** Accepted · 2026-10-15 — agreed in discussion 2026-10-14/15, after
the platform probe and the region-recognition stress test recorded in
`tasks/plan-modal-region.md` (PR #138).

## Context

A modal is asked for in many shapes: a signup form behind a button, an
alert that only closes once the user types a phrase, a consent banner that
opens itself on a first visit and cannot be dismissed until a choice is
made. What they share is the container — top layer, an inert page behind,
Esc, focus returning to the opener. What they do not share is the content,
and the content is where the close button, the title and the explanation
live.

So the content must be able to reach the container: close it, name it,
describe it. Three constraints shape how:

- **The content knows nothing about its container.** A form is a component
  of its own and may stand in any region, several layers down
  (`dialog > grid > Card > form`). It cannot know the region's id.
- **Every framework must work the same.** Passing an id or a handle
  downward is context in React, provide/inject in Vue, context again in
  Svelte and Solid — and nothing at all in Astro, which has no runtime
  context. One mechanism per framework is six to keep in step.
- **Regions are not all native.** The stress test found every popup region
  in the package — ToggleTip and the five date and time pickers — to be a
  `div role="dialog"`: the Popover API needs Chrome 114 and the support
  contract reaches Chrome 109. A mega menu is usually an in-flow
  disclosure. A rule that recognises regions by element
  (`closest('dialog, [popover]')`) misses all of them, and a close channel
  inside a picker inside a modal would close the modal.

## Decision

1. **A region carries a marker: `data-region`.** A boolean that answers
   one question — does this element hear channels? Any element may carry
   it: `<dialog>`, a popover, a `div role="dialog"`, an in-flow menu.

2. **Children speak through channels, one attribute with a closed value
   set: `data-channel="title | description | close"`.** An element feeds
   one channel, never two. The set grows only by amending this ADR.

3. **The nearest region owns a marker.** The kernel resolves every channel
   with `closest('[data-region]')`. A region inside a region (a picker or
   a chip popup inside a modal) hears only its own children. Modals inside
   modals are avoided by design, but the rule does not depend on it.

4. **Channels travel through the DOM, not props.** The DOM is the one tree
   every framework shares; one kernel file
   (`kernel/js/region-channels.ts`) serves Astro, React, Vue, Svelte,
   Solid and Preact, and a child rendered by one framework may sit in a
   region rendered by another.

5. **What each channel does:**
   - `title` → the region's `aria-labelledby` (an id is generated if the
     element has none).
   - `description` → the region's `aria-describedby`.
   - `close` → closes the nearest region; the element's `value` is the
     `returnValue`. On a `<dialog>` the kernel writes `type="button"`,
     `command="close"` and `commandfor`, so the platform does the work
     where invoker commands exist; a feature-detected document-level
     listener does it elsewhere and calls `preventDefault`. A region that
     is not a `<dialog>` receives a `region:close` event (detail:
     `{ returnValue }`) and closes itself its own way.
   `title` and `description` are wired when the region opens. `close` is
   delegated, so a child mounted after opening is heard.

6. **A region owns zero strings.** Channels point at markup the child
   already renders, so they inherit its `lang`. A region's `label` prop
   (`aria-label`, no `lang` of its own) is the one string, and the caller
   passes it in the page language.

7. **The first region is `Modal`** (`components/regions/Modal/`), on
   native `<dialog>`:
   - It never opens itself. It is opened by `command="show-modal"`, by
     `showModal()` from script, or by a kernel decision; it is closed by
     `close`, by its dismiss rule, or by `close()`.
   - `dismiss = any | request | none` (default `request`), mapped to
     `closedby`; where `closedby` is missing the kernel cancels `cancel`
     for `none` and closes on a backdrop click for `any`.
   - `role = dialog | alertdialog` (default `dialog`), independent of
     `dismiss`: a consent banner cannot be dismissed and is not an alert.
   - It owns placement, scroll (content scrolls inside; the page is
     locked by `:root:has(dialog:modal)`), the box's cap against the
     viewport, the backdrop, and the enter, exit and backdrop timelines.
   - It owns no grid. One slot takes any nested tree.
   - Enter motion uses `@starting-style`. Exit motion needs `overlay` and
     is Chromium-only; elsewhere the modal closes without exit motion. No
     JavaScript timeline.

8. **Gates belong to the child.** A close that must wait (type to confirm,
   a consent not yet given) is the child disabling its own `close`
   element. The region knows nothing about it.

## Alternatives rejected

- **A public method on the region** (an imperative handle). The child
  would need a reference to the region, which is the id-passing problem
  again, solved once per framework.
- **Passing the region id down as a prop.** Works in one framework at a
  time; Astro has no context to carry it through intermediate layers.
- **Recognising regions by element** (`dialog, [popover]`). Misses every
  popup region in the package today.
- **Native plus ARIA** (`dialog, [popover], [role=dialog],
  [role=alertdialog]`). Covers the package today, misses an in-flow mega
  menu, and ties channel routing to a role chosen for screen readers.
- **Three boolean attributes** (`data-title`, `data-description`,
  `data-close`). ADR-0025 chose booleans because an element holds several
  test states at once; an element feeds one channel, so one attribute
  with a closed set says it more exactly.
- **A JavaScript exit timeline** for Firefox and Safari. Kernel weight for
  motion the platform will provide when `overlay` ships.

## Consequences

- The ADR-0013 register gains `mo` (Modal); `md` is avoided because it
  reads as the size.
- The field dictionary gains `data-region` and `data-channel`.
- ToggleTip and the pickers are channel-ready once they carry
  `data-region` and handle `region:close`; moving them is its own pass.
- The consent banner is a composition, not a region: a pure kernel
  decision (`kernel/js/consent-preference.ts`), a `<head>` guard and a
  component holding the storage key — the ThemeSwitch pattern
  (`theme-preference.ts`, `AppearanceGuard.astro`).
- Firefox and WebKit are not in CI; the `closedby` and `command` fallbacks
  are tested locally until the `@engines` projects exist.
- Open: whether `title` and `description` need re-wiring for children
  mounted after opening — decided when the first framework adapter is
  built.
