# ADR-0026: A component is tested on its own bench

**Status:** Accepted · 2026-10-09 — agreed in discussion 2026-10-09; lands
with the bench app and one pilot bench first, then one suite at a time.

## Context

The package's e2e suites (20 files, 417 tests) run against
`/kitchen-sink`, a page in the docs app that mounts every fixture section
at once. An inventory on 2026-10-09 found three problems with that page as
the place where tests run:

- **The page is the cost.** The kitchen sink has about 8,450 elements. A
  `page.goto` takes 419 ms against 38–55 ms for a single-section page, and
  axe walks the whole document even when its audit is scoped (290 ms
  against 42 ms). The same suites, unchanged, ran about 2.8× faster
  against single-section pages. CI spends about 14 minutes on e2e.
- **A shared page hides dependencies.** RangeGroup reaches its lane
  through RangeScale's instance (`RangeGroup.ts:168`); its test
  (`rangegroup.e2e.test.js:92`) passes only because another section of
  the kitchen sink loads RangeScale's script. On a page of its own it
  fails five times out of five. ToggleTip's open bubble fails axe
  contrast (1.63:1) on its own page; the kitchen sink masks that as well.
- **The tests depend on the docs app.** `playwright.config.ts` starts
  `apps/docs`'s dev server. Switch the docs app off and the package's
  conformance suites cannot run, even though they guard the package's
  contract, not the site's.

The docs app has a different job: it shows what a thing *is*, with
rulers, descriptions and the voice it speaks in. A test needs the
opposite: every state, nothing else on the page.

## Decision

1. **One bench per component.** Each component that has a suite gets a
   bench: a page that renders that component and nothing else. A suite
   runs against its component's bench, never against a page shared with
   other components.

2. **The bench lives next to the component.**
   `components/<pillar>/…/<Name>/<Name>.bench.astro`, beside
   `<Name>.astro` and `<Name>.css`. It is reached through the existing
   `./<Name>/*` export, like every other file of the component.

3. **The bench is plain.** A left-aligned flex column, all states, no
   tables, no prose, no rulers. Only what the suite needs to address.
   A component whose behaviour depends on placement (a popup that flips
   or clips at an edge) may add a placement layout to its bench. That is
   an opt-in of its own component, not a shape every bench carries.

4. **A bench declares what it needs.** If a component only works
   together with another component's script, the bench mounts that
   component itself. Nothing is borrowed from a neighbour on the page.

5. **The package renders its own benches.** A minimal Astro app inside
   `packages/tsugite` has one dynamic route that renders every
   `*.bench.astro`, and it imports the same CSS entry a consumer imports.
   The package's Playwright config starts this app, not the docs app, and
   on a port of its own. The package's tests run with the docs app
   switched off.

6. **Docs may show a bench; it does not own it.** The docs app can mount
   a bench at `/docs/<slug>/test` by importing it from the package, so
   it can be looked at, locally or deployed. The bench stays the
   package's file.

7. **The kitchen sink is deleted.** No suite runs against it, and it
   is not kept as an overview page.

## Alternatives rejected

- **Keep the kitchen sink, fix the speed elsewhere** (`fullyParallel`,
  more shards). This evens the shards (about 14.0 → 12.2 min), but every
  test still loads 8,450 elements, and the hidden dependencies stay
  hidden.
- **One page per pillar** (Primitives, Compositions, …). Smaller than the
  kitchen sink, but still shared: the primitives pillar alone is most of
  today's page, and the RangeGroup kind of coupling survives inside a
  pillar.
- **Run the suites against the docs pages** (`/docs/<slug>`, through
  `TARGET_PATH`). 18 of 20 files already pass that way, and it is the
  cheapest move. But it makes a test depend on what the docs page chooses
  to show, mixes the bench with the explanation, and keeps the tests
  tied to the docs app.
- **Benches rendered by the docs app.** One Astro server instead of two,
  but the package's tests would still die with the docs app. The seam
  would point the wrong way.
- **No server: render to a string and load it into the browser**
  (AstroContainer + `page.setContent`). It works for markup only. It
  cannot bundle the components' client scripts or CSS, so the
  interactive components, which are most of the suites, cannot be tested
  that way. Markup-only checks belong in vitest anyway.
- **Benches collected in `fixtures/`.** The bench belongs to the
  component's contract as much as its CSS does. A shared folder would
  separate it from the component it tests.

## Consequences

- A second Astro configuration exists in the repo, and it must import
  the same CSS and token entry as a consumer does, or the benches test a
  different system from the one that ships.
- `helpers/target.js` stops defaulting to `/kitchen-sink`; each suite
  defaults to its own bench. `TARGET_PATH` and `TARGET_ID` stay, so a
  consumer can still point a suite at their own page.
- The package's Playwright config no longer reuses whatever runs on
  :4321, which also removes the risk of testing another app that
  happens to sit on that port.
- Suites that guard the docs site rather than a component
  (`header.e2e.test.js`) move to `apps/docs`. Suites that guard a system
  concept rather than one component (`themes.e2e.test.js`) need a bench
  of their own; where it lives is settled when that suite moves.
- `fixtures/` keeps the sections the docs pages show; a bench is not a
  section. The docs app's links to the kitchen sink (start page, map,
  ThemeSwitch, rooms test) go when the page goes.
- RangeGroup and ToggleTip are fixed when their suites move: the move
  is what makes them fail.
- Migration order: the bench app and one pilot bench, then one suite at
  a time, then the kitchen sink is deleted with the last one.
