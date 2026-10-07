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
    this.sprite.setGreeting(this.text);
    return true;
  },
};
