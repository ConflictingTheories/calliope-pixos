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
  src: _resources["default"].artResourceUrl("elementals.gif"),
  sheetSize: [64, 128],
  tileSize: [16, 18],
  // Frame Locations
  frames: {
    up: [[0, 0], [16, 0], [32, 0], [48, 0]],
    right: [[0, 18], [16, 18], [32, 18], [16, 18]],
    down: [[0, 36], [16, 36], [32, 36], [16, 36]],
    left: [[48, 0], [48, 18], [48, 36], [48, 18]]
  },
  // Offsets
  drawOffset: new _vector.Vector(0, 1, 0.2),
  hotspotOffset: new _vector.Vector(0.5, 0.5, 0)
};
exports["default"] = _default;