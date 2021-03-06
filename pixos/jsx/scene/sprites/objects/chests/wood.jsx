/*                                                 *\
** ----------------------------------------------- **
**             Calliope - Site Generator   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2021 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */

import { ActionLoader } from "../../../../engine/utils/loaders.jsx";
import WoodChest from "../../../../engine/sprites/objects/chests/wood.jsx";

export default class MyWoodChest extends WoodChest {
  constructor(engine) {
    // Initialize Sprite
    super(engine);
    this.enableSpeech = false;
    // todo - plan and implement an inventory system
    this.inventory = [
      {
        id: "sword",
        type: "object",
      },
    ];
  }
}
