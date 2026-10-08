# ADR 0005 — Native C runtime: maintained for the initial major version

**Status:** accepted
**Date:** 2026-10-06
**Deciders:** Kyle Derby MacInnis

## Context

The native C port (`packages/core-c`, ~15.7K LOC) was at risk of bit-rot: no
compile matrix, a provisional conformance scope, and an open product-role
question (P6-06). Kyle's decision (2026-10-06): the native runtime is
**maintained at least for the initial major version** because it serves
targets the web player cannot:

- **ARM portable game console** (RG353V-class): offline, handheld play.
- **Desktop PC**: maximum performance and a native experience for players
  who do not want a web experience.
- **Offline support**: no network dependency at runtime.

## Decision

The native runtime is a maintained export target for v1 (not an experiment,
not archived). Consequences:

**Required platforms and presets** (`packages/core-c/CMakePresets.json`):

| Preset | Target | Toggles |
|--------|--------|---------|
| `linux-desktop` | Linux desktop (dev + perf) | audio ON, Lua ON, network ON |
| `linux-desktop-minimal` | Constrained/offline desktop | audio OFF, Lua OFF, network OFF |
| `arm-linux` | ARM Linux console (RG353V-class, EGL/GBM) | audio ON, Lua ON, network OFF |

macOS/Windows hooks exist in the top-level `CMakeLists.txt` but have no
presets and no CI — explicitly out of scope for v1.

**Parity subset** (what "maintained" means — P6-08): the native conformance
suite (`packages/core-c/tests`, CTest) pins math, package manifest/load,
script (Lua binding), and save behavior against the JS implementation's
golden fixtures. Anything outside this subset is best-effort.

**CI**: scrapped 2026-10-06 per Kyle's decision — no CI/CD until something is live. The conformance suite is run manually (`ctest` in the build dir); the `ci-native.yml` workflow file is not in the repo. Revisit when the native targets ship.

## Consequences

- The conformance suite is a merge gate for native changes: new native
  behavior needs a CTest case or a documented tolerance.
- Scripting parity is at the *binding* level (Lua executes, sandbox flags
  respected), not language level: pixoscript (JS) and Lua 5.4 are different
  languages, so script conformance asserts binding behavior, not identical
  script semantics. This is a documented tolerance, not a gap.
- The AI generator (editor, JS-only) is isolated from native builds by
  construction — see P6-10; native targets never link editor code.

## Alternatives considered

- **Experiment**: rejected — without the maintained commitment the port
  rots, and Kyle has concrete hardware targets.
- **Archive**: rejected — the ARM console and offline-PC cases are real
  product requirements for v1.

## Links

- Related tickets: P6-06 (this decision), P6-05 (matrix), P6-07/P6-08
  (conformance), P6-10 (AI isolation)
- `packages/core-c/CMakePresets.json`, `.github/workflows/ci-native.yml`
