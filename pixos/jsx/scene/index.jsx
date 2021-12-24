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

// Shaders
import fs from "../engine/shaders/fs.jsx";
import vs from "../engine/shaders/vs.jsx";
import objfs from "../engine/shaders/objfs.jsx";
import objvs from "../engine/shaders/objvs.jsx";
import World from "../engine/core/world.jsx";

// Scene Object
export default class Scene {
  constructor() {
    // Shaders
    this.shaders = {
      fs: fs(),
      vs: vs(),
    };
    this.objectShaders = {
      fs: objfs(),
      vs: objvs(),
    };
    // Singleton
    if (!Scene._instance) {
      Scene._instance = this;
    }
    return Scene._instance;
  }

  // Init Scene
  init = async (engine) => {
    // game Engine & Timing
    Scene._instance.engine = engine;
    // Init Game Engine Components
    let world = (Scene._instance.world = new World(engine));
    // Load Zones - TODO - Add injection / Props to make more Dynamic
    await world.loadZone("room");
    // await world.loadZone("dungeon-top");
    // await world.loadZone("dungeon-bottom");
    world.zoneList.forEach((z) => z.runWhenLoaded(() => console.log("loading...done")));
  };

  // Todo - Load scene remotely
  loadSceneManifest = async (src) => {
    // Put up loading Screen
    //
    // Fetch Manifest Remotely from Src
    //
    // Parse & Read in Zones
    //
    // Load Zones and Then once ready Remove Loading
    //
    // Start
  };

  // Todo - Load avatar into scene
  loadAvatar = async (src, zoneId) => {
    // Put up loading Screen
    //
    // Fetch Avatar Remotely from Src
    //
    // Parse & Read in & initialized
    //
    // Add to Zone
  };

  // Todo - Load avatar into scene
  exportAvatar = async () => {
    // Put up loading Screen
    //
    // Serialized and Compress Avatar
    //
    // Return Exported archive
  };

  // Render Loop
  render = (engine, now) => {
    // Build
    Scene._instance.world.tick(now);
    // Draw Frame
    this.draw(engine);
  };

  // Draw Scene
  draw = (engine) => {
    Scene._instance.world.draw(engine);
  };

  // Keyboard handler for Scene
  onKeyEvent = (e) => {
    if (e.type === "keydown") {
      Scene._instance.engine.keyboard.onKeyDown(e);
    } else Scene._instance.engine.keyboard.onKeyUp(e);
  };

  // Mobile Touch handler for Scene
  onTouchEvent = (e) => {
    switch (e.type) {
      case "touchstart":
      case "touchend":
      case "touchmove":
      case "touchcancel":
      default:
        Scene._instance.engine.touch(e);
        break;
    }
  };
}
