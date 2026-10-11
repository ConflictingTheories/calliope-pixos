/*
 * ---------------------------------------------------------------
 *     AI Generator - hardware-profiler tests
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025 Kyle Derby MacInnis
 */

import { describe, it, expect } from 'vitest';
import {
  profileHardware,
  tierForHardware,
  HARDWARE_TIERS,
} from '../hardware-profiler.js';

describe('tierForHardware', () => {
  it('maps <=8GB to small', () => {
    expect(tierForHardware({ ramGB: 8, discreteGpu: false })).toBe(HARDWARE_TIERS.SMALL);
    expect(tierForHardware({ ramGB: 4, discreteGpu: null })).toBe(HARDWARE_TIERS.SMALL);
  });

  it('maps 16GB to medium', () => {
    expect(tierForHardware({ ramGB: 16, discreteGpu: false })).toBe(HARDWARE_TIERS.MEDIUM);
  });

  it('maps 32GB+ to large', () => {
    expect(tierForHardware({ ramGB: 32, discreteGpu: false })).toBe(HARDWARE_TIERS.LARGE);
    expect(tierForHardware({ ramGB: 64, discreteGpu: null })).toBe(HARDWARE_TIERS.LARGE);
  });

  it('boosts discrete GPU to large', () => {
    expect(tierForHardware({ ramGB: 16, discreteGpu: true })).toBe(HARDWARE_TIERS.LARGE);
  });

  it('falls back to small when RAM is unknown', () => {
    expect(tierForHardware({ ramGB: null, discreteGpu: false })).toBe(HARDWARE_TIERS.SMALL);
    expect(tierForHardware({ ramGB: NaN, discreteGpu: null })).toBe(HARDWARE_TIERS.SMALL);
  });
});

describe('profileHardware', () => {
  it('uses injected node os info', async () => {
    const p = await profileHardware({
      nodeOs: {
        totalmem: () => 16 * 1024 ** 3,
        cpus: () => new Array(8),
      },
    });
    expect(p.ramGB).toBe(16);
    expect(p.cpuCores).toBe(8);
    expect(p.tier).toBe(HARDWARE_TIERS.MEDIUM);
  });

  it('uses injected navigator info', async () => {
    const p = await profileHardware({
      navigator: { hardwareConcurrency: 4, deviceMemory: 4 },
    });
    expect(p.cpuCores).toBe(4);
    expect(p.ramGB).toBe(4);
    expect(p.tier).toBe(HARDWARE_TIERS.SMALL);
  });

  it('honors explicit overrides', async () => {
    const p = await profileHardware({ ramGB: 48, discreteGpu: true });
    expect(p.tier).toBe(HARDWARE_TIERS.LARGE);
  });

  it('never throws with an empty env', async () => {
    const p = await profileHardware({});
    expect(p.tier).toBe(HARDWARE_TIERS.SMALL);
    expect(Array.isArray(p.notes)).toBe(true);
  });
});
