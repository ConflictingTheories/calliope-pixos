"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */
var _default = exports["default"] = {
  tilesetRequestUrl: function tilesetRequestUrl(id) {
    return '/pixospritz/tilesets/' + id + '/tileset.json';
  },
  zoneRequestUrl: function zoneRequestUrl(id) {
    return '/pixospritz/maps/' + id + '/map.json';
  },
  artResourceUrl: function artResourceUrl(art) {
    return '/pixospritz/art/' + art;
  }
};