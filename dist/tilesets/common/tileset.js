"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _resources = _interopRequireDefault(require("@Engine/utils/resources.jsx"));

var _geometry = _interopRequireDefault(require("@Tilesets/common/geometry.jsx"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
// Tileset Schema
var _default = function _default(sheetOffsetX, sheetOffsetY) {
  return {
    name: "default",
    src: _resources["default"].artResourceUrl("tileset.png"),
    sheetSize: [512, 512],
    sheetOffsetX: sheetOffsetX,
    sheetOffsetY: sheetOffsetY,
    tileSize: 16,
    bgColor: [32, 62, 88],
    // Tile Locations on resource (based on size)
    textures: {
      FLOOR: [1 + sheetOffsetX, 1],
      FLOOR_BR: [2 + sheetOffsetX, 2],
      FLOOR_R: [2 + sheetOffsetX, 1],
      FLOOR_TR: [2 + sheetOffsetX, 0],
      FLOOR_T: [1 + sheetOffsetX, 0],
      FLOOR_TL: [0 + sheetOffsetX, 0],
      FLOOR_L: [0 + sheetOffsetX, 1],
      FLOOR_BL: [0 + sheetOffsetX, 2],
      FLOOR_B: [1 + sheetOffsetX, 2],
      //
      FLOOR_CBR: [1 + sheetOffsetX, 1],
      FLOOR_CTR: [1 + sheetOffsetX, 1],
      FLOOR_CTL: [1 + sheetOffsetX, 1],
      FLOOR_CBL: [1 + sheetOffsetX, 1],
      //
      FLOOR_V: [0 + sheetOffsetX, 3],
      FLOOR_H: [1 + sheetOffsetX, 3],
      FLOOR_C: [0 + sheetOffsetX, 4],
      STAIR: [2 + sheetOffsetX, 3],
      //
      WALL: [1 + sheetOffsetX, 5],
      WATER: [0, 23 + sheetOffsetY],
      WALL_WATER: [1 + sheetOffsetX, 5 + sheetOffsetY * 2],
      WATER_WALL: [1 + sheetOffsetX, 5 + sheetOffsetY * 2],
      //
      EMPTY: [2 + sheetOffsetX, 5],
      EMPTY_BR: [2 + sheetOffsetX, 2],
      EMPTY_R: [2 + sheetOffsetX, 1],
      EMPTY_TR: [2 + sheetOffsetX, 0],
      EMPTY_T: [1 + sheetOffsetX, 0],
      EMPTY_TL: [0 + sheetOffsetX, 0],
      EMPTY_L: [0 + sheetOffsetX, 1],
      EMPTY_BL: [0 + sheetOffsetX, 2],
      EMPTY_B: [1 + sheetOffsetX, 2],
      //
      EMPTY_CBR: [1 + sheetOffsetX, 1],
      EMPTY_CTR: [1 + sheetOffsetX, 1],
      EMPTY_CTL: [1 + sheetOffsetX, 1],
      EMPTY_CBL: [1 + sheetOffsetX, 1]
    },
    // Geometries for the tileset
    // type --> walkability -- 1/0 --> [down,left,up,right]
    geometry: {
      // Flat - Walkability -- All
      FLAT_ALL: _geometry["default"].FLAT_ALL,
      // Flat - Walkability -- None
      FLAT_NONE: _geometry["default"].FLAT_NONE,
      // Stairs
      STAIR_R: _geometry["default"].STAIR_R,
      STAIR_T: _geometry["default"].STAIR_T,
      STAIR_L: _geometry["default"].STAIR_L,
      STAIR_B: _geometry["default"].STAIR_B,
      // Wall
      WALL_R: _geometry["default"].WALL_R,
      WALL_T: _geometry["default"].WALL_T,
      WALL_L: _geometry["default"].WALL_L,
      WALL_B: _geometry["default"].WALL_B
    }
  };
};

exports["default"] = _default;