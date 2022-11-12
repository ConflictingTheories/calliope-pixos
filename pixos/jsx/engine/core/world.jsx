/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2022 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */

import Zone from './zone.jsx';
import ActionQueue from './queue.jsx';
import { Direction } from '@Engine/utils/enums.jsx';
import { EventLoader } from '@Engine/utils/loaders/index.jsx';

export default class World {
  constructor(engine, id) {
    this.id = id;
    this.engine = engine;
    this.zoneDict = {};
    this.zoneList = [];
    this.spriteDict = {};
    this.spriteList = [];
    this.objectDict = {};
    this.objectList = [];
    this.tilesetDict = {};
    this.tilesetList = [];
    this.eventList = [];
    this.eventDict = {};
    this.lastKey = new Date().getTime();
    this.isPaused = true;
    this.afterTickActions = new ActionQueue();
    this.sortZones = this.sortZones.bind(this);
    this.canWalk = this.canWalk.bind(this);
    this.pathFind = this.pathFind.bind(this);
    this.menuConfig = {
      start: {
        onOpen: (menu) => {
          // auto-close - do nothing
          menu.completed = true;
        },
      },
    };
  }

  // push action into next frame
  runAfterTick(action) {
    this.afterTickActions.add(action);
  }

  // Sort zones for correct render order
  sortZones() {
    this.zoneList.sort((a, b) => a.bounds[1] - b.bounds[1]);
  }

  // todo -- setup method to read in json objects from zip

  // Fetch and Load Zone
  async loadZoneFromZip(zoneId, zip, skipCache = false) {
    // check cache ?
    if (!skipCache && this.zoneDict[zoneId]) return this.zoneDict[zoneId];

    let zoneJson = JSON.parse(await zip.file('maps/' + zoneId + '/map.json').async('string')); // main map file (/zip/maps/{zoneId}/map.json)
    let cellJson = JSON.parse(await zip.file('maps/' + zoneId + '/cells.json').async('string')); // cells (/zip/maps/{zoneId}/cells.json)

    // Fetch Zone Remotely (allows for custom maps - with approved sprites / actions)
    let z = new Zone(zoneId, this);
    await z.loadZoneFromZip(zoneJson, cellJson, zip);

    // audio
    this.zoneList.map((x) => {
      if (x.audio) {
        x.audio.pauseAudio();
      }
    });
    if (z.audio) {
      console.log(z.audio);
      z.audio.playAudio();
    }
    // add zone
    this.zoneDict[zoneId] = z;
    this.zoneList.push(z);

    // Sort for correct render order
    z.runWhenLoaded(this.sortZones);
    return z;
  }

  // Fetch and Load Zone
  async loadZone(zoneId, remotely = false, skipCache = false) {
    if (!skipCache && this.zoneDict[zoneId]) return this.zoneDict[zoneId];
    // Fetch Zone Remotely (allows for custom maps - with approved sprites / actions)
    let z = new Zone(zoneId, this);
    if (remotely) await z.loadRemote();
    else await z.load();
    // audio
    this.zoneList.map((x) => {
      if (x.audio) {
        x.audio.pauseAudio();
      }
    });
    if (z.audio) {
      console.log(z.audio);
      z.audio.playAudio();
    }
    // add zone
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
        if (zone.audio) {
          zone.audio.pauseAudio();
        }
        zone.removeAllSprites();
        zone.runWhenDeleted();
      }
    });
    delete this.zoneDict[zoneId];
  }

  // Remove Zones
  removeAllZones() {
    this.zoneList.map((z) => {
      if (z.audio) {
        z.audio.pauseAudio();
      }
      z.removeAllSprites();
      z.runWhenDeleted();
    });
    this.zoneList = [];
    this.zoneDict = {};
  }

  // Update
  tick(time) {
    for (let z in this.zoneDict) this.zoneDict[z]?.tick(time, this.isPaused);
    this.afterTickActions.run(time);
  }

  // read input (HIGHEST LEVEL)
  checkInput(time) {
    if (time > this.lastKey + 200) {
      let touchmap = this.engine.gamepad.checkInput();
      this.lastKey = time;
      // start
      if (this.engine.gamepad.keyPressed('start')) {
        touchmap['start'] = 0;
      }
      // select
      if (this.engine.gamepad.keyPressed('select')) {
        touchmap['select'] = 0;
        this.engine.toggleFullscreen();
      }
    }
  }

  // open start menu
  startMenu(menuConfig, defaultMenus = ['start']) {
    this.addEvent(
      new EventLoader(this.engine, 'menu', [menuConfig ?? this.menuConfig, defaultMenus, false, { autoclose: false, closeOnEnter: true }], this)
    );
  }

  // Add Event to Queue
  addEvent(event) {
    if (this.eventDict[event.id]) this.removeAction(event.id);
    this.eventDict[event.id] = event;
    this.eventList.push(event);
  }

  // Remove Action
  removeAction(id) {
    this.eventList = this.eventList.filter((event) => event.id !== id);
    delete this.eventDict[id];
  }

  // Remove Action
  removeAllActions() {
    this.eventList = [];
    this.eventDict = {};
  }

  // Tick
  tickOuter(time) {
    // read input
    this.checkInput(time);
    // Sort activities by increasing startTime, then by id
    this.eventList.sort((a, b) => {
      let dt = a.startTime - b.startTime;
      if (!dt) return dt;
      return a.id > b.id ? 1 : -1;
    });
    // Run & Queue for Removal when complete
    let toRemove = [];
    this.eventList.forEach((event) => {
      if (!event.loaded || event.startTime > time || (event.pausable && this.isPaused)) return;
      if (event.tick(time)) {
        toRemove.push(event); // remove from backlog
        event.onComplete(); // call completion handler
      }
    });
    // clear completed activities
    toRemove.forEach((event) => this.removeAction(event.id));
    // tick
    if (this.tick && !this.isPaused) this.tick(time);
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
        .sort((a, b) => Math.min(Math.abs(to[0] - a[0]) - Math.abs(to[0] - b[0]), Math.abs(to[1] - a[1]) - Math.abs(to[1] - b[1])))
        .map((neigh) => buildPath(neigh, [...path, [neighbour[0], neighbour[1], 600]]))
        .filter((x) => x)
        .flat();
    }
    // Fetch Steps
    steps = world
      .getNeighbours(x, y)
      .sort((a, b) => Math.min(Math.abs(to[0] - a[0]) - Math.abs(to[0] - b[0]), Math.abs(to[1] - a[1]) - Math.abs(to[1] - b[1])))
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
