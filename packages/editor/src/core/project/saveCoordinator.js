/*
 * ---------------------------------------------------------------
 *           PixoSpritz – Editor – SaveCoordinator
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * (P2-07) The single save path for the editor.  One coordinator
 * owns validation, conflict detection, write status, and retry.
 * Domain code reports success/failure through events — never
 * `alert()`.  A failed write leaves the document dirty; a
 * successful write advances the revision (P2-02).
 */

export const SaveStatus = Object.freeze({
  IDLE: 'idle',
  VALIDATING: 'validating',
  WRITING: 'writing',
  RETRYING: 'retrying',
  SAVED: 'saved',
  ERROR: 'error',
});

const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_RETRY_DELAY_MS = 750;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * @typedef {Object} SaveCoordinatorOptions
 * @property {import('./projectStore.js').ProjectStore} store
 * @property {import('./repository.js').ProjectRepository} repository
 * @property {import('../documents/registry.js').DocumentRegistry} [registry]
 * @property {(path: string) => Promise<{conflict: boolean, detail?: *}>} [detectConflict]
 * @property {number} [maxRetries]
 * @property {number} [retryDelayMs]
 */
export class SaveCoordinator {
  constructor(options) {
    const { store, repository, registry = null, detectConflict = null } = options || {};
    if (!store) throw new Error('SaveCoordinator: ProjectStore is required');
    if (!repository) throw new Error('SaveCoordinator: ProjectRepository is required');
    this.store = store;
    this.repository = repository;
    this.registry = registry;
    this.detectConflict = detectConflict || (async () => ({ conflict: false }));
    this.maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.retryDelayMs = options.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS;
    this.statusByPath = new Map();
    this.listeners = new Map();
    this.autosaveTimer = null;
  }

  on(event, fn) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(fn);
    return () => this.listeners.get(event).delete(fn);
  }

  emit(event, payload) {
    for (const fn of [...(this.listeners.get(event) || [])]) {
      try {
        fn(payload);
      } catch (err) {
        console.error(`[SaveCoordinator] listener for "${event}" threw:`, err);
      }
    }
  }

  statusOf(path) {
    return this.statusByPath.get(path) || SaveStatus.IDLE;
  }

  _setStatus(path, status, extra = {}) {
    this.statusByPath.set(path, status);
    this.emit('status', { path, status, ...extra });
  }

  /**
   * Validate-then-write one document.  Returns { ok, revision?, error? }.
   * @param {string} path
   */
  async save(path) {
    const doc = this.store.getDocument(path);
    if (!doc) return { ok: false, error: new Error(`not open: ${path}`) };

    this._setStatus(path, SaveStatus.VALIDATING);
    if (this.registry) {
      const issues = this.registry.validateDocument(doc.kind, doc.data, path);
      const errors = issues.filter(i => i.severity === 'error');
      if (errors.length > 0) {
        const error = new Error(`validation failed: ${errors[0].message}`);
        error.issues = errors;
        this._setStatus(path, SaveStatus.ERROR, { error });
        this.store.markSaveError(path, error);
        this.emit('save-error', { path, error });
        return { ok: false, error };
      }
    }

    const { conflict, detail } = await this.detectConflict(path);
    if (conflict) {
      this.store.markConflict(path, detail);
      const error = new Error('save conflict: backing store changed');
      this._setStatus(path, SaveStatus.ERROR, { error });
      this.store.markSaveError(path, error);
      this.emit('save-error', { path, error });
      return { ok: false, error };
    }

    this._setStatus(path, SaveStatus.WRITING);
    let attempt = 0;
    for (;;) {
      try {
        const payload = this.registry
          ? this.registry.serializeDocument(doc.kind, doc.data, path)
          : typeof doc.data === 'string'
            ? doc.data
            : JSON.stringify(doc.data);
        await this.repository.write(path, payload);
        const revision = this.store.markSaved(path);
        this._setStatus(path, SaveStatus.SAVED, { revision });
        this.emit('saved', { path, revision });
        return { ok: true, revision };
      } catch (error) {
        attempt += 1;
        if (attempt > this.maxRetries) {
          this._setStatus(path, SaveStatus.ERROR, { error });
          this.store.markSaveError(path, error); // stays dirty
          this.emit('save-error', { path, error });
          return { ok: false, error };
        }
        this._setStatus(path, SaveStatus.RETRYING, { attempt, error });
        this.emit('retry', { path, attempt, error });
        await sleep(this.retryDelayMs * attempt);
      }
    }
  }

  /** Save every dirty open document. */
  async saveAll() {
    const results = [];
    for (const path of this.store.dirtyDocuments()) {
      results.push([path, await this.save(path)]);
    }
    return results;
  }

  /**
   * Autosave dirty documents on an interval.  Returns a stop function.
   * Status (not alerts) surfaces progress to the shell.
   */
  enableAutosave({ intervalMs = 30000 } = {}) {
    this.disableAutosave();
    this.autosaveTimer = setInterval(() => {
      if (this.store.isDirty) {
        this.emit('autosave', { dirty: this.store.dirtyDocuments() });
        void this.saveAll();
      }
    }, intervalMs);
    if (typeof this.autosaveTimer.unref === 'function') this.autosaveTimer.unref();
    return () => this.disableAutosave();
  }

  disableAutosave() {
    if (this.autosaveTimer) {
      clearInterval(this.autosaveTimer);
      this.autosaveTimer = null;
    }
  }
}
