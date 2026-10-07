/**
 * ---------------------------------------------------------------
 *            AI Generator - Hardware Profiler
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 *
 * Detects the machine's capabilities and maps them to a hardware
 * tier used for local-model recommendations. All detection is
 * best-effort with graceful degradation: every probe is guarded
 * and the profiler never throws — unknown values are reported
 * as null and the tier falls back to 'small' (safe default).
 *
 * REVIEW NOTE (for Kyle): the RAM thresholds below (8 / 32 GB)
 * and the discrete-GPU heuristic are starting points. Tune them
 * once we have real-world data on which models run well where.
 */

export const HARDWARE_TIERS = {
  SMALL: 'small', // <=8 GB RAM — small (~3B) models
  MEDIUM: 'medium', // 8-32 GB RAM — medium (~8B) models
  LARGE: 'large', // >=32 GB RAM or discrete GPU — large (~13B+) models
};

export const TIER_LABELS = {
  [HARDWARE_TIERS.SMALL]: 'Small — up to 8 GB RAM',
  [HARDWARE_TIERS.MEDIUM]: 'Medium — 8 to 32 GB RAM',
  [HARDWARE_TIERS.LARGE]: 'Large — 32 GB+ RAM or discrete GPU',
};

/**
 * Map detected hardware to a tier.
 * Pure function — easily unit-testable.
 *
 * @param {object} hw - { ramGB: number|null, discreteGpu: boolean }
 * @returns {string} one of HARDWARE_TIERS
 */
export function tierForHardware({ ramGB, discreteGpu }) {
  if (discreteGpu === true) return HARDWARE_TIERS.LARGE;
  if (typeof ramGB === 'number' && !Number.isNaN(ramGB)) {
    if (ramGB >= 32) return HARDWARE_TIERS.LARGE;
    if (ramGB > 8) return HARDWARE_TIERS.MEDIUM;
  }
  return HARDWARE_TIERS.SMALL;
}

function detectRamGB(env = {}) {
  try {
    // Explicit override (tests, advanced users)
    if (typeof env.ramGB === 'number') return env.ramGB;

    // Node / Electron (desktop)
    if (env.nodeOs && typeof env.nodeOs.totalmem === 'function') {
      return env.nodeOs.totalmem() / 1024 ** 3;
    }
    if (typeof process !== 'undefined' && process.versions?.node) {
      // Dynamic import keeps browser bundles from statically depending on node:os
      // (callers may also inject env.nodeOs instead).
      return null; // resolved by caller via env injection; see profileHardware
    }

    // Browser: Chrome-only deviceMemory (GB, rounded down by the browser)
    const nav = env.navigator ?? (typeof navigator !== 'undefined' ? navigator : null);
    if (nav && typeof nav.deviceMemory === 'number') {
      return nav.deviceMemory;
    }

    // Browser fallback: JS heap limit is a rough proxy for device class
    const perf =
      env.performance ?? (typeof performance !== 'undefined' ? performance : null);
    const heapLimit = perf?.memory?.jsHeapSizeLimit;
    if (typeof heapLimit === 'number' && heapLimit > 0) {
      // Heuristic: heap limit ~1/4 to ~1/2 of device RAM on desktop Chrome.
      // We deliberately estimate conservatively (small tier) here.
      const estimateGB = heapLimit / 1024 ** 3;
      if (estimateGB >= 4) return 16; // large-ish heap -> assume 16 GB class
      if (estimateGB >= 2) return 8;
      return 4;
    }
  } catch {
    // fall through to null
  }
  return null;
}

function detectCpuCores(env = {}) {
  try {
    if (typeof env.cpuCores === 'number') return env.cpuCores;
    if (env.nodeOs && typeof env.nodeOs.cpus === 'function') {
      return env.nodeOs.cpus().length;
    }
    const nav = env.navigator ?? (typeof navigator !== 'undefined' ? navigator : null);
    if (nav && typeof nav.hardwareConcurrency === 'number') {
      return nav.hardwareConcurrency;
    }
  } catch {
    // fall through
  }
  return null;
}

async function detectGpu(env = {}) {
  const result = { webgpu: false, discrete: null, info: null };
  try {
    if (typeof env.discreteGpu === 'boolean') {
      result.discrete = env.discreteGpu;
      return result;
    }
    const nav = env.navigator ?? (typeof navigator !== 'undefined' ? navigator : null);
    const gpu = env.gpu ?? nav?.gpu;
    if (!gpu || typeof gpu.requestAdapter !== 'function') return result;
    result.webgpu = true;
    const adapter = await gpu.requestAdapter();
    if (!adapter) return result;
    const info = adapter.info ?? {};
    result.info = {
      vendor: info.vendor ?? null,
      device: info.device ?? null,
      description: info.description ?? null,
    };
    // Heuristic only: some adapters report discrete vs integrated via
    // vendor strings or `adapter.info.device`. This is unreliable across
    // browsers, so we stay conservative and leave `discrete` null unless
    // the description clearly indicates a discrete part.
    const hay = `${info.vendor ?? ''} ${info.device ?? ''} ${info.description ?? ''}`.toLowerCase();
    if (/(rtx|radeon rx|arc a[37])/.test(hay) && !/iris|uhd|vega 8|apple/.test(hay)) {
      result.discrete = true;
    } else if (/(iris|uhd graphics|apple m|vega 8|mali|adreno)/.test(hay)) {
      result.discrete = false;
    }
  } catch {
    // WebGPU probing must never break the profiler
  }
  return result;
}

/**
 * Profile the current machine. Never throws.
 *
 * @param {object} [env] - injectable environment for tests:
 *   { nodeOs, navigator, performance, gpu, ramGB, cpuCores, discreteGpu }
 * @returns {Promise<object>} { ramGB, cpuCores, gpu, tier, notes[] }
 */
export async function profileHardware(env = {}) {
  const notes = [];

  // Resolve node:os dynamically when running under Node/Electron and no
  // injected override was provided.
  let nodeOs = env.nodeOs ?? null;
  if (!nodeOs && typeof process !== 'undefined' && process.versions?.node) {
    try {
      const mod = await import('node:os');
      nodeOs = mod.default ?? mod;
    } catch {
      notes.push('node:os unavailable; RAM/CPU detection degraded.');
    }
  }

  const ramGB = detectRamGB({ ...env, nodeOs });
  const cpuCores = detectCpuCores({ ...env, nodeOs });
  const gpu = await detectGpu(env);

  if (ramGB == null) {
    notes.push('Could not detect system RAM; tier is a conservative guess.');
  }
  if (gpu.discrete == null && gpu.webgpu) {
    notes.push('GPU class could not be determined; discrete-GPU tier boost not applied.');
  }

  const tier = tierForHardware({ ramGB, discreteGpu: gpu.discrete === true });

  return {
    ramGB: ramGB == null ? null : Math.round(ramGB * 10) / 10,
    cpuCores,
    gpu,
    tier,
    tierLabel: TIER_LABELS[tier],
    notes,
    profiledAt: new Date().toISOString(),
  };
}
