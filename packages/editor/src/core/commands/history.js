/*
 * ---------------------------------------------------------------
 *            PixoSpritz – Editor – CommandHistory
 * ---------------------------------------------------------------
 * Copyright (c) 2022-2025  Kyle Derby MacInnis
 *
 * (P2-05) Undo/redo over operation-specific inverses — never full
 * state snapshots.  Entries carry their own undo closures, an
 * estimated byte size, and an optional coalesce key so pointer
 * strokes collapse into a single bounded command.
 *
 * History is capped by bytes (default 8 MiB), not by entry count,
 * so one giant stroke cannot evict a whole session.
 */

export const DEFAULT_HISTORY_BYTE_CAP = 8 * 1024 * 1024;
export const DEFAULT_COALESCE_WINDOW_MS = 800;

/**
 * @typedef {Object} HistoryEntry
 * @property {string} label
 * @property {() => void} redo      apply (also used for redo)
 * @property {() => void} undo      exact inverse
 * @property {number} [bytes]       estimated size; default estimated
 * @property {string} [coalesceKey]  merges with the top entry when equal
 * @property {(prev: HistoryEntry, next: HistoryEntry) => HistoryEntry} [coalesce]
 *   combine two entries that share a coalesceKey
 */

function estimateBytes(entry) {
  if (typeof entry.bytes === 'number') return Math.max(0, entry.bytes);
  try {
    return 64 + JSON.stringify(entry.snapshot ?? null).length;
  } catch {
    return 256;
  }
}

export class CommandHistory {
  /**
   * @param {{byteCap?: number, coalesceWindowMs?: number}} [options]
   */
  constructor(options = {}) {
    this.byteCap = options.byteCap ?? DEFAULT_HISTORY_BYTE_CAP;
    this.coalesceWindowMs = options.coalesceWindowMs ?? DEFAULT_COALESCE_WINDOW_MS;
    /** @type {Array<{entry: HistoryEntry, bytes: number, at: number}>} */
    this.undoStack = [];
    /** @type {Array<{entry: HistoryEntry, bytes: number, at: number}>} */
    this.redoStack = [];
    this.usedBytes = 0;
    this.listeners = new Set();
  }

  onChange(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  _notify() {
    for (const fn of [...this.listeners]) fn({ canUndo: this.canUndo, canRedo: this.canRedo });
  }

  _evict() {
    while (this.undoStack.length > 0 && this.usedBytes > this.byteCap) {
      const dropped = this.undoStack.shift();
      this.usedBytes -= dropped.bytes;
    }
  }

  /**
   * Push an entry WITHOUT applying it (the caller already applied the
   * change, or will apply via entry.redo()).
   * @param {HistoryEntry} entry
   * @param {{apply?: boolean}} [options]
   */
  push(entry, { apply = false } = {}) {
    if (!entry || typeof entry.redo !== 'function' || typeof entry.undo !== 'function') {
      throw new Error('CommandHistory: entry must define redo/undo');
    }
    const now = Date.now();
    const top = this.undoStack[this.undoStack.length - 1];

    if (
      entry.coalesceKey &&
      top &&
      top.entry.coalesceKey === entry.coalesceKey &&
      now - top.at < this.coalesceWindowMs &&
      typeof entry.coalesce === 'function'
    ) {
      if (apply) entry.redo();
      const merged = entry.coalesce(top.entry, entry);
      const bytes = estimateBytes(merged);
      this.usedBytes += bytes - top.bytes;
      this.undoStack[this.undoStack.length - 1] = { entry: merged, bytes, at: now };
      this._evict();
      this._notify();
      return;
    }

    if (apply) entry.redo();
    const bytes = estimateBytes(entry);
    this.undoStack.push({ entry, bytes, at: now });
    this.usedBytes += bytes;
    this.redoStack.length = 0;
    this._evict();
    this._notify();
  }

  /** @returns {boolean} */
  undo() {
    const item = this.undoStack.pop();
    if (!item) return false;
    item.entry.undo();
    this.usedBytes -= item.bytes;
    this.redoStack.push(item);
    this._notify();
    return true;
  }

  /** @returns {boolean} */
  redo() {
    const item = this.redoStack.pop();
    if (!item) return false;
    item.entry.redo();
    this.usedBytes += item.bytes;
    this.undoStack.push(item);
    this._evict();
    this._notify();
    return true;
  }

  clear() {
    this.undoStack.length = 0;
    this.redoStack.length = 0;
    this.usedBytes = 0;
    this._notify();
  }

  get canUndo() {
    return this.undoStack.length > 0;
  }
  get canRedo() {
    return this.redoStack.length > 0;
  }
  get depth() {
    return this.undoStack.length;
  }
}

/**
 * Accumulate per-pointer-move cell changes during one stroke, then
 * emit a single bounded command whose inverse restores prior values.
 * Usage: const s = createStrokeAccumulator(); onMove -> s.add(cells);
 * onUp -> history.push(s.toCommand(apply, map)).
 */
export function createStrokeAccumulator() {
  /** @type {Map<string, {x:number,y:number,layer:number,before:*,after:*}>} */
  const cells = new Map();
  const key = (x, y, layer) => `${layer}:${x},${y}`;

  return {
    /** Record painted cells: [{x, y, layer, before, after}]. Later moves win for `after`. */
    add(changes) {
      for (const c of changes || []) {
        const k = key(c.x, c.y, c.layer ?? 0);
        const prev = cells.get(k);
        cells.set(k, {
          x: c.x,
          y: c.y,
          layer: c.layer ?? 0,
          before: prev ? prev.before : c.before,
          after: c.after,
        });
      }
    },
    get size() {
      return cells.size;
    },
    /**
     * @param {(cells: Array)} applyCell  writes `after` values
     * @param {(cells: Array)} unapplyCell writes `before` values
     */
    toCommand(label, applyCell, unapplyCell) {
      const list = [...cells.values()];
      const bytes = list.length * 32;
      return {
        label,
        bytes,
        redo: () => applyCell(list),
        undo: () => unapplyCell(list),
      };
    },
    reset() {
      cells.clear();
    },
  };
}
