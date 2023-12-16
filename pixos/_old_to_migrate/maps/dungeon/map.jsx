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

// Tet
import { Vector } from '@Engine/utils/math/vector.jsx';
import { Direction } from '@Engine/utils/enums.jsx';
import { loadAvatar, STORE_NAME } from '@Engine/utils/generator.jsx';
import cells from './cells.jsx';
// Map
export default {
  bounds: [0, 0, 17, 19],
  tileset: 'void',
  audioSrc: '/pixos/audio/dungeon-beat.mp3',
  cells: cells,
  // Sprites and Objects to be Loaded in the Spritz & their Starting Points
  sprites: [
    // NPCs
    { id: 'darkness', type: 'npc/darkness', pos: new Vector(...[10, 4, 0]), facing: Direction.Down },
    { id: 'water', type: 'npc/water-knight', pos: new Vector(...[8, 13, 0]), facing: Direction.Up },
    { id: 'air', type: 'npc/air-knight', pos: new Vector(...[8, 4, 0]), facing: Direction.Down },
    { id: 'fire', type: 'npc/fire-knight', pos: new Vector(...[2, 9, 0]), facing: Direction.Right },
    { id: 'earth', type: 'npc/earth-knight', pos: new Vector(...[14, 7, 0]), facing: Direction.Left },
    // Doorway
    {
      id: 'door',
      type: 'furniture/door',
      pos: new Vector(...[2, 5, 0]),
      facing: Direction.Down,
      zones: ['sewer'],
    },
    // Effect tiles
    { id: 'spurt1', type: 'effects/lavaspurt', pos: new Vector(...[10, 7, -1.5]), facing: Direction.Up },
    { id: 'spurt2', type: 'effects/lavaspurt', pos: new Vector(...[9, 6, -1.5]), facing: Direction.Up },
    { id: 'spurt3', type: 'effects/lavaspurt', pos: new Vector(...[10, 5, -1.5]), facing: Direction.Up },
    { id: 'spurt4', type: 'effects/lavaspurt', pos: new Vector(...[7, 6, -1.5]), facing: Direction.Up },
    { id: 'spurt5', type: 'effects/lavaspurt', pos: new Vector(...[6, 7, -1.5]), facing: Direction.Up },
    { id: 'spurt6', type: 'effects/lavaspurt', pos: new Vector(...[6, 9, -1.5]), facing: Direction.Up },
    { id: 'spurt7', type: 'effects/lavaspurt', pos: new Vector(...[9, 9, -1.5]), facing: Direction.Up },
    { id: 'spurt8', type: 'effects/lavaspurt', pos: new Vector(...[7, 10, -1.5]), facing: Direction.Up },
    { id: 'spurt9', type: 'effects/lavaspurt', pos: new Vector(...[10, 10, -1.5]), facing: Direction.Up },
  ],
  // Scripts / Triggers
  scripts: [
    {
      id: 'load-spritz',
      trigger: async function () {
        await loadAvatar(this, STORE_NAME);
      },
    },
  ],
  // TODO - Add in Spritz / Dialogue
  //
  spritz: [],
  //
  // objects // 3d
  objects: [],
};
