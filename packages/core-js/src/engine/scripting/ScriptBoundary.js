/**
 * Script execution boundary — P4-07 (mechanism, not policy).
 *
 * Published scripts execute inside a Web Worker behind a message API — never
 * in the host realm. This facade provides:
 *
 * - `execute({ script, capabilities })` -> Promise<{ ok, value? , code?, message? }>
 * - Time termination: the worker is terminated if it exceeds `timeoutMs`.
 * - Error termination: compile/runtime/forbidden failures come back typed.
 * - Capability routing: worker `host:*` requests are fulfilled by the host's
 *   `hostHandlers` map; unhandled capabilities are denied.
 * - No ambient host access: the worker receives only the script source and
 *   declared capabilities; the host never evaluates script source itself.
 *
 * The trust policy is sandbox-by-default (P4-06, decided 2026-10-06):
 * default-deny capabilities, with Tier-2 host capabilities requiring an
 * explicit host grant (see script-policy.js). Policy lives in the policy
 * module; this facade remains pure mechanism.
 *
 * Usage:
 *   const boundary = new ScriptBoundary({
 *     createWorker: () => new Worker(new URL('./script-worker.js', import.meta.url), { type: 'module' }),
 *     timeoutMs: 2000,
 *     hostHandlers: { 'host:kv': async (op, key, value) => kvStore(op, key, value) },
 *   });
 *   const r = await boundary.execute({ script, capabilities: ['host:kv'] });
 *   await boundary.dispose();
 */

import { scanScriptForForbidden } from './script-api.js';

let runSeq = 0;

export default class ScriptBoundary {
  /**
   * @param {object} opts
   * @param {() => Worker} opts.createWorker - worker factory (required for hard termination)
   * @param {number} [opts.timeoutMs=2000] - per-execution wall-clock budget
   * @param {object} [opts.hostHandlers] - { 'host:fetch': async (...args), 'host:kv': async (...args) }
   */
  constructor(opts = {}) {
    if (typeof opts.createWorker !== 'function') {
      throw new Error(
        'ScriptBoundary requires a worker factory: hard time-termination is only possible inside a Web Worker.'
      );
    }
    this.createWorker = opts.createWorker;
    this.timeoutMs = opts.timeoutMs ?? 2000;
    this.hostHandlers = opts.hostHandlers || {};
    this.worker = null;
    this.pending = new Map(); // runId -> { resolve, timer }
    this.disposed = false;
  }

  _ensureWorker() {
    if (this.disposed) throw new Error('ScriptBoundary is disposed');
    if (!this.worker) {
      this.worker = this.createWorker();
      this.worker.onmessage = e => this._onMessage(e);
      this.worker.onerror = e => {
        // A worker-level error fails all pending runs.
        for (const [id, p] of this.pending) {
          clearTimeout(p.timer);
          this.pending.delete(id);
          p.resolve({ ok: false, code: 'error', message: String(e.message || 'worker error') });
        }
      };
    }
    return this.worker;
  }

  _onMessage(e) {
    const msg = e.data;
    if (!msg || typeof msg !== 'object') return;

    if (msg.type === 'capability') {
      this._handleCapability(msg);
      return;
    }

    const pending = this.pending.get(msg.id);
    if (!pending) return;
    clearTimeout(pending.timer);
    this.pending.delete(msg.id);

    if (msg.type === 'result') {
      pending.resolve({ ok: true, value: msg.value });
    } else if (msg.type === 'error') {
      pending.resolve({ ok: false, code: msg.code || 'error', message: msg.message });
    }
  }

  async _handleCapability(msg) {
    const { reqId, name, args, id } = msg;
    const worker = this.worker;
    const reply = (ok, value, error) => {
      try {
        worker.postMessage({ id, type: 'capability-result', reqId, ok, value, error });
      } catch {
        /* worker may be gone */
      }
    };
    const handler = this.hostHandlers[name];
    if (typeof handler !== 'function') {
      reply(false, undefined, `no host handler for capability '${name}'`);
      return;
    }
    try {
      const value = await handler(...(args || []));
      reply(true, value);
    } catch (e) {
      reply(false, undefined, String(e?.message ?? e));
    }
  }

  /**
   * Execute a published script behind the boundary.
   * @param {object} opts - { script: string, capabilities?: string[] }
   * @returns {Promise<{ok:boolean, value?, code?, message?}>}
   */
  execute({ script, capabilities = [] } = {}) {
    // Host-side pre-scan (defense in depth; the worker scans again).
    const scan = scanScriptForForbidden(String(script));
    if (!scan.ok) {
      return Promise.resolve({
        ok: false,
        code: 'forbidden',
        message: `Script contains forbidden patterns: ${scan.hits.join(', ')}`,
      });
    }

    const worker = this._ensureWorker();
    const id = `run-${++runSeq}`;

    return new Promise(resolve => {
      const timer = setTimeout(() => {
        // Time termination: kill the worker; the run cannot continue.
        this.pending.delete(id);
        try {
          worker.terminate();
        } catch {
          /* already gone */
        }
        this.worker = null; // next execute() respawns a fresh worker
        resolve({
          ok: false,
          code: 'timeout',
          message: `Script exceeded ${this.timeoutMs}ms execution budget and was terminated`,
        });
      }, this.timeoutMs);

      this.pending.set(id, { resolve, timer });
      try {
        worker.postMessage({ id, type: 'run', script, capabilities });
      } catch (e) {
        clearTimeout(timer);
        this.pending.delete(id);
        resolve({ ok: false, code: 'error', message: String(e?.message ?? e) });
      }
    });
  }

  /** Terminate the worker and release all pending runs. */
  async dispose() {
    this.disposed = true;
    for (const [id, p] of this.pending) {
      clearTimeout(p.timer);
      this.pending.delete(id);
      p.resolve({ ok: false, code: 'disposed', message: 'ScriptBoundary disposed' });
    }
    if (this.worker) {
      try {
        this.worker.terminate();
      } catch {
        /* ignore */
      }
      this.worker = null;
    }
  }
}
