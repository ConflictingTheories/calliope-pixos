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
 * @fileoverview Zone class for Pixos game engine.
 * Manages map zones, sprites, objects, and rendering.
 */

import { Direction, mergeDeep } from '@Engine/utils/enums.js';
import Resources from '@Engine/utils/resources.js';
import ActionQueue from '@Engine/core/queue/index.js';
import { Vector } from '@Engine/utils/math/vector.js';
import { EventLoader, SpriteLoader, TilesetLoader, ActionLoader, ObjectLoader } from '@Engine/utils/loaders/index.js';
import { loadMap, dynamicCells } from '@Engine/dynamic/map.js';
import Loadable from '@Engine/core/queue/loadable.js';
import PixoScriptInterpreter from '@Engine/scripting/PixoScriptInterpreter.js';

/**
 * @typedef {object} ZoneData
 * @property {string} id - Zone ID.
 * @property {number} objId - Object ID.
 * @property {object[]} scripts - Scripts.
 * @property {object} data - Zone data.
 * @property {string[]} objects - Object IDs.
 * @property {string[]} sprites - Sprite IDs.
 * @property {Array<number[]>} selectedTiles - Selected tiles.
 */

/**
 * Zone - Represents a map zone with tiles, sprites, and objects.
 */
export default class Zone extends Loadable {
  /**
   * Creates an instance of Zone.
   * @param {string} zoneId - The zone ID.
   * @param {import('./world.js').default} world - The world instance.
   */
  constructor(zoneId, world) {
    super();
    /** @type {string} */
    this.spritzName = world.id;
    /** @type {string} */
    this.id = zoneId;
    /** @type {number} */
    this.objId = Math.round(Math.random() * 100);
    /** @type {import('./world.js').default} */
    this.world = world;
    /** @type {object} */
    this.data = {};
    /** @type {Object.<string, object>} */
    this.spriteDict = Object.create(null);
    /** @type {object[]} */
    this.spriteList = [];
    /** @type {Object.<string, object>} */
    this.objectDict = Object.create(null);
    /** @type {object[]} */
    this.objectList = [];
    /** @type {Array<number[]>} */
    this.selectedTiles = [];
    /** @type {object[]} */
    this.lights = [];
    /** @type {object[]} */
    this.spritz = [];
    /** @type {object[]} */
    this.scripts = this.scripts || [];
    /** @type {number} */
    this.lastKey = 0;
    /** @type {import('../index.js').default} */
    this.engine = world.engine;
    /** @type {ActionQueue} */
    this.onLoadActions = new ActionQueue();
    /** @type {SpriteLoader} */
    this.spriteLoader = new SpriteLoader(world.engine);
    /** @type {ObjectLoader} */
    this.objectLoader = new ObjectLoader(world.engine);
    /** @type {typeof EventLoader} */
    this.EventLoader = EventLoader;
    /** @type {TilesetLoader} */
    this.tsLoader = new TilesetLoader(world.engine);
    /** @type {object|null} */
    this.audio = null;
    /** @type {Set<string>|null} */
    this._selectedSet = null;
    /** @type {number[]|null} */
    this._highlight = null;
  }

  /**
   * Gets the zone data.
   * @returns {ZoneData} The zone data.
   */
  getZoneData = () => {
    return {
      id: this.id,
      objId: this.objId,
      scripts: this.scripts,
      data: this.data,
      objects: Object.keys(this.objectDict),
      sprites: Object.keys(this.spriteDict),
      selectedTiles: this.selectedTiles,
    };
  };

  /**
   * Called after tileset and actors are loaded.
   */
  afterTilesetAndActorsLoaded = () => {
    if (
      this.loaded ||
      !this.tileset?.loaded ||
      !this.spriteList.every((s) => s.loaded) ||
      !this.objectList.every((o) => o.loaded)
    ) return;

    this.loaded = true;
    this.loadScripts(true);
    this.onLoadActions.run();
  };

  /**
   * Attaches tileset listeners.
   */
  attachTilesetListeners = () => {
    this.tileset.runWhenDefinitionLoaded(this.onTilesetDefinitionLoaded);
    this.tileset.runWhenLoaded(this.afterTilesetAndActorsLoaded);
  };

  /**
   * Finalizes the zone loading.
   */
  finalize = async () => {
    for (const s of this.spriteList) s.runWhenLoaded(this.afterTilesetAndActorsLoaded);
    for (const o of this.objectList) o.runWhenLoaded(this.afterTilesetAndActorsLoaded);
    this.engine.networkManager.loadZone(this.id, this);
  };

  /**
   * Loads the zone remotely.
   */
  loadRemote = async () => {
    const res = await fetch(Resources.zoneRequestUrl(this.id));
    if (!res.ok) return;
    try {
      const data = await res.json();
      this.bounds = data.bounds;
      this.size = [data.bounds[2] - data.bounds[0], data.bounds[3] - data.bounds[1]];

      this.cells = typeof data.cells === 'function' ? data.cells(this.bounds, this) : data.cells;
      this.sprites = typeof data.sprites === 'function' ? data.sprites(this.bounds, this) : data.sprites || [];
      this.objects = typeof data.objects === 'function' ? data.objects(this.bounds, this) : data.objects || [];

      this.tileset = await this.tsLoader.load(data.tileset, this.spritzName);
      this.attachTilesetListeners();

      if (this.audioSrc) this.audio = this.engine.resourceManager.audioLoader.load(this.audioSrc, true);

      await Promise.all([
        Promise.all(this.sprites.map(this.loadSprite)),
        Promise.all(this.objects.map(this.loadObject)),
      ]);

      // If zone specifies a skyboxShader, set it
      if (data.skyboxShader && this.engine.renderManager?.skyboxManager?.setSkyboxShader) {
        await this.engine.renderManager.skyboxManager.setSkyboxShader(data.skyboxShader);
      }

      await this.finalize();
      // If the zone JSON declares a mode, load mode scripts from the spritz package
      try {
        if (data.mode)
          await this.loadMode(data.mode);
      } catch (e) {
        console.warn('zone mode load failed', e);
      }
    } catch (e) {
      console.error('Error parsing zone ' + this.id, e);
    }
  };

  /**
   * Loads the zone.
   */
  load = async () => {
    try {
      const data = require('@Spritz/' + this.spritzName + '/maps/' + this.id + '/map.js').default;
      Object.assign(this, data);

      // dynamic cells (such as randomly generated)
      if (typeof this.cells === 'function') this.cells = this.cells(this.bounds, this);
      // Background audio
      if (this.audioSrc) this.audio = this.engine.resourceManager.audioLoader.load(this.audioSrc, true);

      // Load in tileset assets
      this.size = [this.bounds[2] - this.bounds[0], this.bounds[3] - this.bounds[1]];
      this.tileset = await this.tsLoader.load(this.tileset, this.spritzName);
      this.attachTilesetListeners();

      // dynamically add sprites (if appl.) - todo - possibly same thing for objects?
      if (typeof this.sprites === 'function') this.sprites = this.sprites(this.bounds, this);
      this.sprites = this.sprites || [];
      this.objects = this.objects || [];

      // populate
      await Promise.all([
        Promise.all(this.sprites.map(this.loadSprite)),
        Promise.all(this.objects.map(this.loadObject)),
      ]);

      // If zone specifies a skyboxShader, set it
      if (data.skyboxShader && this.engine.renderManager?.skyboxManager?.setSkyboxShader) {
        await this.engine.renderManager.skyboxManager.setSkyboxShader(data.skyboxShader);
      }

      await this.finalize();
      // If zone specifies a default mode name on the map data, attempt to load it from spritz package
      try {
        if (data.mode)
          await this.loadMode(data.mode);
      } catch (e) {
        console.warn('zone mode load failed', e);
      }

      try {
        this.engine.networkManager.joinZone(this.id);
      } catch (e) {
        console.warn('Network Error :: could not send zone commend to server')
      }

    } catch (e) {
      console.error('Error parsing zone ' + this.id, e);
    }
  };

  /**
   * Loads a trigger from a zip archive.
   * @param {string} trigger - The trigger name.
   * @param {object} zip - The zip archive.
   * @returns {function(): void} The trigger function.
   */
  loadTriggerFromZip = async (trigger, zip) => {
    // Try Lua first
    try {
      const file = await zip.file(`triggers/${trigger}.lua`);
      if (file) {
        const luaScript = await file.async('string');
        return (_this, subject) => {
          const interpreter = new PixoScriptInterpreter(_this.engine);
          interpreter.setScope({ _this, zone: this, subject });
          interpreter.initLibrary();
          return interpreter.run(luaScript);
        };
      }
    } catch (e) {
      if (this.engine?.debug) console.warn('Lua trigger load failed', e);
    }

    // Try .pxs extension (PixoScript/Lua)
    try {
      const pxsFile = await zip.file(`triggers/${trigger}.pxs`);
      if (pxsFile) {
        const luaScript = await pxsFile.async('string');
        return (_this, subject) => {
          const interpreter = new PixoScriptInterpreter(_this.engine);
          interpreter.setScope({ _this, zone: this, subject });
          interpreter.initLibrary();
          return interpreter.run(luaScript);
        };
      }
    } catch (e) {
      if (this.engine?.debug) console.warn('PixoScript trigger load failed', e);
    }

    // JS fallback (sandboxed) — no global eval
    const jsFile = await zip.file(`triggers/${trigger}.js`);
    if (jsFile) {
      const triggerScript = await jsFile.async('string');
      // new Function isolates scope; it receives (zone, engine) and must return a function
      const factory = new Function('zone', 'engine', `${triggerScript}; return (typeof module !== 'undefined' && module.exports) ? module.exports : (typeof exports !== 'undefined' ? exports : (typeof trigger === 'function' ? trigger : null));`);
      const fn = factory(this, this.engine);
      if (typeof fn === 'function') return fn.bind(this, this);
    }

    return () => { };
  };

  /**
   * Loads a mode from a zip archive.
   * @param {string} modeName - The mode name.
   * @param {object} zip - The zip archive.
   */
  loadModeFromZip = async (modeName, zip) => {
    try {
      console.log('Loading Game Mode From Zip');

      const setupFile = zip.file(`modes/${modeName}/setup.lua`);
      const updateFile = zip.file(`modes/${modeName}/update.lua`);
      const teardownFile = zip.file(`modes/${modeName}/teardown.lua`);
      const world = this.world;

      const interpreter = new PixoScriptInterpreter(this.engine);
      interpreter.setScope({ zone: this, map: this, _this: this });
      interpreter.initLibrary();

      const handlers = {};
      if (setupFile) {
        const script = await setupFile.async('string');
        // run the setup registration (it likely calls pixos.register_mode)
        console.log('Zone.loadModeFromZip: running setup.lua for mode', modeName);
        await interpreter.run(script);
      }
      // If update file exists, load it as a function and register as handler
      if (updateFile) {
        const updateScript = await updateFile.async('string');
        // wrap as a function and register to call on each frame via ModeManager
        // We return a JS function that executes the Lua chunk each time
        handlers.update = async (time, params) => {
          try {
            // create a fresh interpreter env for update to avoid state bleed
            const ui = new PixoScriptInterpreter(this.engine);
            ui.setScope({ zone: this, map: this, _this: this, time, params });
            ui.initLibrary();
            // The update.lua is expected to return a function
            const res = await ui.run(updateScript);
            // If the script returned a callable (Lua function) we invoke it
            if (typeof res === 'function') res(time, params);
          } catch (e) { console.warn('mode update exec failed', e); }
        };
      }
      if (teardownFile) {
        const tdScript = await teardownFile.async('string');
        handlers.teardown = async (params) => {
          try {
            const td = new PixoScriptInterpreter(this.engine);
            td.setScope({ zone: this });
            td.initLibrary();
            const res = await td.run(tdScript);
            // if there is a returned callback, we can run it
            if (typeof res === 'function') res(params);
          } catch (e) {
            console.warn('mode teardown failed', e);
          }
        };
      }

      // If the setup script used pixos.register_mode, the ModeManager will
      // already have the registration. But ensure we add handlers if not.
      if (world && world.modeManager) {
        const existing = world.modeManager.registered[modeName];
        if (!existing) world.modeManager.register(modeName, handlers);
      }
    } catch (e) {
      console.warn('loadModeFromZip failed', modeName, e);
    }
  };

  /**
   * Loads a mode.
   * @param {string} modeName - The mode name.
   */
  loadMode = async (modeName) => {
    try {
      const world = this.world;
      await this.loadModeFromZip(modeName, world.spritz.zip);
    } catch (e) {
      console.warn('loadMode failed', modeName, e);
    }
  };

  /**
   * Loads a zone from a zip archive.
   * @param {object} zoneJson - The zone JSON.
   * @param {object} cellJson - The cell JSON.
   * @param {object} zip - The zip archive.
   * @param {boolean} [skipCache=false] - Whether to skip cache.
   */
  loadZoneFromZip = async (zoneJson, cellJson, zip, skipCache = false) => {
    try {
      // Zone extensions
      if (zoneJson.extends?.length) {
        let extension = {};
        await Promise.all(zoneJson.extends.map(async (file) => {
          const str = await zip.file('maps/' + file + '/map.json').async('string');
          extension = mergeDeep(extension, JSON.parse(str));
        }));
        zoneJson = Object.assign(extension, { ...zoneJson, extends: null });
      }

      // Cell extensions
      if (cellJson.extends?.length) {
        let cells = [];
        await Promise.all(cellJson.extends.map(async (file) => {
          const str = await zip.file('maps/' + file + '/cells.json').async('string');
          const parsed = JSON.parse(str);
          cells = cells.concat(parsed.cells ? parsed.cells : parsed);
        }));
        cellJson = cells.concat(cellJson.cells || []);
      }

      // Load heights.json if it exists
      let heightsJson = null;
      try {
        const heightsFile = zip.file('maps/' + this.id + '/heights.json');
        if (heightsFile) {
          const heightsStr = await heightsFile.async('string');
          heightsJson = JSON.parse(heightsStr);
          console.log(`[Zone] Loaded heights.json for ${this.id}:`, heightsJson?.length, 'rows');
          console.log(`[Zone] First row heights:`, heightsJson?.[0]);
          console.log(`[Zone] Heights data sample:`, JSON.stringify(heightsJson?.slice(0, 3)));
        } else {
          console.log(`[Zone] No heights.json found for ${this.id}, using default geometry heights`);
        }
      } catch (e) {
        console.warn(`[Zone] Failed to load heights.json for ${this.id}:`, e.message);
      }

      // Menus
      if (zoneJson.menu) {
        const menus = {};
        await Promise.all(Object.keys(zoneJson.menu).map(async (id) => {
          const menu = { ...zoneJson.menu[id], id };
          if (menu.onOpen) menu.onOpen = (await this.loadTriggerFromZip(menu.onOpen, zip)).bind(this, this);
          if (menu.trigger) menu.trigger = (await this.loadTriggerFromZip(menu.trigger, zip)).bind(this, this);
          menus[id] = menu;
        }));
        this.menus = menus;
        this.world.startMenu(this.menus);
      }

      // Tileset / map / cells
      const tileset = await this.tsLoader.loadFromZip(zip, zoneJson.tileset, this.spritzName);
      const cells = dynamicCells(cellJson, tileset.tiles);
      const map = await loadMap.call(this, zoneJson, cells, zip, heightsJson);
      Object.assign(this, map);

      // Cells generator (string -> function)
      if (typeof this.cells === 'string') {
        try {
          // Strict scope function (no global eval)
          const fn = new Function('bounds', 'zone', `return (${this.cells})(bounds, zone);`);
          this.cells = fn.call(this, this.bounds, this);
        } catch (e) {
          console.error('error loading cell function', e);
        }
      }

      // Audio
      if (zoneJson.mode) {
        try { this.mode = zoneJson.mode } catch (e) { console.error('audio load', e); }
      }

      // Audio
      if (zoneJson.audioSrc) {
        try { this.audio = await this.engine.resourceManager.audioLoader.loadFromZip(zip, zoneJson.audioSrc, true); } catch (e) { console.error('audio load', e); }
      }

      // Lights
      try {
        this.lights = zoneJson.lights ?? [];
        const lm = this.engine.renderManager.lightManager;
        for (const l of this.lights) lm.addLight(l.id, l.pos, l.color, l.attenuation, l.direction, l.density, l.scatteringCoefficients, l.enabled);
      } catch (e) { console.error('lights', e); }

      // Tileset + size
      this.tileset = tileset;
      this.size = [this.bounds[2] - this.bounds[0], this.bounds[3] - this.bounds[1]];

      // Sprite generators
      if (typeof this.sprites === 'string') {
        try {
          const fn = new Function('bounds', 'zone', `return (${this.sprites})(bounds, zone);`);
          this.sprites = fn.call(this, this.bounds, this);
        } catch (e) { console.error('sprite fn', e); }
      }
      this.sprites = this.sprites || [];
      this.objects = this.objects || [];

      await Promise.all([
        Promise.all(this.sprites.map((s) => this.loadSpriteFromZip(s, zip, skipCache))),
        Promise.all(this.objects.map((o) => this.loadObjectFromZip(o, zip))),
      ]);

      this.attachTilesetListeners();

      // If the loaded map object includes a 'mode' property attempt to load a mode module
      // todo - look into whether this should be updated or moved - not sure if the zone should control the mode like this.
      // in some cases, it makes sense, but I feel like if multiple zones are loaded, there could be conflicts, and the idea of
      // the zone controlling gameplay could be confusing in some cases, but for "battle zones" it kind of makes sense - but this could
      // be done via scripts - so possibly something which could be fully scripted instead of this kind of logic - and instead
      // I will likely move this to the world object - and then it will be the 'initial' mode.
      try {
        if (this.mode)
          await this.loadMode(this.mode);
      } catch (e) {
        console.warn('zone mode load failed', e);
      }

      await this.finalize();

    } catch (e) {
      console.error('Error parsing json zone ' + this.id, e);
    }
  };

  /**
   * Runs when the zone is deleted.
   */
  runWhenDeleted = () => {
    for (const l of this.lights) this.engine.renderManager.lightManager.removeLight(l.id);
  };

  /**
   * Called when tileset definition is loaded.
   */
  onTilesetDefinitionLoaded = () => {
    const width = this.size[0];
    const height = this.size[1];
    const rm = this.engine.renderManager;
    const gl = this.engine.gl;

    this.cellVertexPosBuf = Array.from({ length: height }, () => new Array(width));
    this.cellVertexTexBuf = Array.from({ length: height }, () => new Array(width));
    this.cellPickingId = Array.from({ length: height }, () => new Array(width));
    this.walkability = new Uint16Array(width * height);

    // Precompute
    let k = 0;
    for (let j = 0; j < height; j++) {
      for (let i = 0; i < width; i++, k++) {
        const cell = this.cells[k];
        const layers = Math.floor(cell.length / 3);

        let cellVertices = [];
        let cellTex = [];
        let walk = Direction.All;

        // Get height override for this cell if heights data exists
        const heightOverride = this.heights && this.heights[j] && typeof this.heights[j][i] === 'number' 
          ? this.heights[j][i] 
          : null;

        // Debug first few cells - show null/number for diagnostics
        if (k < 5) {
          console.log(`[Zone.finalize] Cell [${j},${i}] heightOverride:`, heightOverride);
        }

        for (let l = 0; l < layers; l++) {
          const tileId = cell[3 * l];
          const tileVariant = cell[3 * l + 1];
          const z = cell[3 * l + 2];
          const tilePos = [this.bounds[0] + i, this.bounds[1] + j, z];
          walk &= this.tileset.getWalkability(tileId);
          
          // Pass height override to getTileVertices
          cellVertices = cellVertices.concat(
            this.tileset.getTileVertices(tileId, tilePos, heightOverride)
          );
          cellTex = cellTex.concat(this.tileset.getTileTexCoords(tileId, tileVariant));
        }

        // override walkability if provided
        if (cell.length === 3 * layers + 1) walk = cell[3 * layers];
        this.walkability[k] = walk;

        // GPU buffers
        const vPos = rm.createBuffer(new Float32Array(cellVertices), gl.STATIC_DRAW, 3);
        const vTex = rm.createBuffer(new Float32Array(cellTex), gl.STATIC_DRAW, 2);
        this.cellVertexPosBuf[j][i] = vPos;
        this.cellVertexTexBuf[j][i] = vTex;

        // Picking ID packed as floats [0..1, 0..1, 0..1, 255]
        this.cellPickingId[j][i] = [
          (this.objId & 0xff) / 255,
          (j & 0xff) / 255,
          (i & 0xff) / 255,
          255,
        ];
      }
    }
  };

  /**
   * Loads scripts.
   * @param {boolean} [refresh=false] - Whether to refresh.
   */
  loadScripts = (refresh = false) => {
    if (this.world.isPaused) return;
    const zone = this;
    for (const x of this.scripts) {
      if (x.id === 'load-spritz' && refresh) this.runWhenLoaded(x.trigger.bind(zone));
    }
  };

  /**
   * Loads an object.
   * @param {object} data - The object data.
   */
  loadObject = async (data) => {
    data.zone = this;
    if (!this.objectDict[data.id]) {
      const obj = await this.objectLoader.load(data, (o) => o.onLoad(o));
      this.world.objectDict[data.id] = this.objectDict[data.id] = obj;
      this.objectList.push(obj);
      this.world.objectList.push(obj);
    }
  };

  /**
   * Loads an object from a zip archive.
   * @param {object} data - The object data.
   * @param {object} zip - The zip archive.
   */
  loadObjectFromZip = async (data, zip) => {
    data.zone = this;
    if (!this.objectDict[data.id]) {
      const obj = await this.objectLoader.loadFromZip(zip, data, async (o) => o.onLoadFromZip(o, zip));
      this.world.objectDict[data.id] = this.objectDict[data.id] = obj;
      this.objectList.push(obj);
      this.world.objectList.push(obj);
    }
  };

  /**
   * Loads a sprite.
   * @param {object} data - The sprite data.
   */
  loadSprite = async (data) => {
    data.zone = this;
    if (!this.spriteDict[data.id]) {
      const spr = await this.spriteLoader.load(data.type, this.spritzName, (s) => s.onLoad(data));
      this.world.spriteDict[data.id] = this.spriteDict[data.id] = spr;
      this.spriteList.push(spr);
      this.world.spriteList.push(spr);
    }
  };

  /**
   * Loads a sprite from a zip archive.
   * @param {object} data - The sprite data.
   * @param {object} zip - The zip archive.
   */
  loadSpriteFromZip = async (data, zip) => {
    data.zone = this;
    if (!this.spriteDict[data.id]) {
      const spr = await this.spriteLoader.loadFromZip(zip, data.type, this.spritzName, async (s) => s.onLoadFromZip(data, zip));
      this.world.spriteDict[data.id] = this.spriteDict[data.id] = spr;
      this.spriteList.push(spr);
      this.world.spriteList.push(spr);
    }
  };

  /**
   * Adds a sprite.
   * @param {object} sprite - The sprite.
   */
  addSprite = (sprite) => {
    sprite.zone = this;
    this.world.spriteDict[sprite.id] = this.spriteDict[sprite.id] = sprite;
    this.spriteList.push(sprite);
    this.world.spriteList.push(sprite);
  };

  /**
   * Removes a sprite.
   * @param {string} id - The sprite ID.
   */
  removeSprite = (id) => {
    const keep = (s) => {
      if (s.id !== id) return true; s.removeAllActions(); return false;
    };
    this.spriteList = this.spriteList.filter(keep);
    this.world.spriteList = this.world.spriteList.filter(keep);
    delete this.spriteDict[id];
    delete this.world.spriteDict[id];
  };

  /**
   * Removes all sprites.
   */
  removeAllSprites = () => {
    for (const s of this.spriteList) this.removeSprite(s.id);
  };

  /**
   * Gets a sprite by ID.
   * @param {string} id - The sprite ID.
   * @returns {object|null} The sprite.
   */
  getSpriteById = (id) => this.spriteDict[id];

  /**
   * Adds a portal.
   * @param {object[]} sprites - The sprites.
   * @param {number} x - The x position.
   * @param {number} y - The y position.
   * @returns {object[]} The sprites.
   */
  addPortal = (sprites, x, y) => {
    if (!this.portals?.length) return sprites;
    const h = this.getHeight(x, y);
    if (h !== 0) return sprites;

    const make = (portal) => { portal.pos = new Vector(x, y, h); sprites.push(portal); };
    if (this.portals.length > 0) {
      if (((x * y) % 3) === 0) make(this.portals.shift()); else make(this.portals.pop());
    }
    return sprites;
  };

  /**
   * Gets the height at a position.
   * @param {number} x - The x position.
   * @param {number} y - The y position.
   * @returns {number} The height.
   */
  getHeight = (x, y) => {
    if (!this.isInZone(x, y)) {
      if (this.engine?.debug) console.error(`Height out of bounds [${x}, ${y}]`);
      return 0;
    }

    const i = Math.floor(x), j = Math.floor(y);
    const dp0 = x - i, dp1 = y - j;

    // index into cells
    const idx = (j - this.bounds[1]) * this.size[0] + (i - this.bounds[0]);
    const cell = this.cells[idx];
    const n = Math.floor(cell.length / 3);

    // local helper without allocations
    const triUV = (t) => {
      const ux = t[1][0] - t[0][0];
      const uy = t[1][1] - t[0][1];
      const vx = t[2][0] - t[0][0];
      const vy = t[2][1] - t[0][1];
      const d = 1 / (ux * vy - uy * vx);
      const T0 = d * vy, T1 = -d * vx, T2 = -d * uy, T3 = d * ux;
      const px = dp0 - t[0][0];
      const py = dp1 - t[0][1];
      return [px * T0 + py * T1, px * T2 + py * T3];
    };

    for (let l = 0; l < n; l++) {
      const poly = this.tileset.getTileWalkPoly(cell[3 * l]);
      if (!poly) continue;
      const baseZ = cell[3 * l + 2];
      for (let p = 0; p < poly.length; p++) {
        const uv = triUV(poly[p]);
        const w = uv[0] + uv[1];
        if (w <= 1) {
          const t = poly[p];
          return baseZ + (1 - w) * t[0][2] + uv[0] * t[1][2] + uv[1] * t[2][2];
        }
      }
    }

    return cell[2];
  };

  /**
   * Draws a row.
   * @param {number} row - The row.
   * @param {Set<string>} selectedSet - The selected set.
   * @param {number[]} highlight - The highlight.
   * @param {object} rm - The render manager.
   * @param {object} shaderProgram - The shader program.
   * @param {object} pickerProgram - The picker program.
   * @param {WebGLRenderingContext} gl - The WebGL context.
   */
  drawRow = (row, selectedSet, highlight, rm, shaderProgram, pickerProgram, gl) => {
    // Attach tileset once per row (sprites may switch textures between rows)
    this.tileset.texture.attach();
    const vPosRow = this.cellVertexPosBuf[row];
    const vTexRow = this.cellVertexTexBuf[row];
    const width = this.size[0];

    // If we have cached picking IDs, use them without checks in the loop
    const pickingRow = this.cellPickingId[row];

    for (let cell = 0; cell < width; cell++) {
      const vPos = vPosRow[cell];
      const vTex = vTexRow[cell];
      rm.bindBuffer(vPos, shaderProgram.aVertexPosition);
      rm.bindBuffer(vTex, shaderProgram.aTextureCoord);

      const id = pickingRow[cell];
      pickerProgram.setMatrixUniforms({ id });
      shaderProgram.setMatrixUniforms({
        id,
        isSelected: selectedSet ? selectedSet.has(`${row},${cell}`) : false,
        sampler: 1.0,
        colorMultiplier: highlight,
      });
      gl.drawArrays(gl.TRIANGLES, 0, vPos.numItems);
      if (rm.debug) rm.debug.tilesDrawn++;
    }
  };

  /**
   * Draws a cell.
   * @param {number} row - The row.
   * @param {number} cell - The cell.
   */
  drawCell = (row, cell) => {
    const rm = this.engine.renderManager;
    const gl = this.engine.gl;
    const shader = rm.shaderProgram;
    const picker = rm.effectPrograms['picker'];

    const vPos = this.cellVertexPosBuf[row][cell];
    const vTex = this.cellVertexTexBuf[row][cell];
    rm.bindBuffer(vPos, shader.aVertexPosition);
    rm.bindBuffer(vTex, shader.aTextureCoord);

    const id = this.cellPickingId[row][cell];
    picker.setMatrixUniforms({ id });
    shader.setMatrixUniforms({
      id,
      isSelected: !!this._selectedSet?.has(`${row},${cell}`),
      sampler: 1.0,
      colorMultiplier: this._highlight || [1, 1, 0, 1],
    });
    gl.drawArrays(gl.TRIANGLES, 0, vPos.numItems);
  };

  /**
   * Draws the zone.
   */
  draw = () => {
    if (!this.loaded) return;

    const rm = this.engine.renderManager;
    const gl = this.engine.gl;
    const shaderProgram = rm.shaderProgram;
    const pickerProgram = rm.effectPrograms['picker'];

    // Build selected set once per frame
    const sel = this.selectedTiles;
    this.selectedSet = (sel && sel.length) ? new Set(sel.map((t) => `${t[0]},${t[1]}`)) : null;
    this.highlight = (this.engine.frameCount & 0x8) ? [1, 0, 0, 1] : [1, 1, 0, 1];

    // look into this
    const ensureSortedByY = (arr) => {
      for (let i = 1; i < arr.length; i++) if (arr[i - 1].pos.y > arr[i].pos.y) { arr.sort((a, b) => a.pos.y - b.pos.y); break; }
    };
    ensureSortedByY(this.spriteList);
    ensureSortedByY(this.objectList);

    rm.mvPushMatrix();
    // Do not reinitialize the camera when FreeCam is active — FreeCam edits camera.uViewMat directly
    if (!this.engine._freecamActive) rm.camera.setCamera();

    let si = 0; // sprite index
    let oi = 0; // object index

    // Need to update to handle the different directions (there are some issues with clipping on other angles)
    const drawForward = this.engine.renderManager.camera.cameraDir === 'N' ||
      this.engine.renderManager.camera.cameraDir === 'NE' ||
      this.engine.renderManager.camera.cameraDir === 'NW' ||
      this.engine.renderManager.camera.cameraDir === 'E';

    if (drawForward) {
      for (let j = 0; j < this.size[1]; j++) {
        this.drawRow(j, this.selectedSet, this.highlight, rm, shaderProgram, pickerProgram, gl);
        while (oi < this.objectList.length && (this.objectList[oi].pos.y - this.bounds[1]) <= j) this.objectList[oi++].draw();
        while (si < this.spriteList.length && (this.spriteList[si].pos.y - this.bounds[1]) <= j) this.spriteList[si++].draw(this.engine);
      }
    } else {
      for (let j = this.size[1] - 1; j >= 0; j--) {
        this.drawRow(j, this.selectedSet, this.highlight, rm, shaderProgram, pickerProgram, gl);
        while (oi < this.objectList.length && (this.bounds[1] - this.objectList[oi].pos.y) <= j) this.objectList[oi++].draw();
        while (si < this.spriteList.length && (this.bounds[1] - this.spriteList[si].pos.y) <= j) this.spriteList[si++].draw(this.engine);
      }
    }

    while (oi < this.objectList.length) this.objectList[oi++].draw();
    while (si < this.spriteList.length) this.spriteList[si++].draw(this.engine);

    rm.mvPopMatrix();
  };

  /**
   * Ticks the zone.
   * @param {number} time - The time.
   * @param {boolean} isPaused - Whether paused.
   */
  tick = (time, isPaused) => {
    if (!this.loaded || isPaused) return;
    this.checkInput(time);
    for (const s of this.spriteList) s.tickOuter(time);
  };

  /**
   * Checks input.
   * @param {number} time - The time.
   */
  checkInput = async (time) => {
    if (time <= this.lastKey + 200) return;
    this.engine.gamepad.checkInput();
    this.lastKey = time;
    // todo - look into hooks - game modes (allow for scripting keymaps)
  };

  /**
   * Checks if a position is in the zone.
   * @param {number} x - The x position.
   * @param {number} y - The y position.
   * @returns {boolean} Whether in zone.
   */
  isInZone = (x, y) => (x >= this.bounds[0] && y >= this.bounds[1] && x < this.bounds[2] && y < this.bounds[3]);

  /**
   * Handles selection.
   * @param {number} row - The row.
   * @param {number} cell - The cell.
   */
  onSelect = async (row, cell) => {
    // allow active mode to intercept selection
    try {
      if (this.world?.modeManager && this.world.modeManager.handleSelect) {
        console.log('Running Custom Select Handler')
        const handled = await this.world.modeManager.handleSelect(this, row, cell, 'tile');
        if (handled) return; // mode consumed selection
      }
    } catch (e) { console.warn('mode selection handler error', e); }
    // toggle select
    let removed = false;
    this.selectedTiles = this.selectedTiles.filter((t) => {
      const keep = !(t[0] === row && t[1] === cell);
      if (!keep) removed = true;
      return keep;
    });
    if (removed) return;

    this.selectedTiles.push([row, cell]);
    if (!this.selectTrigger) return;

    // Lua trigger from spritz zip
    try {
      let file = this.engine.spritz.zip.file(`triggers/${this.selectTrigger}.lua`);
      if (!file) file = this.engine.spritz.zip.file(`triggers/${this.selectTrigger}.pxs`);
      if (!file) throw new Error('No Lua Script Found');
      const luaScript = await file.async('string');
      const interpreter = new PixoScriptInterpreter(this.engine);
      interpreter.setScope({ _this: this, zone: this, subject: new interpreter.lua.Table([row, cell]) });
      interpreter.initLibrary();
      return await interpreter.run(luaScript);
    } catch (e) {
      if (this.engine?.debug) console.warn('select trigger missing', e);
    }
  };

  /**
   * Checks if walkable.
   * @param {number} x - The x position.
   * @param {number} y - The y position.
   * @param {number} direction - The direction.
   * @returns {boolean|null} Whether walkable.
   */
  isWalkable = (x, y, direction) => {
    if (!this.isInZone(x, y)) return null;

    // sprites (values, not keys)
    for (const sId in this.spriteDict) {
      const s = this.spriteDict[sId];
      if (s.pos.x !== x || s.pos.y !== y) continue;
      if (!s.walkable && !s.blocking && s.override) return true; // bypass/override
      if (!s.walkable && s.blocking) return false;             // blocking
    }

    // objects (AABB-lite checks)
    for (const oId in this.objectDict) {
      const o = this.objectDict[oId];
      const minX = o.pos.x - o.scale.x * (o.size.x / 2);
      const minY = o.pos.y - o.scale.y * (o.size.y / 2);
      const withinX = (xx, a, b, inc = false) => (inc ? (xx >= a && xx <= b) : (xx > a && xx < b));
      const xHit = withinX(x, minX, o.pos.x, true);
      const yHit = withinX(y, minY, o.pos.y, true);

      if (!o.walkable && xHit && yHit && !o.blocking && o.override) return true;
      if (!o.walkable && ((o.pos.x === x && o.pos.y === y) || (xHit && yHit)) && o.blocking) return false;
    }

    // tile walkability
    return (this.walkability[(y - this.bounds[1]) * this.size[0] + (x - this.bounds[0])] & direction) !== 0;
  };

  /**
   * Checks if within range.
   * @param {number} x - The value.
   * @param {number} a - The min.
   * @param {number} b - The max.
   * @param {boolean} [include=false] - Whether inclusive.
   * @returns {boolean} Whether within.
   */
  within = (x, a, b, include = false) => (include ? (x >= a && x <= b) : (x > a && x < b));

  /**
   * Triggers a script.
   * @param {string} id - The script ID.
   */
  triggerScript = (id) => {
    for (const x of this.scripts) if (x.id === id) this.runWhenLoaded(x.trigger.bind(this));
  };

  /**
   * Moves a sprite.
   * @param {string} id - The sprite ID.
   * @param {number[]} location - The location.
   * @param {boolean} [running=false] - Whether running.
   * @returns {Promise} The promise.
   */
  moveSprite = async (id, location, running = false) => new Promise(async (resolve) => {
    const sprite = this.getSpriteById(id);
    await sprite.addAction(new ActionLoader(this.engine, 'patrol', [sprite.pos.toArray(), location, running ? 200 : 600, this], sprite, resolve));
  });

  /**
   * Shows sprite dialogue.
   * @param {string} id - The sprite ID.
   * @param {string} dialogue - The dialogue.
   * @param {object} [options={ autoclose: true }] - The options.
   * @returns {Promise} The promise.
   */
  spriteDialogue = async (id, dialogue, options = { autoclose: true }) => new Promise(async (resolve) => {
    const sprite = this.getSpriteById(id);
    await sprite.addAction(new ActionLoader(this.engine, 'dialogue', [dialogue, false, options], sprite, resolve));
  });

  /**
   * Runs actions.
   * @param {object[]} actions - The actions.
   * @returns {Promise} The promise.
   */
  runActions = async (actions) => {
    const scope = this;
    let p = Promise.resolve();
    for (const action of actions) {
      p = p.then(async () => {
        if (!action) return;
        try {
          action.scope = action.scope || scope;
          if (action.sprite) {
            const sprite = action.scope.getSpriteById(action.sprite);
            if (sprite && action.action) {
              const args = [...action.args];
              const options = args.pop();
              await sprite.addAction(new ActionLoader(scope.engine, action.action, [...args, { ...options }], sprite, () => { }));
            }
          }
          if (action.trigger) {
            const avatar = action.scope.getSpriteById('avatar');
            if (avatar) await avatar.addAction(new ActionLoader(scope.engine, 'script', [action.trigger, action.scope, () => { }], avatar));
          }
        } catch (e) {
          console.warn('runActions error', e?.message || e);
        }
      });
    }
    return p.catch((err) => { if (this.engine?.debug) console.warn('runActions chain', err); });
  };

  /**
   * Plays a cutscene.
   * @param {string} id - The cutscene ID.
   * @param {object} [spritz=null] - The spritz.
   * @returns {Promise} The promise.
   */
  playCutScene = async (id, spritz = null) => {
    const seq = spritz || this.spritz;
    for (const x of seq) {
      try {
        x.currentStep = x.currentStep || 0;
        if (x.currentStep > seq.length) continue;
        if (x.id === id) await this.runActions(x.actions);
      } catch (e) { console.error(e); }
    }
  };
}
