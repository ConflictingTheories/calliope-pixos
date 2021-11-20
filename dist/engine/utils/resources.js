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
  tilesetRequestUrl: function tilesetRequestUrl(id) {
    return "/pixos/tilesets/" + id + ".tileset";
  },
  zoneRequestUrl: function zoneRequestUrl(id) {
    return "/pixos/maps/" + id + ".map";
  },
  artResourceUrl: function artResourceUrl(art) {
    return "/pixos/art/" + art;
  }
};
exports["default"] = _default;