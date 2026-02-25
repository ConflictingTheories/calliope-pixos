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

import { Vector } from '../../utils/math/vector.js';

/**
 * @typedef {object} LODLevel
 * @property {number} distance - Maximum distance for this LOD level.
 * @property {number} detail - Detail factor (0-1, where 1 = full detail).
 * @property {string} [asset] - Optional asset variant for this LOD.
 */

/**
 * @typedef {object} LODConfig
 * @property {LODLevel[]} levels - Array of LOD levels sorted by distance.
 * @property {number} [hysteresis=0.1] - Prevents rapid LOD switching (10% default).
 * @property {number} [updateInterval=100] - MS between LOD updates.
 */

/**
 * LODManager - Level of Detail system for performance optimization.
 * Manages LOD levels for models and sprites based on camera distance.
 * Supports smooth transitions between LOD levels with hysteresis.
 */
export default class LODManager {
  /**
   * Creates an instance of LODManager.
   * @param {import('./manager.js').default} renderManager - The render manager instance.
   */
  constructor(renderManager) {
    /** @type {import('./manager.js').default} */
    this.renderManager = renderManager;

    /** @type {Map<string, LODConfig>} Entity ID -> LOD config */
    this.lodConfigs = new Map();

    /** @type {Map<string, number>} Entity ID -> Current LOD index */
    this.currentLOD = new Map();

    /** @type {number} Last update timestamp */
    this.lastUpdateTime = 0;

    /** @type {number} Default update interval in ms */
    this.updateInterval = 100;

    /** @type {LODLevel[]} Default LOD levels */
    this.defaultLevels = [
      { distance: 10, detail: 1.0 }, // Full detail within 10 units
      { distance: 25, detail: 0.75 }, // 75% detail 10-25 units
      { distance: 50, detail: 0.5 }, // 50% detail 25-50 units
      { distance: 100, detail: 0.25 }, // 25% detail 50-100 units
      { distance: Infinity, detail: 0.1 }, // 10% detail beyond 100 units
    ];

    /** @type {boolean} Whether LOD is globally enabled */
    this.enabled = true;

    /** @type {boolean} Debug mode shows LOD level changes */
    this.debug = false;
  }

  /**
   * Registers an entity with custom LOD configuration.
   * @param {string} entityId - Unique entity identifier.
   * @param {LODConfig} config - LOD configuration.
   */
  register(entityId, config) {
    const sortedLevels = [...config.levels].sort((a, b) => a.distance - b.distance);
    this.lodConfigs.set(entityId, {
      levels: sortedLevels,
      hysteresis: config.hysteresis ?? 0.1,
      updateInterval: config.updateInterval ?? this.updateInterval,
    });
    this.currentLOD.set(entityId, 0);
  }

  /**
   * Unregisters an entity from LOD management.
   * @param {string} entityId - Entity to remove.
   */
  unregister(entityId) {
    this.lodConfigs.delete(entityId);
    this.currentLOD.delete(entityId);
  }

  /**
   * Gets LOD configuration for an entity.
   * @param {string} entityId - Entity identifier.
   * @returns {LODConfig|null} Configuration or null if not registered.
   */
  getConfig(entityId) {
    return this.lodConfigs.get(entityId) || null;
  }

  /**
   * Calculates the appropriate LOD level for a given distance.
   * @param {LODLevel[]} levels - LOD levels to check.
   * @param {number} distance - Distance from camera.
   * @param {number} currentLevel - Current LOD level index.
   * @param {number} hysteresis - Hysteresis factor.
   * @returns {number} New LOD level index.
   */
  calculateLODLevel(levels, distance, currentLevel, hysteresis) {
    // Apply hysteresis to prevent rapid switching
    const hysteresisDistance = distance * (1 + hysteresis);

    for (let i = 0; i < levels.length; i++) {
      const level = levels[i];

      // When switching to higher detail (lower index), use normal distance
      // When switching to lower detail (higher index), use hysteresis distance
      const checkDistance = i < currentLevel ? distance : hysteresisDistance;

      if (checkDistance <= level.distance) {
        return i;
      }
    }

    return levels.length - 1;
  }

  /**
   * Gets the LOD detail factor for an entity at a position.
   * Uses default levels if entity is not registered.
   * @param {string} entityId - Entity identifier.
   * @param {Vector|number[]} entityPosition - Entity world position.
   * @returns {LODLevel} Current LOD level with detail factor.
   */
  getLOD(entityId, entityPosition) {
    if (!this.enabled) {
      return { distance: 0, detail: 1.0 };
    }

    const camera = this.renderManager.camera;
    const cameraPos = camera.cameraPosition;

    // Calculate distance from camera
    const pos = entityPosition instanceof Vector ? entityPosition : new Vector(...entityPosition);
    const dx = pos.x - cameraPos.x;
    const dy = pos.y - cameraPos.y;
    const dz = pos.z - cameraPos.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    // Get config or use defaults
    const config = this.lodConfigs.get(entityId);
    const levels = config?.levels || this.defaultLevels;
    const hysteresis = config?.hysteresis ?? 0.1;

    // Get current level
    const currentLevel = this.currentLOD.get(entityId) ?? 0;

    // Calculate new level with hysteresis
    const newLevel = this.calculateLODLevel(levels, distance, currentLevel, hysteresis);

    // Update current level
    this.currentLOD.set(entityId, newLevel);

    if (this.debug && newLevel !== currentLevel) {
      console.log(
        `[LOD] ${entityId}: Level ${currentLevel} -> ${newLevel} (distance: ${distance.toFixed(1)})`
      );
    }

    return levels[newLevel];
  }

  /**
   * Gets the detail factor for an entity (0-1 range).
   * @param {string} entityId - Entity identifier.
   * @param {Vector|number[]} entityPosition - Entity world position.
   * @returns {number} Detail factor (1 = full detail, 0 = minimum detail).
   */
  getDetailFactor(entityId, entityPosition) {
    return this.getLOD(entityId, entityPosition).detail;
  }

  /**
   * Checks if an entity should use its high-detail asset.
   * @param {string} entityId - Entity identifier.
   * @param {Vector|number[]} entityPosition - Entity world position.
   * @param {number} [threshold=0.5] - Threshold for high-detail.
   * @returns {boolean} True if high-detail should be used.
   */
  shouldUseHighDetail(entityId, entityPosition, threshold = 0.5) {
    return this.getDetailFactor(entityId, entityPosition) >= threshold;
  }

  /**
   * Batch update LOD for multiple entities.
   * @param {Array<{id: string, position: Vector|number[]}>} entities - Entities to update.
   * @returns {Map<string, LODLevel>} Map of entity ID to LOD level.
   */
  batchUpdate(entities) {
    const results = new Map();

    for (const entity of entities) {
      results.set(entity.id, this.getLOD(entity.id, entity.position));
    }

    return results;
  }

  /**
   * Gets recommended render settings based on LOD level.
   * @param {number} detailFactor - Detail factor (0-1).
   * @returns {object} Render settings.
   */
  getRenderSettings(detailFactor) {
    return {
      // Skip shadows for low detail objects
      castShadow: detailFactor >= 0.5,
      receiveShadow: detailFactor >= 0.25,

      // Reduce animation quality for distant objects
      animationQuality: detailFactor >= 0.75 ? 'full' : detailFactor >= 0.5 ? 'reduced' : 'minimal',

      // Skip secondary effects for distant objects
      useSecondaryEffects: detailFactor >= 0.75,

      // Reduce texture filtering for distant objects
      textureFiltering: detailFactor >= 0.5 ? 'trilinear' : 'bilinear',

      // Skip normal mapping for very distant objects
      useNormalMap: detailFactor >= 0.5,

      // Reduce particle count for distant emitters
      particleCountMultiplier: Math.max(0.1, detailFactor),
    };
  }

  /**
   * Sets global LOD bias. Lower values = higher detail at distance.
   * @param {number} bias - Bias multiplier (default 1.0).
   */
  setBias(bias) {
    // Adjust all default level distances by bias
    this.defaultLevels = this.defaultLevels.map((level, i) => ({
      ...level,
      distance: level.distance === Infinity ? Infinity : this.defaultLevels[i].distance * bias,
    }));
  }

  /**
   * Enables or disables LOD system globally.
   * @param {boolean} enabled - Whether LOD is enabled.
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * Resets all LOD tracking state.
   */
  reset() {
    this.currentLOD.clear();
  }

  /**
   * Gets statistics about LOD usage.
   * @returns {object} LOD statistics.
   */
  getStats() {
    const stats = {
      totalEntities: this.currentLOD.size,
      byLevel: new Map(),
    };

    for (const [, level] of this.currentLOD) {
      const count = stats.byLevel.get(level) || 0;
      stats.byLevel.set(level, count + 1);
    }

    return stats;
  }
}
