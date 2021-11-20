"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _sewer = _interopRequireDefault(require("../tilesets/sewer.tiles.jsx"));

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
// Tileset
// Map
var _default = {
  bounds: [0, 10, 17, 19],
  tileset: "sewer",
  // (0,10) -> (17,19) (X, Y) (9 Rows x 17 Column)
  cells: [_sewer["default"].SLW_CORNER, _sewer["default"].SLW_COLUMN, _sewer["default"].FLOOR, _sewer["default"].FLOOR, _sewer["default"].LW_LPIT, _sewer["default"].LAVA, _sewer["default"].LAVA, _sewer["default"].LAVA, _sewer["default"].V_WALKWAY, _sewer["default"].LAVA, _sewer["default"].LAVA, _sewer["default"].LAVA, _sewer["default"].RW_RPIT, _sewer["default"].FLOOR, _sewer["default"].FLOOR, _sewer["default"].SRW_COLUMN, _sewer["default"].SRW_CORNER].concat([_sewer["default"].EMPTY, _sewer["default"].SLW_CORNER, _sewer["default"].S_WALL, _sewer["default"].S_WALL, _sewer["default"].S_WALL, _sewer["default"].SLW_LAVA_COLUMN, _sewer["default"].LAVA, _sewer["default"].LAVA, _sewer["default"].S_STAIR, _sewer["default"].LAVA, _sewer["default"].LAVA, _sewer["default"].SRW_LAVA_COLUMN, _sewer["default"].S_WALL, _sewer["default"].S_WALL, _sewer["default"].S_WALL, _sewer["default"].SRW_CORNER, _sewer["default"].EMPTY], [_sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].L_WALL, _sewer["default"].SW_SPIT, _sewer["default"].SW_SPIT, _sewer["default"].S_STAIRWALL, _sewer["default"].SW_SPIT, _sewer["default"].SW_SPIT, _sewer["default"].R_WALL, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY], [_sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].L_WALL, _sewer["default"].FLOOR, _sewer["default"].FLOOR, _sewer["default"].FLOOR, _sewer["default"].FLOOR, _sewer["default"].FLOOR, _sewer["default"].R_WALL, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY], [_sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].L_WALL, _sewer["default"].FLOOR, _sewer["default"].FLOOR, _sewer["default"].FLOOR, _sewer["default"].FLOOR, _sewer["default"].FLOOR, _sewer["default"].R_WALL, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY], [_sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].SLW_CORNER, _sewer["default"].SLW_COLUMN, _sewer["default"].FLOOR, _sewer["default"].FLOOR, _sewer["default"].FLOOR, _sewer["default"].SRW_COLUMN, _sewer["default"].SRW_CORNER, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY], [_sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].SLW_CORNER, _sewer["default"].S_WALL, _sewer["default"].S_WALL, _sewer["default"].S_WALL, _sewer["default"].SRW_CORNER, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY], [_sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY], [_sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY]),
  // Sprites and Objects to be Loaded in the Scene & their Starting Points
  sprites: [{
    id: "e1",
    type: "monsters/water_elemental",
    pos: [8, 13, 0],
    facing: 2
  }, {
    id: "spurt7",
    type: "effects/lavaspurt",
    pos: [7, 10, -1.5],
    facing: 2
  }, {
    id: "spurt9",
    type: "effects/lavaspurt",
    pos: [10, 10, -1.5],
    facing: 2
  }]
};
exports["default"] = _default;