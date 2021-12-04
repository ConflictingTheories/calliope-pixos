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

export default class MobileTouch {
  constructor() {
    // Instance
    if (!MobileTouch._instance) {
      this.x = 0;
      this.y = 0;
      this.isDragging = false;
      this.activeDirection = [];
      MobileTouch._instance = this;
    }
    return MobileTouch._instance;
  }

  // TODO - add drag support / location, and find a way of easily reading its state
  onTouch(e) {
    if (e.touches) {
      this.x = e.touches[0].pageX;
      this.y = e.touches[0].pageY;
      console.log(`Touch:  x: ${this.x}, y: ${this.y}`);
      e.preventDefault();
    }
  }

}
