# PixoSpritz v1 Readiness Release Process

**Ticket:** P6-09 — "Cut v1 readiness release"
**Status:** process definition (no release has been cut from this doc yet)
**Owner:** Kyle Derby MacInnis — nothing below happens without his explicit sign-off.

This document defines *how* a v1 readiness release is cut. It does not cut one.
Cutting a release, tagging, or publishing anything is a separate, explicitly
authorized act (see §3).

---

## 1. Pre-release gates

All of these must be true before a release candidate is even proposed.
A single failed gate stops the release. No exceptions, no "we'll fix it in a
point release" — v1 sets the trust baseline.

### 1.1 Ticket gates

- [ ] Every ticket marked critical in the development plan is implemented **and
      approved** (not merely merged — Kyle has reviewed the draft PR).
- [ ] Every DECISION ticket has a recorded decision (no open decisions on the
      release branch).
- [ ] P0-04 (CI) is marked CANCELLED per the 2026-10-06 decision — CI does not
      exist yet, so the gates below are **manual** until that changes.

### 1.2 Test gates

- [ ] `npm install` from a clean checkout (no `node_modules`, no caches).
- [ ] Full test suite passes: `npm test` (vitest) — zero failures, zero skips
      that aren't explicitly waived in the release notes.
- [ ] Native conformance passes: CTest suite in `packages/core-c` (host GCC
      minimum; ARM cross-compile where the toolchain is available).
- [ ] `npm run verify` passes (release-readiness checks).
- [ ] `npm run lint` passes (lint budget ratchet holds).
- [ ] `npm run sbom` produces a current SBOM (see §4).

### 1.3 Documentation gates

- [ ] `CHANGELOG.md` updated for the release (see §5 — format and process).
- [ ] The dual-license terms have completed legal review (see the
      LAWYER-REVIEW flag in `LICENSE` — commercial terms must be finalized by
      a lawyer before any public release or sale).
- [ ] ADRs for all accepted architectural decisions are in `docs/adr/`.

### 1.4 The verify gate (clean install + golden paths)

This gate **cannot be skipped and cannot be delegated to automation that
doesn't exist yet**. On a clean machine (or container):

1. `npm install` from the release tag — no pre-existing caches.
2. `npm run verify` passes.
3. **Creator golden path:** open the editor → create a project → generate or
   import assets → save → reopen (state intact) → export a pixozine package →
   validate it with the CLI (`pixozine validate`).
4. **Publisher golden path:** take the exported package → publish flow →
   confirm the published artifact loads in the player.
5. **Rollback drill** passes (see §6).

Record the machine, OS, Node version, and results in the release notes.
If any golden path fails, the release is blocked.

---

## 2. Changelog — format and process

`CHANGELOG.md` lives at the repo root. Format (Keep-a-Changelog style,
adapted):

```markdown
# Changelog

## [Unreleased]

## [1.0.0] - YYYY-MM-DD

### Added
- ...

### Changed
- ...

### Fixed
- ...

### Security
- ...

### Removed
- ...

### Known limitations
- ...
```

Rules:

- Every user-facing change lands under `[Unreleased]` in the same PR that
  makes the change. The release process *moves* entries, never *writes* them
  from memory.
- `Security` covers trust-boundary changes (script sandbox, capabilities,
  encryption, native conformance scope).
- `Known limitations` is mandatory reading for v1 — it lists what was
  explicitly deferred (e.g. macOS/Windows native targets, forum layer).
  Honesty here is a feature.
- On release: rename `[Unreleased]` to the version + date, and start a fresh
  empty `[Unreleased]` section.

---

## 3. Public-scope approval — explicit authorization required

**Nothing publishes without Kyle's explicit sign-off.** This includes:

- Pushing a release tag to GitHub.
- Publishing any package to npm (or any registry).
- Making any release artifact public (binaries, player bundles, docs site).
- Announcing the release anywhere.

The approval is per-release, not blanket. "Ship v1" said once does not
authorize v1.1. The approver confirms:

1. All §1 gates passed (with evidence — test output, verify log).
2. The changelog is accurate and the known-limitations section is honest.
3. The public scope is correct: *what* is being published, *where*, under
   *which license tier* (dual-license: confirm which artifacts fall under
   which tier).

Record the approval (who, when, what scope) in the release notes.

---

## 4. Tagging immutable artifacts

Once §3 approval is recorded:

1. **Git tag:** `v1.0.0` (annotated: `git tag -a v1.0.0 -m "PixoSpritz v1.0.0"`).
   Tags are immutable — never move or delete a release tag. A broken release
   gets a new version, never a rewritten tag.
2. **SBOM:** `npm run sbom` output is committed alongside the tag and attached
   to the release. The SBOM is part of the artifact, not an afterthought.
3. **Native artifacts:** each compiled target (host, ARM) is checksummed
   (SHA-256); checksums are recorded in the release notes.
4. **Player bundle:** the versioned web player is pinned by content hash;
   embeds reference the hash, not `latest`.

Versioning follows semver. The `v1.x` line is the maintained native target
per ADR-0005; breaking changes wait for v2.

---

## 5. Rollback drill procedure

The rollback drill verifies we can *unpublish* cleanly, not just publish.
Run it against a staging target before every release, and record the result.

1. **Deploy** the release candidate to the staging target.
2. **Publish** a test pixozine through the full golden path (§1.4).
3. **Break it on purpose:** deploy the *previous* release over it
   (simulating a bad release that must be rolled back).
4. **Verify the previous release still works:**
   - Previously published pixozines load (migrate-on-load handles the
     version step-down or fails loudly — never silently corrupt).
   - The player bundle hash resolves to the previous version.
   - No orphaned artifacts (storage, caches) reference the rolled-back
     version.
5. **Re-deploy** the candidate, re-run the golden paths.
6. **Record:** drill date, operator, target, pass/fail per step.

A failed drill blocks the release exactly like a failed test gate.
The drill exists because v1's users are creators — their published work
must survive our mistakes.

---

## 6. Release checklist (copy per release)

```markdown
## Release vX.Y.Z — checklist

### Gates
- [ ] All critical tickets implemented and approved
- [ ] No open DECISION tickets on the release branch
- [ ] npm install (clean) + npm test + CTest + npm run verify + lint — all green
- [ ] SBOM generated and current
- [ ] CHANGELOG.md updated (entries moved from [Unreleased], known limitations honest)
- [ ] License legal review complete (commercial terms finalized)
- [ ] ADRs current

### Verify gate (clean machine)
- [ ] Machine/OS/Node recorded: ___
- [ ] Creator golden path passes
- [ ] Publisher golden path passes
- [ ] Rollback drill passes (drill log attached)

### Approval
- [ ] Kyle's explicit sign-off recorded (date, scope, license tiers)

### Tagging
- [ ] Annotated git tag pushed (immutable)
- [ ] SBOM attached to release
- [ ] Native artifact checksums recorded
- [ ] Player bundle content hash pinned
```

---

*Process version: 2026-10-06. Amend by PR like any other doc — the process
itself is versioned, because the process is part of the product.*
