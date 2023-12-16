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

// Shaders
import Spritz from '@Engine/core/spritz.jsx';
import World from '@Engine/core/world.jsx';
import JSZip from 'jszip';

// Spritz Object
export default class ExampleDynamicSpritz extends Spritz {
  // Init Spritz
  init = async (engine) => {
    // game Engine & Timing
    Spritz._instance.engine = engine;
    // Init Game Engine Components
    let world = (Spritz._instance.world = new World(engine, 'dynamic'));

    // load spritz
    async function loadSpritz(menu) {
      try {
        // read zip from uploaded file
        let file = engine.fileUpload.files[0];
        let zip = await JSZip.loadAsync(file);

        // find manifest and read
        let manifest = JSON.parse(await zip.file('manifest.json').async('string'));
        console.log(manifest);

        // load initial zone from zip file
        manifest.initialZones.forEach((zone) => {
          world.loadZoneFromZip(zone, zip, true);
        });

        // start
        menu.world.isPaused = false;

        // Exit Menu
        menu.completed = true;
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
