/*
 * ---------------------------------------------------------------
 *            PixoSpritz – Editor – ProjectStore
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * (P2-02) Framework-free project state owner.  Holds project
 * identity, the set of open documents, per-document revision IDs,
 * the dirty set, and lifecycle events — all outside React so tools
 * can share one source of truth without prop drilling.
 *
 * Lifecycle events: 'open' | 'change' | 'save' | 'save-error' |
 * 'close' | 'conflict' | 'dirty-change'
 */

const REVISION_START = 1;

/**
 * @typedef {Object} OpenDocument
 * @property {string} path
 * @property {string} kind
 * @property {*} data            parsed document model
 * @property {number} revision   last-saved revision
 * @property {number} editCount  edits since open (monotonic)
 * @property {boolean} dirty
 */

export class ProjectStore {
  /**
   * @param {import('./repository.js').ProjectRepository} repository
   */
  constructor(repository) {
    if (!repository) throw new Error('ProjectStore: repository is required');
    this.repository = repository;
    this.projectId = null;
    this.projectName = '';
    /** @type {Map<string, OpenDocument>} */
    this.documents = new Map();
    this.revisionCounter = REVISION_START;
    /** @type {Map<string, Set<Function>} */
    this.listeners = new Map();
  }

  // ---------------------------------------------------------- events
  on(event, fn) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(fn);
    return () => this.listeners.get(event).delete(fn);
  }

  emit(event, payload) {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const fn of [...set]) {
      try {
        fn(payload);
      } catch (err) {
        // Listener errors must never break the store.
        console.error(`[ProjectStore] listener for "${event}" threw:`, err);
      }
    }
  }

  // ---------------------------------------------------------- identity
  /**
   * @param {{id?: string, name?: string}} identity
   */
  setIdentity({ id = `project-${Date.now()}`, name = 'Untitled pixozine' } = {}) {
    this.projectId = id;
    this.projectName = name;
  }

  // ---------------------------------------------------------- documents
  /**
   * Open (or re-open) a document.  Unknown kinds stay inspectable —
   * the registry decides how to parse them (P2-03).
   * @param {string} path
   * @param {string} [kind]
   * @param {*} [data]
   * @returns {OpenDocument}
   */
  openDocument(path, kind = 'unknown', data = null) {
    let doc = this.documents.get(path);
    if (!doc) {
      doc = { path, kind, data, revision: 0, editCount: 0, dirty: false };
      this.documents.set(path, doc);
      this.emit('open', { path, kind });
    }
    return doc;
  }

  getDocument(path) {
    return this.documents.get(path) || null;
  }

  /** Record an edit; marks the document dirty. Returns the new editCount. */
  touchDocument(path, data) {
    const doc = this.documents.get(path);
    if (!doc) throw new Error(`ProjectStore: document not open: ${path}`);
    const wasDirty = doc.dirty;
    doc.data = data;
    doc.editCount += 1;
    doc.dirty = true;
    this.emit('change', { path, editCount: doc.editCount });
    if (!wasDirty) this.emit('dirty-change', { path, dirty: true });
    return doc.editCount;
  }

  /**
   * Mark a document saved at a new revision.  Failed writes must NOT
   * call this — the document stays dirty (P2-07).
   */
  markSaved(path) {
    const doc = this.documents.get(path);
    if (!doc) throw new Error(`ProjectStore: document not open: ${path}`);
    doc.revision = this.revisionCounter++;
    const wasDirty = doc.dirty;
    doc.dirty = false;
    this.emit('save', { path, revision: doc.revision });
    if (wasDirty) this.emit('dirty-change', { path, dirty: false });
    return doc.revision;
  }

  markSaveError(path, error) {
    this.emit('save-error', { path, error });
    // Deliberately leaves dirty === true.
  }

  /**
   * Conflict: the backing store changed under us (or a forked recovery
   * journal produced a competing revision).  The document stays open;
   * the caller decides merge/overwrite/fork.
   */
  markConflict(path, detail) {
    this.emit('conflict', { path, detail });
  }

  closeDocument(path) {
    const doc = this.documents.get(path);
    if (!doc) return false;
    this.documents.delete(path);
    this.emit('close', { path, wasDirty: doc.dirty });
    return true;
  }

  /** @returns {string[]} paths of dirty documents */
  dirtyDocuments() {
    return [...this.documents.values()].filter(d => d.dirty).map(d => d.path);
  }

  get isDirty() {
    return this.dirtyDocuments().length > 0;
  }

  snapshot() {
    return {
      projectId: this.projectId,
      projectName: this.projectName,
      documents: [...this.documents.values()].map(d => ({
        path: d.path,
        kind: d.kind,
        revision: d.revision,
        editCount: d.editCount,
        dirty: d.dirty,
      })),
    };
  }
}
