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
export default class PixosScene extends Scene {
  // Init Scene
  init = async (engine) => {
    // game Engine & Timing
    Scene._instance.engine = engine;
    // Init Game Engine Components
    let world = (Scene._instance.world = new World(engine, 'scene'));
    // Load Zones - TODO - Add injection / Props to make more Dynamic
    await world.loadZone('dungeon-top');
    await world.loadZone('dungeon-bottom');
    world.zoneList.forEach((z) => z.runWhenLoaded(() => console.log('loading...done')));
    // show start menu
    world.startMenu({
      start: {
        text: 'Start Game',
        prompt: 'Welcome to Pixos',
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
          // start initial audio
          menu.world.zoneList.filter((x) => x.audio != null).map((x) => x.audio.playAudio());
          // Unpause Gameplay
          menu.world.isPaused = false;
          // Exit Menu
          menu.completed = true;
        },
      },
    });
  };
}
