/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine           **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */
import { Direction, mergeDeep } from '@Engine/utils/enums.js';
import Resources from '@Engine/utils/resources.js';
import ActionQueue from '@Engine/core/queue/index.js';
import { Vector } from '@Engine/utils/math/vector.js';
import { EventLoader, SpriteLoader, TilesetLoader, ActionLoader, ObjectLoader } from '@Engine/utils/loaders/index.js';
import { loadMap, dynamicCells } from '@Engine/dynamic/map.js';
import Loadable from '@Engine/core/queue/loadable.js';
import PixosLuaInterpreter from '@Engine/scripting/PixosLuaInterpreter.js';

export default class Zone extends Loadable {
  /** @param {string} zoneId @param {World} world */
  constructor(zoneId, world) {
    super();
    this.spritzName = world.id;
    this.id = zoneId;
    this.objId = Math.round(Math.random() * 100);
    this.world = world;

    // state
    this.data = {};
    this.spriteDict = Object.create(null);
    this.spriteList = [];
    this.objectDict = Object.create(null);
    this.objectList = [];
    this.selectedTiles = [];
    this.lights = [];
    this.spritz = [];
    this.scripts = this.scripts || [];

    this.lastKey = 0;
    this.engine = world.engine;
    this.onLoadActions = new ActionQueue();

    // loaders
    this.spriteLoader = new SpriteLoader(world.engine);
    this.objectLoader = new ObjectLoader(world.engine);
    this.EventLoader = EventLoader;
    this.tsLoader = new TilesetLoader(world.engine);

    this.audio = null;

    // cached per-frame helpers (set each frame in draw())
    this._selectedSet = null;
    this._highlight = null;
  }

  /** ---------------------------
   * Loading helpers
   * --------------------------- */
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

  attachTilesetListeners = () => {
    this.tileset.runWhenDefinitionLoaded(this.onTilesetDefinitionLoaded);
    this.tileset.runWhenLoaded(this.afterTilesetAndActorsLoaded);
  };

  finalize = async () => {
    // notify sprites/objects when they load
    for (const s of this.spriteList) s.runWhenLoaded(this.afterTilesetAndActorsLoaded);
    for (const o of this.objectList) o.runWhenLoaded(this.afterTilesetAndActorsLoaded);
  };

  /** Load Map Resource from URL */
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
      // If the zone JSON declares a mode, load mode scripts from the zip
      try { if (zoneJson.mode) await this.loadModeFromZip(zoneJson.mode, zip); } catch (e) { console.warn('zone mode load failed', e); }
    } catch (e) {
      console.error('Error parsing zone ' + this.id, e);
    }
  };

  /** Load Tileset Directly (precompiled) */
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
      try { if (data.mode) await this.loadMode(data.mode); } catch (e) { console.warn('zone mode load failed', e); }
    } catch (e) {
      console.error('Error parsing zone ' + this.id, e);
    }
  };

  /** Load trigger scripts from a zip (Lua preferred, JS fallback) */
  loadTriggerFromZip = async (trigger, zip) => {
    // Try Lua first
    try {
      const file = await zip.file(`triggers/${trigger}.lua`);
      if (file) {
        const luaScript = await file.async('string');
        return (_this, subject) => {
          const interpreter = new PixosLuaInterpreter(_this.engine);
          interpreter.setScope({ _this, zone: this, subject });
          interpreter.initLibrary();
          return interpreter.run(luaScript);
        };
      }
    } catch (e) {
      if (this.engine?.debug) console.warn('Lua trigger load failed', e);
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

  /** Load mode scripts from a zip (Lua preferred). Registers handlers with the world's ModeManager. */
  loadModeFromZip = async (modeName, zip) => {
    try {
      const setupFile = zip.file(`modes/${modeName}/setup.lua`);
      const updateFile = zip.file(`modes/${modeName}/update.lua`);
      const teardownFile = zip.file(`modes/${modeName}/teardown.lua`);
      const world = this.world;

      const interpreter = new PixosLuaInterpreter(this.engine);
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
            const ui = new PixosLuaInterpreter(this.engine);
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
        handlers.teardown = async (params) => { try { const td = new PixosLuaInterpreter(this.engine); td.setScope({ zone: this }); td.initLibrary(); await td.run(tdScript); } catch (e) { console.warn('mode teardown failed', e); } };
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

  /** Load mode scripts from filesystem (JS fallback). */
  loadMode = async (modeName) => {
    try {
      const world = this.world;
      // prefer JS files under spritz package (setup.js / update.js)
      try {
        // attempt to require a JS module that exports { setup, update, teardown }
        // eslint-disable-next-line global-require, import/no-dynamic-require
        const mod = require('@Spritz/' + this.spritzName + '/modes/' + modeName + '/setup.js');
        if (mod) {
          const handlers = {};
          if (mod.setup) handlers.setup = mod.setup.bind(this);
          if (mod.update) handlers.update = mod.update.bind(this);
          if (mod.teardown) handlers.teardown = mod.teardown.bind(this);
          if (world && world.modeManager) world.modeManager.register(modeName, handlers);
        }
      } catch (e) {
        // ignore missing JS fallback
      }
    } catch (e) {
      console.warn('loadMode failed', modeName, e);
    }
  };

  /** Load from JSON components within a zip */
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
      const map = await loadMap.call(this, zoneJson, cells, zip);
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
      await this.finalize();
      // If the loaded map object includes a 'mode' property attempt to load a mode module
      try {
        if (this.mode)
          await this.loadMode(this.mode);
      } catch (e) {
        console.warn('zone mode load failed', e);
      }
    } catch (e) {
      console.error('Error parsing json zone ' + this.id, e);
    }
  };

  /** Tear down */
  runWhenDeleted = () => {
    for (const l of this.lights) this.engine.renderManager.lightManager.removeLight(l.id);
  };

  /** Tileset definition loaded: build GPU buffers + picking IDs */
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

        for (let l = 0; l < layers; l++) {
          const tileId = cell[3 * l];
          const tileVariant = cell[3 * l + 1];
          const z = cell[3 * l + 2];
          const tilePos = [this.bounds[0] + i, this.bounds[1] + j, z];
          walk &= this.tileset.getWalkability(tileId);
          cellVertices = cellVertices.concat(this.tileset.getTileVertices(tileId, tilePos));
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

  /** Trigger scripts to load (useful for menus, etc.) */
  loadScripts = (refresh = false) => {
    if (this.world.isPaused) return;
    const zone = this;
    for (const x of this.scripts) {
      if (x.id === 'load-spritz' && refresh) this.runWhenLoaded(x.trigger.bind(zone));
    }
  };

  /** Actor loaders */
  loadObject = async (data) => {
    data.zone = this;
    if (!this.objectDict[data.id]) {
      const obj = await this.objectLoader.load(data, (o) => o.onLoad(o));
      this.world.objectDict[data.id] = this.objectDict[data.id] = obj;
      this.objectList.push(obj);
      this.world.objectList.push(obj);
    }
  };

  loadObjectFromZip = async (data, zip) => {
    data.zone = this;
    if (!this.objectDict[data.id]) {
      const obj = await this.objectLoader.loadFromZip(zip, data, async (o) => o.onLoadFromZip(o, zip));
      this.world.objectDict[data.id] = this.objectDict[data.id] = obj;
      this.objectList.push(obj);
      this.world.objectList.push(obj);
    }
  };

  loadSprite = async (data) => {
    data.zone = this;
    if (!this.spriteDict[data.id]) {
      const spr = await this.spriteLoader.load(data.type, this.spritzName, (s) => s.onLoad(data));
      this.world.spriteDict[data.id] = this.spriteDict[data.id] = spr;
      this.spriteList.push(spr);
      this.world.spriteList.push(spr);
    }
  };

  loadSpriteFromZip = async (data, zip) => {
    data.zone = this;
    if (!this.spriteDict[data.id]) {
      const spr = await this.spriteLoader.loadFromZip(zip, data.type, this.spritzName, async (s) => s.onLoadFromZip(data, zip));
      this.world.spriteDict[data.id] = this.spriteDict[data.id] = spr;
      this.spriteList.push(spr);
      this.world.spriteList.push(spr);
    }
  };

  /** Sprite management */
  addSprite = (sprite) => {
    sprite.zone = this;
    this.world.spriteDict[sprite.id] = this.spriteDict[sprite.id] = sprite;
    this.spriteList.push(sprite);
    this.world.spriteList.push(sprite);
  };

  removeSprite = (id) => {
    const keep = (s) => {
      if (s.id !== id) return true; s.removeAllActions(); return false;
    };
    this.spriteList = this.spriteList.filter(keep);
    this.world.spriteList = this.world.spriteList.filter(keep);
    delete this.spriteDict[id];
    delete this.world.spriteDict[id];
  };

  removeAllSprites = () => {
    for (const s of this.spriteList) this.removeSprite(s.id);
  };

  getSpriteById = (id) => this.spriteDict[id];

  /** Portals -- look into possibly removing this - or find some way of making it more generic */
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

  /** Height at (x,y) in zone  -- Need to look into supporting multiple layers for advanced map support */
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

  /** Row render — expects selected set/highlight from draw() */
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

  /** Single cell draw (editor tooling) */
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

  /** Draw frame */
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

  /** Tick/update */
  tick = (time, isPaused) => {
    if (!this.loaded || isPaused) return;
    this.checkInput(time);
    for (const s of this.spriteList) s.tickOuter(time);
  };

  /** Input */
  checkInput = async (time) => {
    if (time <= this.lastKey + 200) return;
    this.engine.gamepad.checkInput();
    this.lastKey = time;
    // todo - look into hooks - game modes (allow for scripting keymaps)
  };

  /** Geometry */
  isInZone = (x, y) => (x >= this.bounds[0] && y >= this.bounds[1] && x < this.bounds[2] && y < this.bounds[3]);

  onSelect = async (row, cell) => {
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
      const file = this.engine.spritz.zip.file(`triggers/${this.selectTrigger}.lua`);
      if (!file) throw new Error('No Lua Script Found');
      const luaScript = await file.async('string');
      const interpreter = new PixosLuaInterpreter(this.engine);
      interpreter.setScope({ _this: this, zone: this, subject: new interpreter.lua.Table([row, cell]) });
      interpreter.initLibrary();
      return await interpreter.run(luaScript);
    } catch (e) {
      if (this.engine?.debug) console.warn('select trigger missing', e);
    }
  };

  /** Walkability */
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

  within = (x, a, b, include = false) => (include ? (x >= a && x <= b) : (x > a && x < b));

  /** Scripting */
  triggerScript = (id) => {
    for (const x of this.scripts) if (x.id === id) this.runWhenLoaded(x.trigger.bind(this));
  };

  /** Actions */
  moveSprite = async (id, location, running = false) => new Promise(async (resolve) => {
    const sprite = this.getSpriteById(id);
    await sprite.addAction(new ActionLoader(this.engine, 'patrol', [sprite.pos.toArray(), location, running ? 200 : 600, this], sprite, resolve));
  });

  spriteDialogue = async (id, dialogue, options = { autoclose: true }) => new Promise(async (resolve) => {
    const sprite = this.getSpriteById(id);
    await sprite.addAction(new ActionLoader(this.engine, 'dialogue', [dialogue, false, options], sprite, resolve));
  });

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

  /** Cutscenes */
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
