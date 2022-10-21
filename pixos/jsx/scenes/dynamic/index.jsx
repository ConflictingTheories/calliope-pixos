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

// Shaders
import Scene from '@Engine/core/scene.jsx';
import World from '@Engine/core/world.jsx';
import JSZip from 'jszip';

// Scene Object
export default class DynamicScene extends Scene {
  // Init Scene
  init = async (engine) => {
    // game Engine & Timing
    Scene._instance.engine = engine;
    // Init Game Engine Components
    let world = (Scene._instance.world = new World(engine, 'dynamic'));
    // show start menu
    world.startMenu({
      start: {
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
        },
        trigger: async (menu) => {
          console.log(menu);

          // if no file don't go any further
          if (engine.fileUpload.files.length === 0) {
            engine.fileUpload.click();
            engine.fileUpload.onchange = async (e) => {
              try {
                // read zip from uploaded file
                let file = engine.fileUpload.files[0];
                let zip = await JSZip.loadAsync(file);

                zip.forEach(function (relativePath, zipEntry) {
                  // Read Files and Store into local store
                  console.log({ relativePath, name: zipEntry.name });
                 
                  if (relativePath === 'manifest.json') {
                    console.log('found manifest...loading & storing content');
                    // read content from manifest and load from zip
                    //
                    // -- only files in manifest are loaded.
                    // --
                    // -- they are applied by type and dynamically
                    // --
                    // -- loaded into memory.
                  }
                });
              } catch (e) {
                console.error(e);
                return;
              }

              // load zone from zip file
              world.loadZoneFromZip(initialZoneId, zip, true);

              // Exit Menu
              menu.completed = true;
            };
            return;
          }
        },
      },
    });
  };
}
