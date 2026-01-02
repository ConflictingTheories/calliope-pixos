/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */

// Shaders
import Spritz from '@Engine/core/scene/spritz.js';
import World from '@Engine/core/scene/world.js';
import JSZip from 'jszip';
import { debug } from '@Engine/utils/debug-logger.js';

/**
 * ExampleDynamicSpritz - A dynamic Spritz implementation for loading games from zip files.
 */
export default class ExampleDynamicSpritz extends Spritz {
  /**
   * Initializes the dynamic Spritz instance.
   * @param {GLEngine} engine - The game engine instance.
   * @returns {Promise<void>}
   */
  init = async (engine) => {
    Spritz._instance.loaded = false;
    // game Engine & Timing
    Spritz._instance.engine = engine;
    // Init Game Engine Components
    let world = (Spritz._instance.world = new World(Spritz._instance, 'dynamic'));

    // load spritz
    async function loadSpritz(menu) {
      try {
        // read zip from uploaded file
        let file = engine.fileUpload.files[0];
        let zip = await JSZip.loadAsync(file);
        Spritz._instance.zip = zip;

        // find manifest and read
        let manifest = JSON.parse(await zip.file('manifest.json').async('string'));
        debug('Spritz', 'loaded manifest', manifest);

        // Connect to network if specified
        if (manifest.network && manifest.network.url) {
          debug('Spritz', 'Network connection found -- attempting connection to server');
          engine.networkManager.connect(manifest.network.url);
        }

        // load initial zone(s) from zip file. We await each load sequentially so that
        // screen transitions complete cleanly between zones. Each call will fade
        // out the current view, load the zone and then fade back in. Note: if
        // multiple zones are specified, they will be loaded one after the other.
        for (const zone of manifest.initialZones) {
          // Explicitly provide transition parameters when loading zones from
          // the manifest. Without this, `loadZoneFromZip` defaults to no
          // transition so that scripted loads via Lua don't inadvertently
          // trigger extra fades. Each zone will fade out and then fade in.
          await world.loadZoneFromZip(zone, zip, true, { effect: 'cross', duration: 500 });
        }

        // start game
        world.isPaused = false;

        // Exit Menu
        menu.completed = true;
        Spritz._instance.loaded = true;
      } catch (e) {
        console.error(e);
        return;
      }
    }

    // if no file don't go any further and prompt
    function loadZipFile(menu, skipClick = false) {
      if (!skipClick || engine.fileUpload.files.length === 0) {
        engine.fileUpload.click();
        engine.fileUpload.onchange = (e) => loadSpritz(menu);
        return;
      } else {
        // autoload if passed in
        loadSpritz(null);
      }
    }

    // show start menu
    world.startMenu({
      start: {
        pausable: false,
        text: 'Load Game File',
        prompt: 'Please select a file to load...',
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
        onEnter: true,
        onOpen: (menu) => {
          // tood - needs a way to trigger on open
          this.isPaused = true;
          // loadZipFile(true);
        },
        trigger: async (menu) => {
          loadZipFile(menu);
        },
      },
    });
  };
}
