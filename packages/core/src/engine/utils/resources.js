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

export default {
  tilesetRequestUrl: (id) => '/pixospritz/tilesets/' + id + '/tileset.json',
  zoneRequestUrl: (id) => '/pixospritz/maps/' + id + '/map.json',
  artResourceUrl: (art) => '/pixospritz/art/' + art,
};
