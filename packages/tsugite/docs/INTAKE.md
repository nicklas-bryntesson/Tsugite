# Intake: converting a reference-components component into Tsugite

The proven routine (18 components, zero component-code changes, four
logged test adaptations). reference-components remains the vanilla lab;
conversion happens here, occasionally, one component at a time.

1. **canonical() is the markup truth.** Express the component's
   `<Name>.generate.ts` → `canonical()` output as the .astro component —
   not the simplified snippets in the contract .md.
2. **The TS travels verbatim** where possible. Keep the init-gate when
   reusing reference JS (the component hydrates like the vanilla
   reference); adjust only import paths.
3. **The suites travel with the component** into `tests/e2e/` — they are
   the durable contract. Adaptations must be mechanical (selector
   scoping, targetPath) and each one is logged as feedback upstream.
4. **A fixture section** goes into `fixtures/` (the suites' host
   markup); the docs app mounts it via the manifest.
5. **A manifest row** in apps/docs (slug, pillar, family badge, suite
   pointer) puts it on the map.
6. **The data-* vocabulary** must pass the field dictionary
   (component-model.md §2.5) — one word answers one question.
7. **Findings flow back**: anything unclear, drifted or upstream-worthy
   is logged and fed back to reference-components.
