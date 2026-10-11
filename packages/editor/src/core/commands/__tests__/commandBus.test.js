/*
 * ---------------------------------------------------------------
 *        PixoSpritz – Editor – CommandBus tests (P2-04)
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * Includes the execute+undo equality property: for generated
 * command sequences, undoing every command restores the exact
 * prior state.
 */

import { describe, it, expect } from 'vitest';
import { CommandBus } from '../commandBus.js';
import { ProjectStore } from '../../project/projectStore.js';
import { InMemoryProjectRepository } from '../../project/repository.js';

function makeBus() {
  const store = new ProjectStore(new InMemoryProjectRepository());
  store.openDocument('doc.json', 'json', { cells: [] });
  return new CommandBus(store);
}

/** Command factory: append value v to doc.cells, inverse pops it. */
function appendCell(v) {
  return {
    name: 'test.appendCell',
    documents: ['doc.json'],
    do: ({ store }) => {
      const doc = store.getDocument('doc.json');
      doc.data.cells.push(v);
      return { v };
    },
    undo: ({ store }, { v }) => {
      const doc = store.getDocument('doc.json');
      const popped = doc.data.cells.pop();
      if (popped !== v) throw new Error('inverse mismatch');
    },
  };
}

describe('CommandBus', () => {
  it('executes commands and tracks affected documents', () => {
    const bus = makeBus();
    const r = bus.execute(appendCell(7));
    expect(r.ok).toBe(true);
    expect(bus.store.getDocument('doc.json').data.cells).toEqual([7]);
    expect(bus.store.getDocument('doc.json').dirty).toBe(true);
    expect(bus.canUndo).toBe(true);
    expect(bus.canRedo).toBe(false);
  });

  it('undo/redo are exact inverses', () => {
    const bus = makeBus();
    bus.execute(appendCell(1));
    bus.execute(appendCell(2));
    expect(bus.undo()).toBe(true);
    expect(bus.store.getDocument('doc.json').data.cells).toEqual([1]);
    expect(bus.redo()).toBe(true);
    expect(bus.store.getDocument('doc.json').data.cells).toEqual([1, 2]);
    expect(bus.undo()).toBe(true);
    expect(bus.undo()).toBe(true);
    expect(bus.undo()).toBe(false);
    expect(bus.store.getDocument('doc.json').data.cells).toEqual([]);
  });

  it('rejects commands whose preconditions fail', () => {
    const bus = makeBus();
    const rejected = [];
    bus.on('rejected', e => rejected.push(e));
    const cmd = {
      ...appendCell(1),
      canExecute: () => 'not today',
    };
    const r = bus.execute(cmd);
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('not today');
    expect(rejected).toHaveLength(1);
    expect(bus.canUndo).toBe(false);
  });

  it('supports named guards via the P1-04 seam', () => {
    const bus = makeBus();
    bus.registerGuard('doc-open', ({ store }, command) =>
      command.documents.every(p => store.getDocument(p)) ? null : 'document not open'
    );
    const ok = bus.execute({ ...appendCell(1), guards: ['doc-open'] });
    expect(ok.ok).toBe(true);
    const bad = bus.execute({ ...appendCell(1), documents: ['ghost.json'], guards: ['doc-open'] });
    expect(bad.ok).toBe(false);
    const unknown = bus.execute({ ...appendCell(1), guards: ['nope'] });
    expect(unknown.reason).toMatch(/unknown guard/);
  });

  it('transactions collapse into a single undo step and roll back on failure', () => {
    const bus = makeBus();
    const r = bus.transaction('paint-stroke', [appendCell(1), appendCell(2), appendCell(3)]);
    expect(r.ok).toBe(true);
    expect(bus.store.getDocument('doc.json').data.cells).toEqual([1, 2, 3]);
    expect(bus.undoStack).toHaveLength(1);
    bus.undo();
    expect(bus.store.getDocument('doc.json').data.cells).toEqual([]);

    const failer = { ...appendCell(9), canExecute: () => 'blocked' };
    const r2 = bus.transaction('bad', [appendCell(4), failer]);
    expect(r2.ok).toBe(false);
    expect(bus.store.getDocument('doc.json').data.cells).toEqual([]);
    expect(bus.canUndo).toBe(false);
  });

  it('property: execute+undo restores exact state for generated sequences', () => {
    // Deterministic pseudo-random generator (mulberry32).
    const rand = seed => () => {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    for (let trial = 0; trial < 25; trial++) {
      const bus = makeBus();
      const before = JSON.stringify(bus.store.getDocument('doc.json').data);
      const rng = rand(trial * 7919 + 13);
      const n = 1 + Math.floor(rng() * 12);
      const values = Array.from({ length: n }, () => Math.floor(rng() * 1000));
      for (const v of values) expect(bus.execute(appendCell(v)).ok).toBe(true);
      // Undo a random prefix of the sequence, then redo it, then undo all.
      const cut = Math.floor(rng() * (n + 1));
      for (let i = 0; i < cut; i++) bus.undo();
      for (let i = 0; i < cut; i++) bus.redo();
      while (bus.canUndo) bus.undo();
      expect(JSON.stringify(bus.store.getDocument('doc.json').data)).toBe(before);
    }
  });

  it('caps the undo stack', () => {
    const bus = makeBus();
    bus.maxDepth = 5;
    for (let i = 0; i < 10; i++) bus.execute(appendCell(i));
    expect(bus.undoStack).toHaveLength(5);
  });
});
