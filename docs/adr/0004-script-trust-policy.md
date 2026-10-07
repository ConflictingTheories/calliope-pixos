# ADR 0004 — Published-script trust policy: sandbox-by-default

**Status:** accepted
**Date:** 2026-10-06
**Deciders:** Kyle Derby MacInnis

## Context

Pixozines ship with author-written pixoscript. On SVRN, any creator can publish;
scripts are therefore untrusted third-party code by default. The execution
mechanism already exists (P4-07/P4-08): scripts run inside a Web Worker behind
`ScriptBoundary` (time/error termination, message-only host contact) with a
versioned capability registry (`script-api.js`, default-deny). What was open
(P4-06) was the *policy*: which scripts may run, and which host capabilities
(sandboxed network, storage, timers) a publisher may obtain.

## Decision

**Sandbox-by-default.** Every published script — first-party included —
executes inside the worker sandbox. There is no trusted-script fast path.

Capability tiers (`script-policy.js`):

| Tier | Capabilities | Rule |
|------|--------------|------|
| 0 — always | `lib:math`, `lib:table`, `lib:string`, `lib:coroutine` | bound with no declaration |
| 1 — declared | `lib:os` (clock/date only), `lib:io` (host vfs), `lib:debug` | granted when declared in the manifest |
| 2 — granted | `host:fetch` (network), `host:kv` (storage) | declared **and** explicitly granted by the host |
| — | anything else | denied, always |

Grants are explicit, per-pixozine, and scoped: `host:fetch` carries a URL
allowlist, `host:kv` carries a storage namespace. The manifest alone can never
self-grant; the host application (player/editor) is the grant authority and is
expected to surface Tier-2 requests in consent UI.

## Threat model

**Assets:** the host device and its data; the player's network identity;
other pixozines' storage; the creator's reputation (a malicious pixozine
reflects on the platform).

**Threat actors:** a malicious pixozine author; a compromised creator account;
a buggy (non-malicious) script — e.g. an infinite loop or a storage-exhaustion
bug.

**What the sandbox guarantees:**
- No ambient host access: the worker receives only script source + declared
  capabilities; the host never evaluates script source itself.
- Default-deny: undeclared and unknown capabilities are unavailable, including
  `fetch`, `XMLHttpRequest`, `WebSocket`, `eval`, `Function`, `process`.
- Time termination: a run exceeding its budget is killed via worker
  termination (no cooperative yielding required).
- Scoped mediation: granted `host:fetch`/`host:kv` go through host handlers
  that enforce the grant's allowlist/namespace.

**What it explicitly does NOT guarantee (documented limitations):**
- The `FORBIDDEN_PATTERNS` static scan is defense-in-depth, not a proof.
  Determined obfuscation can bypass static scanning; containment rests on
  worker isolation + default-deny, not on the scan.
- A *granted* capability can be abused within its scope (e.g. exfiltration to
  an allowlisted host). Grants must be scoped tightly and surfaced to the user.
- No protection against social engineering ("enter your password to continue").
- Side channels (timing) and resource exhaustion below the kill timeout are
  out of scope for v1.
- `lib:os` exposes clock/date; it cannot extend the execution budget.

## Consequences

- Player/editor hosts must implement the grant authority (consent UI for
  Tier-2 requests) — tracked as host work, not engine work.
- `new Function`-in-host-realm execution (`packages/script/src/index.ts:66`)
  is now a legacy path: all *published* execution must go through
  `ScriptBoundary`. Editor preview may use `createApiAdapter` (guarded mode).
- The policy module (`script-policy.js`) is pure and testable; acceptance
  tests live in `packages/core-js/__tests__/script-policy.test.js`.

## Alternatives considered

- **Trusted-only launch** (only signed/first-party scripts get capabilities):
  rejected — it kills the creator-platform story where third parties publish
  pixozines with scripts.
- **Ambient execution with a denylist**: rejected — denylists don't compose,
  and `new Function` in the host realm gives ambient access by construction.

## Links

- Related tickets: P4-06 (this decision), P4-07/P4-08 (mechanism)
- `packages/core-js/src/engine/scripting/script-policy.js`
- `packages/core-js/src/engine/scripting/ScriptBoundary.js`
- `packages/core-js/src/engine/scripting/script-api.js`
