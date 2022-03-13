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
  // Initialize Dialogue Object
  init: function (greeting, options = {}) {
    this.engine = this.sprite.engine;
    this.greeting = greeting;
    this.options = options;
    this.completed = false;
  },
  // Update & Scroll
  tick: function (time) {
    if (!this.loaded) return;
    this.engine.setGreeting(this.text)
    return true;
  }
};
