/**
 * Published-script trust policy acceptance tests — P4-06.
 *
 * Policy: sandbox-by-default. Default-deny capabilities; Tier-2 host
 * capabilities (network, storage) require an explicit, scoped host grant.
 * The manifest alone can never self-grant.
 *
 * Pure policy tests run directly. Boundary integration (forbidden rejection,
 * timeout containment) uses the injected-fake-Worker pattern from
 * script-boundary.test.js (jsdom has no real Worker).
 */
import { describe, it, expect, vi } from 'vitest';
import ScriptBoundary from '../src/engine/scripting/ScriptBoundary.js';
import {
  TRUST_POLICY,
  TIER_ALWAYS,
  TIER_DECLARED,
  TIER_GRANT,
  POLICY_TIERS,
  resolvePolicy,
  wouldGrant,
  describePolicy,
} from '../src/engine/scripting/script-policy.js';

// Minimal fake worker: never responds (for timeout), or auto-responds.
function fakeWorker({ autoRespond = null } = {}) {
  const handlers = {};
  const worker = {
    terminated: false,
    postMessage: vi.fn(msg => {
      if (autoRespond && msg.type === 'run') {
        autoRespond(msg, r => handlers.message({ data: r }));
      }
    }),
    terminate: vi.fn(() => {
      worker.terminated = true;
    }),
    set onmessage(fn) {
      handlers.message = fn;
    },
    get onmessage() {
      return handlers.message;
    },
    set onerror(fn) {
      handlers.error = fn;
    },
  };
  return worker;
}

describe('trust policy identity (P4-06)', () => {
  it('is sandbox-by-default', () => {
    expect(TRUST_POLICY).toBe('sandbox-by-default');
  });

  it('tiers every known capability and denies the unknown by construction', () => {
    expect(POLICY_TIERS['lib:math']).toBe(TIER_ALWAYS);
    expect(POLICY_TIERS['lib:os']).toBe(TIER_DECLARED);
    expect(POLICY_TIERS['host:fetch']).toBe(TIER_GRANT);
    expect(POLICY_TIERS['host:kv']).toBe(TIER_GRANT);
    expect(POLICY_TIERS['host:mind-control']).toBeUndefined();
  });

  it('describePolicy is well-formed for consent UI', () => {
    const d = describePolicy();
    expect(d.policy).toBe('sandbox-by-default');
    expect(d.tiers.length).toBeGreaterThan(0);
    for (const t of d.tiers) {
      expect(t.capability).toBeTypeOf('string');
      expect([TIER_ALWAYS, TIER_DECLARED, TIER_GRANT]).toContain(t.tier);
    }
  });
});

describe('resolvePolicy (P4-06 acceptance)', () => {
  it('grants Tier-0 capabilities even when nothing is declared (default-deny, not default-empty)', () => {
    const r = resolvePolicy([]);
    expect(r.denied).toEqual([]);
    for (const cap of ['lib:math', 'lib:table', 'lib:string', 'lib:coroutine']) {
      expect(r.granted).toContain(cap);
    }
  });

  it('grants Tier-1 capabilities on declaration', () => {
    const r = resolvePolicy(['lib:os', 'lib:io']);
    expect(r.granted).toContain('lib:os');
    expect(r.granted).toContain('lib:io');
    expect(r.denied).toEqual([]);
  });

  it('denies Tier-2 capabilities without an explicit host grant', () => {
    const r = resolvePolicy(['host:fetch', 'host:kv']);
    expect(r.granted).not.toContain('host:fetch');
    expect(r.granted).not.toContain('host:kv');
    expect(r.denied).toEqual([
      { capability: 'host:fetch', reason: 'grant-required' },
      { capability: 'host:kv', reason: 'grant-required' },
    ]);
  });

  it('grants Tier-2 capabilities with a scoped host grant, echoing the scope', () => {
    const grants = {
      'host:fetch': { allowlist: ['https://cdn.example/'] },
      'host:kv': { namespace: 'pixozine-abc' },
    };
    const r = resolvePolicy(['host:fetch', 'host:kv'], grants);
    expect(r.denied).toEqual([]);
    expect(r.granted).toContain('host:fetch');
    expect(r.granted).toContain('host:kv');
    expect(r.grants['host:fetch']).toEqual({ allowlist: ['https://cdn.example/'] });
    expect(r.grants['host:kv']).toEqual({ namespace: 'pixozine-abc' });
  });

  it('denies unknown capabilities even when "granted" by the manifest', () => {
    const r = resolvePolicy(['host:mind-control'], {
      'host:mind-control': { allowlist: ['*'] },
    });
    expect(r.granted).not.toContain('host:mind-control');
    expect(r.denied).toEqual([
      { capability: 'host:mind-control', reason: 'unknown-capability' },
    ]);
  });

  it('dedupes repeated declarations', () => {
    const r = resolvePolicy(['lib:os', 'lib:os']);
    expect(r.granted.filter(c => c === 'lib:os')).toHaveLength(1);
  });

  it('wouldGrant answers single-capability queries for consent UI', () => {
    expect(wouldGrant('lib:math').granted).toBe(true);
    expect(wouldGrant('host:fetch').granted).toBe(false);
    expect(wouldGrant('host:fetch').reason).toBe('grant-required');
    expect(
      wouldGrant('host:fetch', { 'host:fetch': { allowlist: [] } }).granted
    ).toBe(true);
    expect(wouldGrant('host:nope').reason).toBe('unknown-capability');
  });
});

describe('boundary integration under the policy (P4-06 acceptance)', () => {
  it('rejects forbidden scripts before any worker contact', async () => {
    const worker = fakeWorker();
    const boundary = new ScriptBoundary({
      createWorker: () => worker,
      timeoutMs: 500,
    });
    const r = await boundary.execute({
      script: 'local r = fetch("https://evil.example/")',
      capabilities: [],
    });
    expect(r.ok).toBe(false);
    expect(r.code).toBe('forbidden');
    expect(worker.postMessage).not.toHaveBeenCalled();
    await boundary.dispose();
  });

  it('contains runaway scripts via time termination', async () => {
    vi.useFakeTimers();
    try {
      const worker = fakeWorker(); // never responds
      const boundary = new ScriptBoundary({
        createWorker: () => worker,
        timeoutMs: 100,
      });
      const p = boundary.execute({ script: 'while true do end', capabilities: [] });
      await vi.advanceTimersByTimeAsync(150);
      const r = await p;
      expect(r.ok).toBe(false);
      expect(r.code).toBe('timeout');
      expect(worker.terminate).toHaveBeenCalled();
      await boundary.dispose();
    } finally {
      vi.useRealTimers();
    }
  });

  it('a policy-denied capability never reaches the worker as granted', async () => {
    // The host resolves the policy first; only `granted` is passed down.
    const policy = resolvePolicy(['host:fetch']); // no host grant
    expect(policy.denied).toHaveLength(1);

    const seen = [];
    const worker = fakeWorker({
      autoRespond: (msg, reply) => {
        seen.push(msg.capabilities);
        reply({ id: msg.id, type: 'result', value: 'ok' });
      },
    });
    const boundary = new ScriptBoundary({ createWorker: () => worker });
    const r = await boundary.execute({
      script: 'return 1',
      capabilities: policy.granted, // host:fetch excluded by policy
    });
    expect(r.ok).toBe(true);
    expect(seen[0]).not.toContain('host:fetch');
    await boundary.dispose();
  });
});
