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

import PermissionEvaluator from '../permissions/evaluator.js';
import Zone from './zone.js';

/**
 * WorldMerger — "mix and merge and meld" worlds and spritzes.
 *
 * Merges zones from a source spritz package into the live world:
 * - Shared universes: multiple creators' zones coexist under namespaces
 * - Crossovers: a zone from spritz A appears inside spritz B
 * - Mods/expansions: community zones grafted onto a base game
 *
 * Permissions are enforced: the source package's `permissions.merge`
 * policy is checked before any content is loaded. Private packages
 * cannot be merged; allowlist packages require the identity to be listed.
 *
 * Merged zones are namespaced (`{namespace}:{zoneId}`) so IDs never
 * collide with the host world's zones. Portals between merged zones
 * are rewired to their namespaced targets.
 */
export default class WorldMerger {
  /**
   * @param {import('./world.js').default} world - The host world.
   * @param {PermissionEvaluator} permissionEvaluator - Evaluates merge permissions.
   */
  constructor(world, permissionEvaluator = null) {
    this.world = world;
    this.engine = world.engine;
    this.permissionEvaluator = permissionEvaluator || new PermissionEvaluator(null);
  }

  /**
   * Merges all (or selected) zones from a source bundle into the world.
   *
   * @param {object} sourceBundle - { manifest, zip } — validated spritz package.
   * @param {object} options
   * @param {string} options.namespace - Namespace for merged zones (default: source manifest id).
   * @param {string[]} options.zones - Zone IDs to merge (default: all in manifest.maps).
   * @param {'rename'|'skip'|'overwrite'} options.onConflict - ID conflict policy (default 'rename').
   * @returns {Promise<object>} Merge report { namespace, zonesAdded, zonesSkipped, conflicts }.
   * @throws {Error} If merge permission is denied.
   */
  async mergePackage(sourceBundle, options = {}) {
    const { manifest, zip } = sourceBundle;
    if (!manifest || !zip) {
      throw new Error('mergePackage requires { manifest, zip }');
    }

    // Permission gate
    if (!this.permissionEvaluator.canMerge(manifest)) {
      throw new Error(
        `Merge denied: package "${manifest.title || manifest.id}" does not allow merging ` +
        `(permissions.merge = "${manifest.permissions?.merge || 'private'}")`
      );
    }

    const namespace = options.namespace || manifest.id || 'merged';
    const zoneIds = options.zones || manifest.maps || [];
    const onConflict = options.onConflict || 'rename';

    const report = { namespace, zonesAdded: [], zonesSkipped: [], conflicts: [] };

    for (const zoneId of zoneIds) {
      const namespacedId = `${namespace}:${zoneId}`;
      try {
        await this.mergeZone(zip, zoneId, namespacedId, { onConflict, namespace });
        report.zonesAdded.push(namespacedId);
      } catch (e) {
        if (e.code === 'ZONE_CONFLICT' && onConflict === 'skip') {
          report.zonesSkipped.push(namespacedId);
          report.conflicts.push({ zoneId: namespacedId, reason: e.message });
        } else {
          throw e;
        }
      }
    }

    return report;
  }

  /**
   * Merges a single zone from a source zip under a namespaced ID.
   */
  async mergeZone(zip, sourceZoneId, namespacedId, { onConflict, namespace }) {
    const world = this.world;

    if (world.zoneDict[namespacedId]) {
      if (onConflict === 'skip') {
        const err = new Error(`Zone ${namespacedId} already exists`);
        err.code = 'ZONE_CONFLICT';
        throw err;
      }
      if (onConflict === 'rename') {
        let n = 2;
        let candidate = `${namespacedId}#${n}`;
        while (world.zoneDict[candidate]) candidate = `${namespacedId}#${++n}`;
        namespacedId = candidate;
      }
      // 'overwrite': fall through and replace
    }

    // Load zone data from the source zip's original paths
    let zoneJson;
    let cellJson;
    try {
      zoneJson = JSON.parse(await zip.file(`maps/${sourceZoneId}/map.json`).async('string'));
      cellJson = JSON.parse(await zip.file(`maps/${sourceZoneId}/cells.json`).async('string'));
    } catch (e) {
      throw new Error(`Cannot read zone "${sourceZoneId}" from source bundle: ${e.message}`);
    }

    // Rewire portals: point at namespaced targets within this merge
    if (zoneJson.portals) {
      for (const portal of zoneJson.portals) {
        if (portal.targetZone && !portal.targetZone.includes(':')) {
          portal.targetZone = `${namespace}:${portal.targetZone}`;
        }
      }
    }

    // Tag the zone with merge provenance
    zoneJson.mergedFrom = {
      namespace,
      sourceZoneId,
      sourcePackage: zoneJson.packageId || 'unknown',
      mergedAt: new Date().toISOString(),
    };

    const zone = new Zone(namespacedId, world);
    await zone.loadZoneFromZip(zoneJson, cellJson, zip);

    world.zoneDict[namespacedId] = zone;
    world.zoneList.push(zone);

    // Register rewired portals
    try {
      if (zoneJson.portals) {
        world.portalManager.registerPortals(namespacedId, zoneJson.portals);
      }
    } catch (e) {
      console.warn(`WorldMerger: portal registration failed for ${namespacedId}`, e);
    }

    if (typeof world.sortZones === 'function') {
      zone.runWhenLoaded(world.sortZones);
    }

    return zone;
  }

  /**
   * Lists zones in the world grouped by namespace.
   * @returns {Map<string, string[]>} namespace -> zone IDs
   */
  zonesByNamespace() {
    const groups = new Map();
    for (const zoneId of Object.keys(this.world.zoneDict || {})) {
      const idx = zoneId.indexOf(':');
      const ns = idx > 0 ? zoneId.slice(0, idx) : 'local';
      if (!groups.has(ns)) groups.set(ns, []);
      groups.get(ns).push(zoneId);
    }
    return groups;
  }
}
