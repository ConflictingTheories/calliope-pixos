"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

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
var _default = {
  init: function init(facing) {
    console.log("loading - face");
    this.facing = facing;
  },
  tick: function tick(time) {
    if (this.facing && this.facing != this.sprite.facing) this.sprite.setFacing(this.facing);
    return true;
  }
};
exports["default"] = _default;