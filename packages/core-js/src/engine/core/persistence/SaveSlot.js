/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
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
 * SaveSlot represents a single save file slot.
 */
export default class SaveSlot {
  /**
   * @param {number} id - Slot index/ID.
   * @param {Object} metadata - Metadata about the save (timestamp, game version, etc.).
   */
  constructor(id, metadata = {}) {
    this.id = id;
    this.name = metadata.name || `Slot ${id}`;
    this.timestamp = metadata.timestamp || Date.now();
    this.version = metadata.version || '1.0.0';
    this.thumbnail = metadata.thumbnail || null; // Base64 preview
    this.gameId = metadata.gameId || 'default';
    this.zone = metadata.zone || 'unknown';
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
    };
  }
}
