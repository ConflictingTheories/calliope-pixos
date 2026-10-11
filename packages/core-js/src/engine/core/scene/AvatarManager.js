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
 * AvatarManager: the player character as a persistent traveler.
 *
 * The avatar is NOT part of any map's sprite list. It exists independently
 * and is placed into each map when loaded.
 *
 * - On initial game start: placed at map's default spawn
 * - On portal travel: placed at the linked portal's destination
 * - State (position, facing, inventory, stats) persists across maps
 */

export default class AvatarManager {
  constructor(world) {
    this.world = world;
    this.avatar = null;
    this.state = {
      // Persistent state that survives map changes
      inventory: [],
      stats: {},
      flags: {},
    };
  }

  /**
   * Create the avatar (once per game session).
   */
  createAvatar(spriteType = 'characters/male') {
    if (this.avatar) return this.avatar;

    // Avatar is a special sprite, not tied to any map
    this.avatar = {
      id: 'avatar',
      type: spriteType,
      pos: [0, 0, 0],
      facing: 'Down',
      isAvatar: true,
      // Reference persistent state
      get inventory() { return this._manager.state.inventory; },
      get stats() { return this._manager.state.stats; },
      _manager: this,
    };
    return this.avatar;
  }

  /**
   * Place avatar in a map.
   * @param {string} mapId - Target map
   * @param {object} options - {x, y, facing} or {viaPortal}
   */
  placeInMap(mapId, options = {}) {
    const avatar = this.avatar;
    if (!avatar) {
      console.warn('AvatarManager: no avatar created yet');
      return;
    }

    let x, y, facing;

    if (options.viaPortal && options.portal) {
      // Arriving through a portal — use linked destination
      const dest = this.world.portalManager.resolveDestination(options.portal);
      if (dest) {
        x = dest.x;
        y = dest.y;
        facing = dest.facing;
      }
    }

    // Fall back to explicit coords or map default
    if (x === undefined) {
      x = options.x;
      y = options.y;
      facing = options.facing || 'Down';
    }

    if (x === undefined) {
      // Last resort: map default spawn
      const map = this.world.getMap(mapId);
      const spawn = map?.defaultSpawn || map?.spawn || { x: 0, y: 0 };
      x = spawn.x;
      y = spawn.y;
      facing = spawn.facing || 'Down';
      console.log(`AvatarManager: using default spawn for ${mapId}`);
    }

    avatar.pos = [x, y, 0];
    avatar.facing = facing;
    avatar.currentMap = mapId;

    // Inject into the zone's sprite list
    const zone = this.world.getZone(mapId);
    if (zone && !zone.spriteList.find(s => s.id === 'avatar')) {
      zone.spriteList.push(avatar);
      zone.spriteDict['avatar'] = avatar;
    }

    return avatar;
  }

  /**
   * Remove avatar from current map (before loading new one).
   */
  removeFromMap(mapId) {
    const zone = this.world.getZone(mapId);
    if (zone) {
      zone.spriteList = zone.spriteList.filter(s => s.id !== 'avatar');
      delete zone.spriteDict['avatar'];
    }
  }

  /**
   * Travel through a portal to another map.
   */
  async travelViaPortal(portal) {
    const currentMap = this.avatar?.currentMap;
    if (currentMap) {
      this.removeFromMap(currentMap);
    }

    // Load the target map
    await this.world.loadZone(portal.targetMap);

    // Place avatar at destination
    this.placeInMap(portal.targetMap, { viaPortal: true, portal });
  }

  /**
   * Save persistent state (for save games).
   */
  serialize() {
    return {
      ...this.state,
      avatarPos: this.avatar?.pos,
      avatarFacing: this.avatar?.facing,
      currentMap: this.avatar?.currentMap,
      spriteType: this.avatar?.type,
    };
  }

  /**
   * Restore persistent state (from save game).
   */
  deserialize(data) {
    this.state.inventory = data.inventory || [];
    this.state.stats = data.stats || {};
    this.state.flags = data.flags || {};
    if (data.spriteType) {
      this.createAvatar(data.spriteType);
    }
    if (this.avatar) {
      this.avatar.pos = data.avatarPos || [0, 0, 0];
      this.avatar.facing = data.avatarFacing || 'Down';
      this.avatar.currentMap = data.currentMap;
    }
  }
}
