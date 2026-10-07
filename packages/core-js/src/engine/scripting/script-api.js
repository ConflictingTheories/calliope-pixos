/**
 * Versioned host scripting API — P4-08.
 *
 * Declares the scripting API version and the capability registry. A pixozine
 * manifest declares `scriptApiVersion` + `capabilities`; the runtime grants a
 * script ONLY its declared capabilities — everything else is denied by
 * default (default-deny). The trust POLICY (which capabilities a publisher
 * may request) is Kyle's open decision (P4-06); this module is the mechanism.
 *
 * Capability kinds:
 * - `lib:*` — pixoscript standard libraries bound into the script env.
 * - `host:*` — host-mediated capabilities, fulfilled over the script
 *   boundary message API (the worker cannot reach the host directly).
 */

export const SCRIPT_API_VERSION = '1.0.0';

/**
 * Capability registry: name -> { description, libs?, mediated? }.
 * `libs` are pixoscript stdlib names bound into the env when declared.
 * `mediated` capabilities are fulfilled by the host over the message API.
 */
export const CAPABILITIES = Object.freeze({
  // Always-safe pure libraries (bound by default even with no declaration).
  'lib:math': { description: 'Math library (pure functions)', libs: ['math'] },
  'lib:table': { description: 'Table library', libs: ['table'] },
  'lib:string': { description: 'String library', libs: ['string'] },
  'lib:coroutine': { description: 'Coroutine library', libs: ['coroutine'] },
  // Declared-only standard libraries.
  'lib:os': {
    description: 'OS library (clock/date; no process control)',
    libs: ['os'],
  },
  'lib:io': {
    description: 'IO library (virtual filesystem only, host-provided)',
    libs: ['io'],
  },
  'lib:debug': { description: 'Debug library', libs: ['debug'] },
  // Host-mediated capabilities (fulfilled over the boundary message API).
  'host:fetch': {
    description: 'Host-mediated HTTP requests',
    mediated: true,
  },
  'host:kv': {
    description: 'Host-mediated key-value storage',
    mediated: true,
  },
});

/** Capabilities bound even when a manifest declares none. */
export const DEFAULT_CAPABILITIES = Object.freeze(['lib:math', 'lib:table', 'lib:string', 'lib:coroutine']);

/** All known capability names (for validation / diagnostics). */
export function knownCapabilities() {
  return Object.keys(CAPABILITIES);
}

/**
 * Validate a manifest's declared capability list.
 * @param {string[]} declared
 * @returns {{ ok: boolean, unknown: string[] }}
 */
export function validateCapabilities(declared) {
  const unknown = (declared || []).filter(c => !(c in CAPABILITIES));
  return { ok: unknown.length === 0, unknown };
}

/**
 * Create an in-process API adapter (editor preview / guarded mode) — P4-08.
 * Binds only default + declared capabilities into a pixoscript env.
 *
 * @param {object} env - pixoscript env (from createEnv)
 * @param {object} Table - pixoscript Table class (for emptying libs)
 * @param {string[]} declared - manifest-declared capabilities
 * @param {object} [hostHandlers] - { 'host:fetch': fn, 'host:kv': fn }
 * @returns {{ granted: string[], denied: string[] }}
 */
export function createApiAdapter(env, Table, declared = [], hostHandlers = {}) {
  const granted = [...DEFAULT_CAPABILITIES];
  const denied = [];

  // Default-deny: empty every non-default lib first.
  const allLibs = ['math', 'table', 'string', 'coroutine', 'os', 'io', 'debug', 'package', 'sourcemap'];
  const keepLibs = new Set();
  for (const cap of granted) {
    for (const lib of CAPABILITIES[cap]?.libs || []) keepLibs.add(lib);
  }
  for (const cap of declared) {
    const def = CAPABILITIES[cap];
    if (!def) {
      denied.push(cap);
      continue;
    }
    granted.push(cap);
    for (const lib of def.libs || []) keepLibs.add(lib);
  }
  for (const lib of allLibs) {
    if (!keepLibs.has(lib)) {
      try {
        env.loadLib(lib, new Table());
      } catch {
        /* best effort */
      }
    }
  }

  // Host-mediated capabilities resolve via provided handlers.
  for (const cap of declared) {
    const def = CAPABILITIES[cap];
    if (def?.mediated) {
      const handler = hostHandlers[cap];
      if (typeof handler === 'function') {
        try {
          env.loadLib(`host_${cap.slice(5)}`, handler);
        } catch {
          /* best effort */
        }
      } else {
        denied.push(cap);
      }
    }
  }

  return { granted, denied };
}


/**
 * Static forbidden-pattern scan for published scripts — P4-07.
 *
 * Defense-in-depth layer (worker isolation + capability allowlist are the
 * primary boundary). Catches direct references to ambient host capabilities
 * that must never appear in published scripts. This is a denylist, not a
 * proof: determined obfuscation can bypass static scanning, which is why
 * execution still happens inside the worker with default-deny capabilities.
 *
 * @param {string} source - pixoscript source text
 * @returns {{ ok: boolean, hits: string[] }} hit pattern sources
 */
export const FORBIDDEN_PATTERNS = [
  /\bfetch\s*\(/,
  /\bXMLHttpRequest\b/,
  /\bWebSocket\b/,
  /\bEventSource\b/,
  /\bimport\s*\(/,
  /\beval\s*\(/,
  /\bFunction\s*\(/,
  /\bglobalThis\b/,
  /\bself\s*\.\s*(postMessage|close|importScripts)\b/,
  /\bimportScripts\s*\(/,
  /\bAtomics\b/,
  /\bSharedArrayBuffer\b/,
  /__proto__/,
  /\bprocess\b/,
  /\brequire\s*\(/,
];

export function scanScriptForForbidden(source) {
  const hits = [];
  for (const re of FORBIDDEN_PATTERNS) {
    if (re.test(source)) hits.push(String(re));
  }
  return { ok: hits.length === 0, hits };
}

export default {
  SCRIPT_API_VERSION,
  CAPABILITIES,
  DEFAULT_CAPABILITIES,
  knownCapabilities,
  validateCapabilities,
  createApiAdapter,
  FORBIDDEN_PATTERNS,
  scanScriptForForbidden,
};
