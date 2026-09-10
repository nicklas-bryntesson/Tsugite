# ADR-0004: Token grammar and layer visibility

**Status:** Accepted · 2026-08-31 · Precedent: `src/styles/tokens/base/grid/`

## Context

The Craft experiment (the source of the authoring model in ADR-0003) used a
double-dash grammar (`--COLOR--B50`, `--button--color--primary`), a
deliberate naming experiment to see whether the double dash made long `var()`
chains more readable. The experiment has been evaluated and does not win: this
repo's established grammar (grid, size, site, typography) stays. Craft also
let component tables reference the RAW palette directly, which contradicts
the layer rule below. The tokenisation passes need ONE answer.

## Decision

**The grammar is the repo's established one: single dash, never a double dash
in the middle.**

| Layer | Form | Example |
|---|---|---|
| RAW (constant) | `--UPPERCASE-SINGLE-DASH` | `--COLOR-B50`, `--FONTSIZE-DISPLAY-1-FLOOR` |
| Semantic / tone | `--lowercase-single-dash`, camelCase for property words | `--grid-container-maxWidth`, `--site-offset`, `--button-backgroundColor-primary` |
| Component-private | `--_` prefix | `--_mf-popup-bg`, `--_rs-p` (form refined by ADR-0013) |

**Layer visibility: primitives never appear in a component's end state.**

1. RAW is referenced **only** by the semantic layer. A component's end state
   (computed styles, generated blocks, factories) never contains `--COLOR-*`
   or any other RAW name.
2. Consequence for the ADR-0003 factories: **the four-mode tables live in
   the semantic and theme layers' factories**, where per-mode RAW values
   belong. Component factories are **mode-free pointers** into the semantic
   layer, of the form `--button-backgroundColor-primary: var(--color-interactive-primary)`,
   with no appearance keys. (This is the manifest's "components derive from
   tone".)
3. This also shrinks the generated CSS: only semantic and theme tokens are
   duplicated per mode; component pointers are declared once, independent of
   appearance, exactly like the theme donut's pointers.

## Noted exception

The theme-lab tokens (`--lab-*`) referenced RAW directly, deliberately: the
lab tested delivery, not layering. The lab was deleted when the real
implementation landed (ADR-0003).
