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

export default class Light {
  /**
   * Point Light
   */
  constructor(id, color, position, attenuation, enabled) {
    this.id = id ?? 'light';
    this.color = color ? color : [1.0, 1.0, 1.0];
    this.pos = position ? position : [0.0, 0.0, 0.0];
    this.attenuation = attenuation ? attenuation : [0.5, 0.1, 0.0];
    this.enabled = enabled ? enabled : true;
    this.frame = 0;
  }

  // light flicker
  tick() {
    for (var i = 0; i < 3; i++) this.color[i] += Math.sin((0.00005 * this.frame * 180) / Math.PI) * 0.002;
    this.frame++;
  }
}
