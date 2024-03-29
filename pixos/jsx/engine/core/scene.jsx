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

import { saveAs } from 'file-saver';
import * as JSZip from 'jszip';

// Shaders
import fs from '@Engine/shaders/fs.jsx';
import vs from '@Engine/shaders/vs.jsx';
import World from '@Engine/core/world.jsx';

// Scene Object
export default class Scene {
  constructor() {
    // Shaders
    this.shaders = {
      fs: fs(),
      vs: vs(),
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
    let world = (Scene._instance.world = new World(engine, 'scene'));
    // Load Zones - TODO - Add injection / Props to make more Dynamic
    world.zoneList.forEach((z) => z.runWhenLoaded(() => console.log('loading...done')));
    // show start menu
    world.startMenu({
      start: {
        text: 'Start Game',
        prompt: 'Please press the button to start...',
        x: engine.screenSize().width / 2 - 75,
        y: engine.screenSize().height / 2 - 50,
        w: 150,
        h: 75,
        quittable: false,
        colours: {
          top: '#333',
          bottom: '#777',
          background: '#999',
        },
        onOpen: (menu) => {
          // tood - needs a way to trigger on open
          this.isPaused = true;
        },
        trigger: (menu) => {
          // on Click
          console.log(menu);
          // Unpause Gameplay
          menu.world.isPaused = false;
          // Exit Menu
          menu.completed = true;
        },
      },
    });
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
    let zip = new JSZip();
    let avatar = {}; // todo;
    // store in zip
    zip.folder('pixos').file('avatar.json', JSON.stringify(avatar));
    // save
    let blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, 'avatar.zip');
  };

  // Render Loop
  render = (engine, now) => {
    // Build
    Scene._instance.world.tickOuter(now);
    // Draw Frame
    this.draw(engine);
  };

  // Draw Scene
  draw = (engine) => {
    Scene._instance.world.draw(engine);
  };

  // Keyboard handler for Scene
  onKeyEvent = (e) => {
    if (e.type === 'keydown') {
      Scene._instance.engine.keyboard.onKeyDown(e);
    } else Scene._instance.engine.keyboard.onKeyUp(e);
  };

  // Mobile Touch handler for Scene
  onTouchEvent = (e) => {
    switch (e.type) {
      case 'mousedown':
      case 'mouseup':
      case 'mousemove':
      case 'touchstart':
      case 'touchend':
      case 'touchmove':
      case 'touchcancel':
      default:
        Scene._instance.engine.touch(e);
        break;
    }
  };
}
