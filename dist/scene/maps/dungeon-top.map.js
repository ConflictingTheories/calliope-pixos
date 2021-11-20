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
// Use Tileset
// Map Information
var _default = {
  bounds: [0, 0, 17, 10],
  tileset: "sewer",
  // (0,0) -> (17,10) (X, Y) (10 Rows x 17 Column)
  cells: [_sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].NLW_CORNER, _sewer["default"].N_WALL, _sewer["default"].N_WALL, _sewer["default"].N_WALL, _sewer["default"].NRW_CORNER, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY].concat([_sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].NLW_CORNER, _sewer["default"].NLW_COLUMN, _sewer["default"].FLOOR, _sewer["default"].FLOOR, _sewer["default"].FLOOR, _sewer["default"].NRW_COLUMN, _sewer["default"].NRW_CORNER, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY], [_sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].L_WALL, _sewer["default"].FLOOR, _sewer["default"].FLOOR, _sewer["default"].FLOOR, _sewer["default"].FLOOR, _sewer["default"].FLOOR, _sewer["default"].R_WALL, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY], [_sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].L_WALL, _sewer["default"].FLOOR, _sewer["default"].FLOOR, _sewer["default"].FLOOR, _sewer["default"].FLOOR, _sewer["default"].FLOOR, _sewer["default"].R_WALL, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY], [_sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].L_WALL, _sewer["default"].NW_NPIT, _sewer["default"].NW_NPIT, _sewer["default"].N_STAIRWALL, _sewer["default"].NW_NPIT, _sewer["default"].NW_NPIT, _sewer["default"].R_WALL, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY, _sewer["default"].EMPTY], [_sewer["default"].EMPTY, _sewer["default"].NLW_CORNER, _sewer["default"].N_WALL, _sewer["default"].N_WALL, _sewer["default"].N_WALL, _sewer["default"].NLW_LAVA_COLUMN, _sewer["default"].LAVA, _sewer["default"].LAVA, _sewer["default"].N_STAIR, _sewer["default"].LAVA, _sewer["default"].LAVA, _sewer["default"].NRW_LAVA_COLUMN, _sewer["default"].N_WALL, _sewer["default"].N_WALL, _sewer["default"].N_WALL, _sewer["default"].NRW_CORNER, _sewer["default"].EMPTY], [_sewer["default"].NLW_CORNER, _sewer["default"].NLW_COLUMN, _sewer["default"].FLOOR, _sewer["default"].FLOOR, _sewer["default"].LW_LPIT, _sewer["default"].LAVA, _sewer["default"].LAVA, _sewer["default"].LAVA, _sewer["default"].V_WALKWAY, _sewer["default"].LAVA, _sewer["default"].LAVA, _sewer["default"].LAVA, _sewer["default"].RW_RPIT, _sewer["default"].FLOOR, _sewer["default"].FLOOR, _sewer["default"].NRW_COLUMN, _sewer["default"].NRW_CORNER], [_sewer["default"].L_WALL, _sewer["default"].FLOOR, _sewer["default"].FLOOR, _sewer["default"].FLOOR, _sewer["default"].LW_LPIT, _sewer["default"].LAVA, _sewer["default"].LAVA, _sewer["default"].LAVA, _sewer["default"].V_WALKWAY, _sewer["default"].LAVA, _sewer["default"].LAVA, _sewer["default"].LAVA, _sewer["default"].RW_RPIT, _sewer["default"].FLOOR, _sewer["default"].FLOOR, _sewer["default"].FLOOR, _sewer["default"].R_WALL], [_sewer["default"].L_WALL, _sewer["default"].FLOOR, _sewer["default"].FLOOR, _sewer["default"].FLOOR, _sewer["default"].L_STAIRWALL, _sewer["default"].L_STAIR, _sewer["default"].H_WALKWAY, _sewer["default"].H_WALKWAY, _sewer["default"].C_WALKWAY, _sewer["default"].H_WALKWAY, _sewer["default"].H_WALKWAY, _sewer["default"].R_STAIR, _sewer["default"].R_STAIRWALL, _sewer["default"].FLOOR, _sewer["default"].FLOOR, _sewer["default"].FLOOR, _sewer["default"].R_WALL], [_sewer["default"].L_WALL, _sewer["default"].FLOOR, _sewer["default"].FLOOR, _sewer["default"].FLOOR, _sewer["default"].LW_LPIT, _sewer["default"].LAVA, _sewer["default"].LAVA, _sewer["default"].LAVA, _sewer["default"].V_WALKWAY, _sewer["default"].LAVA, _sewer["default"].LAVA, _sewer["default"].LAVA, _sewer["default"].RW_RPIT, _sewer["default"].FLOOR, _sewer["default"].FLOOR, _sewer["default"].FLOOR, _sewer["default"].R_WALL]),
  // Sprites and Objects to be Loaded in the Scene & their Starting Points
  sprites: [{
    id: "e2",
    type: "monsters/air_elemental",
    pos: [8, 2, 0],
    facing: 8
  }, {
    id: "e3",
    type: "monsters/fire_elemental",
    pos: [2, 8, 0],
    facing: 1
  }, {
    id: "e4",
    type: "monsters/water_elemental",
    pos: [14, 8, 0],
    facing: 4
  }, {
    id: "spurt1",
    type: "effects/lavaspurt",
    pos: [10, 7, -1.5],
    facing: 2
  }, {
    id: "spurt2",
    type: "effects/lavaspurt",
    pos: [9, 6, -1.5],
    facing: 2
  }, {
    id: "spurt3",
    type: "effects/lavaspurt",
    pos: [10, 5, -1.5],
    facing: 2
  }, {
    id: "spurt4",
    type: "effects/lavaspurt",
    pos: [7, 6, -1.5],
    facing: 2
  }, {
    id: "spurt5",
    type: "effects/lavaspurt",
    pos: [6, 7, -1.5],
    facing: 2
  }, {
    id: "spurt6",
    type: "effects/lavaspurt",
    pos: [6, 9, -1.5],
    facing: 2
  }, {
    id: "spurt8",
    type: "effects/lavaspurt",
    pos: [9, 9, -1.5],
    facing: 2
  }, {
    id: "player",
    type: "characters/player",
    pos: [8, 8, -1],
    facing: 8
  }] // TODO - Add Scripts / Triggers for the Scene
  //
  // TODO - Add in Scenes / Dialogue
  //

};
exports["default"] = _default;