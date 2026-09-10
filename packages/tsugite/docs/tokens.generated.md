# Token registry — what a component may reference

<!-- GENERATED — do not edit. Built by engine/registry.js from theme-default/*.tokens.js.
     Regenerate: pnpm tokens   (freshness guarded by tests/tokens.test.ts) -->

Names and roles only, never values: values switch by appearance and viewport
tier and resolve at runtime. Read top-down; that is the resolution chain
(ADR-0008), and a component's CSS reaches at most one layer down from where
it stands:

```
component slot (--_*) → theme channel (--theme-*, one fallback) → semantic → RAW
```

**If a name is not on this page it does not exist.** Do not invent a value or a
token; write a `TODO(token)` beside the raw value and raise it as a finding.

## 1. Component slots — `--_<prefix>-<propertyCamel>` — private

Declared by the component that owns them, on its root (ADR-0013). Never read
another component's slot. The prefix register lives in ADR-0013.

## 2. Theme channels — `--theme-*` (12) — read with one fallback

A channel is present when a voice region (`data-theme`) is an ancestor and absent
otherwise, so it is read with exactly one fallback to the semantic token the
component would otherwise use (ADR-0008): `var(--theme-text, var(--color-text-primary))`.
Voices and their volumes (`data-prominence`, primary | subtle): `neutral` (primary, subtle), `brand` (primary, subtle), `accent` (primary, subtle), `inverse` (primary).
`--theme-cell-*` names are generated wiring and are never referenced.

`--theme-surface`, `--theme-text`, `--theme-textMuted`, `--theme-border`, `--theme-button-color-primary`, `--theme-button-backgroundColor-primary`, `--theme-button-borderColor-primary`, `--theme-button-backgroundColor-primary-hover`, `--theme-button-color-secondary`, `--theme-button-borderColor-secondary`, `--theme-button-borderColor-secondary-hover`, `--theme-button-backgroundColor-secondary-hover`.

## 3. Semantic tokens — read directly

The layer a component's slot resolves to when no theme channel applies, and the
only layer allowed to reference RAW.

### Colour — `--color-*` (28, four-mode)

Each name switches light · dark · light-contrast · dark-contrast by itself; the
component never mentions appearance (ADR-0004 §2).

| Token | Role |
|---|---|
| `--color-surface-page` | The page/content ground. |
| `--color-surface-chrome` | Site chrome: header, footer, table heads. |
| `--color-surface-inset` | Inset/demo/placeholder surfaces. |
| `--color-text-primary` | Body ink on the page ground. |
| `--color-text-secondary` | Muted ink: captions, hints, secondary labels. |
| `--color-interactive-primary` | Primary action surface (buttons, links). |
| `--color-interactive-primary-hover` | Primary action surface on hover. |
| `--color-interactive-onPrimary` | Ink on the primary action surface. |
| `--color-interactive-secondary-text` | Secondary action ink. |
| `--color-interactive-secondary-border` | Secondary action outline. |
| `--color-interactive-secondary-hoverSurface` | Secondary action surface on hover. |
| `--color-interactive-hoverRing` | Ring drawn around an interactive element on hover. |
| `--color-focus-ring` | Keyboard focus ring. |
| `--color-interactive-glow` | Decorative promo glow (CtaButton) — calm/off in the contrast modes. |
| `--color-scrim-media` | Scrim over hero media — heavier where legibility is law. |
| `--color-disabled-text` | Ink of a disabled control. |
| `--color-disabled-surface` | Surface of a disabled control. |
| `--color-disabled-border` | Outline of a disabled control. |
| `--color-feedback-error` | Error / destructive intent. |
| `--color-feedback-onError` | Ink on an error surface. |
| `--color-feedback-success` | Success intent. |
| `--color-feedback-warning` | Warning intent. |
| `--color-feedback-info` | Informational intent. |
| `--color-feedback-onWarning` | Ink on a warning surface. |
| `--color-feedback-onSuccess` | Ink on a success surface. |
| `--color-shadow-popup` | Popup/elevation ink — a shadow reads as depth on light ground; on dark the same ink is invisible, so the dark rows are darker and more opaque (inherited from the reference seam's light-dark() pairs, now explicit mode rows — light-dark() leaves the generated output entirely). |
| `--color-border-default` | Default hairline between surfaces. |
| `--color-border-subtle` | Quieter hairline for inner divisions. |

### Spacing — `--size-*` (19)

Steps `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, `4xl`, `5xl`, one value per viewport tier (floor · mobile · desktop · wide),
multiplied by `--SPACE-SCALE`. The `-px` twins are the same step in px for the
rare property that cannot take rem.

`--size-none`, `--size-xs`, `--size-sm`, `--size-md`, `--size-lg`, `--size-xl`, `--size-2xl`, `--size-3xl`, `--size-4xl`, `--size-5xl`, `--size-xs-px`, `--size-sm-px`, `--size-md-px`, `--size-lg-px`, `--size-xl-px`, `--size-2xl-px`, `--size-3xl-px`, `--size-4xl-px`, `--size-5xl-px`.

### Site scaffolding (1)

`--site-offset`.

### Grids — `--grid-*` (39)

Three recipes (container, layout, breakout) on the grid's own ladder (base · mobile · tablet · desktop, ADR-0011).

`--grid-container-offset`, `--grid-container-maxWidth`, `--grid-container-columns`, `--grid-layout-columns-count-base`, `--grid-layout-columns-count-mobile`, `--grid-layout-columns-count-tablet`, `--grid-layout-columns-count-desktop`, `--grid-layout-gap-base`, `--grid-layout-gap-mobile`, `--grid-layout-gap-tablet`, `--grid-layout-gap-desktop`, `--grid-layout-columns-base`, `--grid-layout-columns-mobile`, `--grid-layout-columns-tablet`, `--grid-layout-columns-desktop`, `--grid-breakout-offset`, `--grid-breakout-maxWidth`, `--grid-breakout-columns-count-base`, `--grid-breakout-columns-count-mobile`, `--grid-breakout-columns-count-tablet`, `--grid-breakout-columns-count-desktop`, `--grid-breakout-gap-base`, `--grid-breakout-gap-mobile`, `--grid-breakout-gap-tablet`, `--grid-breakout-gap-desktop`, `--grid-breakout-column-autoSize-mobile`, `--grid-breakout-content-autoPadding-mobile`, `--grid-breakout-column-autoSize-tablet`, `--grid-breakout-content-autoPadding-tablet`, `--grid-breakout-column-autoSize-desktop`, `--grid-breakout-content-autoPadding-desktop`, `--grid-breakout-columns-base`, `--grid-breakout-columns-mobile`, `--grid-breakout-columns-tablet`, `--grid-breakout-columns-desktop`, `--grid-layout-gap`, `--grid-layout-columns`, `--grid-breakout-gap`, `--grid-breakout-columns`.

### Typography roles (67)

Voices: `heading`, `display`, `body`, `code`, `label`, `preamble`. Every voice publishes one token per
bundle property; a component reads the voice's bundle, never a family or weight
constant. Size stops are tier ramps (ADR-0001) multiplied by `--TYPE-SCALE`.

| Bundle property | Per voice |
|---|---|
| `--fontFamily-<voice>` | `heading`, `display`, `body`, `code`, `label`, `preamble` |
| `--fontWeight-<voice>` | `heading`, `display`, `body`, `body-bold`, `code`, `label`, `preamble` |
| `--lineHeight-<voice>` | `heading`, `display`, `body`, `label`, `preamble` |
| `--letterSpacing-<voice>` | `heading`, `display`, `body`, `label`, `preamble` |
| `--fontFeatureSettings-<voice>` | `heading`, `display`, `body`, `label`, `preamble` |
| `--baseline-offset-<voice>` | `heading`, `display`, `body`, `label`, `preamble` |
| `--fontEmBox-<voice>` | `heading`, `display`, `body`, `label`, `preamble` |
| `--fontCapGap-<voice>` | `heading`, `display`, `body`, `label`, `preamble` |
| `--fontDescent-<voice>` | `heading`, `display`, `body`, `label`, `preamble` |

Size stops: `--fontSize-h1`, `--fontSize-h2`, `--fontSize-h3`, `--fontSize-h4`, `--fontSize-h5`, `--fontSize-h6`, `--fontSize-display-1`, `--fontSize-display-2`, `--fontSize-display-3`, `--fontSize-body-small`, `--fontSize-body`, `--fontSize-body-large`, `--fontSize-code`, `--fontSize-label-small`, `--fontSize-label`, `--fontSize-label-large`, `--fontSize-preamble-small`, `--fontSize-preamble`, `--fontSize-preamble-large`.

## 4. The `--ui-*` seam (21) — pointers into the semantic layer

The reference-components lineage's public surface (ADR-0002), expressed as
appearance-free pointers. Ported components read it; it never mentions a mode.

| Seam token | Points to |
|---|---|
| `--ui-surface` | `var(--color-surface-page)` |
| `--ui-surface-foreground` | `var(--color-text-primary)` |
| `--ui-surface-padding` | `0.75rem` |
| `--ui-radius` | `0.75rem` |
| `--ui-shadow` | `var(--color-shadow-popup)` |
| `--ui-border` | `var(--color-border-subtle)` |
| `--ui-ring` | `var(--color-focus-ring)` |
| `--ui-primary` | `var(--color-interactive-primary)` |
| `--ui-primary-foreground` | `var(--color-interactive-onPrimary)` |
| `--ui-muted-foreground` | `var(--color-text-secondary)` |
| `--ui-hover` | `var(--color-interactive-secondary-hoverSurface)` |
| `--ui-destructive` | `var(--color-feedback-error)` |
| `--ui-warning` | `var(--color-feedback-warning)` |
| `--ui-warning-foreground` | `var(--color-feedback-onWarning)` |
| `--ui-success` | `var(--color-feedback-success)` |
| `--ui-info` | `var(--color-feedback-info)` |
| `--ui-font-size` | `var(--fontSize-label)` |
| `--ui-font-size-small` | `var(--fontSize-label-small)` |
| `--ui-font-weight` | `var(--fontWeight-label)` |
| `--ui-font-weight-strong` | `var(--fontWeight-body-bold)` |
| `--SITE--PADDING` | `var(--site-offset)` |

## 5. RAW constants (238) — never in a component

UPPERCASE names are the palette, the type stops per tier, the spacing and site
constants and the scale knobs. Only the semantic factories may reference them
(ADR-0004 §1). A component that writes one has skipped a layer.

- `--COLOR-<FAMILY>-<L>` (55): `--COLOR-SUMI-` × 20, `--COLOR-AI-` × 11, `--COLOR-HINOKI-` × 6, `--COLOR-YU-` × 6, `--COLOR-KAKI-` × 4, `--COLOR-MATCHA-` × 4, `--COLOR-KOHAKU-` × 4
- `--TYPE-SCALE`
- `--FIRA-SANS`, `--FIRA-SANS-600`
- `--NOTO-SERIF`
- `--ABRIL-FATFACE`, `--ABRIL-FATFACE-400`
- `--INTER`, `--INTER-400`
- `--MONOSPACE`, `--MONOSPACE-400`
- `--NOTOS-SERIF-400`, `--NOTOS-SERIF-700`
- `--FONTSIZE-<STOP>-<TIER>` (76), tiers `FLOOR`, `MOBILE`, `DESKTOP`, `WIDE`
- `--SPACE-SCALE`
- `--SIZE-<STOP>-<TIER>` (72), tiers `FLOOR`, `MOBILE`, `DESKTOP`, `WIDE`, `PX`
- `--DIR-LTR`, `--DIR-RTL`
- `--MOBILE-BREAKPOINT`
- `--DESKTOP-BREAKPOINT`
- `--SITE-MAXWIDTH`, `--SITE-OFFSET-FLOOR`, `--SITE-OFFSET-FLOOR-NEGATIVE`, `--SITE-OFFSET-MOBILE`, `--SITE-OFFSET-MOBILE-NEGATIVE`, `--SITE-OFFSET-DESKTOP`, `--SITE-OFFSET-DESKTOP-NEGATIVE`, `--SITE-OFFSET-WIDE`, `--SITE-OFFSET-WIDE-NEGATIVE`
- `--CONTENT-MAXWIDTH`
- `--GRID-GAP-BASE`, `--GRID-GAP-MOBILE`, `--GRID-GAP-TABLET`, `--GRID-GAP-DESKTOP`, `--GRID-COLUMNS-BASE`, `--GRID-COLUMNS-MOBILE`, `--GRID-COLUMNS-TABLET`, `--GRID-COLUMNS-DESKTOP`
