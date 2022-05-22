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

import Resources from "@Engine/utils/resources.jsx";
import Tileset from "@Engine/core/tileset.jsx";

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
  async load(type, sceneName) {
    console.log('loading tileset - ', this, type, sceneName)
    let tileset = this.tilesets[type];
    if (tileset) return tileset;
    let instance = new Tileset(this.engine);
    this.tilesets[type] = instance;
    instance.name = type;
    let json = require("@Tilesets/" + type + "/tileset.jsx")["default"];
    console.log('loading .... - ', json, type, sceneName)
    instance.onJsonLoaded(json);
    return instance;
  }
}