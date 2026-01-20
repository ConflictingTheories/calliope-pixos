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
 * @fileoverview World class for Pixos game engine.
 * Manages zones, sprites, and game state.
 */

import Zone from './zone.js';
import { debug } from '@Engine/utils/debug-logger.js';
import ModeManager from '../mode/manager.js';
import ActionQueue from '../queue/index.js';
import { Direction } from '@Engine/utils/enums.js';
import { EventLoader } from '@Engine/utils/loaders/index.js';
import Avatar from './avatar.js';
import NetworkAvatarManager from './NetworkAvatarManager.js';
import { Vector } from '@Engine/utils/math/vector.js';
import Pathfinder from './Pathfinder.js';
/**
 * @typedef {object} MenuConfig
 * @property {object} start - Start menu configuration.
 */

/**
 * World - Manages the game world including zones, sprites, and events.
 */
export default class World {
  /**
   * Creates an instance of World.
   * @param {object} spritz - The spritz instance.
   * @param {string} id - The world ID.
   */
  constructor(spritz, id) {
    /** @type {string} */
    this.id = id;
    /** @type {object} */
    this.spritz = spritz;
    /** @type {number} */
    this.objId = Math.round(Math.random() * 1000) + 1;
    /** @type {import('../index.js').default} */
    this.engine = spritz.engine;
    /** @type {Object.<string, Zone>} */
    this.zoneDict = {};
    /** @type {Zone[]} */
    this.zoneList = [];
    /** @type {NetworkAvatarManager} */
    this.networkAvatars = new NetworkAvatarManager(this);
    /** @type {Object.<string, object>} */
    this.spriteDict = {};
    /** @type {object[]} */
    this.spriteList = [];
    /** @type {Object.<string, object>} */
    this.objectDict = {};
    /** @type {object[]} */
    this.objectList = [];
    /** @type {Object.<string, object>} */
    this.tilesetDict = {};
    /** @type {object[]} */
    this.tilesetList = [];
    /** @type {object[]} */
    this.eventList = [];
    /** @type {Object.<string, object>} */
    this.eventDict = {};
    /** @type {number} */
    this.lastKey = new Date().getTime();
    /** @type {number} */
    this.lastZoneTransitionTime = 0;
    /** @type {boolean} */
    this.isPaused = true;
    /** @type {ModeManager} */
    this.modeManager = new ModeManager(this);
    /** @type {ActionQueue} */
    this.afterTickActions = new ActionQueue();
    /** @type {MenuConfig} */
    this.menuConfig = {
      start: {
        // onOpen: (menu) => {
        //   menu.completed = true;
        // },
      },
    };
    /** @type {string|null} */
    this.currentZoneId = null;
  }

  addRemoteAvatar(clientId, avatarData) {
    return this.networkAvatars.addRemoteAvatar(clientId, avatarData);
  }

  removeRemoteAvatar(clientId) {
    return this.networkAvatars.removeRemoteAvatar(clientId);
  }

  updateRemoteAvatar(clientId, avatarData) {
    return this.networkAvatars.updateRemoteAvatar(clientId, avatarData);
  }

  applyRemoteAction(clientId, action, params, spriteId) {
    return this.networkAvatars.applyRemoteAction(clientId, action, params, spriteId);
  }

  get remoteAvatars() {
    return this.networkAvatars.remoteAvatars;
  }


  /**
   * Creates an avatar in the world.
   * @param {object} avatarData - The avatar data.
   * @returns {Avatar|null} The created avatar or null.
   */
  createAvatar = (avatarData) => {
    const zone = this.zoneContaining(avatarData.x, avatarData.y);
    if (zone) {
      const avatar = new Avatar(this.engine);
      // leave z undefined so Avatar.onLoad will compute using hotspotOffset
      avatar.onLoad({
        zone: zone,
        id: avatarData.id,
        pos: new Vector(avatarData.x, avatarData.y),
        ...avatarData
      });
      zone.addSprite(avatar);
      return avatar;
    }
    return null;
  };

  /**
   * Removes an avatar from the world.
   * @param {Avatar} avatar - The avatar to remove.
   */
  removeAvatar = (avatar) => {
    const zone = avatar.zone;
    if (zone) {
      zone.removeSprite(avatar);
    }
  };

  /**
   * Gets the avatar sprite.
   * @returns {object|null} The avatar sprite.
   */
  getAvatar = () => {
    return this.spriteDict['avatar'];
  };

  /**
   * Pushes an action to run after the current tick.
   * @param {function(): void} action - The action to run.
   */
  runAfterTick = (action) => {
    this.afterTickActions.add(action);
  };

  /**
   * Sorts zones for correct render order.
   */
  sortZones = () => {
    this.zoneList.sort((a, b) => a.bounds[1] - b.bounds[1]);
  };



  /**
   * Loads a zone from a zip archive.
   * @param {string} zoneId - The zone ID.
   * @param {object} zip - The zip archive.
   * @param {boolean} [skipCache=false] - Whether to skip cache.
   * @param {object} [transitionParams={ effect: 'cross', duration: 500 }] - Transition parameters.
   * @returns {Promise<Zone>} The loaded zone.
   */
  loadZoneFromZip = async (zoneId, zip, skipCache = false, transitionParams = { effect: 'cross', duration: 500 }) => {
    return this._withTransition(transitionParams, async () => {
      if (!skipCache && this.zoneDict[zoneId]) return this.zoneDict[zoneId];
      const engine = this.engine;

      debug('World', 'Loading Zone from Zip:', zoneId);

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
        z.audio.playAudio();
      }

      // add zone
      this.zoneDict[zoneId] = z;
      this.zoneList.push(z);

      // Sort for correct render order
      z.runWhenLoaded(this.sortZones);

      this.currentZoneId = zoneId;
      return z;
    });
  };

  /**
   * Loads a zone.
   * @param {string} zoneId - The zone ID.
   * @param {boolean} [remotely=false] - Whether to load remotely.
   * @param {boolean} [skipCache=false] - Whether to skip cache.
   * @param {object} [transitionParams={ effect: 'cross', duration: 500 }] - Transition parameters.
   * @returns {Promise<Zone>} The loaded zone.
   */
  loadZone = async (zoneId, remotely = false, skipCache = false, transitionParams = { effect: 'cross', duration: 500 }) => {
    return this._withTransition(transitionParams, async () => {
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

      this.currentZoneId = zoneId;
      return z;
    });
  };

  /**
   * Helper to wrap a function with a screen transition.
   * @private
   */
  _withTransition = async (transitionParams, fn) => {
    const engine = this.engine;
    let useTransition = false;
    if (transitionParams && engine?.renderManager) {
      const rm = engine.renderManager;
      const now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
      const timeSinceLast = now - (rm.transitionStartTime + rm.transitionDuration);
      if (!rm.isTransitioning && timeSinceLast > 100) {
        useTransition = true;
      }
    }

    if (useTransition) {
      const { effect = 'cross', duration = 500 } = transitionParams;
      await engine.renderManager.startTransition({ effect, direction: 'out', duration });
    }

    const result = await fn();

    if (useTransition) {
      const { effect = 'cross', duration = 500 } = transitionParams;
      await engine.renderManager.startTransition({ effect, direction: 'in', duration });
    }

    return result;
  };


  /**
   * Removes a zone.
   * @param {string} zoneId - The zone ID to remove.
   */
  removeZone = (zoneId) => {
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
  };

  /**
   * Removes all zones.
   */
  removeAllZones = () => {
    this.zoneList.map((z) => {
      if (z.audio) {
        z.audio.pauseAudio();
      }
      z.removeAllSprites();
      z.runWhenDeleted();
    });
    this.zoneList = [];
    this.zoneDict = {};
  };

  /**
   * Updates the world.
   * @param {number} time - The current time.
   */
  tick = (time) => {
    for (let z in this.zoneDict) this.zoneDict[z]?.tick(time, this.isPaused);
    this.afterTickActions.run(time);
  };

  /**
   * Checks input at the world level.
   * @param {number} time - The current time.
   */
  checkInput = (time) => {
    if (time > this.lastKey + 200) {
      this.lastKey = time;

      if (this.modeManager && this.modeManager.handleInput) {
        try {
          if (this.modeManager.handleInput(time)) return;
        } catch (e) { console.warn('mode input handler error', e); }
      }
      let touchmap = this.engine.gamepad.checkInput();
      if (this.engine.gamepad.keyPressed('start')) {
        touchmap['start'] = 0;
      }
      if (this.engine.gamepad.keyPressed('select')) {
        touchmap['select'] = 0;
        this.engine.toggleFullscreen();
      }
    }
  };

  /**
   * Opens the start menu.
   * @param {object} menuConfig - The menu configuration.
   * @param {string[]} [defaultMenus=['start']] - Default menus.
   */
  startMenu = (menuConfig, defaultMenus = ['start']) => {
    this.addEvent(
      new EventLoader(this.engine, 'menu', [menuConfig ?? this.menuConfig, defaultMenus, false, { autoclose: false, closeOnEnter: true }], this)
    );
  };

  /**
   * Adds an event to the queue.
   * @param {object} event - The event to add.
   */
  addEvent = (event) => {
    if (this.eventDict[event.id]) this.removeAction(event.id);
    this.eventDict[event.id] = event;
    this.eventList.push(event);
  };

  /**
   * Removes an action.
   * @param {string} id - The action ID.
   */
  removeAction = (id) => {
    this.eventList = this.eventList.filter((event) => event.id !== id);
    delete this.eventDict[id];
  };

  /**
   * Removes all actions.
   */
  removeAllActions = () => {
    this.eventList = [];
    this.eventDict = {};
  };

  /**
   * Handles outer tick logic for events and zones.
   * @param {number} time - The current time.
   */
  tickOuter = (time) => {
    this.checkInput(time);
    this.eventList.sort((a, b) => {
      let dt = a.startTime - b.startTime;
      if (!dt) return dt;
      return a.id > b.id ? 1 : -1;
    });
    let toRemove = [];
    this.eventList.forEach((event) => {
      if (!event.loaded || event.startTime > time || (event.pausable && this.isPaused)) return;
      if (event.tick(time)) {
        toRemove.push(event);
        event.onComplete();
      }
    });
    toRemove.forEach((event) => this.removeAction(event.id));
    if (this.tick && !this.isPaused) this.tick(time);
    if (!this.isPaused && this.modeManager && this.modeManager.update) {
      try {
        this.modeManager.update(time);
      } catch (e) {
        console.warn('mode update error', e);
      }
    }
  };

  /**
   * Draws each zone.
   */
  draw = () => {
    for (let z in this.zoneDict) this.zoneDict[z].draw(this.engine);
  };

  /**
   * Finds the zone containing the given coordinates.
   * @param {number} x - The x coordinate.
   * @param {number} y - The y coordinate.
   * @returns {Zone|null} The zone containing the point.
   */
  zoneContaining = (x, y) => {
    for (let z in this.zoneDict) {
      let zone = this.zoneDict[z];
      if (zone.loaded && zone.isInZone(x, y)) return zone;
    }
    return null;
  };

  /**
   * Finds a path between two points using A* pathfinding.
   * @param {Array<number>} from - The starting point [x, y] or [x, y, z].
   * @param {Array<number>} to - The ending point [x, y] or [x, y, z].
   * @param {Object} options - Pathfinding options.
   * @param {boolean} options.allowDiagonal - Allow diagonal movement (default: true).
   * @param {boolean} options.smoothPath - Apply path smoothing (default: true).
   * @param {boolean} options.useLegacy - Use legacy pathfinding algorithm (default: false).
   * @returns {Array<Array<number>>|null} The path as array of [x, y, z] coordinates, or null if no path found.
   */
  pathFind = (from, to, options = {}) => {
    const {
      allowDiagonal = true,
      smoothPath = true,
      useLegacy = false,
    } = options;

    // Use legacy algorithm if requested (for backward compatibility)
    if (useLegacy) {
      return this.pathFindLegacy(from, to);
    }

    // Find the zone containing the start point
    const zone = this.zoneContaining(from[0], from[1]);
    if (!zone || !zone.loaded) {
      debug('World', 'pathFind: No zone found for start point', from);
      return null;
    }

    // Create pathfinder for this zone
    const pathfinder = new Pathfinder(zone);

    // Find path using A*
    const path = pathfinder.findPath(from[0], from[1], to[0], to[1], {
      allowDiagonal,
      smoothPath,
    });

    if (!path || path.length === 0) {
      return null;
    }

    // Ensure path includes timing information for compatibility with action system
    // Legacy format: [x, y, z, time]
    return path.map((point, index) => {
      if (point.length === 3) {
        return [...point, 600]; // Add default timing
      }
      return point;
    });
  };

  /**
   * Legacy pathfinding implementation (kept for backward compatibility).
   * @private
   * @param {Array<number>} from - The starting point.
   * @param {Array<number>} to - The ending point.
   * @returns {Array} The path.
   */
  pathFindLegacy = (from, to) => {
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
  };

  /**
   * Gets a zone by ID.
   * @param {string} id - The zone ID.
   * @returns {Zone|null} The zone.
   */
  getZoneById = (id) => {
    return this.zoneDict[id];
  };

  /**
   * Gets adjacent cells.
   * @param {number} x - The x coordinate.
   * @param {number} y - The y coordinate.
   * @returns {Array<Array<number>>} The neighbors.
   */
  getNeighbours = (x, y) => {
    let top = [x, y + 1, Direction.Up],
      bottom = [x, y - 1, Direction.Down],
      left = [x - 1, y, Direction.Left],
      right = [x + 1, y, Direction.Right];
    return [top, left, right, bottom];
  };

  /**
   * Checks if a cell can be walked on.
   * @param {Array<number>} neighbour - The neighbor cell.
   * @param {string} jsonNeighbour - The JSON string of the neighbor.
   * @param {Array<string>} visited - Visited cells.
   * @returns {boolean} Whether it can be walked.
   */
  canWalk = (neighbour, jsonNeighbour, visited) => {
    let zone = this.zoneContaining(...neighbour);
    if (
      !zone ||
      visited.indexOf(jsonNeighbour) >= 0 ||
      !zone.isWalkable(...neighbour) ||
      !zone.isWalkable(neighbour[0], neighbour[1], Direction.reverse(neighbour[2]))
    ) {
      return false;
    }
    return true;
  };
}
