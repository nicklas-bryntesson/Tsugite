# Tsugite 継手

A reference for deterministic front-end systems, built like joinery:
pieces meet through contracts that fit exactly — and refuse what doesn't.

A component here is a contract: a table of what may happen — which HTML
is an allowed outcome, which combinations may exist at once, what is
refused. The CSS mounts on that outcome whatever the route to the browser,
so the same component renders identically from Astro, React or Vue through
adapters of a few dozen lines ([why that matters](TLDR.md#a-component-is-a-contract)).

New here? Start with [TLDR.md](TLDR.md): the problem, in blunt examples,
and what this system does about it.

- **`packages/tsugite`** — the system (the proof): kernel, components,
  the color engine and token generator, conformance suites, ADR ledger.
- **`apps/docs`** — the documentation site (the argument): the map, the
  control room, the test bench, and the case for building this way.

The system's own tables (`theme-default`) are its first consumer:
spin a new base by authoring your own factories and regenerating —
coverage, ΔE fidelity and WCAG contrast are asserted at build.
