/*
 * ---------------------------------------------------------------
 *           PixoSpritz – Editor – Performance budgets
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * (P3-11) The perf harness lives under editor/tests/performance/.
 * Budgets are generous wall-clock ceilings for regression
 * detection on CI hardware — not absolute targets.  A test fails
 * only when an operation blows its budget by a clear margin, so
 * normal machine variance does not flake the suite.
 *
 * To run:  npx vitest run tests/performance
 */

export const BUDGETS = {
  // Map document: parse/normalize/validate/serialize a 128x128 trio.
  'map.document.roundTrip': { ms: 500, scale: '128x128 trio' },
  // Picking: 10k inverse-transform picks (O(1) path).
  'map.pick.10k': { ms: 300, scale: '10000 picks' },
  // Chunk manager: 10k dirty-cell updates across chunks.
  'map.chunks.10kDirty': { ms: 400, scale: '10000 cells' },
  // Command bus: 10k paint commands with undo/redo.
  'commands.10k': { ms: 800, scale: '10000 commands' },
  // History: 50k ops with stroke coalescing under the byte cap.
  'history.50k': { ms: 1200, scale: '50000 ops' },
  // Cutscene clock: full playthrough of a 500-node graph at 60Hz.
  'cutscene.500nodes': { ms: 600, scale: '500 nodes' },
  // Journal: 5k appends to the memory backend.
  'journal.5k': { ms: 400, scale: '5000 entries' },
  // Deterministic export: build a 200-file package twice.
  'export.200files': { ms: 1500, scale: '200 files' },
};

/**
 * Assert a function completes within its named budget.
 * Returns the measured milliseconds.
 */
export function expectWithinBudget(name, fn) {
  const budget = BUDGETS[name];
  if (!budget) throw new Error(`unknown perf budget: ${name}`);
  const start = performance.now();
  const result = fn();
  const finish = asyncResult => {
    const ms = performance.now() - start;
    if (ms > budget.ms) {
      throw new Error(
        `[perf] ${name} took ${ms.toFixed(1)}ms, budget ${budget.ms}ms (${budget.scale})`
      );
    }
    // eslint-disable-next-line no-console
    console.log(`[perf] ${name}: ${ms.toFixed(1)}ms / ${budget.ms}ms (${budget.scale})`);
    return asyncResult;
  };
  if (result && typeof result.then === 'function') return result.then(finish);
  finish(result);
  return result;
}
