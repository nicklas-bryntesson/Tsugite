---
name: writing-css
description: The routine for writing or changing any CSS in packages/tsugite — read the doctrine, the registry and the component's recipe, write, then compare the file against example.css point by point. Use before touching a component's .css or a <style> block, and when reviewing CSS someone else wrote.
---

# Writing CSS

A component stylesheet in this repo has one shape. `example.css` in this
folder is that shape written out: a component that does not exist, showing
every form the doctrine asks for, each block commented with the rule and
where it lives. `counter-example.css` is the same component written wrong,
every fault marked. You compare against the first and recognise the second.

## Before writing

1. Read `packages/tsugite/docs/css-doctrine.md` — the rules. Short.
2. Read `packages/tsugite/docs/tokens.generated.md` — the registry. A name
   that is not there does not exist; a raw value with a `TODO(token)` beats
   an invented name.
3. Read the component's table, `packages/tsugite/recipes/<name>.recipe.ts`.
   Every value of every axis in it needs a gate in the CSS; nothing in the
   CSS may gate a value the table does not have.
4. Find the component's slot prefix in ADR-0013 §2's register, or claim one
   there if the component is new.

## While writing

Follow `example.css` block for block. In particular:

- One root, PascalCase, the recipe's `class`. Parts are the recipe's part
  names, bare lowercase, nested under the root with `&`.
- Knobs on the root with a default; carriers set only by gates; never an
  empty slot.
- Every axis value gated, the off value first. No default in the base for
  an attribute the component always writes.
- Tiers, containers and feature queries nest inside the root, bounded at
  both ends; a feature query is a pair, fallback first, nothing declared in
  both branches.
- One fallback per expression, only at the theme seam or a voice's optional
  stop.
- Logical properties. One declaration per line. Typed TODOs above the line.

## After writing — the comparison

Before reporting, hold the file against `example.css` section by section
and write the result into your reply:

- **Header** — promise, one line per gate, nothing else.
- **Root** — knobs with defaults, prefix from the register, no carriers, no
  empty slots.
- **Parts** — bare lowercase, nested; no `Name-part`, no `name-part`.
- **Gates** — every recipe value present, off first, carriers complete per
  gate.
- **Queries** — nested, bounded, paired; nothing overridden between a base
  and a branch.
- **Chain** — every `var()` in the registry (or a `TODO(token)`), at most
  one fallback, at a seam.
- **Form** — one declaration per line, `&` first, typed TODOs, no rulers,
  no provenance.

Name every deviation, and say whether it is deliberate (with the reason
above the line in the file) or a fix you made. A file that deviates without
saying why is drift, whoever wrote it.

## What the comparison cannot decide

Some things look the same and mean different things: `:where` is right in
the run engine's law (d) exemption and wrong as an invitation to be
overridden from outside; a raw value is right with a `TODO(token)` and
wrong without one. The example says which is which; when it does not,
stop and ask rather than pick.

## Keeping the example true

A change to the doctrine, a new convention, or a new ADR that touches CSS
lands in `example.css` in the same pull request. An example that lags the
rules teaches the wrong ones.
