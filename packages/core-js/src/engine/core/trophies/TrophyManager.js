/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine            **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis   **
**                                                 **
** PixoSpritz Dual License - see LICENSE.          **
** Free for education, non-commercial use, and     **
** individual non-profit artists (CC-BY-NC-SA-4.0) **
** Commercial use requires a purchased license.    **
** ----------------------------------------------- **
\*                                                 */

/**
 * @fileoverview Trophy/achievement system for the PixoSpritz runtime.
 *
 * Games declare trophies in their manifest:
 *
 *   "trophies": [
 *     { "id": "first-steps", "title": "First Steps",
 *       "description": "Leave the starting zone.",
 *       "icon": "trophies/first-steps.png",
 *       "rarity": "common",
 *       "criteria": { "hint": "unlock via pixoscript" } }
 *   ]
 *
 * Rarity is one of: common, rare, epic, legendary.
 *
 * Runtime API (event-driven — no polling, decoupled from the game loop):
 *
 *   engine.trophyManager.unlock('first-steps');
 *   engine.trophyManager.isUnlocked('first-steps'); // true
 *   engine.trophyManager.list(); // definitions + unlocked state
 *   engine.trophyManager.onUnlock((trophy) => toast(trophy.title));
 *
 * Unlocked trophies persist per-game in localStorage
 * (`pixos_trophies::<gameId>`, same metadata pattern as SaveManager).
 * Sync to the SVRN identity is handled through a TrophySyncProvider
 * (see sync.js) — local-only by default, hub stubbed until the
 * identity provider exists.
 */

import { LocalTrophySyncProvider } from './sync.js';
import { debug } from '../../utils/debug-logger.js';

/** localStorage key prefix for per-game trophy state. */
export const TROPHY_STORAGE_PREFIX = 'pixos_trophies::';

/** Valid trophy rarities. */
export const TROPHY_RARITIES = ['common', 'rare', 'epic', 'legendary'];

/**
 * @typedef {object} TrophyDefinition
 * @property {string} id - Unique trophy id within the game.
 * @property {string} title - Display title.
 * @property {string} [description] - Display description.
 * @property {string} [icon] - Asset path/URI for the trophy icon.
 * @property {string} [rarity] - One of TROPHY_RARITIES (default 'common').
 * @property {object} [criteria] - Opaque criteria hint for tooling (not evaluated by the runtime).
 */

/**
 * @typedef {object} TrophyState
 * @property {TrophyDefinition} def - The trophy definition.
 * @property {boolean} unlocked - Whether it is unlocked.
 * @property {string|null} unlockedAt - ISO timestamp of unlock, or null.
 */

function isBrowserStorageAvailable() {
  return typeof localStorage !== 'undefined' && localStorage !== null;
}

export default class TrophyManager {
  /**
   * @param {object|null} engine - Engine reference (optional; used for future hooks).
   * @param {object} [opts]
   * @param {object|null} [opts.storage] - Injectable storage ({getItem,setItem,removeItem}) for tests.
   * @param {number} [opts.syncDebounceMs] - Debounce for sync pushes after unlock (default 2000).
   */
  constructor(engine = null, opts = {}) {
    this.engine = engine;

    /** @type {Map<string, TrophyDefinition>} */
    this.definitions = new Map();

    /** @type {Map<string, string>} trophy id -> ISO unlockedAt */
    this.unlocked = new Map();

    /** @type {Set<Function>} unlock subscribers */
    this.subscribers = new Set();

    /** @type {string} */
    this.gameId = 'default';

    this.storage = opts.storage || (isBrowserStorageAvailable() ? localStorage : null);
    this.syncDebounceMs = opts.syncDebounceMs ?? 2000;
    this.syncProvider = new LocalTrophySyncProvider();
    this._syncTimer = null;
    this._loaded = false;
  }

  // ---------------------------------------------------------------
  // Definition loading
  // ---------------------------------------------------------------

  /**
   * Register trophy definitions from a game manifest.
   * Safe to call with a manifest that has no `trophies` array (no-op).
   * @param {object} manifest
   * @returns {number} count of registered definitions.
   */
  loadFromManifest(manifest) {
    if (!manifest || typeof manifest !== 'object') return 0;
    this.gameId = String(manifest.id || manifest.title || 'default');
    const defs = Array.isArray(manifest.trophies) ? manifest.trophies : [];
    this.define(defs);
    this._loadPersisted();
    this._loaded = true;
    debug('TrophyManager', `loaded ${this.definitions.size} trophies for game "${this.gameId}"`);
    return this.definitions.size;
  }

  /**
   * Register trophy definitions programmatically.
   * @param {TrophyDefinition[]} defs
   */
  define(defs) {
    for (const def of defs || []) {
      this._validateDefinition(def);
      this.definitions.set(def.id, {
        id: def.id,
        title: def.title || def.id,
        description: def.description || '',
        icon: def.icon || null,
        rarity: TROPHY_RARITIES.includes(def.rarity) ? def.rarity : 'common',
        criteria: def.criteria || {},
      });
    }
  }

  _validateDefinition(def) {
    if (!def || typeof def.id !== 'string' || def.id.length === 0) {
      throw new Error('TrophyManager: trophy definition requires a non-empty string id');
    }
    if (this.definitions.has(def.id)) {
      throw new Error(`TrophyManager: duplicate trophy id "${def.id}"`);
    }
    if (def.rarity && !TROPHY_RARITIES.includes(def.rarity)) {
      throw new Error(`TrophyManager: unknown rarity "${def.rarity}" (expected one of ${TROPHY_RARITIES.join(', ')})`);
    }
  }

  // ---------------------------------------------------------------
  // Runtime API
  // ---------------------------------------------------------------

  /**
   * Unlock a trophy. Idempotent — unlocking twice is a no-op returning
   * alreadyUnlocked: true (no duplicate events, no duplicate sync).
   * @param {string} id
   * @returns {{ok: boolean, trophy: TrophyState|null, alreadyUnlocked: boolean, unlockedAt: string|null}}
   */
  unlock(id) {
    const def = this.definitions.get(id);
    if (!def) {
      debug('TrophyManager', `unlock ignored: unknown trophy id "${id}"`);
      return { ok: false, trophy: null, alreadyUnlocked: false, unlockedAt: null };
    }
    if (this.unlocked.has(id)) {
      return {
        ok: true,
        trophy: this._stateFor(def),
        alreadyUnlocked: true,
        unlockedAt: this.unlocked.get(id),
      };
    }
    const unlockedAt = new Date().toISOString();
    this.unlocked.set(id, unlockedAt);
    this._persist();
    const trophy = this._stateFor(def);
    // Event-driven: notify subscribers (UI/toast hooks). Never throws into the game.
    for (const fn of this.subscribers) {
      try {
        fn(trophy);
      } catch (e) {
        debug('TrophyManager', `subscriber threw for "${id}": ${e.message}`);
      }
    }
    this._scheduleSync();
    debug('TrophyManager', `unlocked "${id}"`);
    return { ok: true, trophy, alreadyUnlocked: false, unlockedAt };
  }

  /** @param {string} id */
  isUnlocked(id) {
    return this.unlocked.has(id);
  }

  /** @returns {TrophyState[]} all definitions with unlocked state. */
  list() {
    return [...this.definitions.values()].map((def) => this._stateFor(def));
  }

  /** @returns {TrophyState[]} only unlocked trophies. */
  unlockedList() {
    return this.list().filter((t) => t.unlocked);
  }

  /**
   * Subscribe to unlock events (for UI/toast hooks).
   * @param {(trophy: TrophyState) => void} fn
   * @returns {() => void} unsubscribe function.
   */
  onUnlock(fn) {
    this.subscribers.add(fn);
    return () => this.subscribers.delete(fn);
  }

  /** Relock a trophy (dev/testing). @param {string} id */
  lock(id) {
    if (this.unlocked.delete(id)) {
      this._persist();
      this._scheduleSync();
    }
  }

  /** Clear all unlocked state for the current game (dev/testing). */
  reset() {
    this.unlocked.clear();
    this._persist();
    this._scheduleSync();
  }

  _stateFor(def) {
    const unlockedAt = this.unlocked.get(def.id) || null;
    return { def, unlocked: unlockedAt !== null, unlockedAt };
  }

  // ---------------------------------------------------------------
  // Persistence (localStorage metadata pattern, like SaveManager)
  // ---------------------------------------------------------------

  _storageKey() {
    return TROPHY_STORAGE_PREFIX + this.gameId;
  }

  _persist() {
    if (!this.storage) return;
    try {
      const payload = { unlocked: Object.fromEntries(this.unlocked) };
      this.storage.setItem(this._storageKey(), JSON.stringify(payload));
    } catch (e) {
      debug('TrophyManager', `persist failed: ${e.message}`);
    }
  }

  _loadPersisted() {
    if (!this.storage) return;
    try {
      const raw = this.storage.getItem(this._storageKey());
      if (!raw) return;
      const payload = JSON.parse(raw);
      if (payload && typeof payload.unlocked === 'object') {
        for (const [id, at] of Object.entries(payload.unlocked)) {
          if (this.definitions.has(id)) this.unlocked.set(id, at);
        }
      }
    } catch (e) {
      debug('TrophyManager', `load failed: ${e.message}`);
    }
  }

  // ---------------------------------------------------------------
  // Sync
  // ---------------------------------------------------------------

  /** @param {import('./sync.js').TrophySyncProvider} provider */
  setSyncProvider(provider) {
    this.syncProvider = provider;
  }

  _scheduleSync() {
    if (this._syncTimer) clearTimeout(this._syncTimer);
    this._syncTimer = setTimeout(() => {
      this._syncTimer = null;
      this.sync().catch((e) => debug('TrophyManager', `sync failed: ${e.message}`));
    }, this.syncDebounceMs);
    // Don't hold the process open for a background sync.
    if (this._syncTimer.unref) this._syncTimer.unref();
  }

  /**
   * Pull remote state, merge (union — trophies are monotonic), push merged.
   * @returns {Promise<{pushed: boolean, merged: number}>}
   */
  async sync() {
    const provider = this.syncProvider;
    if (!provider) return { pushed: false, merged: 0 };
    const local = [...this.unlocked.entries()].map(([id, unlockedAt]) => ({ id, unlockedAt }));
    let remote = null;
    try {
      remote = await provider.pull(this.gameId);
    } catch (e) {
      debug('TrophyManager', `pull failed: ${e.message}`);
    }
    const merged = provider.merge(local, remote || []);
    let added = 0;
    for (const { id, unlockedAt } of merged) {
      if (!this.unlocked.has(id) && this.definitions.has(id)) {
        this.unlocked.set(id, unlockedAt);
        added++;
      } else if (this.unlocked.has(id) && unlockedAt < this.unlocked.get(id)) {
        // Keep the earliest unlock timestamp across devices.
        this.unlocked.set(id, unlockedAt);
      }
    }
    if (added > 0) this._persist();
    const finalState = [...this.unlocked.entries()].map(([id, unlockedAt]) => ({ id, unlockedAt }));
    try {
      await provider.push(this.gameId, finalState);
    } catch (e) {
      debug('TrophyManager', `push failed: ${e.message}`);
      return { pushed: false, merged: added };
    }
    return { pushed: true, merged: added };
  }
}
