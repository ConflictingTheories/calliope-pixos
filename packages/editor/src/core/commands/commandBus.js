/*
 * ---------------------------------------------------------------
 *            PixoSpritz – Editor – CommandBus
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * (P2-04) Named command execution with undo/redo and transactions.
 * Every command declares: a unique name, preconditions, the set of
 * affected document IDs, and operation-specific do/undo functions.
 * No snapshots: undo applies the recorded inverse.
 *
 * Depends on P2-02 (ProjectStore) for document bookkeeping.  The
 * P1-04 seam (cross-track precondition helpers) is represented by
 * the optional `guards` registry — see `registerGuard`.
 */

/**
 * @typedef {Object} EditorCommand
 * @property {string} name            unique command name, e.g. 'map.paint'
 * @property {string[]} documents     affected document paths (IDs)
 * @property {(ctx: CommandContext) => string|null} [canExecute]  returns reason or null
 * @property {(ctx: CommandContext) => *} do
 * @property {(ctx: CommandContext, doResult: *) => void} undo
 * @property {string} [label]         human label for UI / palette
 * @property {string} [undoLabel]
 */

/**
 * @typedef {Object} CommandContext
 * @property {import('../project/projectStore.js').ProjectStore} store
 * @property {Map<string, *>} services  shared services (registry, repository…)
 */

export class CommandBus {
  /**
   * @param {import('../project/projectStore.js').ProjectStore} store
   * @param {Map<string, *>} [services]
   */
  constructor(store, services = new Map()) {
    if (!store) throw new Error('CommandBus: ProjectStore is required');
    this.store = store;
    this.services = services;
    /** @type {Array<{command: EditorCommand, doResult: *}>} */
    this.undoStack = [];
    /** @type {Array<{command: EditorCommand, doResult: *}>} */
    this.redoStack = [];
    /** @type {Map<string, Function>} named precondition guards (P1-04 seam) */
    this.guards = new Map();
    this.listeners = new Map();
    this.maxDepth = 500;
  }

  on(event, fn) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(fn);
    return () => this.listeners.get(event).delete(fn);
  }

  emit(event, payload) {
    for (const fn of [...(this.listeners.get(event) || [])]) fn(payload);
  }

  /** Register a named precondition guard (P1-04 seam for cross-track guards). */
  registerGuard(name, fn) {
    this.guards.set(name, fn);
    return this;
  }

  ctx() {
    return { store: this.store, services: this.services };
  }

  checkPreconditions(command) {
    if (typeof command.canExecute === 'function') {
      const reason = command.canExecute(this.ctx());
      if (reason) return reason;
    }
    for (const name of command.guards || []) {
      const guard = this.guards.get(name);
      if (!guard) return `unknown guard: ${name}`;
      const reason = guard(this.ctx(), command);
      if (reason) return reason;
    }
    return null;
  }

  /**
   * Execute a command.  Returns { ok, reason?, result? }.
   * @param {EditorCommand} command
   */
  execute(command) {
    if (!command || typeof command.name !== 'string' || typeof command.do !== 'function' || typeof command.undo !== 'function') {
      throw new Error('CommandBus: command must define name/do/undo');
    }
    const blocked = this.checkPreconditions(command);
    if (blocked) {
      this.emit('rejected', { command, reason: blocked });
      return { ok: false, reason: blocked };
    }
    const c = this.ctx();
    const result = command.do(c);
    for (const docPath of command.documents || []) {
      const doc = this.store.getDocument(docPath);
      if (doc) this.store.touchDocument(docPath, doc.data);
    }
    this.undoStack.push({ command, doResult: result });
    if (this.undoStack.length > this.maxDepth) this.undoStack.shift();
    this.redoStack.length = 0;
    this.emit('executed', { command, result });
    return { ok: true, result };
  }

  /** @returns {boolean} whether an undo happened */
  undo() {
    const entry = this.undoStack.pop();
    if (!entry) return false;
    entry.command.undo(this.ctx(), entry.doResult);
    for (const docPath of entry.command.documents || []) {
      const doc = this.store.getDocument(docPath);
      if (doc) this.store.touchDocument(docPath, doc.data);
    }
    this.redoStack.push(entry);
    this.emit('undone', { command: entry.command });
    return true;
  }

  /** @returns {boolean} whether a redo happened */
  redo() {
    const entry = this.redoStack.pop();
    if (!entry) return false;
    const result = entry.command.do(this.ctx());
    entry.doResult = result;
    for (const docPath of entry.command.documents || []) {
      const doc = this.store.getDocument(docPath);
      if (doc) this.store.touchDocument(docPath, doc.data);
    }
    this.undoStack.push(entry);
    this.emit('redone', { command: entry.command });
    return true;
  }

  /**
   * Run several commands as one undoable transaction.  If any command
   * is rejected, the already-executed ones are undone in reverse order.
   * @param {string} name
   * @param {EditorCommand[]} commands
   */
  transaction(name, commands) {
    const done = [];
    for (const command of commands) {
      const r = this.execute(command);
      if (!r.ok) {
        for (const entry of done.reverse()) entry.command.undo(this.ctx(), entry.doResult);
        // Remove the partial entries from the undo stack.
        this.undoStack.splice(this.undoStack.length - done.length, done.length);
        this.emit('transaction-aborted', { name, reason: r.reason });
        return { ok: false, reason: r.reason };
      }
      done.push({ command, doResult: r.result });
    }
    // Collapse into a single undo entry.
    this.undoStack.splice(this.undoStack.length - done.length, done.length);
    const combo = {
      name: `transaction:${name}`,
      documents: [...new Set(done.flatMap(e => e.command.documents || []))],
      label: name,
      do: c => done.map(e => e.command.do(c)),
      undo: (c, results) => {
        for (let i = done.length - 1; i >= 0; i--) done[i].command.undo(c, results ? results[i] : done[i].doResult);
      },
    };
    this.undoStack.push({ command: combo, doResult: null });
    this.redoStack.length = 0;
    this.emit('transaction', { name, count: done.length });
    return { ok: true };
  }

  get canUndo() {
    return this.undoStack.length > 0;
  }
  get canRedo() {
    return this.redoStack.length > 0;
  }
  clear() {
    this.undoStack.length = 0;
    this.redoStack.length = 0;
  }
}
