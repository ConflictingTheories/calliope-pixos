/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
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
 * SaveMigration handles version migration for save files.
 * Ensures backward compatibility when save format changes.
 */
export default class SaveMigration {
  /**
   * Current save format version
   */
  static CURRENT_VERSION = "1.0.0";

  /**
   * Migrates a save file to the current version.
   * @param {Object} saveData - The save data to migrate.
   * @returns {Promise<Object>} - Migrated save data.
   */
  static async migrate(saveData) {
    if (!saveData || !saveData.version) {
      // Legacy save without version - treat as 1.0.0
      saveData.version = "1.0.0";
    }

    const version = saveData.version;
    
    // Already at current version
    if (version === this.CURRENT_VERSION) {
      return saveData;
    }

    // Migrate through versions sequentially
    let migrated = { ...saveData };
    
    if (this.compareVersions(version, "1.0.0") < 0) {
      migrated = await this.migrateTo1_0_0(migrated);
    }

    // Future migrations would go here:
    // if (this.compareVersions(version, "1.1.0") < 0) {
    //   migrated = await this.migrateTo1_1_0(migrated);
    // }

    migrated.version = this.CURRENT_VERSION;
    return migrated;
  }

  /**
   * Migrates save data to version 1.0.0 format.
   * @param {Object} saveData - Save data to migrate.
   * @returns {Promise<Object>} - Migrated save data.
   */
  static async migrateTo1_0_0(saveData) {
    const migrated = {
      version: "1.0.0",
      format: "pxsave",
      gameId: saveData.gameId || "default",
      timestamp: saveData.timestamp ? new Date(saveData.timestamp).toISOString() : new Date().toISOString(),
      player: {
        zone: saveData.player?.zone || saveData.zone || "unknown",
        position: saveData.player?.position || saveData.position || [0, 0, 0],
        facing: saveData.player?.direction || saveData.player?.facing || 0,
      },
      flags: saveData.flags || saveData.variables || {},
      zones: saveData.zones || {},
    };

    // Preserve any additional fields
    if (saveData.playTime) migrated.playTime = saveData.playTime;
    if (saveData.slotId) migrated.slotId = saveData.slotId;
    if (saveData.slotName) migrated.slotName = saveData.slotName;
    if (saveData.screenshot) migrated.screenshot = saveData.screenshot;
    if (saveData.checksum) migrated.checksum = saveData.checksum;
    if (saveData.quests) migrated.quests = saveData.quests;
    if (saveData.meta) migrated.meta = saveData.meta;

    return migrated;
  }

  /**
   * Compares two version strings.
   * @param {string} v1 - First version.
   * @param {string} v2 - Second version.
   * @returns {number} - Negative if v1 < v2, positive if v1 > v2, 0 if equal.
   */
  static compareVersions(v1, v2) {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;
      
      if (part1 < part2) return -1;
      if (part1 > part2) return 1;
    }
    
    return 0;
  }

  /**
   * Validates save data structure.
   * @param {Object} saveData - Save data to validate.
   * @returns {boolean} - True if valid.
   */
  static validate(saveData) {
    if (!saveData) return false;
    if (!saveData.version) return false;
    if (!saveData.format || saveData.format !== "pxsave") return false;
    if (!saveData.gameId) return false;
    if (!saveData.timestamp) return false;
    if (!saveData.player) return false;
    if (!saveData.player.zone) return false;
    if (!Array.isArray(saveData.player.position) || saveData.player.position.length !== 3) return false;
    
    return true;
  }
}
