/**
 * Script boundary worker host — P4-07.
 *
 * Runs inside a Web Worker (no DOM, no document, no storage). Published
 * scripts execute here — never in the host realm — behind a message API:
 *
 * Host -> worker:
 *   { id, type: 'run', script, capabilities: string[] }
 *   { id, type: 'capability-result', reqId, ok, value?, error? }
 *
 * Worker -> host:
 *   { id, type: 'result', value }              script completed
 *   { id, type: 'error', code, message }        compile/runtime/forbidden failure
 *   { id, type: 'capability', reqId, name, args }  host-mediated capability request
 *
 * Time termination is enforced by the host (worker.terminate()); this file
 * enforces capability default-deny + the forbidden-pattern scan.
 *
 * NOTE: static scanning is defense-in-depth, not a proof — see script-api.js.
 */

/* global self */
import { createEnv, Table } from 'pixoscript';
import {
  createApiAdapter,
  scanScriptForForbidden,
  validateCapabilities,
} from './script-api.js';

const pendingCapabilities = new Map();
let capSeq = 0;
const CAPABILITY_TIMEOUT_MS = 10000;

function serialize(value) {
  try {
    return JSON.parse(
      JSON.stringify(value, (_k, v) => (typeof v === 'bigint' ? String(v) : v))
    );
  } catch {
    return String(value);
  }
}

/** Bridge for host-mediated capabilities: posts to the host and awaits reply. */
function makeHostBridge(runId, name) {
  return (...args) => {
    const reqId = `${runId}:${name}:${++capSeq}`;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        pendingCapabilities.delete(reqId);
        reject(new Error(`capability '${name}' timed out`));
      }, CAPABILITY_TIMEOUT_MS);
      pendingCapabilities.set(reqId, {
        resolve: v => {
          clearTimeout(timer);
          resolve(v);
        },
        reject: e => {
          clearTimeout(timer);
          reject(new Error(e));
        },
      });
      self.postMessage({ id: runId, type: 'capability', reqId, name, args: serialize(args) });
    });
  };
}

async function handleRun(msg) {
  const { id, script, capabilities = [] } = msg;

  // 1. Forbidden-pattern scan (defense in depth).
  const scan = scanScriptForForbidden(script);
  if (!scan.ok) {
    self.postMessage({
      id,
      type: 'error',
      code: 'forbidden',
      message: `Script contains forbidden patterns: ${scan.hits.join(', ')}`,
    });
    return;
  }

  // 2. Capability validation (unknown capabilities are denied, not ignored).
  const { ok, unknown } = validateCapabilities(capabilities);
  if (!ok) {
    self.postMessage({
      id,
      type: 'error',
      code: 'forbidden',
      message: `Unknown capabilities requested: ${unknown.join(', ')}`,
    });
    return;
  }

  // 3. Restricted env: no filesystem config, default-deny capabilities.
  let env;
  try {
    env = createEnv({ PIXOSCRIPT_PATH: '', stdin: '' });
  } catch (e) {
    self.postMessage({ id, type: 'error', code: 'env', message: String(e?.message ?? e) });
    return;
  }

  const hostBridges = {
    'host:fetch': makeHostBridge(id, 'host:fetch'),
    'host:kv': makeHostBridge(id, 'host:kv'),
  };
  const { denied } = createApiAdapter(env, Table, capabilities, hostBridges);
  if (denied.length > 0) {
    self.postMessage({
      id,
      type: 'error',
      code: 'forbidden',
      message: `Capabilities denied (unknown or no host handler): ${denied.join(', ')}`,
    });
    return;
  }

  // 4. Execute. Async actions surface as promises; await them.
  try {
    const result = await env.parse(script).exec();
    self.postMessage({ id, type: 'result', value: serialize(result) });
  } catch (e) {
    self.postMessage({
      id,
      type: 'error',
      code: 'runtime',
      message: String(e?.message ?? e),
    });
  }
}

self.onmessage = async e => {
  const msg = e.data;
  if (!msg || typeof msg !== 'object') return;

  if (msg.type === 'run') {
    await handleRun(msg);
    return;
  }

  if (msg.type === 'capability-result') {
    const pending = pendingCapabilities.get(msg.reqId);
    if (!pending) return;
    pendingCapabilities.delete(msg.reqId);
    if (msg.ok) pending.resolve(msg.value);
    else pending.reject(msg.error || 'capability failed');
  }
};
