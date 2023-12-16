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

import { Vector } from '@Engine/utils/math/vector.jsx';
import Resources from '@Engine/utils/resources.jsx';
import Sprite from '@Engine/core/sprite.jsx';
import { ActionLoader } from '@Engine/utils/loaders/index.jsx';

export default class Plant extends Sprite {
  constructor(engine) {
    // Initialize Sprite
    super(engine);
    // Should the camera follow the avatar?
    this.bindCamera = false;
    // enable speech
    this.enableSpeech = true;
    // Interaction Management
    this.state = 'closed';
    // Inventory
    this.blocking = false;
    this.fixed = true;
  }
}
