/*
 * ---------------------------------------------------------------
 *          PixoSpritz – Editor – Crash-recovery journal
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * (P2-06) Persists validated command batches to IndexedDB (with an
 * in-memory fallback outside browsers).  After a crash/forced
 * reload, recovery replays the journal into a FORK of the project —
 * it never overwrites the last exported/saved bytes.
 *
 * A journal batch is a list of serializable command descriptors:
 *   { name, documents, label, payload }
 * Only commands that pass CommandBus preconditions are journaled.
 */

const STORE = 'journal';
const META = 'meta';

/** In-memory backend (tests, SSR, environments without IndexedDB). */
export function createMemoryBackend() {
  const batches = new Map(); // projectId -> Array<entry>
  const meta = new Map(); // projectId -> { savedRevision }
  return {
    kind: 'memory',
    async append(projectId, entry) {
      if (!batches.has(projectId)) batches.set(projectId, []);
      batches.get(projectId).push(entry);
    },
    async list(projectId) {
      return [...(batches.get(projectId) || [])];
    },
    async clear(projectId) {
      batches.delete(projectId);
    },
    async getMeta(projectId) {
      return meta.get(projectId) || { savedRevision: 0 };
    },
    async setMeta(projectId, value) {
      meta.set(projectId, value);
    },
    /** Test hook: simulate a fresh page load over the same storage. */
    __entries: batches,
  };
}

/** IndexedDB backend. Resolves to memory backend when unavailable. */
export function createIndexedDBBackend(dbName = 'pixospritz-recovery') {
  if (typeof indexedDB === 'undefined') return createMemoryBackend();
  let dbPromise = null;

  function db() {
    if (!dbPromise) {
      dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open(dbName, 1);
        req.onupgradeneeded = () => {
          const d = req.result;
          if (!d.objectStoreNames.contains(STORE)) d.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
          if (!d.objectStoreNames.contains(META)) d.createObjectStore(META, { keyPath: 'projectId' });
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    }
    return dbPromise;
  }

  function tx(store, mode, fn) {
    return db().then(
      d =>
        new Promise((resolve, reject) => {
          const t = d.transaction(store, mode);
          const s = t.objectStore(store);
          const req = fn(s);
          t.oncomplete = () => resolve(req ? req.result : undefined);
          t.onerror = () => reject(t.error);
        })
    );
  }

  return {
    kind: 'indexeddb',
    async append(projectId, entry) {
      await tx(STORE, 'readwrite', s => s.add({ ...entry, projectId, createdAt: Date.now() }));
    },
    async list(projectId) {
      const all = await tx(STORE, 'readonly', s => s.getAll());
      return (all || []).filter(e => e.projectId === projectId);
    },
    async clear(projectId) {
      const all = await tx(STORE, 'readonly', s => s.getAll());
      await Promise.all(
        (all || []).filter(e => e.projectId === projectId).map(e => tx(STORE, 'readwrite', s => s.delete(e.id)))
      );
    },
    async getMeta(projectId) {
      const row = await tx(META, 'readonly', s => s.get(projectId));
      return row || { projectId, savedRevision: 0 };
    },
    async setMeta(projectId, value) {
      await tx(META, 'readwrite', s => s.put({ projectId, ...value }));
    },
  };
}

export function defaultBackend() {
  return createIndexedDBBackend();
}

/**
 * Recovery journal over a storage backend.
 */
export class RecoveryJournal {
  /**
   * @param {{kind:string, append:Function, list:Function, clear:Function, getMeta:Function, setMeta:Function}} backend
   */
  constructor(backend = defaultBackend()) {
    this.backend = backend;
  }

  /**
   * Journal one validated batch of command descriptors.
   * @param {string} projectId
   * @param {Array<{name:string, documents:string[], label?:string, payload?:*}>} batch
   * @param {number} baseRevision  store revision the batch applies to
   */
  async journalBatch(projectId, batch, baseRevision) {
    if (!Array.isArray(batch) || batch.length === 0) return;
    for (const cmd of batch) {
      if (!cmd || typeof cmd.name !== 'string' || !Array.isArray(cmd.documents)) {
        throw new Error('RecoveryJournal: batch entries must be {name, documents[]} descriptors');
      }
    }
    await this.backend.append(projectId, { batch, baseRevision });
  }

  /** Record a successful save so recovery can distinguish saved vs lost work. */
  async markSaved(projectId, savedRevision) {
    await this.backend.setMeta(projectId, { savedRevision });
  }

  /**
   * Inspect recovery state after a (re)load.
   * @returns {Promise<{hasRecovery: boolean, forkId: string|null, batches: Array, savedRevision: number}>}
   */
  async inspect(projectId) {
    const [entries, meta] = await Promise.all([
      this.backend.list(projectId),
      this.backend.getMeta(projectId),
    ]);
    const unsaved = entries.filter(e => (e.baseRevision ?? 0) >= (meta.savedRevision ?? 0));
    if (unsaved.length === 0) return { hasRecovery: false, forkId: null, batches: [], savedRevision: meta.savedRevision ?? 0 };
    return {
      hasRecovery: true,
      // Recovery ALWAYS forks — the last saved/exported project is preserved.
      forkId: `${projectId}-recovered-${Date.now()}`,
      batches: unsaved.flatMap(e => e.batch),
      savedRevision: meta.savedRevision ?? 0,
    };
  }

  /** Discard the journal (call after the user saves or explicitly drops recovery). */
  async discard(projectId) {
    await this.backend.clear(projectId);
  }
}
