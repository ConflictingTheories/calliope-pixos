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
import RedChest from "../../../../engine/sprites/objects/chests/red.jsx";

export default class MyRedChest extends RedChest {
  constructor(engine) {
    // Initialize Sprite
    super(engine);
    // todo - plan and implement an inventory system
    this.inventory = [];
  }
}
