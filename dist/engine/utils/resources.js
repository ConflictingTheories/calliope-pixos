"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

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
var _default = {
  tilesetRequestUrl: function tilesetRequestUrl(id) {
    return "/pixos/tilesets/" + id + "/tileset.json";
  },
  zoneRequestUrl: function zoneRequestUrl(id) {
    return "/pixos/maps/" + id + "/map.json";
  },
  artResourceUrl: function artResourceUrl(art) {
    return "/pixos/art/" + art;
  }
};
exports["default"] = _default;