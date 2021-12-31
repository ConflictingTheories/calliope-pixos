/*                                                 *\
** ----------------------------------------------- **
**             Calliope - Site Generator   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2021 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */

import Zone from "./zone.jsx";
import ActionQueue from "./queue.jsx";
import { Direction } from "../utils/enums.jsx";

export default class World {
  constructor(engine) {
    this.engine = engine;
    this.zoneDict = {};
    this.zoneList = [];
    this.afterTickActions = new ActionQueue();
    this.sortZones = this.sortZones.bind(this);
    this.canWalk = this.canWalk.bind(this);
    this.pathFind = this.pathFind.bind(this);
  }

  // push action into next frame
  runAfterTick(action) {
    this.afterTickActions.add(action);
  }

  // Sort zones for correct render order
  sortZones() {
    this.zoneList.sort((a, b) => a.bounds[1] - b.bounds[1]);
  }

  // Fetch and Load Zone
  async loadZone(zoneId, remotely = false) {
    if (this.zoneDict[zoneId]) return this.zoneDict[zoneId];
    // Fetch Zone Remotely (allows for custom maps - with approved sprites / actions)
    let z = new Zone(zoneId, this);
    if (remotely) await z.loadRemote();
    else await z.load();
    this.zoneDict[zoneId] = z;
    this.zoneList.push(z);
    // Sort for correct render order
    z.runWhenLoaded(this.sortZones);
    return z;
  }

  // Remove Zone
  removeZone(zoneId) {
    this.zoneList = this.zoneList.filter((zone) => {
      if (zone.id !== zoneId) {
        return true;
      } else {
        zone.removeAllSprites();
      }
    });
    delete this.zoneDict[zoneId];
  }

  // Remove Zones
  removeAllZones() {
    this.zoneList = [];
    this.zoneDict = {};
  }

  // Update
  tick(time) {
    for (let z in this.zoneDict) this.zoneDict[z]?.tick(time);
    this.afterTickActions.run(time);
  }

  // Draw Each Zone
  draw() {
    for (let z in this.zoneDict) this.zoneDict[z].draw(this.engine);
  }

  // Check for Cell inclusion
  zoneContaining(x, y) {
    for (let z in this.zoneDict) {
      let zone = this.zoneDict[z];
      if (zone.loaded && zone.isInZone(x, y)) return zone;
    }
    return null;
  }

  /**
   * Finds a path if one exists between two points on the world
   * @param Vector from
   * @param Vector to
   */
  pathFind(from, to) {
    // memory
    let steps = [],
      visited = [],
      found = false,
      world = this,
      x = from[0],
      y = from[1];
    // loop through tiles
    function buildPath(neighbour, path) {
      let jsonNeighbour = JSON.stringify([neighbour[0], neighbour[1]]);
      if (found) return false; // ignore anything further
      if (neighbour[0] == to[0] && neighbour[1] == to[1]) {
        // found it
        found = true;
        // if final location is blocked, stop in front
        if (!world.canWalk(neighbour, jsonNeighbour, visited)) {
          return [found, [...path]];
        }
        // otherwise return whole path
        return [found, [...path, to]];
      }
      // Check walkability
      if (!world.canWalk(neighbour, jsonNeighbour, visited)) return false;
      // Visit Node & continue Search
      visited.push(jsonNeighbour);
      return world
        .getNeighbours(...neighbour)
        .map((neigh) => buildPath(neigh, [...path, [neighbour[0], neighbour[1], 600]]))
        .filter((x) => x)
        .flat();
    }
    // Fetch Steps
    steps = world
      .getNeighbours(x, y)
      .map((neighbour) => buildPath(neighbour, [[from[0], from[1], 600]]))
      .filter((x) => x[0]);
    // Flatten Path from Segments
    return steps.flat();
  }

  /**
   *  Gets adjacencies
   * @param int x
   * @param int y
   */
  getNeighbours(x, y) {
    let top = [x, y + 1, Direction.Up],
      bottom = [x, y - 1, Direction.Down],
      left = [x - 1, y, Direction.Left],
      right = [x + 1, y, Direction.Right];
    return [top, left, right, bottom];
  }

  // Should we skip?
  canWalk(neighbour, jsonNeighbour, visited) {
    let zone = this.zoneContaining(...neighbour);
    if (
      visited.indexOf(jsonNeighbour) >= 0 ||
      !zone ||
      !zone.isWalkable(...neighbour) ||
      !zone.isWalkable(neighbour[0], neighbour[1], Direction.reverse(neighbour[2]))
    ) {
      return false;
    }
    return true;
  }
}

// Pathfinding Algorithm
// ---------------------
// Start Point
// Goal

// Path []
// Current Point

// --- Func
//
// Get Neighbours - Foreach Neighbour
//  - Check Neighbour
//    - Check Goal
//        - Found it - Return Path
//        - Else
//          - Get Neighbours

// ----

// GetNeighbours (x, y){
//    results = []
//    top = (x,y+1)
//    bottom = (x,y-1)
//    left = (x-1,y)
//    right = (x+1,y)
//
//    for each above
//      if (isWalkable()) add to results
//
//    return results
// }

// ----
