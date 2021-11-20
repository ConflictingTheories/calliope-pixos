"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _vector = require("../../../engine/utils/math/vector");

var _resources = _interopRequireDefault(require("../../../engine/utils/resources"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
  // Character art from http://opengameart.org/content/twelve-16x18-rpg-character-sprites-including-npcs-and-elementals
  src: _resources["default"].artResourceUrl("elementals.gif"),
  sheetSize: [64, 128],
  tileSize: [16, 18],
  // Frame Positions
  frames: {
    up: [[0, 54], [16, 54], [32, 54], [48, 54]],
    right: [[0, 72], [16, 72], [32, 72], [16, 72]],
    down: [[0, 90], [16, 90], [32, 90], [16, 90]],
    left: [[48, 54], [48, 72], [48, 90], [48, 72]]
  },
  // Offsets
  drawOffset: new _vector.Vector(0, 1, 0.2),
  hotspotOffset: new _vector.Vector(0.5, 0.5, 0)
};
exports["default"] = _default;