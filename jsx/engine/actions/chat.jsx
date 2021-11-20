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
  init: function (prompt, scrolling = true, options = {}) {
    console.log("loading - chat");
    this.engine = this.sprite.engine;
    this.text = "";
    this.prompt = prompt;
    this.scrolling = scrolling;
    this.line = 0;
    this.options = options;
    this.completed = false;
    this.lastKey = new Date().getTime();
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
    this.checkInput(time);
    this.textbox = this.engine.scrollText(this.prompt + this.text, this.scrolling, this.options);
    return this.completed;
  },
  // Handle Keyboard
  checkInput: function (time) {
    if (time > this.lastKey + 100) {
      switch (this.engine.keyboard.lastPressedCode()) {
        case "Escape":
          this.completed = true;
          break;
        case "Backspace":
          let arr = this.text.split("");
          arr.pop();
          this.text = arr.join("");
          this.lastKey = time;
          break;
        case "Enter":
          this.engine.setGreeting(this.text);
          this.completed = true;
          break;
      }
      // debounce keypresses
      // write to chat box
      let char = this.engine.keyboard.lastPressed("abcdefghijklmnopqrstuvwxyz., ");
      if (char) {
        this.lastKey = time;
        this.text += "" + char;
      }
    }
  },
};
