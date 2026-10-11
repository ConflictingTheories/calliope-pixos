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
 * PortalManager: links doorways between maps.
 *
 * Each portal has:
 * - id: unique within its map (e.g. "village-north-door")
 * - x, y: tile position
 * - targetMap: which map it leads to
 * - targetPortal: which portal you arrive at (by id)
 *
 * When the avatar enters a portal, they're placed at the target
 * portal's position — not the map's default spawn.
 *
 * If targetPortal is missing or not found, falls back to default spawn.
 */

export default class PortalManager {
  constructor(world) {
    this.world = world;
    this.portalsByMap = {}; // mapId -> [{id, x, y, targetMap, targetPortal}]
  }

  /**
   * Register portals for a map (from map.json).
   */
  registerPortals(mapId, portals) {
    this.portalsByMap[mapId] = portals || [];
  }

  /**
   * Get all portals for a map.
   */
  getPortals(mapId) {
    return this.portalsByMap[mapId] || [];
  }

  /**
   * Find a portal by ID in a map.
   */
  findPortal(mapId, portalId) {
    return this.getPortals(mapId).find(p => p.id === portalId) || null;
  }

  /**
   * Find which portal the avatar is standing on (if any).
   */
  getPortalAt(mapId, x, y) {
    return this.getPortals(mapId).find(
      p => Math.round(p.x) === Math.round(x) && Math.round(p.y) === Math.round(y)
    ) || null;
  }

  /**
   * Resolve where the avatar should appear when entering via a portal.
   * Returns {x, y} or null if no linked portal found.
   */
  resolveDestination(portal) {
    if (!portal.targetMap || !portal.targetPortal) {
      return null;
    }
    const dest = this.findPortal(portal.targetMap, portal.targetPortal);
    if (!dest) {
      console.warn(
        `PortalManager: target portal "${portal.targetPortal}" not found in "${portal.targetMap}"`
      );
      return null;
    }
    // Offset by 1 tile so avatar doesn't stand ON the portal
    // (prevents immediate re-trigger)
    return {
      x: dest.x,
      y: dest.y + 1,
      facing: 'Up', // Face back toward the portal
    };
  }

  /**
   * Validate all portal links. Returns list of broken links.
   */
  validate() {
    const broken = [];
    for (const [mapId, portals] of Object.entries(this.portalsByMap)) {
      for (const portal of portals) {
        if (!portal.targetMap) {
          broken.push({ map: mapId, portal: portal.id, issue: 'missing targetMap' });
        } else if (portal.targetPortal) {
          const dest = this.findPortal(portal.targetMap, portal.targetPortal);
          if (!dest) {
            broken.push({
              map: mapId,
              portal: portal.id,
              issue: `target portal "${portal.targetPortal}" not found in "${portal.targetMap}"`,
            });
          }
        }
      }
    }
    return broken;
  }
}
