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

import Resources from "./resources.jsx";
import Sprite from "../sprite.jsx";
import Tileset from "../tileset.jsx";
import Action from "../action.jsx";

// Helps Loads New Tileset Instance
export class TilesetLoader {
  constructor(engine) {
    this.engine = engine;
    this.tilesets = {};
  }
  // Load tileset asynchronously over network
  async loadRemote(name) {
    let tileset = this.tilesets[name];
    if (tileset) return tileset;
    // Generate Tileset
    this.tilesets[name] = tileset = new Tileset(this.engine);
    tileset.name = name;
    // Fetch Image and Apply
    const fileResponse = await fetch(Resources.tilesetRequestUrl(name));
    if (fileResponse.ok) {
      try {
        let content = await fileResponse.json();
        await tileset.loadTileset(content);
      } catch (e) {
        console.error("Error parsing tileset '" + tileset.name + "' definition");
        console.error(e);
      }
    }
    return this.tilesets[name];
  }

  // Load Tileset Directly (precompiled)
  async load(type) {
    let tileset = this.tilesets[type];
    if (tileset) return tileset;
    let instance = new Tileset(this.engine);
    this.tilesets[type] = instance;
    instance.loadTileset(require("../../scene/tilesets/" + type + ".tileset.jsx")["default"]);
    return instance;
  }
}

// Helps Loads New Sprite Instance
export class SpriteLoader {
  constructor(engine) {
    this.engine = engine;
    this.definitions = [];
    this.instances = {};
  }
  // Load Sprite
  async load(type) {
    if (!this.instances[type]) {
      this.instances[type] = [];
    }
    // New Instance
    let instance = new Sprite(this.engine, type);
    this.instances[type].push({ instance });
    return instance;
  }
}

// Helps Loads New Sprite Instance
export class DialogueLoader {
  constructor(engine) {
    this.engine = engine;
    this.definitions = [];
    this.instances = {};
  }
  // Load Sprite
  async load(type) {
    if (!this.instances[type]) {
      this.instances[type] = [];
    }
    // New Instance
    let instance = new Dialogue(this.engine, type);
    this.instances[type].push({ instance });
    return instance;
  }
}

// Helps Loads New Action Instance
export class ActionLoader {
  constructor(sprite, type, args) {
    this.engine = sprite.engine;
    this.type = type;
    this.args = args;
    this.sprite = sprite;
    this.instances = {};
    this.definitions = [];
    this.time = new Date().getTime();
    this.id = sprite.id + "-" + type + "-" + time;
    return this.load(type, args);
  }
  // Load Action
  load(type, args) {
    if (!this.instances[type]) {
      this.instances[type] = [];
    }
    // New Instance (assigns properties loaded by type)
    let instance = new Action(this.type, this.sprite);
    instance.configure(type, sprite, this.id, this.time, args);
    instance.onLoad(args);
    return instance;
  }
}
