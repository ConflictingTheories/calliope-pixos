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

const Resources = {
  basePath: '/pixospritz',
  setBasePath: (path) => { Resources.basePath = path.replace(/\/$/, ''); },
  tilesetRequestUrl: (id) => `${Resources.basePath}/tilesets/${id}/tileset.json`,
  zoneRequestUrl: (id) => `${Resources.basePath}/maps/${id}/map.json`,
  cellsRequestUrl: (id) => `${Resources.basePath}/maps/${id}/cells.json`,
  artResourceUrl: (art) => `${Resources.basePath}/art/${art}`,
};

export default Resources;
