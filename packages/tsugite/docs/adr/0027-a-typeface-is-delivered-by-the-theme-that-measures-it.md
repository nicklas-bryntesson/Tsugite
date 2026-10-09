# ADR-0027: A typeface is delivered by the theme that measures it

**Status:** Accepted · 2026-10-09 — agreed in discussion 2026-10-09; lands
before the next suite moves to its bench (ADR-0026), so no bench measures
in a fallback font.

## Context

`theme-default/typography.tokens.js` names every family and its geometry:
`--FIRA-SANS` is `'Fira Sans', system-ui, sans-serif` with
`{ ascent: 0.93, capHeight: 0.692, descent: 0.26 }`. The text-box engine
(ADR-0024) and the faux-trim math build on those numbers, and a family
without metrics refuses to build.

The faces themselves do not live there. The font files sit in
`apps/docs/public/fonts/`, and the eight `@font-face` rules in
`apps/docs/src/styles/base/font.css`. So the theme says *which* typeface
and *how it measures*, but only the docs app can deliver it. The metrics
and the files they were measured from sit on opposite sides of the seam.

The bench app (ADR-0026, PR #110) made this visible: it renders the
package alone, so it renders in `system-ui` and `georgia` while the engine
trims them with Fira Sans's and Noto Serif's numbers. Every geometric
measurement on a bench is then of a font the theme does not describe.

Two more things point the same way:

- **A new theme is a new typeface.** A future theme builder (a dashboard
  that writes a theme, see the create-rig idea) has to change the faces
  together with the metrics. If the faces live in a site's CSS, a theme
  cannot carry its own type.
- **The current rules list `woff` before `woff2`.** A browser takes the
  first source it supports, so every modern browser downloads the larger
  `woff` and never the `woff2`. That is the kind of drift a generator
  rules out and hand-written CSS lets through.

## Decision

1. **A family's faces are data, next to its metrics.** Each entry in
   `typeFamilies` lists its faces: weight, style, an optional
   unicode-range, and its files.

   ```js
   "--FIRA-SANS": {
     stack: "'Fira Sans', system-ui, sans-serif",
     metrics: { ascent: 0.93, capHeight: 0.692, descent: 0.26 },
     faces: [
       { weight: 600, style: "normal", unicodeRange: "U+0020-007E",
         files: ["FiraSans/FiraSans-Heading-Core.woff2", "FiraSans/FiraSans-Heading-Core.woff"] },
       …
     ],
   },
   ```

   The exact shape is settled when it is built; what is decided is that
   faces, stack and metrics are one object.

2. **The files live in the theme.** `theme-default/fonts/<Family>/`.
   A theme is the unit that carries its typefaces; the package carries
   its themes.

3. **`@font-face` is generated.** `pnpm tokens` writes the rules into a
   generated file under `styles/tokens/typography/`, with each `url()`
   written relative to that file, so any consumer's bundler (Vite in the
   docs app and the bench app) resolves the files out of the package. No
   copy in `public/`, no alias. The generator writes the sources in a
   fixed order, `woff2` first, and `font-display: swap` on every face.

4. **A family delivers its faces, or says it is the system's.** A family
   either lists faces or is marked as a system family (today only
   `--MONOSPACE`, whose stack is the generic `monospace`). One of the
   two, or the build refuses, the way a family without metrics refuses
   today. A weight in `typeWeights` that names a family with faces must
   have a face at that weight, or the build refuses.

5. **The docs app receives its fonts from the package.** It imports the
   generated file like the other token tables, and its own `font.css`
   and `public/fonts/` go.

## Alternatives rejected

- **A copy of the files in both apps.** Two sources of the same bytes;
  the first rebrand updates one and not the other.
- **An alias from the bench app to `apps/docs/public/fonts`.** No copy,
  but the package would reach into the docs app, the seam pointing the
  wrong way, the same fault ADR-0026 removed from the tests.
- **A hand-written `fonts.css` in the theme.** The files would move to
  the right side of the seam, but the faces would stay outside the data:
  a theme builder could not write them, and nothing would check a weight
  against its face, or the source order.

## Consequences

- `typography.tokens.js`, its validation (`validateTypography`) and the
  generator gain the faces; `tests/typographyTokens.test.ts` holds the
  two refusals in decision 4.
- The font files move from `apps/docs/public/fonts/` to
  `theme-default/fonts/`; `font.css` goes from the docs app, and the
  docs global CSS imports the generated file instead.
- The bench app imports the same generated file, and renders in the
  theme's typefaces.
- Every face reaches modern browsers as `woff2` for the first time.
  Rendering does not change; the bytes on the wire get smaller.
- All four typefaces are under the SIL Open Font License, which asks
  that the license travels with the files. None ships with them today;
  each family folder gets its `OFL.txt` when the files move.
- Reading the metrics from the files at build (the step-2 plan in
  `typography.tokens.js`) becomes possible, since the files and the
  numbers now sit side by side. It is not part of this decision.
- The CSS entry the docs app and the bench app import is still two
  lists of the same files (`global.css`, `bench.css`). A package-owned
  entry is a separate question.
