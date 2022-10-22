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
export default function loadTileset(tilesetJson, TilesetGeometry) {
  return {
    name: tilesetJson.name,
    src: tilesetJson.src,
    sheetSize: tilesetJson.sheetSize,
    sheetOffsetX: tilesetJson.sheetOffsetX,
    sheetOffsetY: tilesetJson.sheetOffsetY,
    tileSize: tilesetJson.tileSize,
    bgColor: tilesetJson.bgColor,
    // Tile Locations on resource (based on size)
    textures: tilesetJson.textures,
    // Geometries for the tileset
    // type --> walkability -- 1/0 --> [down,left,up,right]
    geometry: TilesetGeometry,
  };
}
