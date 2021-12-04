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
    this.text = text; // holds queue of dialogue
    this.displayText = typeof text === "string" ? text : this.text.shift(); // current statement
    this.scrolling = scrolling;
    this.options = options;
    this.completed = false;
    this.lastText = false;
    this.lastKey = new Date().getTime();
    this.loaded = true;
  },
  // Update & Scroll
  tick: function (time) {
    // console.log('action', this);
    if (!this.loaded) return;
    // Check for Dialogue Completion (TODO - manual triggers + scroll / sections)
    if (this.options && this.options.autoclose) {
      this.endTime = this.endTime ? this.endTime : this.options.endTime ?? new Date().getTime() + 10000; // 10 seconds default if autoclose
      if (time > this.endTime) {
        this.completed = true;
      }
    }
    // Handle Input
    this.checkInput(time);

    console.log(this.displayText, this.text);
    // Dialogue
    this.sprite.speak(this.displayText);

    // Callback on Completion
    if (this.completed && this.options.onClose) {
      this.sprite.speech.clearHud();
      this.options.onClose();
    }
    return this.completed;
  },
  // Handle Keyboard
  checkInput: function (time) {
    if (time > this.lastKey + 100) {
    switch (this.engine.keyboard.lastPressedCode()) {
      case "Escape":
        console.log("closing dialogue");
        this.sprite.speak(false);
        this.completed = true; // toggle
        break;
      case "Enter":
        if (typeof this.text === "string" || (this.text.length === 0)) {
          this.completed = true;
        } else {
          this.completed = false;
          this.displayText = this.text.shift();
          this.sprite.speak(this.displayText);
        }
        break;
    }
  }
  },
};
