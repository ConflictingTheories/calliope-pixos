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

export default {
  init: function (facing) {
    this.facing = facing;
  },
  tick: function (time) {
    if (this.facing && this.facing != this.sprite.facing) this.sprite.setFacing(this.facing);
    return true;
  },
};
