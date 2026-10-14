# ADR-0028: A grid of equal items decides its last row

**Status:** Accepted · 2026-10-14 — agreed in discussion 2026-10-13/14, after
the ItemGrid lab (`apps/docs/src/pages/lab/item-grid.astro`, PR #135) was
pressed with Teaser at every width.

## Context

A list of equal items — teasers, cards, pillars, chips — is laid out in
every project as `repeat(auto-fit, minmax(…, 1fr))`. That fills the full
rows and leaves the last one to chance: 7 items in three columns end as
3 / 3 / 1, a lone card stretched or stranded, and the edges meet the site
grid only by coincidence. The docs app has three such grids of its own
(home principles, map pillars, foundations strip).

The problem is the remainder, not the number of columns. Projects answer
it differently (the lone item lies across the row, is inset by a column,
is centred, borrows from the row above), so a single answer would be
wrong somewhere; the lab showed that the answers are few and each is
a handful of quantity queries.

Two constraints shape the mechanism:

- **`@container` cannot read `var()`.** The column thresholds are
  literals; they cannot follow a token.
- **An item that reshapes owns its own layout.** Teaser is upright or
  lying by its own container query in the width it is given. The grid
  must not know what stands in it (ADR-0015): it allocates width, the
  item answers.

## Decision

1. **ItemGrid is a region.** It governs one capability — the
   distribution of equal items — for any children, as ScrollArea governs
   overflow. Promise: *a list of equal items whose last row is decided,
   not left over.* Element `ul` (default), `ol` or `div`.

2. **Twelve tracks, only spans change.** The grid always has twelve
   tracks on `--grid-layout-gap`; three columns span 4, two span 6, one
   spans 12. In the main column the grid's tracks are therefore the
   site's, with no subgrid and no span tokens. The DOM order is never
   changed (no `order`, no dense packing), so reading and tab order are
   the visual order.

3. **The grid is its own container.** The items query the grid's width:
   one column below 36rem, two to 60rem, three above. The thresholds are
   raw literals with a `TODO(token)`. When a second project needs other
   values they are generated from the layout tokens by `pnpm tokens`
   beside the grid tokens, as the text-box engine's kernel file is
   (ADR-0024) — not before; with one consumer a generator would carry
   two constants. The thresholds are layout, not theme: nothing in
   ItemGrid is voiced or themed.

4. **`remainder` is a closed axis** with six values, all shipped:
   - `balance` (default) — a lone leftover borrows one from the row
     above, the last four share two rows (3 / 2 / 2); two leftovers share
     a row.
   - `split` — the leftovers bookend the grid: one pair opens and one
     closes (2 / 3 / 2); two leftovers open (2 / 3).
   - `fill` — the leftovers share the whole row.
   - `inset` — as `fill`, with one column of air at each side.
   - `center` — the leftovers keep their size, centred.
   - `start` — the leftovers keep their size, at the start.
   In two columns a lone leftover takes the row (`balance`, `fill`), is
   inset or centred, or — under `split` — goes first. The leftovers are
   found by quantity queries (`:nth-child`, `:nth-last-child`, `:has()`);
   there is no counting prop and no JavaScript.

5. **ItemGridItem is ItemGrid's cell.** A part with its own small table,
   because a renderer cannot wrap another component's children for it:
   `li` (default) or `div`, class `item`, styled only from
   `ItemGrid.css`. Its one job is to hand the item the whole cell
   (`display: grid`), so equal items in a row are equally tall. Its
   element follows the grid's; the renderer cannot see the parent, so
   the author keeps them in step.

6. **A list keeps its list role.** `ItemGrid.css` takes the markers off,
   and WebKit then drops the list role. The grid writes `role="list"` on
   `ul` and `ol` (a derived value of the element); a `div` gets none.

7. **Fallback.** Without container queries, a plain
   `repeat(auto-fit, minmax(18rem, 1fr))`: the leftovers hang where they
   fall. Where container queries exist but `:has()` does not, the rules
   that need a count (`balance` over four or more, `split`) do not match
   and those leftovers behave as `start`.

## Alternatives rejected

- **One fixed answer** (always fill, or always balance). Each project in
  the lab's reference set wanted a different last row; one answer would
  be an escape hatch in every project but one.
- **Columns by viewport tier.** The grid sits in main columns, sidebars
  and cards; only its own width says how many items fit.
- **A track count that changes per state** (3, 2, 1 tracks). A remainder
  could then only fill or start; centring or insetting needs half and
  single site columns, which twelve tracks give for free.
- **Reordering** (`order`, `grid-auto-flow: dense`) to move the remainder.
  It breaks the reading order the DOM promises.
- **A count prop** written by the renderer. The CSS can count; a prop
  would be a second truth that drifts when items are added client-side.

## Consequences

- The ADR-0013 register gains `ig` (ItemGrid). ItemGridItem has no slots
  of its own.
- The remainder gates rewrite the column state's span carrier
  (`--_ig-column`) on the leftovers. The leftovers are found by position
  the way a state is found by a pseudo-class, so the second write is the
  gate's answer for those items, not a base unwound (doctrine §1); the
  inspector shows the carrier struck through on a leftover, as it does
  under `:hover`.
- Teaser's picture had to follow the card's width, not the copy's length,
  before the lab could compare widths (PR #134).
- The lab page is replaced by `/docs/item-grid`, one example per
  remainder value, and the bench mounted at `/docs/item-grid/test`. The
  docs app's three hand-built grids move onto ItemGrid in their own pass.
- Open: whether an item may opt out of equality (a featured item), and a
  threshold set per minimum item width — both wait for a real case.
