/*
 * ---------------------------------------------------------------
 *        PixoSpritz – Editor – CommandHistory tests (P2-05)
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * Verifies: operation-specific inverses, stroke coalescing (one
 * bounded command for a large stroke), byte-cap eviction, exact undo.
 */

import { describe, it, expect } from 'vitest';
import { CommandHistory, createStrokeAccumulator } from '../history.js';

describe('CommandHistory', () => {
  it('undoes via operation inverses, not snapshots', () => {
    const h = new CommandHistory();
    let value = 0;
    h.push({ label: 'inc', redo: () => { value += 1; }, undo: () => { value -= 1; } }, { apply: true });
    h.push({ label: 'add10', redo: () => { value += 10; }, undo: () => { value -= 10; } }, { apply: true });
    expect(value).toBe(11);
    h.undo();
    expect(value).toBe(1);
    h.redo();
    expect(value).toBe(11);
  });

  it('coalesces strokes that share a key within the window', () => {
    const h = new CommandHistory({ coalesceWindowMs: 60_000 });
    let value = 0;
    const stroke = (n, prev) => ({
      label: 'stroke',
      coalesceKey: 'brush-stroke-1',
      coalesce: (a, b) => ({ ...b, undo: a.undo }),
      redo: () => { value = n; },
      undo: prev,
    });
    h.push(stroke(1, () => { value = 0; }), { apply: true });
    h.push(stroke(2, () => { value = 0; }), { apply: true });
    h.push(stroke(3, () => { value = 0; }), { apply: true });
    expect(h.depth).toBe(1);
    expect(value).toBe(3);
    h.undo();
    expect(value).toBe(0);
  });

  it('caps history by bytes, evicting oldest first', () => {
    const h = new CommandHistory({ byteCap: 100 });
    for (let i = 0; i < 10; i++) {
      h.push({ label: `e${i}`, bytes: 30, redo: () => {}, undo: () => {} });
    }
    expect(h.usedBytes).toBeLessThanOrEqual(100);
    expect(h.depth).toBeLessThan(10);
    expect(h.canUndo).toBe(true);
  });

  it('clears redo on new push', () => {
    const h = new CommandHistory();
    let v = 0;
    const inc = { label: 'i', redo: () => { v++; }, undo: () => { v--; } };
    h.push(inc, { apply: true });
    h.undo();
    h.push(inc, { apply: true });
    expect(h.canRedo).toBe(false);
    expect(v).toBe(1);
  });
});

describe('createStrokeAccumulator', () => {
  it('merges a large stroke into one bounded command with exact undo', () => {
    // Simulate a 200-cell brush stroke over a 16x16 grid.
    const grid = new Map(); // "x,y" -> tile
    const acc = createStrokeAccumulator();
    for (let i = 0; i < 200; i++) {
      const x = i % 16, y = Math.floor(i / 16) % 16;
      acc.add([{ x, y, layer: 0, before: grid.get(`${x},${y}`) ?? 0, after: 5 }]);
    }
    expect(acc.size).toBeLessThanOrEqual(200);
    const applyCell = cells => cells.forEach(c => grid.set(`${c.x},${c.y}`, c.after));
    const unapplyCell = cells => cells.forEach(c => grid.set(`${c.x},${c.y}`, c.before));
    const cmd = acc.toCommand('brush stroke', applyCell, unapplyCell);

    const h = new CommandHistory();
    h.push(cmd, { apply: true });
    expect(h.depth).toBe(1); // one bounded command
    expect([...grid.values()].every(v => v === 5)).toBe(true);
    h.undo();
    expect([...grid.values()].every(v => v === 0)).toBe(true); // exact undo
    h.redo();
    expect([...grid.values()].every(v => v === 5)).toBe(true);
  });

  it('keeps the earliest before-value when a cell is repainted mid-stroke', () => {
    const acc = createStrokeAccumulator();
    acc.add([{ x: 1, y: 1, layer: 0, before: 0, after: 5 }]);
    acc.add([{ x: 1, y: 1, layer: 0, before: 5, after: 9 }]);
    expect(acc.size).toBe(1);
    let v = -1;
    const cmd = acc.toCommand('s', cells => { v = cells[0].after; }, cells => { v = cells[0].before; });
    cmd.redo();
    expect(v).toBe(9);
    cmd.undo();
    expect(v).toBe(0); // original value, not the mid-stroke one
  });
});
