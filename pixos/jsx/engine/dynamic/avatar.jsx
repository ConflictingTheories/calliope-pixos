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

import { Vector } from '@Engine/utils/math/vector.jsx';
import Avatar from '@Engine/core/avatar.jsx';

export default class DynamicAvatar extends Avatar {
  constructor(engine, json, zip) {
    // Initialize Sprite
    super(engine);
    // load in json
    this.loadJson(json, zip);
  }

  // load in json properties to object
  loadJson(json, zip) {
    this.src = json.src;
    this.zip = zip;
    this.portraitSrc = json.portraitSrc;
    this.sheetSize = json.sheetSize;
    this.tileSize = json.tileSize;
    this.state = json.state ?? 'intro';
    // Frames
    this.frames = json.frames;
    // Offsets
    this.hotspotOffset = new Vector(...json.hotspotOffset);
    this.drawOffset = {};
    Object.keys(json.drawOffset).forEach((offset) => {
      this.drawOffset[offset] = new Vector(...json.drawOffset[offset]);
    });
    // Should the camera follow the avatar?
    this.bindCamera = json.bindCamera;
    this.enableSpeech = json.enableSpeech; // speech bubble
  }
}
