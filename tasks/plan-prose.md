# Prose — the plan (2026-09-22, before the POC)

Prose is the back door into the inheritance model: the one place markup is
not ours (an editor's rich text). Its content must still read as the
components do. This plan says what may drift, what may not, and how the
second kind is prevented rather than reviewed. Nothing here is built; the
POC comes first.

## The finding to open with

`components/Prose/Prose.astro` carries two margin systems on the same
paragraphs: the variant layer's `margin-block-end: 1em` on `p` is dead under
the trailing "PROSE SYSTEM (moved from style.css)" block's `.Prose > * + *`
1.5rem flow; the heading bundle is declared twice; blockquote padding and
list indent twice with different values. The fixture's claim about paragraph
spacing is therefore false. Remove the drift inside Prose before generating
anything into it.

Also wrong, from ADR-0021: Prose's line-length cap sits on the root at the
body stop, so headings get a ceiling measured in the body face and a
component in the flow can never be wider than a paragraph. The cap belongs
per element (below); the root stays uncapped.

## Two files, one map

1. **The rhythm file — hand-written, Prose's own truth.** Vertical flow
   between blocks, lists, tables, hr, links in running text, inline code.
   Components own no margins, so nothing here has a component to drift
   from. Every Layout's Stack is the model: one owl, `.Prose > * + *`, one
   measure from the size scale, and the exceptions named and counted on
   one hand. Never two rhythms.

2. **The generated file — from JS, everything that must not drift.** A
   small map, element → (voice, stop):

   ```js
   export const proseMap = {
     h1: ["heading", "1"], h2: ["heading", "2"], h3: ["heading", "3"],
     h4: ["heading", "4"], h5: ["heading", "5"], h6: ["heading", "6"],
     p: ["body", "md"], li: ["body", "md"], figcaption: ["label", "sm"],
     code: ["code", "md"],
   };
   ```

   The factory reads it with `sizeTokenName()` and emits `prose.generated.css`
   in the components' own skeleton: the invariants once (the engine), then
   per element only the slots — `--_pr-fontSize`, `--_pr-lineHeight`,
   `--_pr-letterSpacing`, `--_pr-lineLength` from the stop's tokens. No hand
   writes an `h2` row, so two `h2` rows cannot exist. The map is the one
   thing a human edits, and it is a design decision (an editor's h2 is
   heading 2), so it lives beside the recipes.

   Once the run engine is one shared file (`kernel/css/run.css`, see
   tasks/parking-lot.md), it is emitted twice from one source: for
   `[data-run="block"] > .run` and for Prose's element list.

## Depth and the lower boundary

- **Any depth.** Editors nest: `li p`, `blockquote p`, `ul ul`, `td p`.
  `.Prose > p` would leave a paragraph in a quote unstyled and the editor
  can do nothing about it. Structure rules count from the nearest meaningful
  parent (`li > ul` for a nested list's indent), never from Prose.
- **Never into a component.** CMSs put blocks in rich text (Umbraco, Craft):
  `<Prose><p/><Quote …/><p/></Prose>`. Every component carries a class on
  its root; editor markup carries none. The boundary is the first classed
  root: `@scope (.Prose) to (.Prose [class])` when the support contract
  allows it (the Chrome 109 tail of `.browserslistrc` drops `@scope`
  entirely, which would leave Prose unstyled there); until then the generated
  form `:where(.Prose) p:not(:is(.Prose [class]) *)`. Generated, so the
  selector's shape is a generator detail and switches in one place when the
  threshold moves (ADR-0009).
- Scope proximity (or `:where()` today) keeps Prose below every component's
  own rule: a component inside Prose always wins.

## The POC fixture and its four assertions

```html
<Prose>
  <p>…</p>
  <Quote … />
  <p>…</p>
  <h2>…</h2>
  <ul><li>…<ul><li>…</li></ul></li></ul>
</Prose>
```

1. Nothing leaks in: computed style of the Quote's inner `p` is identical
   with and without Prose around it.
2. One rhythm: the same step between paragraph and Quote as between two
   paragraphs (the owl treats the component as any block, ADR-0015: a
   composition styles its own parts, never a child's class).
3. The component's voice is unchanged inside Prose (law d, nearest voice
   wins by inheritance).
4. Every run sits on its own stop's line length: the `h2` at
   `--lineLength-h2` in its own face, the `p` at the body stop, the Quote
   free to take the column.

## The guard

A parity test in Playwright: `<Heading element="h2" size="2">` beside
`<Prose><h2>`, computed styles compared for the bundle's properties, per
voice × stop × appearance mode. Generation removes the mechanism for drift;
the test catches the residue. Same pair as the typography table already has
(the factory refuses an incomplete table, the test holds the artifact to
the factory).

## Study first

Open Props UI and Tailwind Typography: how each draws the depth and the
lower boundary (`not-prose`), how many rules a flow really needs, and what
they do with nested lists and blocks in text. Every Layout (Heydon
Pickering) is the lens for the rhythm file.

## Also Prose's since 2026-09-22

The reset no longer sets `text-wrap`, `overflow-wrap` or the body
`line-height` (styles/base/reset.css). For raw editor markup those are
Prose's to answer; until this pass lands, Prose headings are unbalanced and
long words may overflow.
