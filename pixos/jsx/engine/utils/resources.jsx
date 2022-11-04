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

export default {
  tilesetRequestUrl: (id) => '/pixos/tilesets/' + id + '/tileset.json',
  zoneRequestUrl: (id) => '/pixos/maps/' + id + '/map.json',
  artResourceUrl: (art) => '/pixos/art/' + art,
};
