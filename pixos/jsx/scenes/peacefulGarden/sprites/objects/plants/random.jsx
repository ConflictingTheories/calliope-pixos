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

import { ActionLoader } from '@Engine/utils/loaders/index.jsx';
import RandomPlant from '@Sprites/objects/plants/random.jsx';

export default class MyPlants extends RandomPlant {
  constructor(engine) {
    // Initialize Sprite
    super(engine);
    this.enableSpeech = false;
    // todo - plan and implement an inventory system
    this.inventory = [];
  }
}
