/*                                                 *\
** ----------------------------------------------- **
**          Calliope - PixoSpritz Server           **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */

/**
 * DeltaSynchronizer - Efficient network state synchronization
 * Sends only changes (deltas) instead of full state, reducing bandwidth 10-100x
 */
export default class DeltaSynchronizer {
  constructor(options = {}) {
    this.compressionEnabled = options.compression ?? true;
    this.snapshotInterval = options.snapshotInterval ?? 100; // ms
    this.maxDeltaAge = options.maxDeltaAge ?? 1000; // ms

    // State tracking
    this.lastSnapshot = {};
    this.currentSnapshot = {};
    this.deltas = [];
    this.lastSyncTime = Date.now();
  }

  /**
   * Records the current state
   * @param {Object} state - Current game state
   */
  recordSnapshot(state) {
    this.lastSnapshot = this.currentSnapshot;
    this.currentSnapshot = this._deepClone(state);
  }

  /**
   * Computes delta (diff) between last and current snapshot
   * @returns {Object} Delta containing only changed fields
   */
  computeDelta() {
    const delta = {
      timestamp: Date.now(),
      changes: {},
      removed: [],
    };

    // Find added/modified fields
    for (const key in this.currentSnapshot) {
      const current = this.currentSnapshot[key];
      const last = this.lastSnapshot[key];

      if (!this._isEqual(current, last)) {
        delta.changes[key] = current;
      }
    }

    // Find removed fields
    for (const key in this.lastSnapshot) {
      if (!(key in this.currentSnapshot)) {
        delta.removed.push(key);
      }
    }

    return delta;
  }

  /**
   * Encodes delta for network transmission
   * @param {Object} delta
   * @returns {Buffer|Uint8Array} Encoded delta
   */
  encodeDelta(delta) {
    let data = JSON.stringify(delta);

    if (this.compressionEnabled) {
      data = this._compress(data);
    }

    return data;
  }

  /**
   * Decodes received delta
   * @param {Buffer|string} encoded - Encoded delta
   * @returns {Object} Decoded delta
   */
  decodeDelta(encoded) {
    let data = encoded;

    if (this.compressionEnabled && data instanceof Uint8Array) {
      data = this._decompress(data);
    }

    return JSON.parse(data);
  }

  /**
   * Applies delta to state
   * @param {Object} state - Target state
   * @param {Object} delta - Delta to apply
   * @returns {Object} Updated state
   */
  applyDelta(state, delta) {
    const updated = this._deepClone(state);

    // Apply changes
    for (const key in delta.changes) {
      updated[key] = delta.changes[key];
    }

    // Remove deleted fields
    for (const key of delta.removed) {
      delete updated[key];
    }

    return updated;
  }

  /**
   * Detects collision changes between states
   * Useful for physics/collision synchronization
   * @param {Object} lastState
   * @param {Object} currentState
   * @returns {Object} Collision delta
   */
  computeCollisionDelta(lastState, currentState) {
    const delta = {
      newCollisions: [],
      endedCollisions: [],
    };

    const lastCollisions = new Set((lastState.collisions || []).map(c => c.id));
    const currentCollisions = new Set((currentState.collisions || []).map(c => c.id));

    // New collisions
    for (const id of currentCollisions) {
      if (!lastCollisions.has(id)) {
        const collision = currentState.collisions.find(c => c.id === id);
        delta.newCollisions.push(collision);
      }
    }

    // Ended collisions
    for (const id of lastCollisions) {
      if (!currentCollisions.has(id)) {
        delta.endedCollisions.push(id);
      }
    }

    return delta;
  }

  /**
   * Computes delta for entity positions only (for interpolation)
   * @param {Array<Object>} lastEntities
   * @param {Array<Object>} currentEntities
   * @returns {Object} Position delta
   */
  computePositionDelta(lastEntities, currentEntities) {
    const positionChanges = {};

    for (const current of currentEntities) {
      const last = lastEntities.find(e => e.id === current.id);

      if (!last || this._positionChanged(last, current)) {
        positionChanges[current.id] = {
          x: current.x,
          y: current.y,
          z: current.z || 0,
          vx: current.vx || 0,
          vy: current.vy || 0,
          vz: current.vz || 0,
        };
      }
    }

    return { positions: positionChanges, timestamp: Date.now() };
  }

  /**
   * Computes diff for arbitrary objects
   * Deep comparison - only includes changed properties
   * @param {Object} obj1
   * @param {Object} obj2
   * @returns {Object} Diff object
   */
  computeObjectDiff(obj1, obj2) {
    const diff = {};

    // Check all keys in obj2
    for (const key in obj2) {
      if (key.startsWith('_')) continue; // Skip private fields

      const val1 = obj1[key];
      const val2 = obj2[key];

      if (!this._isEqual(val1, val2)) {
        diff[key] = val2;
      }
    }

    // Check for deleted keys
    const deleted = [];
    for (const key in obj1) {
      if (!(key in obj2) && !key.startsWith('_')) {
        deleted.push(key);
      }
    }

    if (deleted.length > 0) {
      diff.__deleted = deleted;
    }

    return diff;
  }

  /**
   * Merges multiple deltas into one
   * Useful for batching updates
   * @param {Array<Object>} deltas
   * @returns {Object} Merged delta
   */
  mergedeltas(deltas) {
    if (deltas.length === 0) return { changes: {}, removed: [] };
    if (deltas.length === 1) return deltas[0];

    const merged = {
      timestamp: Math.max(...deltas.map(d => d.timestamp)),
      changes: {},
      removed: new Set(),
    };

    for (const delta of deltas) {
      // Merge changes (later deltas override earlier ones)
      Object.assign(merged.changes, delta.changes);

      // Merge removed
      for (const key of delta.removed) {
        merged.removed.add(key);
      }

      // Remove re-added keys from deleted list
      for (const key in delta.changes) {
        merged.removed.delete(key);
      }
    }

    merged.removed = Array.from(merged.removed);
    return merged;
  }

  /**
   * Validates delta for correctness
   * @param {Object} delta
   * @returns {boolean} Is valid
   */
  validateDelta(delta) {
    if (!delta || typeof delta !== 'object') return false;
    if (typeof delta.timestamp !== 'number') return false;
    if (!Array.isArray(delta.removed)) return false;
    if (!delta.changes || typeof delta.changes !== 'object') return false;

    return true;
  }

  /**
   * Deep clone utility
   * @private
   */
  _deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof Array) return obj.map(item => this._deepClone(item));

    const cloned = {};
    for (const key in obj) {
      cloned[key] = this._deepClone(obj[key]);
    }
    return cloned;
  }

  /**
   * Equality check
   * @private
   */
  _isEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (typeof a !== typeof b) return false;

    if (typeof a === 'object') {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);

      if (keysA.length !== keysB.length) return false;

      for (const key of keysA) {
        if (!this._isEqual(a[key], b[key])) return false;
      }

      return true;
    }

    return false;
  }

  /**
   * Position changed utility
   * @private
   */
  _positionChanged(entity1, entity2) {
    const threshold = 0.01; // Position delta threshold
    return (
      Math.abs((entity1.x || 0) - (entity2.x || 0)) > threshold ||
      Math.abs((entity1.y || 0) - (entity2.y || 0)) > threshold ||
      Math.abs((entity1.z || 0) - (entity2.z || 0)) > threshold
    );
  }

  /**
   * Simple compression (stub - implement with pako or similar)
   * @private
   */
  _compress(data) {
    // TODO: Implement with real compression library
    // For now, just return as-is
    return data;
  }

  /**
   * Simple decompression (stub)
   * @private
   */
  _decompress(data) {
    // TODO: Implement with real compression library
    return data;
  }

  /**
   * Calculate compression ratio
   * @param {Object} fullState
   * @param {Object} delta
   * @returns {number} Ratio (smaller = better compression)
   */
  getCompressionRatio(fullState, delta) {
    const fullSize = JSON.stringify(fullState).length;
    const deltaSize = JSON.stringify(delta).length;
    return deltaSize / fullSize;
  }
}
