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
import Sprite from "../core/sprite.jsx";
import ModelObject from "../core/object.jsx";
import Tileset from "../core/tileset.jsx";
import Action from "../core/action.jsx";

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
        await tileset.onJsonLoaded(content);
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
    let json = require("../../scene/tilesets/" + type + "/tileset.jsx")["default"];
    instance.onJsonLoaded(json);
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
    let afterLoad = arguments[1];
    let runConfigure = arguments[2];
    if (!this.instances[type]) {
      this.instances[type] = [];
    }
    // New Instance
    let Type = require("../../scene/sprites/" + type + ".jsx")["default"];
    console.log(Type, type);
    let instance = new Type(this.engine);
    instance.templateLoaded = true;
    // Update Existing
    this.instances[type].forEach(function (instance) {
      if (instance.afterLoad) instance.afterLoad(instance.instance);
    });
    // Configure if needed
    if (runConfigure) runConfigure(instance);
    // once loaded
    if (afterLoad) {
      console.log("after load");
      if (instance.templateLoaded) afterLoad(instance);
      else this.instances[type].push({ instance, afterLoad });
    }

    return instance;
  }
}

//helps load sprite
export class ObjectLoader {
  constructor(engine) {
    this.engine = engine;
    this.definitions = [];
    this.instances = {};
  }
  // Load Sprite
  async load(model) {
    let afterLoad = arguments[1];
    let runConfigure = arguments[2];
    if (!this.instances[model.id]) {
      this.instances[model.id] = [];
    }
    let instance = new ModelObject(this.engine);
    instance.update(model);
    // New Instance
    let modelreq = {
      obj: `pixos/models/${instance.type}.obj`,
      mtl: model.mtl ?? false,
      mtlTextureRoot: "/pixos/models",
      downloadMtlTextures: true,
      enableWTextureCoord: false,
      name: instance.id,
    };
    instance.mesh = (await this.engine.objLoader.downloadModels([modelreq]))[model.id];
    instance.templateLoaded = true;
    console.log("loaded model", instance);
    // Update Existing
    this.instances[instance.id].forEach(function (instance) {
      if (instance.afterLoad) instance.afterLoad(instance.instance);
    });
    // Configure if needed
    if (runConfigure) runConfigure(instance);
    // once loaded
    if (afterLoad) {
      console.log("after load");
      if (instance.templateLoaded) afterLoad(instance);
      else this.instances[instance.id].push({ instance, afterLoad });
    }
    instance.loaded = true;
    return instance;
  }
}

// Helps Loads New Action Instance
export class ActionLoader {
  constructor(engine, type, args, sprite, callback) {
    this.engine = engine;
    this.type = type;
    this.args = args;
    this.sprite = sprite;
    this.callback = callback;
    this.instances = {};
    this.definitions = [];

    let time = new Date().getTime();
    let id = sprite.id + "-" + type + "-" + time;
    return this.load(
      type,
      function (action) {
        action.onLoad(args);
      },
      function (action) {
        action.configure(type, sprite, id, time, args);
      }
    );
  }
  // Load Action
  load(type) {
    let afterLoad = arguments[1];
    let runConfigure = arguments[2];
    if (!this.instances[type]) {
      this.instances[type] = [];
    }
    // New Instance (assigns properties loaded by type)
    let instance = new Action(this.type, this.sprite, this.callback);
    Object.assign(instance, require("../actions/" + type + ".jsx")["default"]);
    instance.templateLoaded = true;
    // Notify existing
    this.instances[type].forEach(function (instance) {
      if (instance.afterLoad) instance.afterLoad(instance.instance);
    });
    // construct
    if (runConfigure) runConfigure(instance);
    // load
    if (afterLoad) {
      if (instance.templateLoaded) afterLoad(instance);
      else this.instances[type].push({ instance, afterLoad });
    }

    return instance;
  }
}
// Loads Audio
export class AudioLoader {
  constructor(src, loop = false) {
    this.src = src;
    this.playing = false;
    this.audio = new Audio(src);
    // loop if set
    if (loop) {
      this.audio.addEventListener(
        "ended",
        function () {
          this.currentTime = 0;
          this.play();
        },
        false
      );
    }
    this.audio.load();
  }
  isPlaying() {
    return this.playing;
  }
  playAudio() {
    const audioPromise = this.audio.play();
    this.playing = true;
    if (audioPromise !== undefined) {
      audioPromise
        .then((_) => {
          // autoplay started
        })
        .catch((err) => {
          // catch dom exception
          console.info(err);
        });
    }
  }
  pauseAudio() {
    const audioPromise = this.audio.pause();
    this.playing = false;
    if (audioPromise !== undefined) {
      audioPromise
        .then((_) => {
          // autoplay started
        })
        .catch((err) => {
          // catch dom exception
          console.info(err);
        });
    }
  }
}
