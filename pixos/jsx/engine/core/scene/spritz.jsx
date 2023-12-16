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

import { saveAs } from 'file-saver';
import * as JSZip from 'jszip';

// Shaders
import fs from '@Engine/shaders/fs.jsx';
import vs from '@Engine/shaders/vs.jsx';
import blurFs from '@Engine/shaders/blur/fs.jsx';
import blurVs from '@Engine/shaders/blur/vs.jsx';
import blurInit from '@Engine/shaders/blur/init.jsx';
import World from '@Engine/core/scene/world.jsx';

// Spritz Object
export default class Spritz {
  /**
   * Spritz represent an individual Pixospritz
   * @returns
   */
  constructor() {
    this.shaders = {
      fs: fs(),
      vs: vs(),
    };
    this.effects = {
      // todo - make more dynamic and support for custom effects
      blur: {
        id: 'blur',
        fs: blurFs(),
        vs: blurVs(),
        init: blurInit,
      },
    };
    this.effectPrograms = {};

    if (!Spritz._instance) {
      Spritz._instance = this;
    }
    return Spritz._instance;
  }

  /**
   * Init Spritz
   * @param {*} engine
   */
  init = async (engine) => {
    // game Engine & Timing
    Spritz._instance.engine = engine;
    // Init Game Engine Components
    let world = (Spritz._instance.world = new World(engine, 'spritz'));
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
          // Unpause Gameplay
          menu.world.isPaused = false;
          // Exit Menu
          menu.completed = true;
        },
      },
    });
  };

  /**
   * Todo - Load spritz remotely
   * @param {string} src
   */
  loadSpritzManifest = async (src) => {
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

  /**
   * Todo - Load avatar into spritz
   * @param {string} src
   * @param {string} zoneId
   */
  loadAvatar = async (src, zoneId) => {
    // Put up loading Screen
    //
    // Fetch Avatar Remotely from Src
    //
    // Parse & Read in & initialized
    //
    // Add to Zone
  };

  /**
   * Todo - Load avatar into spritz
   */
  exportAvatar = async () => {
    let zip = new JSZip();
    let avatar = {}; // todo;
    // store in zip
    zip.folder('pixos').file('avatar.json', JSON.stringify(avatar));
    // save
    let blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, 'avatar.zip');
  };

  /**
   * Render Loop
   * @param {*} engine
   * @param {number} now
   */
  render = (engine, now) => {
    // Build
    Spritz._instance.world.tickOuter(now);
    // use core shader
    Spritz._instance.engine.renderManager.activateShaderProgram();

    // Draw Frame
    this.draw(engine);

    // effect rendering - ex) blur depth of field
    Object.keys(this.effects).map((id) => {
      console.log([id]);
      Spritz._instance.engine.renderManager.activateShaderEffectProgram(id);
      this.effectPrograms[id]?.draw();
    });
  };

  /**
   * Draw Spritz
   * @param {*} engine
   */
  draw = (engine) => {
    Spritz._instance.world.draw(engine);
  };

  /**
   * Keyboard event handler for Spritz
   * @param {*} e
   */
  onKeyEvent = (e) => {
    if (e.type === 'keydown') {
      Spritz._instance.engine.keyboard.onKeyDown(e);
    } else Spritz._instance.engine.keyboard.onKeyUp(e);
  };

  /**
   * Mobile Touch event handler for Spritz
   * @param {*} e
   */
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
        Spritz._instance.engine.touch(e);
        break;
    }
  };
}
