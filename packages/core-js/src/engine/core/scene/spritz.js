/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis  **
**                                                 **
** PixoSpritz Dual License - see LICENSE.          **
** Free for education, non-commercial use, and     **
** individual non-profit artists (CC-BY-NC-SA-4.0) **
** Commercial use requires a purchased license.    **
** ----------------------------------------------- **
\*                                                 */

import { saveAs } from 'file-saver';
import * as JSZip from 'jszip';

// Shaders
import fs from '@Engine/shaders/fs.js';
import vs from '@Engine/shaders/vs.js';
// effect shaders -- needs work - not working
import World from '@Engine/core/scene/world.js';

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
  init = async engine => {
    // game Engine & Timing
    Spritz._instance.engine = engine;
    // Init Game Engine Components
    let world = (Spritz._instance.world = new World(Spritz._instance, 'spritz'));
    // Load Zones - TODO - Add injection / Props to make more Dynamic
    world.zoneList.forEach(z => z.runWhenLoaded(() => console.log('loading...done')));
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
        onOpen: menu => {
          // tood - needs a way to trigger on open
          this.isPaused = true;
        },
        trigger: menu => {
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
  /**
   * KNOWN LIMITATION: This method is not implemented.
   * Required for: Loading spritz packages from remote URLs.
   * Implementation needs: fetch manifest JSON, parse zones, initialize zone objects,
   * show loading UI, handle errors.
   * Status: STUB - throws if called.
   */
  loadSpritzManifest = async src => {
    throw new Error('loadSpritzManifest is not implemented. Spritz packages must be loaded via the engine bootstrap.');
  };

  /**
   * Todo - Load avatar into spritz
   * @param {string} src
   * @param {string} zoneId
   */
  /**
   * KNOWN LIMITATION: This method is not implemented.
   * Required for: Loading player avatars from remote sources.
   * Implementation needs: fetch avatar JSON, validate schema, create avatar object,
   * add to specified zone, handle loading UI.
   * Status: STUB - throws if called.
   */
  loadAvatar = async (src, zoneId) => {
    throw new Error('loadAvatar is not implemented. Avatars must be created via the avatar system.');
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
   * Logic Update Loop (events)
   * @param {number} now
   */
  update = now => {
    // Build
    Spritz._instance.world.tickOuter(now);
  };

  /**
   * Render Loop
   * @param {*} engine
   * @param {number} now
   */
  render = (engine, now) => {
    // Draw Frame
    Spritz._instance.world.draw(engine);

    // effect rendering - ex) blur depth of field -- todo - revisit
    // Object.keys(this.effects).map((id) => {
    //   Spritz._instance.engine.renderManager.activateShaderEffectProgram(id);
    //   this.effectPrograms[id]?.draw();
    // });
  };

  /**
   * Keyboard event handler for Spritz
   * @param {*} e
   */
  onKeyEvent = e => {
    if (e.type === 'keydown') {
      Spritz._instance.engine.keyboard.onKeyDown(e);
    } else Spritz._instance.engine.keyboard.onKeyUp(e);
  };

  /**
   * Mobile Touch event handler for Spritz
   * @param {*} e
   */
  onTouchEvent = e => {
    switch (e.type) {
      case 'mousedown':
      case 'mouseup':
      case 'mousemove':
      case 'touchstart':
      case 'touchend':
      case 'touchmove':
      case 'touchcancel':
      default:
        // Ensure engine and touchHandler exist before calling
        if (
          Spritz._instance &&
          Spritz._instance.engine &&
          typeof Spritz._instance.engine.touchHandler === 'function'
        ) {
          try {
            Spritz._instance.engine.touchHandler(e);
          } catch (err) {
            console.warn('touchHandler error', err);
          }
        }
        break;
    }
  };
}
