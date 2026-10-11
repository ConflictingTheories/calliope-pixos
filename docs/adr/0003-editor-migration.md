# ADR 0003 — Editor migration strategy

**Status:** proposed
**Date:** 2026-10-06
**Deciders:** Kyle Derby MacInnis

## Context

`packages/editor` is ~50K LOC with zero tests and a 1,915-line god component
(`app.jsx`) that eagerly imports all 12+ tool panels. Any overhaul without a
safety net is high-risk. The editor is also the package Kyle most wants improved.

## Decision (proposed)

Migrate incrementally behind a seam, no big-bang rewrite:

1. **Test harness first** — add the missing `test` script and cover zip
   round-trip, Monaco language registration, and orchestrator pure functions
   before structural changes.
2. **Panel registry + lazy loading** — extract the 12 tool panels from `app.jsx`
   into a registry and load via `React.lazy` + Suspense; target <300 lines
   for `app.jsx`.
3. **State management** — replace abandoned `react-recollect` (10 files) with
   React context (or zustand) before it rots further.
4. **One zip library** — `jszip@^3.10.1` everywhere; remove `@zip.js/zip.js`
   once its single import (`app.jsx`) is migrated.
5. **Vendored audio** — extract `zip-manager/services/lib/*` to npm deps or
   `packages/vendor` so license/audit tooling can see them.

## Consequences

- Each step is independently shippable and testable; the editor keeps working
  throughout.
- The zip-library cut and recollect replacement are the two steps that change
  runtime dependencies and need the most review.

## Alternatives considered

- **Full rewrite:** rejected — 50K LOC with zero tests cannot be rewritten
  safely; incremental migration preserves a working editor at every commit.

## Links

- Related tickets: P2-01…P2-05 (plan), P6-09 (AI generator isolation — needs P6-08)
