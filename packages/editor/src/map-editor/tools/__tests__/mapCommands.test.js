/*
 * ---------------------------------------------------------------
 *       PixoSpritz – Editor – mapCommands tests (P3-06)
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * Every tool command supports exact undo/redo and reports dirty
 * ranges for the chunk manager.
 */

import { describe, it, expect } from 'vitest';
import { paintCellsCommand, eraseCellsCommand, fillCommand, toolStrokeToCommand } from '../mapCommands.js';
import { CommandBus } from '../../../core/commands/commandBus.js';
import { ProjectStore } from '../../../core/project/projectStore.js';
import { InMemoryProjectRepository } from '../../../core/project/repository.js';

function makeHarness() {
  const grid = new Map(); // "layer:x,y" -> value
  const key = (x, y, l) => `${l}:${x},${y}`;
  const cells = {
    path: 'maps/a.json',
    get: (x, y, l = 0) => grid.get(key(x, y, l)) ?? 0,
    set: (x, y, l = 0, v) => grid.set(key(x, y, l), v),
  };
  const store = new ProjectStore(new InMemoryProjectRepository());
  store.openDocument('maps/a.json', 'map', { cells: [] });
  const bus = new CommandBus(store, new Map([['cells', cells]]));
  return { grid, cells, store, bus, get: cells.get };
}

describe('mapCommands', () => {
  it('paint supports exact undo/redo and reports dirty ranges', () => {
    const { bus, get } = makeHarness();
    const cmd = paintCellsCommand([
      { x: 1, y: 1, layer: 0, before: 0, after: 5 },
      { x: 2, y: 1, layer: 0, before: 0, after: 5 },
      { x: 9, y: 9, layer: 0, before: 0, after: 0 }, // no-op filtered
    ]).bindToDocument('maps/a.json');
    expect(cmd.cellCount).toBe(2);
    expect(cmd.dirtyRange).toEqual({ x0: 1, y0: 1, x1: 2, y1: 1 });
    expect(bus.execute(cmd).ok).toBe(true);
    expect(get(1, 1)).toBe(5);
    expect(bus.undo()).toBe(true);
    expect(get(1, 1)).toBe(0);
    expect(get(2, 1)).toBe(0);
    expect(bus.redo()).toBe(true);
    expect(get(2, 1)).toBe(5);
  });

  it('erase writes empty and undoes exactly', () => {
    const { bus, cells } = makeHarness();
    cells.set(3, 3, 0, 7);
    const cmd = eraseCellsCommand([{ x: 3, y: 3, layer: 0, before: 7 }]).bindToDocument('maps/a.json');
    expect(cmd.name).toBe('map.eraseCells');
    bus.execute(cmd);
    expect(cells.get(3, 3)).toBe(0);
    bus.undo();
    expect(cells.get(3, 3)).toBe(7);
  });

  it('fill covers the contiguous region and no-ops on same value', () => {
    const { bus, cells } = makeHarness();
    // 3x3 of tile 1 with a tile-2 wall down the middle.
    for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) cells.set(x, y, 0, x === 1 ? 2 : 1);
    const cmd = fillCommand(0, 0, 0, 9, cells.get, { width: 3, height: 3 }).bindToDocument('maps/a.json');
    expect(cmd.cellCount).toBe(3); // left column only
    bus.execute(cmd);
    expect(cells.get(0, 2)).toBe(9);
    expect(cells.get(2, 0)).toBe(1); // right side untouched
    bus.undo();
    expect(cells.get(0, 2)).toBe(1);
    expect(fillCommand(0, 0, 0, 9, cells.get, { width: 3, height: 3 })).toBe(null); // same value... (after undo it's 1 again)
  });

  it('adapts a legacy tool stroke into one command', () => {
    const { bus, cells } = makeHarness();
    const fakeBrush = {
      name: 'brush',
      onStart: (x, y, _m, o) => ({ cells: [{ x, y, tile: o.selectedTile }] }),
      onMove: (x, y, _m, o) => ({ cells: [{ x, y, tile: o.selectedTile }] }),
      onEnd: () => null,
    };
    const stroke = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }];
    const cmd = toolStrokeToCommand(
      fakeBrush,
      stroke,
      {},
      { selectedTile: 4, layer: 0 },
      (x, y, l) => cells.get(x, y, l)
    ).bindToDocument('maps/a.json');
    expect(cmd.cellCount).toBe(3); // duplicate (1,0) merged
    bus.execute(cmd);
    expect(cells.get(2, 0)).toBe(4);
    bus.undo();
    expect(cells.get(2, 0)).toBe(0);
  });
});
