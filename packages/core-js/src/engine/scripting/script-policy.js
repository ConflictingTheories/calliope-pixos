/**
 * Published-script trust policy — P4-06 (DECIDED: sandbox-by-default).
 *
 * Kyle's decision (2026-10-06): all published pixozine scripts run inside the
 * ScriptBoundary worker sandbox with default-deny capabilities. There is no
 * trusted-script fast path: even first-party scripts execute behind the
 * boundary. Host capabilities (network, storage) are granted explicitly by
 * the host application, never by the script or its manifest alone.
 *
 * Sensitivity tiers:
 *   TIER_ALWAYS (0)   — bound even when a manifest declares nothing.
 *   TIER_DECLARED (1) — granted when the manifest declares the capability.
 *   TIER_GRANT (2)    — declared AND explicitly granted by the host.
 *   unknown           — denied, always.
 *
 * Permission model:
 *   network (host:fetch) — Tier 2. Grant carries an `allowlist` of URL
 *     prefixes; requests outside it are denied by the host handler.
 *   storage (host:kv)    — Tier 2. Grant carries a `namespace`; the script
 *     sees only keys under `<namespace>:` and can never reach other
 *     pixozines' or the host's storage.
 *   time (lib:os)        — Tier 1. Clock/date only (the lib itself exposes
 *     no process control); wall-clock execution is still bounded by the
 *     ScriptBoundary timeout regardless of grants.
 *
 * This module is pure policy (no I/O, no worker). Enforcement lives in
 * ScriptBoundary (time/error termination) and createApiAdapter (lib binding).
 */

export const TRUST_POLICY = 'sandbox-by-default';

/** Sensitivity tiers. Lower number = less sensitive. */
export const TIER_ALWAYS = 0;
export const TIER_DECLARED = 1;
export const TIER_GRANT = 2;

/**
 * Capability -> tier. Must stay in sync with CAPABILITIES in script-api.js.
 * Anything not listed here is denied (default-deny).
 */
export const POLICY_TIERS = Object.freeze({
  // Tier 0: pure, always-safe libraries.
  'lib:math': TIER_ALWAYS,
  'lib:table': TIER_ALWAYS,
  'lib:string': TIER_ALWAYS,
  'lib:coroutine': TIER_ALWAYS,
  // Tier 1: declared-only. lib:os is clock/date with no process control;
  // lib:io is a host-provided virtual filesystem; lib:debug is introspection.
  'lib:os': TIER_DECLARED,
  'lib:io': TIER_DECLARED,
  'lib:debug': TIER_DECLARED,
  // Tier 2: declared + explicit host grant. Network and storage cross the
  // sandbox boundary and are mediated by host handlers with scoped grants.
  'host:fetch': TIER_GRANT,
  'host:kv': TIER_GRANT,
});

export const TIER_DESCRIPTIONS = Object.freeze({
  [TIER_ALWAYS]: 'always bound, no declaration needed',
  [TIER_DECLARED]: 'granted when declared in the manifest',
  [TIER_GRANT]: 'granted only with an explicit, scoped host grant',
});

/**
 * Resolve a manifest's declared capabilities against the sandbox policy.
 *
 * @param {string[]} declared - capabilities from the pixozine manifest
 * @param {object} hostGrants - explicit host grants, e.g.
 *   `{ 'host:fetch': { allowlist: ['https://cdn.example/'] },
 *      'host:kv': { namespace: 'pixozine-abc' } }`
 * @returns {{ granted: string[], denied: { capability: string, reason: string }[], grants: object }}
 *   `granted` lists capabilities the script may use; `denied` lists the rest
 *   with machine-readable reasons: 'unknown-capability' | 'grant-required'.
 *   `grants` echoes back the scoped grant objects for the granted Tier-2 caps.
 */
export function resolvePolicy(declared = [], hostGrants = {}) {
  const granted = [];
  const denied = [];
  const grants = {};

  const seen = new Set();
  for (const cap of declared || []) {
    if (seen.has(cap)) continue;
    seen.add(cap);

    const tier = POLICY_TIERS[cap];
    if (tier === undefined) {
      denied.push({ capability: cap, reason: 'unknown-capability' });
      continue;
    }
    if (tier === TIER_GRANT) {
      const grant = hostGrants[cap];
      if (grant && typeof grant === 'object') {
        granted.push(cap);
        grants[cap] = grant;
      } else {
        denied.push({ capability: cap, reason: 'grant-required' });
      }
      continue;
    }
    granted.push(cap); // TIER_ALWAYS and TIER_DECLARED
  }

  // Tier-0 capabilities are always available even when undeclared.
  for (const [cap, tier] of Object.entries(POLICY_TIERS)) {
    if (tier === TIER_ALWAYS && !seen.has(cap) && !granted.includes(cap)) {
      granted.push(cap);
    }
  }

  return { granted, denied, grants };
}

/**
 * Check whether a single capability would be granted under the policy.
 * Convenience wrapper for host UIs (e.g. "this pixozine wants network").
 */
export function wouldGrant(capability, hostGrants = {}) {
  const tier = POLICY_TIERS[capability];
  if (tier === undefined) return { granted: false, reason: 'unknown-capability' };
  if (tier === TIER_GRANT) {
    const grant = hostGrants[capability];
    return grant && typeof grant === 'object'
      ? { granted: true, reason: 'grant-present', grant }
      : { granted: false, reason: 'grant-required' };
  }
  return { granted: true, reason: 'tier-' + tier };
}

/**
 * Human-readable policy summary for manifests, docs, and consent UI.
 * @returns {{ policy: string, tiers: { capability: string, tier: number, description: string }[] }}
 */
export function describePolicy() {
  return {
    policy: TRUST_POLICY,
    tiers: Object.entries(POLICY_TIERS).map(([capability, tier]) => ({
      capability,
      tier,
      description: TIER_DESCRIPTIONS[tier],
    })),
  };
}

export default {
  TRUST_POLICY,
  TIER_ALWAYS,
  TIER_DECLARED,
  TIER_GRANT,
  POLICY_TIERS,
  TIER_DESCRIPTIONS,
  resolvePolicy,
  wouldGrant,
  describePolicy,
};
