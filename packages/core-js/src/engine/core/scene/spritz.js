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
   * Load a spritz manifest from a remote URL.
   * Fetches the manifest JSON, then loads each zone listed.
   * @param {string} src - URL to the manifest JSON
   * @returns {Promise<object>} The loaded manifest
   */
  loadSpritzManifest = async src => {
    const world = Spritz._instance.world;
    if (!world) {
      throw new Error('loadSpritzManifest: world not initialized. Call init() first.');
    }

    const response = await fetch(src);
    if (!response.ok) {
      throw new Error(`loadSpritzManifest: failed to fetch ${src} (${response.status})`);
    }

    const manifest = await response.json();

    // Load each zone in the manifest
    const zones = manifest.zones || [];
    for (const zoneEntry of zones) {
      const zoneId = typeof zoneEntry === 'string' ? zoneEntry : zoneEntry.id;
      if (zoneId) {
        await world.loadZone(zoneId, true);
      }
    }

    // Set starting zone if specified
    if (manifest.startZone) {
      await world.loadZone(manifest.startZone, true);
    }

    return manifest;
  };

  /**
   * Load an avatar from a remote URL and add it to a zone.
   * @param {string} src - URL to the avatar JSON
   * @param {string} zoneId - ID of the zone to add the avatar to
   * @returns {Promise<object>} The created avatar
   */
  loadAvatar = async (src, zoneId) => {
    const world = Spritz._instance.world;
    if (!world) {
      throw new Error('loadAvatar: world not initialized. Call init() first.');
    }

    const response = await fetch(src);
    if (!response.ok) {
      throw new Error(`loadAvatar: failed to fetch ${src} (${response.status})`);
    }

    const avatarData = await response.json();

    // Ensure the target zone is loaded
    if (zoneId && !world.zoneDict[zoneId]) {
      await world.loadZone(zoneId, true);
    }

    const avatar = world.createAvatar(avatarData);
    if (!avatar) {
      throw new Error('loadAvatar: failed to create avatar from data');
    }

    return avatar;
  };

  /**
   * Export the current player avatar to a zip file.
   * @returns {Promise<void>}
   */
  exportAvatar = async () => {
    const world = Spritz._instance.world;
    if (!world) {
      throw new Error('exportAvatar: world not initialized. Call init() first.');
    }

    const avatar = world.avatarManager && world.avatarManager.getAvatar
      ? world.avatarManager.getAvatar()
      : world.playerAvatar || null;

    if (!avatar) {
      throw new Error('exportAvatar: no avatar to export');
    }

    const avatarData = typeof avatar.serialize === 'function'
      ? avatar.serialize()
      : {
          id: avatar.id,
          position: avatar.position,
          sprite: avatar.spriteId || avatar.sprite,
        };

    const zip = new JSZip();
    zip.folder('pixos').file('avatar.json', JSON.stringify(avatarData, null, 2));
    const blob = await zip.generateAsync({ type: 'blob' });
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
