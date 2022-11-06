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
export default class ExampleDynamicScene extends Scene {
  // Init Scene
  init = async (engine) => {
    // game Engine & Timing
    Scene._instance.engine = engine;
    // Init Game Engine Components
    let world = (Scene._instance.world = new World(engine, 'dynamic'));

    // load scene
    async function loadScene(menu) {
      try {
        // read zip from uploaded file
        let file = engine.fileUpload.files[0];
        let zip = await JSZip.loadAsync(file);

        // read file contents of zip
        zip.forEach((path, file) => {
          console.log(path);
        });

        // find manifest and read
        let manifest = JSON.parse(await zip.file('manifest.json').async('string'));
        console.log(manifest);

        // read in zone files
        let zones = await Promise.all(
          manifest.maps.map(async (zoneId) => {
            try {
              let zoneJson = JSON.parse(await zip.file('maps/' + zoneId + '/map.json').async('string'));
              let zoneCells = JSON.parse(await zip.file('maps/' + zoneId + '/cells.json').async('string'));
              return { id: zoneId, map: zoneJson, cells: zoneCells };
            } catch (e) {
              console.error(`Zone Not Found:: ${tilesetId} - ${e}`);
            }
          })
        );
        console.log(zones);

        // read in sprites
        let sprites = await Promise.all(
          manifest.sprites.map(async (spriteId) => {
            try {
              let spriteJson = JSON.parse(await zip.file('sprites/' + spriteId + '.json').async('string'));
              return { id: spriteId, sprite: spriteJson };
            } catch (e) {
              console.error(`Sprite Not Found:: ${tilesetId} - ${e}`);
            }
          })
        );
        console.log(sprites);

        // read in objects
        let objects = await Promise.all(
          manifest.objects.map(async (objectId) => {
            try {
              let spriteJson = JSON.parse(await zip.file('objects/' + objectId + '.json').async('string'));
              return { id: objectId, sprite: spriteJson };
            } catch (e) {
              console.error(`Object Not Found:: ${tilesetId} - ${e}`);
            }
          })
        );
        console.log(objects);

        // confirm all manifest listed tilesets are found in tilesets
        let tilesets = await Promise.all(
          manifest.tilesets.map(async (tilesetId) => {
            try {
              let tilesetJson = JSON.parse(await zip.file('tilesets/' + tilesetId + '.json').async('string'));
              let tilesetGeo = JSON.parse(await zip.file('tilesets/' + tilesetId + '.json').async('string'));
              return { id: tilesetId, tileset: tilesetJson, geometry: tilesetGeo };
            } catch (e) {
              console.error(`Tileset Not Found:: ${tilesetId} - ${e}`);
            }
          })
        );
        console.log(tilesets);

        // load initial zone from zip file
        console.log('Initializing initial zone...' + manifest.initialZone);
        world.loadZoneFromZip(manifest.initialZone, zip, true);

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
        engine.fileUpload.onchange = (e) => loadScene(menu);
        return;
      } else {
        // autoload if passed in
        loadScene(null);
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
          console.log(menu);
          loadZipFile(menu);
        },
      },
    });
  };
}
