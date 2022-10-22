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
import { Direction } from '@Engine/utils/enums.jsx';
import Resources from '@Engine/utils/resources.jsx';
import ActionQueue from '@Engine/core/queue.jsx';
import { Vector } from '@Engine/utils/math/vector.jsx';
import { SpriteLoader, TilesetLoader, ActionLoader, ObjectLoader } from '@Engine/utils/loaders/index.jsx';
import { loadMap } from '@Scenes/dynamic/maps/map.jsx';
import { dynamicCells } from '@Scenes/dynamic/maps/cells.jsx';

// for dynamic loading -- todo
// import { loadMap } from "../../scenes/maps/dynamic/map";
// import { dynamicCells } from "../../scenes/maps/dynamic/cells";

export default class Zone {
  constructor(zoneId, world) {
    this.sceneName = world.id;
    this.id = zoneId;
    this.world = world;
    this.data = {};
    this.spriteDict = {};
    this.spriteList = [];
    this.objectDict = {};
    this.objectList = [];
    this.scenes = [];
    this.lastKey = Date.now();
    this.engine = world.engine;
    this.onLoadActions = new ActionQueue();
    this.spriteLoader = new SpriteLoader(world.engine);
    this.objectLoader = new ObjectLoader(world.engine);
    this.tsLoader = new TilesetLoader(world.engine);
    this.audio = null;
    // bind
    this.onTilesetDefinitionLoaded = this.onTilesetDefinitionLoaded.bind(this);
    this.onTilesetOrSpriteLoaded = this.onTilesetOrSpriteLoaded.bind(this);
    this.loadSprite = this.loadSprite.bind(this, this);
    this.loadObject = this.loadObject.bind(this, this);
    this.checkInput = this.checkInput.bind(this);
  }

  // Load Map Resource from URL
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
        this.tileset = await this.tsLoader.load(data.tileset, this.sceneName);
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

  // Load Tileset Directly (precompiled)
  async load() {
    try {
      // Extract and Read in Information
      let data = require('@Scenes/' + this.sceneName + '/maps/' + this.id + '/map.jsx')['default'];
      Object.assign(this, data);
      // handle cells generator
      if (typeof this.cells == 'function') {
        this.cells = this.cells(this.bounds, this);
      }
      // audio loader
      if (this.audioSrc) {
        this.audio = this.engine.audioLoader.load(this.audioSrc, true); // loop background music
      }
      // Load tileset and create level geometry & trigger updates
      this.size = [this.bounds[2] - this.bounds[0], this.bounds[3] - this.bounds[1]];
      this.tileset = await this.tsLoader.load(this.tileset, this.sceneName);
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

  // Load from Json components -- For more Dynamic Evaluation
  // todo --- NEEDS TO access the JSON from the World Level to Load New Instances
  // as it is reading everything from the prebundled zip
  async loadJson(zoneJson, cellJson) {
    try {
      // Extract and Read in Information
      console.log({msg: "zone load json", zoneJson, cellJson});
      
      // todo
      // extract tileset from the zip and load
      //

      let tileset = await this.tsLoader.load(zoneJson.tileset, this.sceneName);
      console.log({msg: "zone load tileset found", tileset});
      let cells = dynamicCells(cellJson, tileset.tiles);
      console.log({msg: "zone load map data", cells});
      let map = loadMap(zoneJson, cells);
      console.log({msg: "zone load map data", data});

      Object.assign(this, map);
      // handle cells generator
      if (typeof this.cells === 'string') {
        this.cells = (eval.call(this, this.cells)).call(this, this.bounds, this);
      }
      // audio loader
      if (this.audioSrc) {
        this.audio = this.engine.audioLoader.load(this.audioSrc, true); // loop background music
      }
      console.log({msg: "zone load audio loaded"});

      // Load tileset and create level geometry & trigger updates
      this.tileset = tileset;
      this.size = [this.bounds[2] - this.bounds[0], this.bounds[3] - this.bounds[1]];
      this.tileset.runWhenDefinitionLoaded(this.onTilesetDefinitionLoaded.bind(this));
      this.tileset.runWhenLoaded(this.onTilesetOrSpriteLoaded.bind(this));
      console.log({msg: "zone load tileset loaded"});

      // Load sprites
      if (typeof this.sprites === 'string') {
        this.sprites = (eval.call(this, this.sprites)).call(this, this.bounds, this);
      }
      console.log({msg: "zone load sprites identified"});

      let self = this;
      await Promise.all(self.sprites.map(self.loadSprite));
      await Promise.all(self.objects.map(self.loadObject));
      console.log({msg: "zone load objects/sprites loaded"});

      // Notify the zone sprites when the new sprite has loaded
      self.spriteList.forEach((sprite) => sprite.runWhenLoaded(self.onTilesetOrSpriteLoaded));
      self.objectList.forEach((object) => object.runWhenLoaded(self.onTilesetOrSpriteLoaded));
    } catch (e) {
      console.error('Error parsing json zone ' + this.id);
      console.error(e);
    }
  }

  // Actions to run when the map has loaded
  runWhenLoaded(action) {
    if (this.loaded) action();
    else this.onLoadActions.add(action);
  }

  // When tileset loads
  onTilesetDefinitionLoaded() {
    this.vertexPosBuf = [];
    this.vertexTexBuf = [];
    this.walkability = [];
    // Determine Walkability and Load Vertices
    for (let j = 0, k = 0; j < this.size[1]; j++) {
      let vertices = [];
      let vertexTexCoords = [];
      // Loop over Tiles
      for (let i = 0; i < this.size[0]; i++, k++) {
        let cell = this.cells[k];
        this.walkability[k] = Direction.All;
        let n = Math.floor(cell.length / 3);
        // Calc Walk, Vertex positions and Textures for each cell
        for (let l = 0; l < n; l++) {
          let tilePos = [this.bounds[0] + i, this.bounds[1] + j, cell[3 * l + 2]];
          this.walkability[k] &= this.tileset.getWalkability(cell[3 * l]);
          vertices = vertices.concat(this.tileset.getTileVertices(cell[3 * l], tilePos));
          vertexTexCoords = vertexTexCoords.concat(this.tileset.getTileTexCoords(cell[3 * l], cell[3 * l + 1]));
        }
        // Custom walkability
        if (cell.length == 3 * n + 1) this.walkability[k] = cell[3 * n];
      }
      this.vertexPosBuf[j] = this.engine.createBuffer(vertices, this.engine.gl.STATIC_DRAW, 3);
      this.vertexTexBuf[j] = this.engine.createBuffer(vertexTexCoords, this.engine.gl.STATIC_DRAW, 2);
    }
  }

  // run after each tileset / sprite is loaded
  onTilesetOrSpriteLoaded() {
    if (this.loaded || !this.tileset.loaded || !this.spriteList.every((sprite) => sprite.loaded) || !this.objectList.every((object) => object.loaded))
      return;
    // Load Scene Triggers
    let zone = this;
    this.scripts.forEach((x) => {
      if (x.id === 'load-scene') {
        this.runWhenLoaded(x.trigger.bind(zone));
      }
    });
    // loaded
    this.loaded = true;
    this.onLoadActions.run();
  }

  // load obj model
  async loadObject(_this, data) {
    data.zone = _this;
    if (!this.objectDict[data.id] && !_this.objectDict[data.id]) {
      let newObject = await this.objectLoader.load(data, (sprite) => sprite.onLoad(sprite));
      this.objectDict[data.id] = newObject;
      this.objectList.push(newObject);
    }
  }

  // Load Sprite
  async loadSprite(_this, data, skipCache = false) {
    data.zone = _this;
    if (skipCache || (!this.spriteDict[data.id] && !_this.spriteDict[data.id])) {
      let newSprite = await this.spriteLoader.load(data.type, this.sceneName, (sprite) => sprite.onLoad(data));
      this.spriteDict[data.id] = newSprite;
      this.spriteList.push(newSprite);
    }
  }

  // Add an existing sprite to the zone
  addSprite(sprite) {
    sprite.zone = this;
    this.spriteDict[sprite.id] = sprite;
    this.spriteList.push(sprite);
  }

  // Remove an sprite from the zone
  removeSprite(id) {
    this.spriteList = this.spriteList.filter((sprite) => {
      if (sprite.id !== id) {
        return true;
      } else {
        sprite.removeAllActions();
      }
    });
    delete this.spriteDict[id];
  }

  // Remove all sprites from the zone
  removeAllSprites() {
    this.spriteList = [];
    this.spriteDict = {};
  }

  // Remove an sprite from the zone
  getSpriteById(id) {
    return this.spriteDict[id];
  }

  // add portal to provide list of sprites
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

  // Calculate the height of a point in the zone
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

  // Draw Row of Zone
  drawRow(row) {
    // vertice positions
    this.engine.bindBuffer(this.vertexPosBuf[row], this.engine.shaderProgram.aVertexPosition);
    // texture positions
    this.engine.bindBuffer(this.vertexTexBuf[row], this.engine.shaderProgram.aTextureCoord);
    // texturize
    this.tileset.texture.attach();
    // set shader
    this.engine.shaderProgram.setMatrixUniforms();
    // draw triangles
    this.engine.gl.drawArrays(this.engine.gl.TRIANGLES, 0, this.vertexPosBuf[row].numItems);
  }

  // Draw Frame
  draw() {
    if (!this.loaded) return;
    // Organize by Depth
    this.spriteList?.sort((a, b) => a.pos.y - b.pos.y);
    this.objectList?.sort((a, b) => a.pos.y - b.pos.y);
    this.engine.mvPushMatrix();
    this.engine.setCamera();
    // Draw tile terrain row by row (back to front)
    let k = 0;
    let z = 0;
    for (let j = 0; j < this.size[1]; j++) {
      this.drawRow(j);
      while (z < this.objectList.length && this.objectList[z].pos.y - this.bounds[1] <= j) {
        this.objectList[z++].draw();
      }
      // draw each sprite in front of floor tiles if positioned in front
      while (k < this.spriteList.length && this.spriteList[k].pos.y - this.bounds[1] <= j) {
        this.spriteList[k++].draw(this.engine);
      }
    }
    while (z < this.objectList.length) {
      this.objectList[z++].draw();
    }
    // draw each sprite (fixes tearing)
    while (k < this.spriteList.length) {
      this.spriteList[k++].draw(this.engine);
    }
    this.engine.mvPopMatrix();
  }

  // Update
  tick(time, isPaused) {
    if (!this.loaded || isPaused) return;
    this.checkInput(time);
    this.spriteList.forEach(async (sprite) => sprite.tickOuter(time));
  }

  // read input
  async checkInput(time) {
    if (time > this.lastKey + 100) {
      let touchmap = this.engine.gamepad.checkInput();
      this.lastKey = time;
      switch (this.engine.keyboard.lastPressedKey('o')) {
        case 'o':
          console.log(this.audio);
          await this.moveSprite('monster', [7, 7, this.getHeight(7, 7)], false);
          if (this.audio) this.audio.playAudio();
          break;
      } // play audio
    }
  }

  // Check for zone inclusion
  isInZone(x, y) {
    return x >= this.bounds[0] && y >= this.bounds[1] && x < this.bounds[2] && y < this.bounds[3];
  }

  // Cell Walkable
  isWalkable(x, y, direction) {
    if (!this.isInZone(x, y)) return null;
    console.log('check walk');
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

  // check cells
  within(x, a, b, include = false) {
    if (include && x >= a && x <= b) return true;
    if (!include && x > a && x < b) return true;
    return false;
  }

  // Trigger Script
  triggerScript(id) {
    this.scripts.forEach((x) => {
      if (x.id === id) {
        this.runWhenLoaded(x.trigger.bind(this));
      }
    });
  }

  // Move the sprite
  async moveSprite(id, location, running = false) {
    return new Promise((resolve, reject) => {
      let sprite = this.getSpriteById(id);
      sprite.addAction(new ActionLoader(this.engine, 'patrol', [sprite.pos.toArray(), location, running ? 200 : 600, this], sprite, resolve));
    });
  }

  // Sprite Dialogue
  async spriteDialogue(id, dialogue, options = { autoclose: true }) {
    return new Promise((resolve, reject) => {
      let sprite = this.getSpriteById(id);
      sprite.addAction(new ActionLoader(this.engine, 'dialogue', [dialogue, false, options], sprite, resolve));
    });
  }

  // Run Action configuration from JSON description
  async runActions(actions) {
    let self = this;
    return await actions.reduce(async (prev, action) => {
      return await prev
        .then(
          async () =>
            new Promise((resolve, reject) => {
              if (!action) resolve();
              try {
                if (!action.scope) action.scope = self;
                if (action.sprite) {
                  let sprite = action.scope.getSpriteById(action.sprite);
                  // apply action
                  if (sprite && action.action) {
                    let args = action.args;
                    let options = args.pop();
                    sprite.addAction(new ActionLoader(self.engine, action.action, [...args, { ...options }], sprite, () => resolve(self)));
                  }
                }
                // trigger script
                if (action.trigger) {
                  let sprite = action.scope.getSpriteById('avatar');
                  if (sprite && action.trigger) {
                    sprite.addAction(new ActionLoader(self.engine, 'script', [action.trigger, action.scope, () => resolve(self)], sprite));
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

  // Play a scene
  async playScene(id, scenes = null) {
    let self = this;
    if (!scenes) {
      scenes = self.scenes;
    }
    scenes.forEach(async function runScene(x) {
      try {
        if (!x.currentStep) {
          x.currentStep = 0; // Starting
        }
        if (x.currentStep > scenes.length) {
          return; // scene finished
        }
        if (x.id === id) {
          // found scene
          await self.runActions(x.actions);
        }
      } catch (e) {
        console.error(e);
      }
    });
  }
}
