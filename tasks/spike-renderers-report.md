# Spike report: one recipe, three renderers (Card) — and what a Field will add

**Date:** 2026-09-10 · **Branch/PR:** `spike/card-renderers`, #40 · **ADR:** 0017 (Proposed)
**Purpose:** the record of what was proven on Card, what broke and why, and the
preconditions for the next spike on a complex Field component.

## 1. What was proven

| Claim | Evidence |
|---|---|
| A Tsugite component's contract is its rendered DOM, not its source file | Card rendered by Astro, React and Vue from one recipe; six prop sets byte-identical after comment stripping (`tests/card-renderers.test.ts`, 7 tests) |
| One global, attribute-gated CSS serves every renderer unchanged | `Card.css` imported by all three; on `/docs/card` the React and Vue cards resolve to the same computed styles as the Astro one (`apps/docs/tests/e2e/card-renderers.e2e.test.js`) |
| The logic can leave the framework | `lib/card.ts` `resolveCard(props) → { tag, className, attrs, mode, errorMessage }`; renderers add only host idioms |
| Existing tests survive the move | Card contract tests and Teaser tests unchanged and green; 303 unit tests in the package |
| React and Vue can be shown side by side in the docs app, server-rendered only | `@astrojs/react`, `@astrojs/vue`, no `client:` directive, no hydration |

## 2. The shape that worked

```
lib/card.ts        the recipe: validation, defaults, forbidden combinations, attrs in write order
Card.astro         thin renderer: slot, set:html, DevError
Card.tsx           thin renderer: children, createElement, dev-only error box
Card.vue           thin renderer: <component :is>, v-bind, slot — plain JS (see §3)
Card.css           the one CSS, imported by every renderer
tests/card-renderers.test.ts     equality across renderers, plus the suppress case
apps/docs/…/Renderers.astro      the three cards on one page, data-renderer marks them
apps/docs/tests/e2e/card-renderers.e2e.test.js   attributes + computed styles equal
```

Rules that fell out (ADR-0017): the recipe is the source; renderers are adapters;
the cross-check is a test, never a comment; one `.css` per component; React and
Vue render server-side only.

## 3. What broke, and the real cause

- **Vue SSR slot markers.** Vue emits `<!--[-->…<!--]-->` around slot content and
  `<!---->` for a `v-if` that rendered nothing. Comments are not DOM the CSS or a
  user sees; the equality normaliser strips them.
- **`$RefreshSig$ is not defined` in dev only.** Not Vue in React: React's *tooling*
  in Vue's file. Vue's plugin strips a `lang="ts"` SFC script through Vite's shared
  oxc transform; in dev that transform carries the React plugin's global Fast Refresh
  setting and ignores the React plugin's own exclude filter, so it injected a refresh
  signature (`useSlots`/`useAttrs` read as hooks) into the compiled SFC. Build and
  preview never run refresh, which is why the spike passed before a dev server saw
  it. Fix: the SFC is plain `<script setup>`; there is nothing to strip, so it never
  takes that path. Versions: Vite 8.2, plugin-vue 6.0, plugin-react 5.2.
- **A dev server started before an integration is added does not pick it up.** The
  running server was four days old. Restart after adding integrations; Astro 7
  refuses a second `astro dev`, but the programmatic `dev()` API on another port
  works for verification.

The lesson under all three: two frameworks that are each fine leaked into each
other through a shared compiler with a global mode. That is the failure the
doctrine is built to prevent in CSS, and the build chain is less watertight than
the design system.

## 4. What a Field component adds

Card has no runtime. A Field has one, and the way Tsugite already does it is the
best news of this report:

- **The runtime is framework-free by construction.** `AffixField.ts`,
  `DateField.ts` and the rest attach through the DOM:
  `querySelectorAll('[data-component="AffixField"]')` → `new AffixField(el)`.
  They never import Astro. A React- or Vue-rendered Field that emits the same DOM
  gets the same runtime attached, unchanged. The verbatim `.ts` files the intake
  routine protects are exactly the files that need no port.
- **Who attaches, and when.** Today the `.astro` file carries a `<script>` that
  imports the runtime; a React or Vue renderer has no such slot. For server-only
  renderers the *page* attaches (one import, one `attachAll`), which is also how a
  consumer outside Astro would do it. If a renderer ever hydrates client-side, the
  runtime mutating DOM under React or Vue is a conflict: a separate decision, and
  the reason ADR-0017 §5 keeps renderers server-only.
- **Generated markup inside the component.** Fields build segments, popups and
  grids at runtime and read ids (`data-id`, `aria-describedby`, label `for`). The
  recipe must own the id derivation so every renderer writes the same ids; the
  runtime then finds the same targets.
- **The conformance suites are already renderer-agnostic.** Every Field has an e2e
  suite targeting the fixture by `data-id` through `tests/e2e/helpers/target.js`.
  A fixture that mounts the React and Vue Fields beside the Astro one lets the
  *same suite* run three times with a renderer parameter. That is the strongest
  proof available: not "same HTML" but "same behaviour under keyboard and mouse".
- **Slots become props.** Field markup is generated, not slotted, so the
  slot/children difference that Card exposed mostly disappears; what remains is
  `labelSuffix`-style raw HTML props, which each renderer sets with its own
  dangerous-HTML idiom.
- **CSS out of the `.astro` file.** Fields carry 200–560 lines of CSS in
  `<style is:global>`; each needs its `<Name>.css` first. This is the cleanup
  rule from ADR-0017 §4 and can land in the Field cleanup passes regardless of
  renderers.

## 5. Recommendation for spike 2

Pick **AffixField**: the smallest Field with a real runtime (235 lines Astro, 175
lines TS), its own e2e suite (`tests/e2e/affixfield.e2e.test.js`), ids, ARIA, and
a `ch`-based width calculation the runtime owns. DateField is the stress test
after that, not before.

Order:

1. `AffixField.css` out of the `.astro` file (cleanup rule; no behaviour change).
2. `lib/affixField.ts`: resolve props → root attrs, ids, part attrs; the `.astro`
   file becomes a renderer of it. Existing e2e stays green.
3. `AffixField.tsx` and `AffixField.vue` (plain JS), equality test as for Card.
4. A fixture mounting all three with distinct `data-id`s and the page attaching
   the runtime once; run `affixfield.e2e.test.js` parameterised by renderer.
5. Only then decide: does the recipe pattern scale to DateField's 500 + 1 150
   lines, or does the Field family need one shared field recipe first?

Open questions to settle before or during spike 2:

- Who owns id generation when the same component appears three times on one page
  (recipe takes an explicit `id`, as Fields already require)?
- Does the runtime's `attachAll` need an idempotence guard once several renderers
  share a page? (It already sets an instance on the element; verify.)
- Is the equality test byte-level or DOM-level for Fields? Whitespace inside
  generated markup may differ per renderer; a DOM-normalised comparison
  (parse, serialise) is likely the right tool.
- ADR-0017 stays Proposed until a Field passes; then Accepted, and the `.css`-per-
  component rule moves from convention to doctrine.

## 6. Numbers at the end of the day

| | |
|---|---|
| PRs merged today | #36 cleanup pass 1 · #37 token registry · #38 cleanup pass 2 · #39 Surface |
| PR open | #40 renderer spike |
| ADRs added | 0013 slot grammar · 0014 token registry · 0015 footprint · 0016 Surface · 0017 renderers (proposed) |
| Package unit tests | 303 · docs 65 · docs e2e 2 · Notice e2e 7 |
