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
import Resources from '@Engine/utils/resources.jsx';
import Chest from './base.jsx';
export default class RedChest extends Chest {
  constructor(engine) {
    // Initialize Sprite
    super(engine);
    // Character art from http://opengameart.org/content/chara-seth-scorpio
    this.src = Resources.artResourceUrl('chests.gif');
    this.sheetSize = [256, 256];
    this.tileSize = [16, 24];
    // Offsets
    this.drawOffset = new Vector(0, 1, 0.2);
    this.hotspotOffset = new Vector(0.5, 0.5, 0);
    // Frames & Faces
    this.frames = {
      down: [
        [32, 0],
        [32, 24],
        [32, 48],
        [32, 72],
      ],
      right: [
        [96, 0],
        [96, 24],
        [96, 48],
        [96, 72],
      ],
      up: [
        [32, 96],
        [32, 120],
        [32, 144],
        [32, 168],
      ],
      left: [
        [160, 0],
        [160, 24],
        [160, 48],
        [160, 72],
      ],
    };
    // Should the camera follow the avatar?
    this.bindCamera = false;
    // enable speech
    this.enableSpeech = true;
    // Interaction Management
    this.state = 'closed';
    this.inventory = [];
  }
}
