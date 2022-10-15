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
import { Vector } from '../../../utils/math/vector.jsx';
import Resources from '../../../utils/resources.jsx';
import Plant from './base.jsx';
export default class RandomPlant extends Plant {
  constructor(engine) {
    // Initialize Sprite
    super(engine);
    this.src = Resources.artResourceUrl('plants.png');
    this.sheetSize = [1024, 32]; // (actually 512 - gives 2x up-res)
    this.tileSize = [12, 24]; // (relative to other sprites)
    this.selectedPlant = [Math.floor(12 * ((Math.random() * 30) % 30)), 0];
    // Offsets
    // new Vector(-0.25, 1, 0.125)
    this.drawOffset = new Vector(0.25 * Math.random(), 0.5 + 0.1 * Math.random(), -0.2);
    this.hotspotOffset = new Vector(0, 0, 0);
    // Frames & Faces
    this.frames = {
      down: [this.selectedPlant],
      right: [this.selectedPlant],
      up: [this.selectedPlant],
      left: [this.selectedPlant],
    };
    // Should the camera follow the avatar?
    this.bindCamera = false;
    // this.fixed = true;
    // enable speech
    this.enableSpeech = false;
  }
}
