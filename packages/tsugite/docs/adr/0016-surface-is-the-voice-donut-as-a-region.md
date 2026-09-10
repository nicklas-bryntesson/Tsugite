# ADR-0016: Surface is the voice donut as a region

**Status:** Accepted · 2026-09-10

## Context

ADR-0006 gave the system its theme axis: `data-theme` says whose palette
speaks, `data-prominence` how loud, and the factory generates one block
per voice and one per volume. Since then every page band that wanted a
voice wrote the two attributes on a bare element and its own padding
and background rules beside them (the docs start page, the Button
ownership example). Nothing owned the ground, the rhythm, or the rule
that two equal bands read as one.

Nicklas had built that last rule before, in an earlier codebase, per
theme by hand:

```css
.block[theme="surface-R90"] + .block[theme="surface-R90"] { padding-block-start: 0; }
```

Each theme was a CSS block of its own, and each pair a rule of its own.
In Tsugite the first half is already automatic — the theme channels
resolve the ground and the ink for every voice in every mode — and the
second half is an enumeration over a table the factory already owns.

The component-model draft names `Section`, `Container` and
`ContentBlock` as entropy magnets: names that cannot refuse anything.
This one can. It *claims* a voice for what it hosts; it refuses layout,
content vocabulary and landmark semantics.

## Decision

1. **Surface is a component and a region.** On the docs map it sits in the
   `region` pillar: it governs a capability (colour) over hosted content
   and projects state (`data-theme`, `data-prominence`) that the whole
   subtree reads through the channels, exactly as MotionRegion governs
   motion. Card stays a primitive: it frames; Surface claims.
2. **It owns three things and nothing else:** the ground and ink
   (`--theme-surface` and `--theme-text`, one fallback each to the
   semantic default, ADR-0008), a block and inline rhythm from the size
   and site ramps, and the theme claim. No per-voice CSS lives in the
   component; the generated voice blocks do that work.
3. **The ground is absence.** A Surface without `theme` writes no
   `data-theme`, because the wiring block matches any value. With a voice,
   `data-prominence` is always written (default `primary`). Without a
   voice, `data-prominence` is written only when passed, and means "the
   surrounding voice, at this volume" (ADR-0006 §2).
4. **The component reads the combination matrix.** An unknown voice, an
   unknown volume, or a pair `voiceMatrix` does not list is a dev error —
   the second of ADR-0006 §6's three enforcement surfaces.
5. **Adjacency rules are generated, not written.** Two adjacent Surfaces
   of the same voice × volume are one ground, so the second drops its
   start padding. CSS cannot compare a sibling's attribute value, so one
   rule per combination is required; `engine/surface.js` emits them from
   `voiceMatrix` and `VOLUMES` into `components/Surface/Surface.generated.css`
   — the ground, each volume-only nesting, and each allowed pair. A
   forbidden pair gets no rule. The file is a generated artifact like the
   token CSS: `pnpm tokens` writes it, the freshness suite guards it, the
   hook blocks hand edits.
6. **Footprint vocabulary from ADR-0015:** a Surface always spans its
   container, so it carries no `grow-inline`; its hosted content is held
   to the site's content measure through `data-cap-inline`, default true.

## Alternatives rejected

- **Per-theme CSS in the component** (the earlier codebase's form).
  Rejected: it grows with the catalogue and repeats what the voice
  blocks already do.
- **Hand-written adjacency rules.** Rejected: they are wrong the day a
  voice or volume is added; the matrix is the single source.
- **A `ground` value for `data-theme`.** Rejected for now: the wiring
  block matches any value, so a written ground would claim a voice. If
  nested breakout to the page ground is needed, it is a new decision.
- **Naming it Region or Section.** Region is the accessibility landmark
  and MotionRegion's word; Section cannot refuse anything.

## Consequences

- The adjacency collapse only sees siblings: two Surfaces in different
  wrappers do not read each other. The component says so in its header.
- The docs start page and the Button ownership example can be rebuilt on
  Surface; they are not in this change.
- The rhythm reads `--size-2xl` and `--site-offset` until the spacing
  sweep gives sections their own tokens.
- Slot prefix `sf` joins the ADR-0013 register.
