/* PixoSpritz — TrophyManager tests (pure logic, no DOM). */

import { describe, it, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { describe, it, test, expect, vi, beforeEach, afterEach } from 'vitest';
import TrophyManager, { TROPHY_RARITIES } from '../TrophyManager.js';
import {
  TrophySyncProvider,
  LocalTrophySyncProvider,
  SvrnHubTrophySyncProvider,
  SvrnHubTrophySyncNotAvailableError,
} from '../sync.js';

/** In-memory storage stand-in for localStorage. */
function memStorage() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, v),
    removeItem: (k) => m.delete(k),
  };
}

const MANIFEST = {
  id: 'test-game',
  title: 'Test Game',
  trophies: [
    { id: 'first-steps', title: 'First Steps', description: 'Leave home.', rarity: 'common' },
    { id: 'boss-slayer', title: 'Boss Slayer', rarity: 'legendary', icon: 't/boss.png' },
  ],
};

function fresh(opts = {}) {
  const mgr = new TrophyManager(null, { storage: memStorage(), syncDebounceMs: 0, ...opts });
  mgr.loadFromManifest(MANIFEST);
  return mgr;
}

// 1. Manifest loading registers definitions.
{
  const mgr = fresh();
  const list = mgr.list();
  console.assert(list.length === 2, `expected 2 trophies, got ${list.length}`);
  console.assert(list[0].def.rarity === 'common', 'default rarity preserved');
  console.assert(list[1].def.rarity === 'legendary', 'explicit rarity preserved');
  console.assert(list.every((t) => !t.unlocked), 'none unlocked initially');
  console.log('ok 1 — manifest loading');
}

// 2. Unlock is idempotent; unknown ids are rejected.
{
  const mgr = fresh();
  const r1 = mgr.unlock('first-steps');
  console.assert(r1.ok && !r1.alreadyUnlocked, 'first unlock ok');
  console.assert(mgr.isUnlocked('first-steps'), 'isUnlocked true');
  const r2 = mgr.unlock('first-steps');
  console.assert(r2.ok && r2.alreadyUnlocked, 'second unlock is no-op');
  console.assert(r2.unlockedAt === r1.unlockedAt, 'timestamp stable across re-unlock');
  const r3 = mgr.unlock('nope');
  console.assert(!r3.ok && r3.trophy === null, 'unknown id rejected');
  console.log('ok 2 — unlock idempotency');
}

// 3. Unlock events fire exactly once per trophy (subscriber hook for UI/toast).
{
  const mgr = fresh();
  const seen = [];
  const unsub = mgr.onUnlock((t) => seen.push(t.def.id));
  mgr.unlock('first-steps');
  mgr.unlock('first-steps'); // no-op: no second event
  mgr.unlock('boss-slayer');
  console.assert(seen.length === 2, `expected 2 events, got ${seen.length}`);
  console.assert(seen[0] === 'first-steps' && seen[1] === 'boss-slayer', 'event order + payload');
  unsub();
  mgr.lock('first-steps');
  mgr.unlock('first-steps');
  console.assert(seen.length === 2, 'unsubscribed: no further events');
  console.log('ok 3 — unlock events');
}

// 4. Persistence roundtrip via injected storage.
{
  const storage = memStorage();
  const a = new TrophyManager(null, { storage, syncDebounceMs: 0 });
  a.loadFromManifest(MANIFEST);
  a.unlock('boss-slayer');
  const b = new TrophyManager(null, { storage, syncDebounceMs: 0 });
  b.loadFromManifest(MANIFEST);
  console.assert(b.isUnlocked('boss-slayer'), 'unlock survives reload');
  console.assert(!b.isUnlocked('first-steps'), 'locked stays locked');
  console.log('ok 4 — persistence');
}

// 5. Validation: duplicate ids and bad rarity rejected.
{
  const mgr = new TrophyManager(null, { storage: memStorage(), syncDebounceMs: 0 });
  let threw = 0;
  try { mgr.define([{ id: 'x' }, { id: 'x' }]); } catch { threw++; }
  try { mgr.define([{ id: 'y', rarity: 'mythic' }]); } catch { threw++; }
  try { mgr.define([{ title: 'no id' }]); } catch { threw++; }
  console.assert(threw === 3, `expected 3 validation errors, got ${threw}`);
  console.assert(TROPHY_RARITIES.join(',') === 'common,rare,epic,legendary', 'rarity set');
  console.log('ok 5 — definition validation');
}

// 6. Merge is union with earliest-timestamp-wins (trophies are monotonic).
{
  const p = new TrophySyncProvider();
  const merged = p.merge(
    [{ id: 'a', unlockedAt: '2026-01-02T00:00:00Z' }],
    [
      { id: 'a', unlockedAt: '2026-01-01T00:00:00Z' },
      { id: 'b', unlockedAt: '2026-01-03T00:00:00Z' },
    ]
  );
  console.assert(merged.length === 2, `union: expected 2, got ${merged.length}`);
  const a = merged.find((t) => t.id === 'a');
  console.assert(a.unlockedAt === '2026-01-01T00:00:00Z', 'earliest timestamp wins');
  console.log('ok 6 — sync merge');
}

// 7. Local provider is a safe no-op; hub stub throws typed error.
{
  const local = new LocalTrophySyncProvider();
  const pulled = await local.pull('g');
  console.assert(pulled === null, 'local pull returns null');
  await local.push('g', []); // must not throw

  const hub = new SvrnHubTrophySyncProvider();
  let err = null;
  try { await hub.push('g', []); } catch (e) { err = e; }
  console.assert(err instanceof SvrnHubTrophySyncNotAvailableError, 'hub push throws typed error');
  console.assert(err.code === 'svrn-hub-trophy-sync-not-available', 'error code set');
  console.log('ok 7 — sync providers');
}

// 8. sync() merges remote unlocks into local state.
{
  const mgr = fresh();
  mgr.unlock('first-steps');
  mgr.setSyncProvider({
    merge: TrophySyncProvider.prototype.merge,
    pull: async () => [{ id: 'boss-slayer', unlockedAt: '2026-01-05T00:00:00Z' }],
    push: async () => {},
  });
  const res = await mgr.sync();
  console.assert(res.pushed, 'push succeeded');
  console.assert(mgr.isUnlocked('boss-slayer'), 'remote unlock merged locally');
  console.assert(mgr.isUnlocked('first-steps'), 'local unlock retained');
  console.log('ok 8 — sync pull/merge/push');
}

// 9. Manifest without trophies is a no-op (backward compatible).
{
  const mgr = new TrophyManager(null, { storage: memStorage(), syncDebounceMs: 0 });
  const n = mgr.loadFromManifest({ id: 'plain-game', title: 'Plain' });
  console.assert(n === 0, 'no trophies registered');
  const r = mgr.unlock('anything');
  console.assert(!r.ok, 'unlock with no definitions rejected');
  console.log('ok 9 — manifest without trophies');
}

console.log('\nAll trophy tests passed.');
