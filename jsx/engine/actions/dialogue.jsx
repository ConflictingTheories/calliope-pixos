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
  init: function (text, scrolling = true, options = {}) {
    console.log("loading - dialogue");
    this.engine = this.sprite.engine;
    this.text = text;
    this.scrolling = scrolling;
    this.options = options;
    this.completed = false;
  },
  // Update & Scroll
  tick: function (time) {
    if (!this.loaded) return;
    // Check for Dialogue Completion (TODO - manual triggers + scroll / sections)
    if (this.options && this.options.autoclose) {
      this.endTime = this.endTime ? this.endTime : this.options.endTime ?? new Date().getTime() + 10000; // 10 seconds default if autoclose
      if (time > this.endTime) {
        this.completed = true;
      }
    }
    // Handle Input
    this.checkInput();
    this.textbox = this.engine.scrollText(this.text, this.scrolling, this.options);
    return this.completed;
  },
  // Handle Keyboard
  checkInput: function () {
    switch (this.engine.keyboard.lastPressed("q")) {
      // close dialogue on q key press
      case "q":
        console.log("closing dialogue");
        this.completed = true; // toggle
      default:
        return null;
    }
  },
};
