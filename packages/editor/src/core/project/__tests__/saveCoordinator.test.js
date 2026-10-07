/*
 * ---------------------------------------------------------------
 *      PixoSpritz – Editor – SaveCoordinator tests (P2-07)
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 */

import { describe, it, expect, vi } from 'vitest';
import { SaveCoordinator, SaveStatus } from '../saveCoordinator.js';
import { ProjectStore } from '../projectStore.js';
import { InMemoryProjectRepository } from '../repository.js';
import { createDefaultRegistry } from '../../documents/registry.js';

function makeCoordinator({ repository, registry } = {}) {
  const repo = repository || new InMemoryProjectRepository();
  const store = new ProjectStore(repo);
  const coord = new SaveCoordinator({
    store,
    repository: repo,
    registry: registry === undefined ? createDefaultRegistry() : registry,
    maxRetries: 1,
    retryDelayMs: 1,
  });
  return { coord, store, repo };
}

describe('SaveCoordinator', () => {
  it('saves valid documents and advances the revision', async () => {
    const { coord, store } = makeCoordinator();
    store.openDocument('a.json', 'json', { x: 1 });
    store.touchDocument('a.json', { x: 2 });
    const statuses = [];
    coord.on('status', e => statuses.push(e.status));
    const r = await coord.save('a.json');
    expect(r.ok).toBe(true);
    expect(r.revision).toBeGreaterThan(0);
    expect(store.getDocument('a.json').dirty).toBe(false);
    expect(statuses).toContain(SaveStatus.SAVED);
    expect(coord.statusOf('a.json')).toBe(SaveStatus.SAVED);
  });

  it('refuses to save invalid documents and keeps them dirty', async () => {
    const { coord, store } = makeCoordinator();
    store.openDocument('m.pixomap.json', 'map', { layers: [{}] }); // malformed cells
    store.touchDocument('m.pixomap.json', { layers: [{}] });
    const r = await coord.save('m.pixomap.json');
    expect(r.ok).toBe(false);
    expect(r.error.message).toMatch(/validation failed/);
    expect(store.getDocument('m.pixomap.json').dirty).toBe(true);
  });

  it('keeps documents dirty when the write fails, after retry', async () => {
    const repo = new InMemoryProjectRepository();
    const fail = vi.spyOn(repo, 'write').mockRejectedValue(new Error('disk full'));
    const { coord, store } = makeCoordinator({ repository: repo, registry: null });
    const retries = [];
    coord.on('retry', e => retries.push(e));
    store.openDocument('a.json', 'json', {});
    store.touchDocument('a.json', { x: 1 });
    const r = await coord.save('a.json');
    expect(r.ok).toBe(false);
    expect(fail).toHaveBeenCalledTimes(2); // initial + 1 retry
    expect(retries).toHaveLength(1);
    expect(store.getDocument('a.json').dirty).toBe(true);
    expect(coord.statusOf('a.json')).toBe(SaveStatus.ERROR);
  });

  it('surfaces conflicts without writing', async () => {
    const { coord, store, repo } = makeCoordinator({ registry: null });
    const write = vi.spyOn(repo, 'write');
    coord.detectConflict = async () => ({ conflict: true, detail: 'external edit' });
    const conflicts = [];
    store.on('conflict', e => conflicts.push(e));
    store.openDocument('a.json', 'json', {});
    store.touchDocument('a.json', { x: 1 });
    const r = await coord.save('a.json');
    expect(r.ok).toBe(false);
    expect(write).not.toHaveBeenCalled();
    expect(conflicts).toHaveLength(1);
    expect(store.getDocument('a.json').dirty).toBe(true);
  });

  it('saveAll persists every dirty document', async () => {
    const { coord, store, repo } = makeCoordinator({ registry: null });
    store.openDocument('a.json', 'json', {});
    store.openDocument('b.json', 'json', {});
    store.touchDocument('a.json', { a: 1 });
    store.touchDocument('b.json', { b: 2 });
    const results = await coord.saveAll();
    expect(results.every(([, r]) => r.ok)).toBe(true);
    expect(await repo.read('b.json')).toContain('"b"');
    expect(store.isDirty).toBe(false);
  });
});
