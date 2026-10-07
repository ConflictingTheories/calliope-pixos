/*
 * ---------------------------------------------------------------
 *       PixoSpritz – Editor – ProjectStore tests (P2-02)
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * Framework-free tests: open/change/save/close/conflict, dirty
 * tracking, revision advancement, lifecycle events.
 */

import { describe, it, expect, vi } from 'vitest';
import { ProjectStore } from '../projectStore.js';
import { InMemoryProjectRepository } from '../repository.js';

function makeStore() {
  const store = new ProjectStore(new InMemoryProjectRepository());
  store.setIdentity({ id: 'p1', name: 'Test pixozine' });
  return store;
}

describe('ProjectStore', () => {
  it('opens documents and emits lifecycle events', () => {
    const store = makeStore();
    const events = [];
    store.on('open', e => events.push(['open', e.path]));
    store.on('change', e => events.push(['change', e.path]));
    const doc = store.openDocument('maps/a.json', 'map', { w: 1 });
    expect(doc.kind).toBe('map');
    expect(store.getDocument('maps/a.json')).toBe(doc);
    store.touchDocument('maps/a.json', { w: 2 });
    expect(doc.dirty).toBe(true);
    expect(doc.editCount).toBe(1);
    expect(events).toEqual([['open', 'maps/a.json'], ['change', 'maps/a.json']]);
  });

  it('tracks the dirty set and clears it on save', () => {
    const store = makeStore();
    const dirtyEvents = [];
    store.on('dirty-change', e => dirtyEvents.push(e));
    store.openDocument('a.json', 'json', {});
    store.openDocument('b.json', 'json', {});
    store.touchDocument('a.json', { x: 1 });
    expect(store.isDirty).toBe(true);
    expect(store.dirtyDocuments()).toEqual(['a.json']);
    const rev = store.markSaved('a.json');
    expect(rev).toBeGreaterThan(0);
    expect(store.isDirty).toBe(false);
    expect(dirtyEvents).toEqual([
      { path: 'a.json', dirty: true },
      { path: 'a.json', dirty: false },
    ]);
  });

  it('advances revisions monotonically across documents', () => {
    const store = makeStore();
    store.openDocument('a.json', 'json', {});
    store.openDocument('b.json', 'json', {});
    store.touchDocument('a.json', {});
    store.touchDocument('b.json', {});
    const r1 = store.markSaved('a.json');
    const r2 = store.markSaved('b.json');
    expect(r2).toBeGreaterThan(r1);
  });

  it('keeps documents dirty when a save fails', () => {
    const store = makeStore();
    const errors = [];
    store.on('save-error', e => errors.push(e));
    store.openDocument('a.json', 'json', {});
    store.touchDocument('a.json', { x: 1 });
    const err = new Error('disk full');
    store.markSaveError('a.json', err);
    expect(store.getDocument('a.json').dirty).toBe(true);
    expect(errors[0].error).toBe(err);
  });

  it('emits conflict without closing the document', () => {
    const store = makeStore();
    const conflicts = [];
    store.on('conflict', e => conflicts.push(e));
    store.openDocument('a.json', 'json', {});
    store.markConflict('a.json', { reason: 'external-change' });
    expect(conflicts).toHaveLength(1);
    expect(store.getDocument('a.json')).not.toBe(null);
  });

  it('closes documents and reports unsaved state', () => {
    const store = makeStore();
    const closed = [];
    store.on('close', e => closed.push(e));
    store.openDocument('a.json', 'json', {});
    store.touchDocument('a.json', {});
    expect(store.closeDocument('a.json')).toBe(true);
    expect(store.closeDocument('a.json')).toBe(false);
    expect(closed).toEqual([{ path: 'a.json', wasDirty: true }]);
  });

  it('isolates listener errors from store integrity', () => {
    const store = makeStore();
    store.on('open', () => { throw new Error('boom'); });
    const seen = vi.fn();
    store.on('open', seen);
    expect(() => store.openDocument('x.json')).not.toThrow();
    expect(seen).toHaveBeenCalled();
  });

  it('requires a repository', () => {
    expect(() => new ProjectStore(null)).toThrow();
  });
});
