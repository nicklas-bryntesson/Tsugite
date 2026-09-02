# ADR-0009: Deletability is the gate criterion — progressive enhancement with the happy path last

**Status:** Accepted · 2026-09-02

## Context

Progressive enhancement in this system is gated: `@supports` branches
bound each declaration to the support context where it is valid, the
same bounding ADR-0007 applies to every other axis. The intended
lifecycle is explicit — when a feature crosses the agreed support
threshold (e.g. "subgrid passed 94%"), the fallback branch and its gate
are deleted wholesale, and nothing may break for the supported set.

This is a backend code principle applied to front-end structure:
**defensive design with the happy path last.** Guards come first and
expect to die; the modern spec is the happy path, authored as the end
state. Deleting a guard must never require editing the truth that
survives it.

The criterion crystallized in a discussion about `@layer` compile
polyfills (2026-09-02): under it, an authored fallback branch and a
compile-time polyfill are the same category — both are guards, and both
must answer the same question: *is removal a no-op for the supported
set?* An authored `@supports` branch answers it by construction
(branches are bounded, values do not bleed). A polyfill answers it only
empirically — its simulation must be semantically identical to the
native spec, otherwise deletion day breaks the supported majority, the
one place breakage cannot be afforded. The conformance suites (computed
styles) turn that empirical property into a provable one.

## Decision

A fallback mechanism — an authored `@supports` branch or a compile-time
polyfill — is permitted if and only if:

1. **Removal is a no-op for the supported set** — by construction
   (bounded branches, no value bleed) or by conformance proof (the
   suites run green with the mechanism disabled).
2. **Values never bleed between branches.** Each branch is
   self-contained; the support axis is a bounded axis like every other
   (ADR-0007).
3. **The happy path is authored last and as the end state.** Deleting a
   fallback deletes code or build config only — never edits to the
   surviving modern branch.

The lifecycle is maintained with **regular threshold checks**: when a
feature passes the support threshold, run the **deletion-readiness
check** — the conformance suites with the fallback branch or polyfill
disabled. Green means the deletion is mechanical; the branch, its gate,
or the polyfill package is removed in one step.

## Consequences

- `docs/css-doctrine.md` §5 codifies the rule for day-to-day CSS work.
- Compile polyfills are no longer categorically rejected; they are
  assessed under this criterion (deletable, semantics proven by
  conformance) plus one documented cost: a source-distributed package
  places the polyfill in the consumer's pipeline, so it becomes part of
  the support contract until deletion day.
- The `@layer` rejection in ADR-0008 stands for the theme seam (the
  ownership chain does that job), but a future native-`@layer` adoption
  is a threshold decision under this ADR, not a permanent ban.
- Fallback branches carry an implicit expiry: a guard that can never be
  deleted is a design smell, not a safety net.
