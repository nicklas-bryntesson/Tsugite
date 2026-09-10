# ADR-0017: The recipe is the source; renderers are adapters

**Status:** Proposed · 2026-09-10 — spiked on Card (Astro + React + Vue, byte-identical
markup under test, one CSS gating all three on the docs page). Accepted when Nicklas
says so; a second component on the pattern is the natural next proof.

## Context

Tsugite is written in Astro, and Astro is a good host for a component
system: server-rendered markup, global CSS by design, fixtures the
conformance suites drive in a real browser. Nicklas asked whether the
same components could exist in React, Vue or Svelte inside this repo,
with a cross-reference telling an author who changes `Card.astro` to
change `Card.tsx` and `Card.vue` too.

The contract of a Tsugite component is not its source file. It is the
rendered DOM — the root class, the `data-*` axes with every value
written, the part names — and the global CSS that gates on them
(ADR-0007, ADR-0010, ADR-0015). The conformance suites test exactly that
and never ask who rendered it. A component that emits the same DOM is the
same component. That makes a second framework cheap, and it makes a
cross-reference the wrong mechanism: three source files held together by
a comment are three truths.

`lib/buttonShared.ts` already showed the alternative: one framework-free
function resolves props to attributes, and two Astro components render it.

## Decision

1. **The recipe is the source.** A component with logic gets a
   framework-free module in `lib/` — `resolveCard(props)` returns the
   tag, the class, the `data-*` attributes in write order, the mode
   (render, suppress, error) and the error message. Validation, defaults,
   forbidden combinations and the attribute vocabulary live there and
   nowhere else.
2. **Renderers are adapters.** `Card.astro`, `Card.tsx` and any later
   `Card.vue` are thin templates that call the recipe and write its
   result verbatim, adding only the host framework's idioms: slot versus
   children, `set:html` versus `dangerouslySetInnerHTML`, dev-error
   rendering. Whether there is content to host is the renderer's
   question; the recipe takes the answer.
3. **The cross-check is a test.** For every component with more than one
   renderer, a unit test renders the same prop sets through each and
   requires byte-identical markup, and the suppress case for each. On the
   docs page, an e2e test compares the rendered cards' attributes and
   computed styles. Drift between renderers fails the suite; no comment
   asks anyone to remember.
4. **One `.css` per component.** A component's CSS lives in
   `<Name>.css`, imported by every renderer, never in `<style is:global>`
   inside the `.astro` file, which only Astro can read. Button already
   did this for its two Astro renderers; the cleanup passes carry the
   rule to the rest.
5. **React renders on the server only** in the docs app: the integration
   exists to show and test the renderer, not to hydrate anything. A
   `client:` directive on a Tsugite component is a separate decision.

## Alternatives rejected

- **A cross-reference comment** between `Card.astro`, `Card.tsx` and
  `Card.vue`. Rejected: three sources of truth, kept in step by memory.
- **Porting the CSS per framework** (CSS modules, styled components).
  Rejected: the global, attribute-gated CSS is the contract; a per-framework
  copy would be the drift the doctrine exists to prevent.
- **Keeping the recipe in the `.astro` frontmatter** and translating it by
  hand. Rejected for the same reason: two copies of the logic.

## Consequences

- Card is the first component on the pattern: `lib/card.ts`,
  `Card.astro`, `Card.tsx`, `Card.vue`, `Card.css`, `tests/card-renderers.test.ts`,
  and `apps/docs/tests/e2e/card-renderers.e2e.test.js` against the
  Renderers example on `/docs/card`.
- The rule "one `.css` per component" joins the cleanup conventions;
  Notice, Heading, Teaser and Surface still carry their CSS in the
  `.astro` file.
- Vue joined the spike as one SFC plus a row in the equality test; its SSR
  slot markers are comments and the normaliser strips them. Svelte is the
  same move. Not started.
- `react`, `react-dom`, `vue` and `@vitejs/plugin-vue` are dev
  dependencies of the package (for the equality test); `react`,
  `react-dom`, `vue`, `@astrojs/react` and `@astrojs/vue` are docs
  dependencies (for the page).
- A running dev server does not pick up a newly added integration's Vite
  defines; restart it after adding one (the Vue SSR globals threw a
  ReferenceError until then, while the build was fine).
- The docs Elevation lead still described the pre-pass-1 behaviour
  ("the attribute is written only when asked for"); corrected on the way.
