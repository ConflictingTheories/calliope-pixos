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

import Door from "@Sprites/furniture/door.jsx";
export default class MyDoor extends Door {
  constructor(engine) {
    // Initialize Sprite
    super(engine);
    this.fixed = true;
  }
}
