# ADR-0011: The base tables join the factory — spacing, site and grids are authored in JS; Sass retires

**Status:** Accepted · 2026-09-04

## Context

ADR-0003 settled that tokens are authored in JS and delivered as generated
CSS, and the color and typography layers followed. Three tables did not:
the spacing scale (`SIZE-*` / `--size-*`), the site scaffolding
(`SITE-OFFSET-*`, `--site-offset`, max widths, the `--dir` sign) and the
grids (`GRID-*`, `--grid-container|layout|breakout-*`). They lived in
eleven `.scss` files under `styles/tokens/`, wired through one
`tokens.scss` entry that the docs app imported ahead of everything else.

By 2026-09-04 that Sass tree was a shell. Four of the eleven files were
empty mixins left behind when color and typography moved to the factory,
kept only so the entry's `@include` order stayed valid. The remaining six
contained no Sass at all — no variables, loops, math or interpolation —
only custom properties inside `@mixin tokens {}`. Sass did one thing for
them: concatenate them into `:root`. The dependency cost two
`devDependencies`, a second CSS toolchain beside Lightning CSS
(ADR-0010), and an exception to hard rule 4 ("author tokens in
`theme-default/*.tokens.js`") that the rule did not name.

The alternative considered was to flatten the six files into one
hand-written `base.tokens.css` and drop Sass without touching the
factory. Rejected: it removes the tool but keeps the exception. The
tables would remain the only tokens in the system without a source of
truth in JS, without completeness validation, and without a freshness
guard.

## Decision

1. **Three new token sources in `theme-default/`:** `size.tokens.js`
   (nine steps × four tiers, in rem), `site.tokens.js` (scalar constants,
   the offset ramp × four tiers) and `grid.tokens.js` (four steps, each
   gap + column count). Humans edit here and nowhere else.
2. **One emitted artifact,** `styles/tokens/base/base.generated.css`,
   from `generateBaseStylesheet()` in the collector: RAW constants in
   `:root`, then the tier-gated semantic ramps, then the grids. Derived
   values are derived, not typed: the px twins of every spacing step
   (`--SIZE-MD-DESKTOP-PX`) come from the rem value at 16px/rem, the
   negative offsets (`--SITE-OFFSET-WIDE-NEGATIVE`) from the offset, and
   the three grid templates from the step table.
3. **The refusal rule extends to the base tables.** `validateBase()`
   fails the build for a spacing step or offset missing a tier, a
   non-rem spacing literal, or a grid step missing gap or columns.
   `tests/baseTokens.test.ts` guards freshness (committed artifact ≡
   factory) and boundedness (the ranges abut, exactly one block active).
4. **The viewport-tier ladder is one constant.** `TIER_MEDIA` moves from
   inside the typography emitter to module scope in the collector and is
   shared by every tier-mapped ramp, so type and spacing flip at the
   same pixel by construction (ADR-0001).
5. **Sass is removed:** the eleven `.scss` files, the `sass`
   devDependency in both workspaces, the `.scss` extension in the
   typography gate, and the Sass carve-out in the nesting gate. The docs
   app imports the artifact from `global.css` with the other generated
   token files instead of importing `tokens.scss` from the layout.

## The port is faithful — and what it exposed

The emitted rule set is identical to what Sass produced (proven by
lowering both with the build's Lightning CSS targets and comparing
selector contexts and declarations). No value, name, gate or selector
changed. The port therefore preserves four things that a fresh design
would not have written; each is recorded in `tasks/parking-lot.md` as
a separate decision, not taken here:

- **The grid has its own ladder.** Steps `base/mobile/tablet/desktop` at
  `40 / 48 / 80rem` predate ADR-0001 and do not coincide with the
  viewport tiers (`21.25 / 48.75 / 90rem`). `grid.tokens.js` carries its
  own `GRID_STEPS` and `GRID_MEDIA` for that reason. Aligning the grid to
  the tier axis changes where columns flip — a threshold decision.
- **`--dir` is set on descendants of `:root`, not on `:root`.** The Sass
  source nested `:not([dir="rtl"])` and `[dir="rtl"]` inside the `:root`
  mixin, which Sass emitted as `:root :not([dir="rtl"])` — a descendant
  selector. Nothing consumes `--dir` today. The generator reproduces the
  emitted selectors verbatim; whether the sign belongs on `:root`, on
  `html[dir]`, or nowhere is open.
- **Two legacy constants are unused and off the ladder:**
  `--MOBILE-BREAKPOINT: 48.74rem` and `--DESKTOP-BREAKPOINT: 75rem`.
  75rem is no boundary in either ladder. Kept verbatim.
- **The px twins have no consumer.** `--size-*-px` and
  `--SIZE-*-*-PX` are emitted but nothing reads them. Now that they are
  derived, deleting them is a one-line change in the emitter if the
  decision is that px spacing should not exist.

## Consequences

- Hard rule 4 is now true without exception: every token in the system
  is authored in `theme-default/*.tokens.js` and regenerated with
  `pnpm tokens`. The generated-file hook already covers the new
  artifact by its `.generated.css` suffix.
- The system's CSS pipeline is one tool (Lightning CSS, ADR-0010) and
  one browser target. No stylesheet is preprocessed.
- ADR-0005 and `component-model.md` mention the retired `.scss` files
  historically; those references stand as history.
- `styles/tokens/` now holds only generated artifacts and their
  directories. A future consumer of the package imports
  `base.generated.css` the way the docs app does.
