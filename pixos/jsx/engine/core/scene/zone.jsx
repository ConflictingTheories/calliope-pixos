/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2023 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */
import { Direction, mergeDeep } from '@Engine/utils/enums.jsx';
import Resources from '@Engine/utils/resources.jsx';
import ActionQueue from '@Engine/core/queue/index.jsx';
import { Vector } from '@Engine/utils/math/vector.jsx';
import { EventLoader, SpriteLoader, TilesetLoader, ActionLoader, ObjectLoader } from '@Engine/utils/loaders/index.jsx';
import { loadMap, dynamicCells } from '@Engine/dynamic/map.jsx';
import Loadable from '@Engine/core/queue/loadable.jsx';
import PixosLuaInterpreter from '@Engine/scripting/PixosLuaInterpreter.jsx';

export default class Zone extends Loadable {
  /**
   * Zones represent Map Sections either standalone or part of a set
   * @param {string} zoneId
   * @param {World} world
   */
  constructor(zoneId, world) {
    super();
    this.spritzName = world.id;
    this.id = zoneId;
    this.objId = Math.round(Math.random() * 100);
    this.world = world;
    this.data = {};
    this.spriteDict = {};
    this.spriteList = [];
    this.objectDict = {};
    this.objectList = [];
    this.selectedTiles = [];
    this.lights = [];
    this.spritz = [];
    this.lastKey = Date.now();
    this.engine = world.engine;
    this.onLoadActions = new ActionQueue();
    this.spriteLoader = new SpriteLoader(world.engine);
    this.objectLoader = new ObjectLoader(world.engine);
    this.EventLoader = EventLoader;
    this.tsLoader = new TilesetLoader(world.engine);
    this.audio = null;
    // bind
    this.onTilesetDefinitionLoaded = this.onTilesetDefinitionLoaded.bind(this);
    this.onTilesetOrSpriteLoaded = this.onTilesetOrSpriteLoaded.bind(this);
    this.loadObjectFromZip = this.loadObjectFromZip.bind(this, this);
    this.loadSpriteFromZip = this.loadSpriteFromZip.bind(this, this);
    this.loadSprite = this.loadSprite.bind(this, this);
    this.playCutScene = this.playCutScene.bind(this, this);
    this.loadObject = this.loadObject.bind(this, this);
    this.checkInput = this.checkInput.bind(this);
  }

  /**
   * Load Map Resource from URL
   */
  async loadRemote() {
    const fileResponse = await fetch(Resources.zoneRequestUrl(this.id));
    if (fileResponse.ok) {
      try {
        // Extract and Read in Information
        let data = await fileResponse.json();
        this.bounds = data.bounds;
        this.size = [data.bounds[2] - data.bounds[0], data.bounds[3] - data.bounds[1]];
        // cells
        this.cells = typeof data.cells == 'function' ? data.cells(this.bounds, this) : data.cells;
        // sprites
        this.sprites = typeof data.sprites == 'function' ? data.sprites(this.bounds, this) : data.sprites;
        // Load tileset and create level geometry & trigger updates
        this.tileset = await this.tsLoader.load(data.tileset, this.spritzName);
        this.tileset.runWhenDefinitionLoaded(this.onTilesetDefinitionLoaded.bind(this));
        this.tileset.runWhenLoaded(this.onTilesetOrSpriteLoaded.bind(this));
        // Load sprites from tileset
        if (data.sprites) await Promise.all(data.sprites.map(this.loadSprite.bind(this)));
        if (data.objects) await Promise.all(data.objects.map(this.loadObject.bind(this)));
        // Notify the zone sprites when the new sprite has loaded
        this.spriteList.forEach((sprite) => sprite.runWhenLoaded(this.onTilesetOrSpriteLoaded.bind(this)));
        this.objectList.forEach((object) => object.runWhenLoaded(this.onTilesetOrSpriteLoaded.bind(this)));
      } catch (e) {
        console.error('Error parsing zone ' + this.id);
        console.error(e);
      }
    }
  }

  /**
   * Load Tileset Directly (precompiled)
   */
  async load() {
    try {
      // Extract and Read in Information
      let data = require('@Spritz/' + this.spritzName + '/maps/' + this.id + '/map.jsx')['default'];
      Object.assign(this, data);
      // handle cells generator
      if (typeof this.cells == 'function') {
        this.cells = this.cells(this.bounds, this);
      }
      // audio loader
      if (this.audioSrc) {
        this.audio = this.engine.resourceManager.audioLoader.load(this.audioSrc, true); // loop background music
      }
      // Load tileset and create level geometry & trigger updates
      this.size = [this.bounds[2] - this.bounds[0], this.bounds[3] - this.bounds[1]];
      this.tileset = await this.tsLoader.load(this.tileset, this.spritzName);
      this.tileset.runWhenDefinitionLoaded(this.onTilesetDefinitionLoaded.bind(this));
      this.tileset.runWhenLoaded(this.onTilesetOrSpriteLoaded.bind(this));
      // Load sprites
      if (typeof this.sprites == 'function') {
        this.sprites = this.sprites(this.bounds, this);
      }
      let self = this;
      await Promise.all(self.sprites.map(self.loadSprite));
      await Promise.all(self.objects.map(self.loadObject));
      // Notify the zone sprites when the new sprite has loaded
      self.spriteList.forEach((sprite) => sprite.runWhenLoaded(self.onTilesetOrSpriteLoaded));
      self.objectList.forEach((object) => object.runWhenLoaded(self.onTilesetOrSpriteLoaded));
    } catch (e) {
      console.error('Error parsing zone ' + this.id);
      console.error(e);
    }
  }

  /**
   * load trigger scripts from zip
   * @param {string} trigger
   * @param {Zip} zip
   * @returns
   */
  async loadTriggerFromZip(trigger, zip) {
    // lua scripting
    try {
      let luaScript = await zip.file(`triggers/${trigger}.lua`).async('string');
      console.log({ msg: 'lua script', luaScript });

      return (_this, subject) => {
        let interpreter = new PixosLuaInterpreter(_this.engine);
        interpreter.setScope({ _this, zone: this, subject });
        interpreter.initLibrary();
        interpreter.run('print("hello world lua - zone trigger from zip")');
        return interpreter.run(luaScript);
      };
    } catch (e) {
      console.error({ msg: 'error loading lua script', e });
    }

    // JS scripting
    let triggerScript = await zip.file(`triggers/${trigger}.js`).async('string');
    return eval.call(this, triggerScript);
  }

  /**
   * Load from Json components -- For more Dynamic Evaluation
   * todo --- NEEDS TO access the JSON from the World Level to Load New Instances
   * as it is reading everything from the prebundled zip
   * @param {*} zoneJson
   * @param {*} cellJson
   * @param {Zip} zip
   * @param {boolean} skipCache
   */
  async loadZoneFromZip(zoneJson, cellJson, zip, skipCache = false) {
    let self = this;
    console.log('loading zip');

    try {
      // zone extensions
      if (zoneJson.extends) {
        console.log('extendings');
        let extension = {};
        console.log({ zoneJson, cellJson, zip });
        await Promise.all(
          zoneJson.extends.map(async (file) => {
            let stringD = JSON.parse(await zip.file('maps/' + file + '/map.json').async('string'));
            extension = mergeDeep(extension, stringD);
            console.log(JSON.parse(JSON.stringify(extension)));
          })
        );
        // unset
        zoneJson.extends = null;
        Object.assign(extension, zoneJson);
        zoneJson = extension;
      }
      console.log({ zoneJson });
      // cell extensions
      if (cellJson.extends) {
        let cells = [];
        await Promise.all(
          cellJson.extends.map(async (file) => {
            let stringD = JSON.parse(await zip.file('maps/' + file + '/cells.json').async('string'));
            if (stringD.cells) {
              cells = cells.concat(stringD.cells);
            } else {
              cells = cells.concat(stringD);
            }
          })
        );
        cellJson = cells.concat(cellJson.cells);
      }
      console.log({ cellJson });
      // load game menus & pause usually
      if (zoneJson.menu) {
        let menus = {};
        await Promise.all(
          Object.keys(zoneJson.menu).map(async (id) => {
            let menu = zoneJson.menu[id];
            menu.id = id;
            if (menu.onOpen) {
              menu.onOpen = (await self.loadTriggerFromZip(menu.onOpen, zip)).bind(self, self);
            }
            if (menu.trigger) {
              menu.trigger = (await self.loadTriggerFromZip(menu.trigger, zip)).bind(self, self);
            }
            menus[id] = menu;
          })
        );
        // launch the start menu
        this.menus = menus;
        this.world.startMenu(this.menus);
      }

      try {
        // Extract and Read in Information
        var tileset = await this.tsLoader.loadFromZip(zip, zoneJson.tileset, this.spritzName);
        console.log('tileset');
        var cells = dynamicCells(cellJson, tileset.tiles);
        console.log('cells');
        var map = await loadMap.call(this, zoneJson, cells, zip);
        console.log('map');
        Object.assign(this, map);
        console.log('map assign');
      } catch (e) {
        console.log(this);
        console.error({ msg: 'error reading in zone & cell data', e });
      }

      // handle cells generator
      try {
        if (typeof this.cells === 'string') {
          this.cells = eval.call(this, this.cells).call(this, this.bounds, this);
        }
      } catch (e) {
        console.error({ msg: 'error loading cell function', e });
      }

      // load audio
      try {
        console.log({ msg: 'audio....', src: zoneJson.audioSrc, scope: this });
        if (zoneJson.audioSrc) {
          this.audio = await this.engine.resourceManager.audioLoader.loadFromZip(zip, zoneJson.audioSrc, true); // loop background music
        }
      } catch (e) {
        console.error({ msg: 'error loading audio track', e });
      }

      // load lights
      try {
        this.lights = zoneJson.lights ?? [];
        this.lights.forEach((light) =>
          this.engine.renderManager.lightManager.addLight(
            light.id,
            light.pos,
            light.color,
            light.attenuation,
            light.direction,
            light.density,
            light.scatteringCoefficients,
            light.enabled
          )
        );
        console.log({ msg: 'lights....', lm: this.engine.renderManager.lightManager });
      } catch (e) {
        console.error({ msg: 'error loading lights', e });
      }

      // Load tileset and create level geometry & trigger updates
      try {
        this.tileset = tileset;
        console.log({ msg: 'tileset....', tileset: this.tileset });
        this.size = [this.bounds[2] - this.bounds[0], this.bounds[3] - this.bounds[1]];
      } catch (e) {
        console.error({ msg: 'error loading tileset', e });
      }

      // Load sprites (todo -- allow for generator scripts much like triggers)
      try {
        if (typeof this.sprites === 'string') {
          this.sprites = eval.call(self, self.sprites).call(self, self.bounds, self);
        }
      } catch (e) {
        console.error({ msg: 'error loading sprite function', e });
      }

      // sprites from zip
      try {
        await Promise.all(
          self.sprites.map(async (sprite) => {
            let sprit = await self.loadSpriteFromZip(sprite, zip, skipCache);
            return sprit;
          })
        );
      } catch (e) {
        console.error({ msg: 'error loading sprites from map', e });
      }

      // objects from zip
      try {
        await Promise.all(self.objects.map((object) => self.loadObjectFromZip(object, zip)));
      } catch (e) {
        console.error({ msg: 'error loading objects from map', e });
      }

      // notify when tilesets are loaded
      this.tileset.runWhenDefinitionLoaded(this.onTilesetDefinitionLoaded.bind(this));
      this.tileset.runWhenLoaded(this.onTilesetOrSpriteLoaded.bind(this));

      // Notify the zone sprites when the new sprite has loaded
      self.spriteList.forEach((sprite) => sprite.runWhenLoaded(self.onTilesetOrSpriteLoaded));

      // load objects and notify others
      self.objectList.forEach((object) => object.runWhenLoaded(self.onTilesetOrSpriteLoaded));
    } catch (e) {
      console.error('Error parsing json zone ' + this.id);
      console.error(e);
    }
  }

  /**
   * tear down
   */
  runWhenDeleted() {
    // remove lights associated with zone
    this.lights.forEach((light) => this.engine.renderManager.lightManager.removeLight(light.id));
  }

  /**
   * When tileset loads
   */
  onTilesetDefinitionLoaded() {
    this.cellVertexPosBuf = Array.from(Array(this.size[1]), () => new Array(this.size[0]));
    this.cellVertexTexBuf = Array.from(Array(this.size[1]), () => new Array(this.size[0]));
    this.walkability = [];
    // Determine Walkability and Load Vertices
    for (let j = 0, k = 0; j < this.size[1]; j++) {
      // Loop over Tiles
      for (let i = 0; i < this.size[0]; i++, k++) {
        let cellVertices = [];
        let cellVertexTexCoords = [];

        let cell = this.cells[k];

        // Calc Walk, Vertex positions and Textures for each cell
        let n = Math.floor(cell.length / 3);
        this.walkability[k] = Direction.All;
        for (let l = 0; l < n; l++) {
          let tilePos = [this.bounds[0] + i, this.bounds[1] + j, cell[3 * l + 2]];
          this.walkability[k] &= this.tileset.getWalkability(cell[3 * l]);

          // add to cell
          cellVertices = cellVertices.concat(this.tileset.getTileVertices(cell[3 * l], tilePos));
          cellVertexTexCoords = cellVertexTexCoords.concat(this.tileset.getTileTexCoords(cell[3 * l], cell[3 * l + 1]));
        }

        this.cellVertexPosBuf[j][i] = this.engine.renderManager.createBuffer(cellVertices, this.engine.gl.STATIC_DRAW, 3);
        this.cellVertexTexBuf[j][i] = this.engine.renderManager.createBuffer(cellVertexTexCoords, this.engine.gl.STATIC_DRAW, 2);

        // Custom walkability
        if (cell.length == 3 * n + 1) this.walkability[k] = cell[3 * n];
      }
    }
  }

  /**
   * run after each tileset / sprite is loaded
   * @returns
   */
  onTilesetOrSpriteLoaded() {
    if (this.loaded || !this.tileset.loaded || !this.spriteList.every((sprite) => sprite.loaded) || !this.objectList.every((object) => object.loaded))
      return;
    // loaded
    this.loaded = true;
    this.loadScripts(true);
    this.onLoadActions.run();
  }

  /**
   * trigger scripts to load (useful for pausing game to show menu, etc.)
   * @param {boolean} refresh
   * @returns
   */
  loadScripts(refresh = false) {
    // Load Spritz Triggers
    if (this.world.isPaused) {
      return;
    }

    let zone = this;
    this.scripts.forEach((x) => {
      if (x.id === 'load-spritz' && refresh) {
        this.runWhenLoaded(x.trigger.bind(zone));
      }
    });
  }

  /**
   * load obj model
   * @param {*} _this
   * @param {*} data
   */
  async loadObject(_this, data) {
    data.zone = _this;
    if (!this.objectDict[data.id] && !_this.objectDict[data.id]) {
      let newObject = await this.objectLoader.load(data, (object) => object.onLoad(object));
      this.world.objectDict[data.id] = this.objectDict[data.id] = newObject;
      this.objectList.push(newObject);
      this.world.objectList.push(newObject);
    }
  }

  /**
   * load obj model from zip bundle
   * @param {*} _this
   * @param {*} data
   * @param {Zip} zip
   */
  async loadObjectFromZip(_this, data, zip) {
    data.zone = _this;
    if (!this.objectDict[data.id] && !_this.objectDict[data.id]) {
      let newObject = await this.objectLoader.loadFromZip(zip, data, async (object) => await object.onLoadFromZip(object, zip));
      this.world.objectDict[data.id] = this.objectDict[data.id] = newObject;
      this.objectList.push(newObject);
      this.world.objectList.push(newObject);
    }
  }

  /**
   * Load Sprite
   * @param {*} _this
   * @param {*} data
   */
  async loadSprite(_this, data) {
    data.zone = _this;
    if (!this.spriteDict[data.id] && !_this.spriteDict[data.id]) {
      let newSprite = await this.spriteLoader.load(data.type, this.spritzName, (sprite) => sprite.onLoad(data));
      this.world.spriteDict[data.id] = this.spriteDict[data.id] = newSprite;
      this.spriteList.push(newSprite);
      this.world.spriteList.push(newSprite);
    }
  }

  /**
   * Load Sprite from zip bundle
   * @param {*} _this
   * @param {*} data
   * @param {Zip} zip
   */
  async loadSpriteFromZip(_this, data, zip) {
    data.zone = _this;
    if (!this.spriteDict[data.id] && !_this.spriteDict[data.id]) {
      let newSprite = await this.spriteLoader.loadFromZip(zip, data.type, this.spritzName, async (sprite) => await sprite.onLoadFromZip(data, zip));
      this.world.spriteDict[data.id] = this.spriteDict[data.id] = newSprite;
      this.spriteList.push(newSprite);
      this.world.spriteList.push(newSprite);
    }
  }

  /**
   * Add an existing sprite to the zone
   * @param {Sprite} sprite
   */
  addSprite(sprite) {
    sprite.zone = this;
    this.world.spriteDict[sprite.id] = this.spriteDict[sprite.id] = sprite;
    this.spriteList.push(sprite);
    this.world.spriteList.push(sprite);
  }

  /**
   * Remove an sprite from the zone
   * @param {string} id
   */
  removeSprite(id) {
    this.spriteList = this.spriteList.filter((sprite) => {
      if (sprite.id !== id) {
        return true;
      } else {
        sprite.removeAllActions();
      }
    });
    this.world.spriteList = this.world.spriteList.filter((sprite) => {
      if (sprite.id !== id) {
        return true;
      } else {
        sprite.removeAllActions();
      }
    });
    delete this.spriteDict[id];
    delete this.world.spriteDict[id];
  }

  /**
   * Remove all sprites from the zone
   */
  removeAllSprites() {
    this.spriteList.forEach((sprite) => {
      this.removeSprite(sprite.id);
    });
  }

  /**
   * Remove an sprite from the zone
   * @param {string} id
   * @returns
   */
  getSpriteById(id) {
    return this.spriteDict[id];
  }

  /**
   * add portal to provide list of sprites
   * @param {Sprites[]} sprites
   * @param {number} x
   * @param {number} y
   * @returns
   */
  addPortal(sprites, x, y) {
    if (this.portals.length > 0 && this.getHeight(x, y) === 0) {
      let portal = this.portals.pop();
      portal.pos = new Vector(...[x, y, this.getHeight(x, y)]);
      sprites.push(portal);
    } else if (this.portals.length > 0 && (x * y) % Math.abs(3) && this.getHeight(x, y) === 0) {
      let portal = this.portals.shift();
      portal.pos = new Vector(...[x, y, this.getHeight(x, y)]);
      sprites.push(portal);
    }
    return sprites;
  }

  /**
   * Calculate the height of a point in the zone
   * @param {number} x
   * @param {number} y
   * @returns
   */
  getHeight(x, y) {
    if (!this.isInZone(x, y)) {
      console.error('Requesting height for [' + x + ', ' + y + '] outside zone bounds');
      return 0;
    }

    let i = Math.floor(x);
    let j = Math.floor(y);
    let dp = [x - i, y - j];

    // Calculate point inside a triangle
    let getUV = (t, p) => {
      // Vectors relative to first vertex
      let u = [t[1][0] - t[0][0], t[1][1] - t[0][1]];
      let v = [t[2][0] - t[0][0], t[2][1] - t[0][1]];

      // Calculate basis transformation
      let d = 1 / (u[0] * v[1] - u[1] * v[0]);
      let T = [d * v[1], -d * v[0], -d * u[1], d * u[0]];

      // Return new coords
      u = (p[0] - t[0][0]) * T[0] + (p[1] - t[0][1]) * T[1];
      v = (p[0] - t[0][0]) * T[2] + (p[1] - t[0][1]) * T[3];
      return [u, v];
    };

    // Check if any of the tiles defines a custom walk polygon
    let cell = this.cells[(j - this.bounds[1]) * this.size[0] + i - this.bounds[0]];
    let n = Math.floor(cell.length / 3);
    for (let l = 0; l < n; l++) {
      let poly = this.tileset.getTileWalkPoly(cell[3 * l]);
      if (!poly) continue;

      // Loop over triangles
      for (let p = 0; p < poly.length; p++) {
        let uv = getUV(poly[p], dp);
        let w = uv[0] + uv[1];
        if (w <= 1) return cell[3 * l + 2] + (1 - w) * poly[p][0][2] + uv[0] * poly[p][1][2] + uv[1] * poly[p][2][2];
      }
    }

    // Use the height of the first tile in the cell
    return cell[2];
  }

  /**
   * Draw Row of Zone
   * @param {*} row
   */
  drawRow(row) {
    // attach tileset texture
    this.tileset.texture.attach();

    for (let l = 0; l < this.size[0]; l++) {
      this.drawCell(row, l);
    }
  }

  /**
   * Draw Row of Zone
   * @param {*} row
   */
  drawCell(row, cell) {
    // vertices and texture coords
    this.engine.renderManager.bindBuffer(this.cellVertexPosBuf[row][cell], this.engine.renderManager.shaderProgram.aVertexPosition);
    this.engine.renderManager.bindBuffer(this.cellVertexTexBuf[row][cell], this.engine.renderManager.shaderProgram.aTextureCoord);

    // set picking id shader
    this.engine.renderManager.effectPrograms['picker'].setMatrixUniforms({ id: this.getPickingId(row, cell) });
    this.engine.renderManager.shaderProgram.setMatrixUniforms({ 
      id: this.getPickingId(row, cell),
      isSelected: this.isCellSelected(row, cell),
      sampler: 1.0,
      colorMultiplier: this.engine.frameCount & 0x8 ? [1, 0, 0, 1] : [1, 1, 0, 1],
    });

    // draw triangles
    this.engine.gl.drawArrays(this.engine.gl.TRIANGLES, 0, this.cellVertexPosBuf[row][cell].numItems);
  }

  /**
   * Check if cell is selected tile: [row,cell]
   * @param {number} row
   * @param {number} cell
   * @returns
   */
  isCellSelected(row, cell) {
    return this.selectedTiles.some((tile) => tile[1] === cell && tile[0] === row);
  }

  /**
   * Return id for picking
   * @returns
   */
  getPickingId(row, cell) {
    const id = [
      (((this.objId) >> 0) & 0xff) / 0xff,
      ((row >> 0) & 0xff) / 0xff,
      ((cell  >> 0) & 0xff) / 0xff,
      255,
    ];
    return id;
  }

  /**
   * Draw Frame
   * @returns
   */
  draw() {
    if (!this.loaded) return;
    // Organize by Depth
    this.spriteList?.sort((a, b) => a.pos.y - b.pos.y);
    this.objectList?.sort((a, b) => a.pos.y - b.pos.y);
    this.engine.renderManager.mvPushMatrix();
    this.engine.renderManager.camera.setCamera();
    // Draw tile terrain row by row (back to front) (Needs work -- NOT WORKING RIGHT YET)
    let k = 0;
    let z = 0;
    switch (this.engine.renderManager.camera.cameraDir) {
      case 'N':
      case 'NE':
      case 'NW':
      case 'E':
        for (let j = 0; j < this.size[1]; j++) {
          this.drawRow(j);

          // todo - look into improving this now that we are using cell-based drawing.
          // draw each sprite in front of floor tiles if positioned in front
          while (z < this.objectList.length && this.objectList[z].pos.y - this.bounds[1] <= j) {
            this.objectList[z++].draw();
          }
          // draw each sprite in front of floor tiles if positioned in front
          // todo -- needs some work - needs to adjust with the camera angle. The position is camera dependent
          while (k < this.spriteList.length && this.spriteList[k].pos.y - this.bounds[1] <= j) {
            this.spriteList[k++].draw(this.engine);
          }
        }
        break;
      case 'W':
      case 'S':
      case 'SW':
      case 'SE':
        for (let j = this.size[1] - 1; j >= 0; j--) {
          this.drawRow(j);

          // todo - look into improving this now that we are using cell-based drawing.
          // draw each sprite in front of floor tiles if positioned in front
          while (z < this.objectList.length && this.bounds[1] - this.objectList[z].pos.y <= j) {
            this.objectList[z++].draw();
          }
          // draw each sprite in front of floor tiles if positioned in front
          // todo -- needs some work - needs to adjust with the camera angle. The position is camera dependent
          while (k < this.spriteList.length && this.bounds[1] - this.spriteList[k].pos.y <= j) {
            this.spriteList[k++].draw(this.engine);
          }
        }
        break;
    }

    while (z < this.objectList.length) {
      this.objectList[z++].draw();
    }
    // draw each sprite (fixes tearing)
    while (k < this.spriteList.length) {
      this.spriteList[k++].draw(this.engine);
    }
    this.engine.renderManager.mvPopMatrix();
  }

  /**
   * Update
   * @param {number} time
   * @param {boolean} isPaused
   * @returns
   */
  tick(time, isPaused) {
    if (!this.loaded || isPaused) return;
    this.checkInput(time);
    this.spriteList.forEach(async (sprite) => sprite.tickOuter(time));
  }

  /**
   * read input
   * @param {number} time
   */
  async checkInput(time) {
    if (time > this.lastKey + 100) {
      let touchmap = this.engine.gamepad.checkInput();
      this.lastKey = time;
      switch (this.engine.keyboard.lastPressedKey('o')) {
        case 'o':
          await this.moveSprite('monster', [7, 7, this.getHeight(7, 7)], false);
          if (this.audio) {
            console.log(this.audio);
            this.audio.playAudio();
          }
          break;
      } // play audio
    }
  }

  /**
   * Check for zone inclusion
   * @param {number} x
   * @param {number} y
   * @returns
   */
  isInZone(x, y) {
    return x >= this.bounds[0] && y >= this.bounds[1] && x < this.bounds[2] && y < this.bounds[3];
  }

  /**
   *
   * @param {number} x
   * @param {number} y
   * @param {number} direction
   * @returns
   */
  isWalkable(x, y, direction) {
    if (!this.isInZone(x, y)) return null;
    for (let sprite in this.spriteDict) {
      if (
        // if sprite bypass & override
        !this.spriteDict[sprite].walkable &&
        this.spriteDict[sprite].pos.x === x &&
        this.spriteDict[sprite].pos.y === y &&
        !this.spriteDict[sprite].blocking &&
        this.spriteDict[sprite].override
      )
        return true;

      if (
        // else if sprite blocking
        !this.spriteDict[sprite].walkable &&
        this.spriteDict[sprite].pos.x === x &&
        this.spriteDict[sprite].pos.y === y &&
        this.spriteDict[sprite].blocking
      )
        return false;
    }
    for (let object in this.objectDict) {
      if (
        // if sprite bypass & override
        !this.objectDict[object].walkable &&
        this.within(
          x,
          this.objectDict[object].pos.x - this.objectDict[object].scale.x * (this.objectDict[object].size.x / 2),
          this.objectDict[object].pos.x
        ) &&
        this.within(
          y,
          this.objectDict[object].pos.y - this.objectDict[object].scale.y * (this.objectDict[object].size.y / 2),
          this.objectDict[object].pos.y
        ) &&
        !this.objectDict[object].blocking &&
        this.objectDict[object].override
      )
        return true;

      if (
        // else if object blocking
        !this.objectDict[object].walkable &&
        ((this.objectDict[object].pos.x === x && this.objectDict[object].pos.y === y) ||
          (this.within(
            x,
            this.objectDict[object].pos.x - this.objectDict[object].scale.x * (this.objectDict[object].size.x / 2),
            this.objectDict[object].pos.x,
            true
          ) &&
            this.within(
              y,
              this.objectDict[object].pos.y - this.objectDict[object].scale.y * (this.objectDict[object].size.y / 2),
              this.objectDict[object].pos.y,
              true
            ))) &&
        this.objectDict[object].blocking
      )
        return false;
    }
    // else tile specific
    return (this.walkability[(y - this.bounds[1]) * this.size[0] + x - this.bounds[0]] & direction) != 0;
  }

  /**
   * check cells for position inclusion
   * @param {number} x
   * @param {number} a
   * @param {number} b
   * @param {boolean} include
   * @returns
   */
  within(x, a, b, include = false) {
    if (include && x >= a && x <= b) return true;
    if (!include && x > a && x < b) return true;
    return false;
  }

  /**
   * Trigger Script
   * @param {string} id
   */
  triggerScript(id) {
    this.scripts.forEach((x) => {
      if (x.id === id) {
        this.runWhenLoaded(x.trigger.bind(this));
      }
    });
  }

  /**
   * Move the sprite
   * @param {string} id
   * @param {number[]} location
   * @param {*} running
   * @returns
   */
  async moveSprite(id, location, running = false) {
    return new Promise(async (resolve, reject) => {
      console.log({ msg: 'moving sprite', id, location, running });
      let sprite = this.getSpriteById(id);
      await sprite.addAction(new ActionLoader(this.engine, 'patrol', [sprite.pos.toArray(), location, running ? 200 : 600, this], sprite, resolve));
    });
  }

  /**
   * Sprite Dialogue
   * @param {string} id
   * @param {string} dialogue
   * @param {*} options
   * @returns
   */
  async spriteDialogue(id, dialogue, options = { autoclose: true }) {
    return new Promise(async (resolve, reject) => {
      console.log({ msg: 'sprite dialogue', id, dialogue, options });
      let sprite = this.getSpriteById(id);
      await sprite.addAction(new ActionLoader(this.engine, 'dialogue', [dialogue, false, options], sprite, resolve));
    });
  }

  /**
   * Run Action configuration from JSON description
   * @param {*} actions
   * @returns
   */
  async runActions(actions) {
    let self = this;
    return await actions.reduce(async (prev, action) => {
      return await prev
        .then(
          async () =>
            new Promise(async (resolve, reject) => {
              if (!action) resolve();
              try {
                if (!action.scope) action.scope = self;
                if (action.sprite) {
                  let sprite = action.scope.getSpriteById(action.sprite);
                  // apply action
                  if (sprite && action.action) {
                    let args = action.args;
                    let options = args.pop();
                    await sprite.addAction(new ActionLoader(self.engine, action.action, [...args, { ...options }], sprite, () => resolve(self)));
                  }
                }
                // trigger script
                if (action.trigger) {
                  let sprite = action.scope.getSpriteById('avatar');
                  if (sprite && action.trigger) {
                    await sprite.addAction(new ActionLoader(self.engine, 'script', [action.trigger, action.scope, () => resolve(self)], sprite));
                  }
                }
              } catch (e) {
                reject(e);
              }
            })
        )
        .catch((err) => {
          console.warn('err', err.message);
        });
    }, Promise.resolve());
  }

  /**
   * Play a spritz
   * @param {string} id
   * @param {*} spritz
   */
  async playCutScene(id, spritz = null) {
    let self = this;
    if (!spritz) {
      spritz = self.spritz;
    }
    spritz.forEach(async function runSpritz(x) {
      try {
        if (!x.currentStep) {
          x.currentStep = 0; // Starting
        }
        if (x.currentStep > spritz.length) {
          return; // spritz finished
        }
        if (x.id === id) {
          // found spritz
          await self.runActions(x.actions);
        }
      } catch (e) {
        console.error(e);
      }
    });
  }
}
