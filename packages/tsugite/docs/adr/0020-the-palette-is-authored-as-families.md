# ADR-0020: The palette is authored as families

**Status:** Accepted · 2026-09-18. Landed with the same PR: the RAW palette
source restructured, the generated CSS byte-identical, `/docs/color`
rendering per family.

## Context

The RAW palette was a flat object of 55 keys. Its families — SUMI, AI,
HINOKI, YU, KAKI, MATCHA, KOHAKU — existed only in the key strings and in
comments above each block. No code could ask "which steps does SUMI have"
without parsing names, and the docs page rendered what the data was: a
mat of 55 swatches. Nicklas's own colour map for the same palette reads
families from structure and shows ramps, ladders and the "ladder → mode
row" table that replaced twelve `mix()` recipes with four pointers.

Two things the palette needs from a future theme builder settled the
shape. First, **naming is a label.** Every system names its colours
differently — `brand-blue`, `AI-50`, `Ocean` — and none of it matters:
a colour is a label that gets assigned to roles. Second, **a brand may be
as sloppy or as meticulous as it likes.** One project will author seven
named families with glyphs and steps in exact lightness order; another
will dump every colour it has into one bag and point roles at it. Both
must produce the same CSS.

This is ADR-0003's move a third time: an authoring form that carries
structure, a delivered form that does not (ADR-0018 §5 did the same for
recipes and their closures).

## Decision

1. **A family is authoring form and UI grouping, nothing more.** The
   palette source is

   ```js
   export const palette = {
     sumi: { label: "SUMI", glyph: "墨", note: "…", steps: [["00", "oklch(…)"], ["05", "…"], …] },
     ai:   { label: "AI",   glyph: "藍", note: "…", steps: [ … ] },
     …
   };
   ```

   The **key** is the system's id. The **label** is free text for humans
   and the builder. The **steps** are an ordered list of `[label, oklch]`
   pairs; step labels are free too (`00`–`95`, `50`–`900`, `paper`/`ink`).

2. **Families are kind-less.** Neutral, chromatic, status: those are
   properties of the roles that point at a family, never of the family. A
   family nothing points at (YU today) is not an error; a lint may say so.

3. **The order is the author's and may be wrong.** Steps are positions in
   an array. A lint may warn when the order does not follow lightness; a
   builder may offer to sort; the system does not care.

4. **CSS names are derived, never authored.** `--COLOR-<KEY>-<STEP>`, upper
   case, from the family key and the step label. The flat map every
   consumer reads — `rawColorTokens` — is computed from the families in
   authoring order, so the generated CSS is stable and, for this palette,
   byte-identical to before. `RAW_REF`, `rawRefName`, `raw()` and
   `assertRawReferences` are unchanged: one grammar, one lookup, one guard
   (`raw()` throws on an unknown step at build).

5. **The system requires nothing of the palette's structure.** Only that
   `(family, step)` is addressable. One family or twenty, sorted or not,
   deliver the same CSS. Roles are assigned in the semantic and voice
   factories by pointing at a step, cell by cell, per mode the project has
   opted into; the palette knows nothing about roles.

## Alternatives rejected

- **Families as a naming convention only** (the status quo: `FAMILY-STEP`
  in the key, grouped by regex). Three copies of the regex had already
  drifted once; a name with a hyphen inside the family fell out of all
  three silently. Structure has no regex.
- **A `kind` on the family** (neutral / chromatic / status). It would let
  the system reason about families, which is exactly the dependency
  decision 5 forbids: the one-bag project has no kinds to give.
- **Sorting steps by lightness automatically.** Convenient in a builder,
  but it takes a decision away from the author and hides a mistake the
  author may want to see. Explicit order plus a warning.
- **Contrast requirements as a system rule.** Discussed and placed
  elsewhere: the theme builder warns (or errors, with an "I know what I'm
  doing" override) while roles are assigned. The house theme's own AA/AAA
  test on voice cells stays as a test of this palette, not as a law for
  others.

## Consequences

- `theme-default/raw.color.tokens.js` exports `palette` (the families),
  `rawName(key, step)` and the derived `rawColorTokens`. The dead
  migration tail (`LEGACY_MAP`, `RETIRED`, `FEEDBACK_SHAPE`) goes: nothing
  imported it and the migration it described has landed.
- `/docs/color` renders the RAW palette per family — label, glyph, note,
  a ramp of steps — from the same structure. Nothing else on the page
  changes.
- `styles/tokens/color/color.raw.generated.css` is regenerated and
  unchanged.
- For the theme builder: "create a family" is a key, a label and an
  empty ladder; assigning roles is a separate step, a table of roles ×
  opted-in modes with a `(family, step)` in every cell. Contrast checking
  lives there, as a warning with an override. Voices authored as a delta
  over the semantic roles (delivered total, per ADR-0006) is a direction
  noted for that work, not decided here.
