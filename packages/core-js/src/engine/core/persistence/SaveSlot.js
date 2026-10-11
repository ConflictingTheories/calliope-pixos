/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine           **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis  **
**                                                 **
** PixoSpritz Dual License - see LICENSE.          **
** Free for education, non-commercial use, and     **
** individual non-profit artists (CC-BY-NC-SA-4.0) **
** Commercial use requires a purchased license.    **
** ----------------------------------------------- **
\*                                                 */

/**
 * SaveSlot represents a single save in the branching save tree.
 *
 * Saves are organized by:
 * - namespace: scope the save belongs to (e.g. "universe:midgard",
 *   "universe:midgard/world:valoria", or "default" for legacy flat saves)
 * - branch: named timeline within a namespace (default "main")
 * - parentId: the save this one branched from (null for roots)
 *
 * This allows "what if" timelines, shared-universe forks, and mod save
 * trees — not just flat atomic slots.
 */
export default class SaveSlot {
  /**
   * @param {string|number} id - Unique save ID.
   * @param {Object} metadata - Metadata about the save.
   */
  constructor(id, metadata = {}) {
    this.id = id;
    this.name = metadata.name || `Save ${id}`;
    this.timestamp = metadata.timestamp || Date.now();
    this.version = metadata.version || '1.0.0';
    this.thumbnail = metadata.thumbnail || null; // Base64 preview
    this.gameId = metadata.gameId || 'default';
    this.zone = metadata.zone || 'unknown';
    // Branching fields
    this.namespace = metadata.namespace || 'default';
    this.branch = metadata.branch || 'main';
    this.parentId = metadata.parentId ?? null;
    this.label = metadata.label || null; // human tag, e.g. "before boss"
  }

  /**
   * Serializes metadata to a plain object.
   * @returns {Object}
   */
  serialize() {
    return {
      id: this.id,
      name: this.name,
      timestamp: this.timestamp,
      version: this.version,
      thumbnail: this.thumbnail,
      gameId: this.gameId,
      zone: this.zone,
      namespace: this.namespace,
      branch: this.branch,
      parentId: this.parentId,
      label: this.label,
    };
  }

  /**
   * Returns the namespace path segments.
   * e.g. "universe:midgard/world:valoria" -> ["universe:midgard", "world:valoria"]
   * @returns {string[]}
   */
  namespacePath() {
    return this.namespace.split('/').filter(Boolean);
  }

  /**
   * Checks if this save is a root (no parent).
   * @returns {boolean}
   */
  isRoot() {
    return this.parentId === null || this.parentId === undefined;
  }
}
