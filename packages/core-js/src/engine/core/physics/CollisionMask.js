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
 * CollisionMask - Bit-mask system for collision layers.
 * Allows filtering collisions by layer (e.g., players don't collide with items).
 * 
 * Usage:
 *   const PLAYER_LAYER = 0x01;  // Bit 0
 *   const ENEMY_LAYER = 0x02;   // Bit 1
 *   const ITEM_LAYER = 0x04;    // Bit 2
 *   const WALL_LAYER = 0x08;    // Bit 3
 * 
 *   body.collisionLayer = PLAYER_LAYER;
 *   body.collisionMask = ENEMY_LAYER | WALL_LAYER; // Collide with enemies and walls
 */
export default class CollisionMask {
  /**
   * Predefined collision layers.
   */
  static Layers = {
    DEFAULT: 0x01,      // Bit 0
    PLAYER: 0x02,       // Bit 1
    ENEMY: 0x04,        // Bit 2
    ITEM: 0x08,         // Bit 3
    WALL: 0x10,         // Bit 4
    TRIGGER: 0x20,      // Bit 5
    PROJECTILE: 0x40,   // Bit 6
    NPC: 0x80,          // Bit 7
    ALL: 0xFF,          // All layers
  };

  /**
   * Checks if two collision masks should collide.
   * @param {number} layerA - Layer of body A.
   * @param {number} maskA - Collision mask of body A.
   * @param {number} layerB - Layer of body B.
   * @param {number} maskB - Collision mask of body B.
   * @returns {boolean} True if bodies should collide.
   */
  static shouldCollide(layerA, maskA, layerB, maskB) {
    // A collides with B if A's mask includes B's layer AND B's mask includes A's layer
    return (maskA & layerB) !== 0 && (maskB & layerA) !== 0;
  }

  /**
   * Creates a collision mask from layer names.
   * @param {Array<string>} layerNames - Array of layer names (e.g., ['PLAYER', 'ENEMY']).
   * @returns {number} Combined layer bitmask.
   */
  static createMask(layerNames) {
    let mask = 0;
    for (const name of layerNames) {
      if (this.Layers[name]) {
        mask |= this.Layers[name];
      }
    }
    return mask;
  }

  /**
   * Gets layer names from a mask.
   * @param {number} mask - Collision mask.
   * @returns {Array<string>} Array of layer names.
   */
  static getLayerNames(mask) {
    const names = [];
    for (const [name, value] of Object.entries(this.Layers)) {
      if (name !== 'ALL' && (mask & value) !== 0) {
        names.push(name);
      }
    }
    return names;
  }
}
