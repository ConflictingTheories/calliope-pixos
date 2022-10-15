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

import { Vector } from '@Engine/utils/math/vector.jsx';
import { Direction } from '@Engine/utils/enums.jsx';
import { loadAvatar, STORE_NAME } from '@Engine/utils/generator.jsx';
import cells from './cells.jsx';

// Use Tileset
// Map Information
export default {
  bounds: [0, 0, 17, 10],
  // Determines the tileset to load
  tileset: 'void',
  // (0,0) -> (17,10) (X, Y) (10 Rows x 17 Column)
  cells: cells,
  // Sprites and Objects to be Loaded in the Scene & their Starting Points (includes effect tiles)
  sprites: [
    // NPCs
    { id: 'darkness', type: 'npc/darkness', pos: new Vector(...[10, 4, 0]), facing: Direction.Down },
    { id: 'air', type: 'npc/air-knight', pos: new Vector(...[8, 4, 0]), facing: Direction.Down },
    { id: 'fire', type: 'npc/fire-knight', pos: new Vector(...[2, 9, 0]), facing: Direction.Right },
    { id: 'earth', type: 'npc/earth-knight', pos: new Vector(...[14, 7, 0]), facing: Direction.Left },
    // Doorway
    {
      id: 'door',
      type: 'furniture/door',
      pos: new Vector(...[2, 5, 0]),
      facing: Direction.Down,
      zones: ['mountain'],
    },
    // Effect tiles
    { id: 'spurt1', type: 'effects/lavaspurt', pos: new Vector(...[10, 7, -1.5]), facing: Direction.Up },
    { id: 'spurt2', type: 'effects/lavaspurt', pos: new Vector(...[9, 6, -1.5]), facing: Direction.Up },
    { id: 'spurt3', type: 'effects/lavaspurt', pos: new Vector(...[10, 5, -1.5]), facing: Direction.Up },
    { id: 'spurt4', type: 'effects/lavaspurt', pos: new Vector(...[7, 6, -1.5]), facing: Direction.Up },
    { id: 'spurt5', type: 'effects/lavaspurt', pos: new Vector(...[6, 7, -1.5]), facing: Direction.Up },
    { id: 'spurt6', type: 'effects/lavaspurt', pos: new Vector(...[6, 9, -1.5]), facing: Direction.Up },
    { id: 'spurt7', type: 'effects/lavaspurt', pos: new Vector(...[9, 9, -1.5]), facing: Direction.Up },
  ],
  // Scenes + Scenarios
  scripts: [
    {
      id: 'load-scene',
      trigger: async function () {
        console.log('Triggered');
      },
    },
  ],
  // TODO - Add in Scenes / Dialogue
  //
  scenes: [],
  //
  // objects // 3d
  objects: [],
};
