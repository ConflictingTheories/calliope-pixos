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

          // Prompt for File
          let input = new HTMLInputElement();
          input.type = 'file';

          // if no file don't go any further
          if (fileElement.files.length === 0) {
            input.click();
            return;
          }

          // read zip
          try {
            let file = input.files[0];
            let zip = await JSZip.loadAsync(file);
            zip.forEach(function (relativePath, zipEntry) {
              // Read Files and Store into local store
              console.log({ relativePath, name: zipEntry.name });

              // Find manifest
              //
            });
          } catch (e) {
            console.error(e);
            return;
          }

          // load zone from zip file
          world.loadZoneFromZip(initialZoneId, zip, true);

          // Exit Menu
          menu.completed = true;
        },
      },
    });
  };
}
