/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis  **
**                                                 **
** PixoSpritz Dual License - see LICENSE.          **
** Free for education, non-commercial use, and     **
** individual non-profit artists (CC-BY-NC-SA-4.0) **
** Commercial use requires a purchased license.    **
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
