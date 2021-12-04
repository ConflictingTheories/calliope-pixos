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

export default {
  // Initialize Dialogue Object
  init: function (greeting, options = {}) {
    console.log("loading - greeting");
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
