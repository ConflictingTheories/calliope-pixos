/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis  **
**                                                 **
** PixoSpritz Dual License - see LICENSE.          **
** Free for education, non-commercial use, and     **
** individual non-profit artists (CC-BY-NC-SA-4.0) **
** Commercial use requires a purchased license.    **
** ----------------------------------------------- **
\*                                                 */

const Resources = {
  basePath: '/pixospritz',
  setBasePath: path => {
    Resources.basePath = path.replace(/\/$/, '');
  },
  tilesetRequestUrl: id => `${Resources.basePath}/tilesets/${id}/tileset.json`,
  zoneRequestUrl: id => `${Resources.basePath}/maps/${id}/map.json`,
  cellsRequestUrl: id => `${Resources.basePath}/maps/${id}/cells.json`,
  artResourceUrl: art => `${Resources.basePath}/art/${art}`,
};

export default Resources;
