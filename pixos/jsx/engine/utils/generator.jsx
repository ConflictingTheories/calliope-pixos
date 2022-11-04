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

import { store } from 'react-recollect';

import { Vector } from '@Engine/utils/math/vector.jsx';
import { Direction } from '@Engine/utils/enums.jsx';

// Store Name
export const STORE_NAME = 'garden-tome';

// generate random map zone
export async function generateZone(self, gender, storeName, cyoa) {
  // load current scene or play welcome
  let tome = self.engine.fetchStore(storeName);

  if (!tome) {
    // Initialize the garden
    tome = {
      gender: gender,
      position: new Vector(...[8, 3, 0]),
      selected: -2,
      rain: true,
      snow: false,
      scenes: [],
      sprites: [],
      objects: [],
    };

    // Load CYOA config
    Object.assign(tome, cyoa);

    self.engine.addStore(storeName, tome);

    // Generate a collection of scenes programmably
    // and append them to the scenes collection.

    // self.randomlyGenerateSprites();
    // self.randomlySprites();
    await self.playScene('welcome');
  } else {
    // load Sprites
    await Promise.all(
      tome.sprites
        .filter((x) => {
          // Determine whether to load sprite or not
          // base on the tome settings and cyoa

          return x.id == tome.selected;
        })
        .map(self.loadSprite.bind(self))
    );

    // Load Objects
    await Promise.all(
      tome.objects
        .filter((x) => {
          // Determine whether to load object or not
          // base on the tome settings and cyoa

          return x.id == tome.selected;
        })
        .map(self.loadObject.bind(self))
    );

    // Load NPCs for the zone
    await Promise.all(
      tome.npcs
        .filter((x) => {
          // Determine whether to load NPC and decide what
          // dialogue is base on the tome settings and cyoa

          return x.id == tome.selected;
        })
        .map(async (trigger) => {
          // run trigger
        })
    );

    // Apply any Triggers & Setup New Scenes if needed
    await Promise.all(
      tome.triggers
        .filter((x) => {
          // Determine whether to load trigger
          // base on the tome settings and cyoa

          return x.id == tome.selected;
        })
        .map(async (trigger) => {
          // run trigger
        })
    );

    // Finally - Play appropriate scenes
    await Promise.all(
      tome.scenes
        .filter((x) => {
          return x.id == tome.selected;
        })
        .map(async (scene) => {
          await self.playScene(scene.id, tome.scenes);
        })
    );

    // run custom scene
    let scene = [
      {
        id: 'new-space' + Math.random(),
        actions: [
          // manual actions
          // Scripted Dialogue Action Controls directly on sprites
          {
            sprite: 'avatar',
            action: 'dialogue',
            args: [
              [
                'Welcome traveler... I see you are exploring. Good. Please continue to look',
                'You have travelled into the number ' + (store.pixos && store.pixos[storeName] ? store.pixos[storeName].selected : -2) + ' room',
              ],
              false,
              { autoclose: true },
            ],
            scope: self, // scoped to the zone
          },
        ],
      },
    ];
    await self.playScene(scene[0].id, scene);
  }
}

// load avatar
export async function loadAvatar(zone, storeName) {
  // randomly pick gender & store
  let gender =
    typeof store.pixos[storeName]?.gender !== 'undefined' ? store.pixos[storeName].gender : ['male', 'female'][Math.floor((2 * Math.random()) % 2)];
  // Load avatar (Male or Female)
  await zone.loadSprite.bind(self)({
    id: 'avatar',
    type: 'characters/' + gender,
    gender: gender,
    pos: typeof store.pixos[storeName]?.position !== 'undefined' ? store.pixos[storeName].position : new Vector(...[8, 8, zone.getHeight(8, 8)]),
    facing: Direction.Down,
  });
  return gender;
}
