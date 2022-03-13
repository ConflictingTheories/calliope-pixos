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

import { ActionLoader } from "@Engine/utils/loaders/index.jsx";
import IronChest from "@Engine/sprites/objects/chests/iron.jsx";

export default class MyMetalChest extends IronChest {
  constructor(engine) {
    // Initialize Sprite
    super(engine);
    this.enableSpeech = false;
    // todo - plan and implement an inventory system
    this.inventory = [];
  }
}
