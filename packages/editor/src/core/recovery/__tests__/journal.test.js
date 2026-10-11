/*
 * ---------------------------------------------------------------
 *       PixoSpritz – Editor – Recovery journal tests (P2-06)
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * Verifies: batch journaling, forced-reload recovery offer, fork
 * semantics (never overwrites the saved project), and saved-state
 * tracking.
 */

import { describe, it, expect } from 'vitest';
import { RecoveryJournal, createMemoryBackend } from '../journal.js';

const batch = rev => [
  { name: 'map.paint', documents: ['maps/a.json'], label: 'paint', payload: { cells: 3 } },
  { name: 'map.paint', documents: ['maps/a.json'], label: 'paint', payload: { cells: 1 } },
];

describe('RecoveryJournal', () => {
  it('offers recovery after a forced reload and forks the project', async () => {
    const backend = createMemoryBackend();
    const before = new RecoveryJournal(backend);
    await before.markSaved('proj-1', 4);
    await before.journalBatch('proj-1', batch(5), 5);
    await before.journalBatch('proj-1', batch(6), 6);

    // Simulate a fresh page load over the same storage.
    const after = new RecoveryJournal(backend);
    const state = await after.inspect('proj-1');
    expect(state.hasRecovery).toBe(true);
    expect(state.batches).toHaveLength(4);
    expect(state.savedRevision).toBe(4);
    // Fork: the recovered project gets its own id; the saved one is untouched.
    expect(state.forkId.startsWith('proj-1-recovered-')).toBe(true);
    expect(state.forkId).not.toBe('proj-1');
  });

  it('reports no recovery when everything was saved', async () => {
    const backend = createMemoryBackend();
    const j = new RecoveryJournal(backend);
    await j.journalBatch('proj-1', batch(5), 5);
    await j.markSaved('proj-1', 6);
    const state = await j.inspect('proj-1');
    expect(state.hasRecovery).toBe(false);
    expect(state.batches).toEqual([]);
  });

  it('discards the journal after save-or-drop', async () => {
    const backend = createMemoryBackend();
    const j = new RecoveryJournal(backend);
    await j.journalBatch('proj-1', batch(5), 5);
    await j.discard('proj-1');
    expect((await j.inspect('proj-1')).hasRecovery).toBe(false);
  });

  it('validates batch descriptors before journaling', async () => {
    const j = new RecoveryJournal(createMemoryBackend());
    await expect(j.journalBatch('p', [{ bogus: true }], 1)).rejects.toThrow(/descriptors/);
    await j.journalBatch('p', [], 1); // empty batch is a no-op
  });
});
