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
import { Vector } from '@Engine/utils/math/vector.js';
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
    /** @type {Object.<string, object>} */
    this.remoteAvatars = new Map();
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
  }

  addRemoteAvatar(clientId, avatarData) {
    // Create and add a new avatar sprite for the remote player using engine Avatar class
    try {
      // If we already have this remote avatar, update and return it
      if (this.remoteAvatars.has(clientId)) {
        const existing = this.remoteAvatars.get(clientId);
        try { debug('World', `Remote avatar for ${clientId} already exists, updating instead`); } catch (e) { }
        if (avatarData.x != null) existing.pos.x = avatarData.x;
        if (avatarData.y != null) existing.pos.y = avatarData.y;
        if (avatarData.z != null) existing.pos.z = avatarData.z;
        if (avatarData.facing != null) existing.facing = avatarData.facing;
        return existing;
      }
      // Instantiate Avatar and try to copy template properties from the local player avatar
      const avatar = new Avatar(this.engine);

      // Try to find a local avatar template to copy necessary rendering/template fields
      const localTemplate = this.getAvatar();
      if (localTemplate) {
        // Copy minimal template fields required by Sprite
        avatar.src = localTemplate.src;
        avatar.portraitSrc = localTemplate.portraitSrc;
        avatar.sheetSize = localTemplate.sheetSize;
        avatar.tileSize = localTemplate.tileSize;
        avatar.frames = localTemplate.frames;
        avatar.hotspotOffset = localTemplate.hotspotOffset;
        avatar.drawOffset = localTemplate.drawOffset;
        avatar.enableSpeech = localTemplate.enableSpeech;
        avatar.bindCamera = false; // remote avatars shouldn't bind camera
        // Copy runtime resources so remote avatar can render immediately
        if (localTemplate.texture) avatar.texture = localTemplate.texture;
        if (localTemplate.vertexTexBuf) avatar.vertexTexBuf = localTemplate.vertexTexBuf;
        if (localTemplate.vertexPosBuf) avatar.vertexPosBuf = localTemplate.vertexPosBuf;
        if (localTemplate.speech && localTemplate.speechTexBuf) avatar.speech = localTemplate.speech, avatar.speechTexBuf = localTemplate.speechTexBuf;
        // mark as loaded so draw will render without waiting for async onLoad
        avatar.loaded = true;
        avatar.templateLoaded = true;
      } else {
        console.warn('No local avatar template found; remote avatar may not render correctly');
      }

      // Ensure unique sprite id to avoid collisions with local 'avatar' id
      const baseId = avatarData.id || 'player';
      const spriteId = `${baseId}-${clientId}`;

      // Set properties and create buffers synchronously
      const zone = this.getZoneById(avatarData.zone || avatarData.zoneId) || this.zoneContaining(avatarData.x || 0, avatarData.y || 0);
      avatar.zone = zone;
      avatar.id = spriteId;
      // compute z if not provided. Use hotspot offset so we sample tile height for avatar foot position.
      const rawX = avatarData.x ?? (avatarData.pos && avatarData.pos.x) ?? 0;
      const rawY = avatarData.y ?? (avatarData.pos && avatarData.pos.y) ?? 0;
      const hx = rawX + (avatar.hotspotOffset?.x ?? 0);
      const hy = rawY + (avatar.hotspotOffset?.y ?? 0);
      const zVal = (typeof avatarData.z === 'number') ? avatarData.z : (avatarData.pos && typeof avatarData.pos.z === 'number') ? avatarData.pos.z : (zone ? zone.getHeight(hx, hy) : 0);
      avatar.pos = new Vector(rawX, rawY, zVal);
      avatar.facing = avatarData.facing || 0;
      avatar.isSelected = false; // remote avatars not selected

      // Create buffers synchronously with fallback tile size
      let tileSize = (zone && zone.tileset && zone.tileset.tileSize) ? zone.tileset.tileSize : 32;
      let normTile = [avatar.tileSize[0] / tileSize, avatar.tileSize[1] / tileSize];
      let verts = [
        [0, 0, 0],
        [normTile[0], 0, 0],
        [normTile[0], 0, normTile[1]],
        [0, 0, normTile[1]],
      ];
      let poly = [
        [verts[2], verts[3], verts[0]],
        [verts[2], verts[0], verts[1]]
      ].flat(3);
      avatar.vertexPosBuf = this.engine.renderManager.createBuffer(poly, this.engine.gl.STATIC_DRAW, 3);
      let texCoords = avatar.getTexCoords();
      avatar.vertexTexBuf = this.engine.renderManager.createBuffer(texCoords, this.engine.gl.DYNAMIC_DRAW, 2);
      if (avatar.enableSpeech) {
        avatar.speechVerBuf = this.engine.renderManager.createBuffer(avatar.getSpeechBubbleVertices(), this.engine.gl.STATIC_DRAW, 3);
        avatar.speechTexBuf = this.engine.renderManager.createBuffer(avatar.getSpeechBubbleTexture(), this.engine.gl.DYNAMIC_DRAW, 2);
      }

      // Add to the zone if available. Ensure id/zone registration happens *before* we store
      // this.remoteAvatars to avoid updates arriving before registration completes.
      if (zone) {
        // Ensure zone has spriteDict and spriteList
        if (!zone.spriteDict) zone.spriteDict = {};
        if (!zone.spriteList) zone.spriteList = [];
        // register in dictionaries and lists synchronously
        this.spriteDict[avatar.id] = avatar;
        zone.spriteDict[avatar.id] = avatar;
        if (!zone.spriteList.includes(avatar)) zone.spriteList.push(avatar);
        if (!this.spriteList.includes(avatar)) this.spriteList.push(avatar);
        debug('World', `Added remote avatar for client ${clientId} as sprite '${avatar.id}' to zone ${zone.id} at (${avatar.pos.x},${avatar.pos.y},${avatar.pos.z})`);
      }

      // store mapping after registration
      this.remoteAvatars.set(clientId, avatar);
      try { debug('World', `Remote avatar map now has ${this.remoteAvatars.size} entries`); } catch (e) { }
      return avatar;
    } catch (e) {
      console.warn('Failed to add remote avatar', e);
      return null;
    }
  }

  removeRemoteAvatar(clientId) {
    const avatar = this.remoteAvatars.get(clientId);
    if (avatar) {
      try {
        if (avatar.zone) {
          // remove by id if possible
          const idToRemove = avatar.id || (avatar.objId ? avatar.objId : null);
          if (idToRemove) avatar.zone.removeSprite(idToRemove);
          else avatar.zone.removeSprite(avatar);
        }
      } catch (e) {
        try { if (avatar.zone) avatar.zone.removeSprite(avatar); } catch (e2) { }
      }
      this.remoteAvatars.delete(clientId);
    }
  }

  updateRemoteAvatar(clientId, avatarData) {
    const avatar = this.remoteAvatars.get(clientId);
    if (avatar) {
      try { debug('World', `updateRemoteAvatar: client=${clientId} pre pos=${avatar.pos?.x},${avatar.pos?.y},${avatar.pos?.z} loaded=${avatar.loaded} id=${avatar.id} zone=${avatar.zone?.id}`); } catch (e) { }
      if (typeof avatar.setPosition === 'function') {
        avatar.setPosition(avatarData.x, avatarData.y, avatarData.z);
      } else if (avatar.pos) {
        avatar.pos.x = avatarData.x;
        avatar.pos.y = avatarData.y;
        avatar.pos.z = avatarData.z || avatar.pos.z;
      }
      if (typeof avatar.updateState === 'function') {
        avatar.updateState(avatarData);
      } else {
        // fallback: apply facing and animation frame
        if (avatarData.facing != null) avatar.facing = avatarData.facing;
        if (avatarData.animFrame != null) avatar.animFrame = avatarData.animFrame;
      }
      // Defensive: ensure sprite is marked loaded so draw will execute
      if (!avatar.loaded) {
        console.warn(`Remote avatar ${clientId} was not loaded; forcing loaded=true so renderer will attempt to draw.`);
        avatar.loaded = true;
        avatar.templateLoaded = true;
        if (!avatar.texture || typeof avatar.texture.attach !== 'function') avatar.texture = { loaded: true, attach: () => { } };
      }
      try { debug('World', `updateRemoteAvatar: client=${clientId} post pos=${avatar.pos?.x},${avatar.pos?.y},${avatar.pos?.z} loaded=${avatar.loaded} id=${avatar.id} zone=${avatar.zone?.id}`); } catch (e) { }
      return avatar;
    }
    return null;
  }

  applyRemoteAction(clientId, action, params, spriteId) {
    const avatar = this.remoteAvatars.get(clientId);
    if (avatar) {
      avatar.performAction(action, params); // implement this in your avatar class
    }
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
    // check cache ?
    if (!skipCache && this.zoneDict[zoneId]) return this.zoneDict[zoneId];
    const engine = this.engine;

    // transition effects
    let useTransition = false;
    if (transitionParams && engine?.renderManager) {
      const rm = engine.renderManager;
      const now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
      // Compute time since the last transition started. We allow a small
      // grace period after a transition completes before a new one is
      // permitted. If a transition is still running (isTransitioning),
      // startTransition() will queue the next transition automatically.
      const timeSinceLast = now - (rm.transitionStartTime + rm.transitionDuration);
      if (!rm.isTransitioning && timeSinceLast > 100) {
        useTransition = true;
      }
    }
    if (useTransition) {
      const { effect = 'cross', duration = 500 } = transitionParams;
      await engine.renderManager.startTransition({ effect: effect, direction: 'out', duration: duration });
    }

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

    // fade back in once the new zone has finished loading
    if (useTransition) {
      const { effect = 'cross', duration = 500 } = transitionParams;
      await engine.renderManager.startTransition({ effect: effect, direction: 'in', duration: duration });
    }

    return z;
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
    if (!skipCache && this.zoneDict[zoneId]) return this.zoneDict[zoneId];
    const engine = this.engine;

    // transition effects
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
      await engine.renderManager.startTransition({ effect: effect, direction: 'out', duration: duration });
    }

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

    // fade back in once the new zone has finished loading
    if (useTransition) {
      const { effect = 'cross', duration = 500 } = transitionParams;
      await engine.renderManager.startTransition({ effect: effect, direction: 'in', duration: duration });
    }
    return z;
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
   * Finds a path between two points.
   * @param {Array<number>} from - The starting point.
   * @param {Array<number>} to - The ending point.
   * @returns {Array} The path.
   */
  pathFind = (from, to) => {
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
