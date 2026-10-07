# ADR 0002 — Package-first architecture

**Status:** accepted
**Date:** 2026-10-06
**Deciders:** Kyle Derby MacInnis

## Context

The engine, editor, console player, and (planned) publishing flow all pass around
loose directories and ad-hoc zips. The "spritz" package format was aspirational:
no versioned spec, no validator, an 18-line stub player. For SVRN publishing
("pixozines") the distributable artifact must be real, versioned, and validatable.

## Decision

- The **package** (manifest + declarative JSON + assets in a zip) is the unit of
  distribution between editor → player → publishing backend.
- `packages/specs` owns the format schemas; a single validator is the gate for
  anything the editor emits or the player loads (see P1-03/P1-04 in the plan).
- Content units are called **pixozines** (Z1, 2026-10-06); the `svrn-format`
  package owns the format going forward.

## Consequences

- Editor export, console loading, and the publishing pipeline all validate
  against the same schemas; invalid packages cannot ship.
- Format changes require a version bump and migration notes (P1-02 policy).

## Alternatives considered

- **Keep per-tool ad-hoc zips:** rejected — already the source of the
  editor/server data-shape split-brain class of bug.

## Links

- Related tickets: P1-01, P1-02, P1-03, P1-04
- SVRN reconciliation addendum (2026-10-06)
