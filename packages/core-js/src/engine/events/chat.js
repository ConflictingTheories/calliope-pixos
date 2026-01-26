/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis  **
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
    this.engine = this.world.engine;
    this.text = '';
    this.prompt = prompt;
    this.scrolling = scrolling;
    this.line = 0;
    this.options = options;
    this.completed = false;
    this.lastKey = new Date().getTime();
    
    // Register this chat as an active HUD element so it gets re-rendered each frame
    this.engine.hud.registerElement(`chat-${Date.now()}`, this);
  },
  // Update & Scroll
  tick: function (time) {
    if (!this.loaded) return;
    // Check for Dialogue Completion (See dialogue.js for full section/scroll support)
    if (this.options && this.options.autoclose) {
      this.endTime = this.endTime ? this.endTime : this.options.endTime ?? new Date().getTime() + 10000; // 10 seconds default if autoclose
      if (time > this.endTime) {
        this.completed = true;
      }
    }
    // Handle Input
    this.checkInput(time);
    this.textbox = this.engine.hud.scrollText(this.prompt + this.text, this.scrolling, this.options);
    return this.completed;
  },
  // Render
  render: function () {
    if (!this.engine || !this.prompt) return;
    
    // Re-render chat textbox
    this.textbox = this.engine.hud.scrollText(this.prompt + this.text, this.scrolling, this.options);
  },
  // Handle Keyboard
  checkInput: function (time) {
    if (time > this.lastKey + 200) {
      let skipChar = false;
      switch (this.engine.keyboard.lastPressedCode()) {
        case 'Escape':
          this.completed = true;
          skipChar = true;
          break;
        case 'Backspace':
          let arr = this.text.split('');
          arr.pop();
          this.text = arr.join('');
          this.lastKey = time;
          skipChar = true;
          break;
        case 'Enter':
          this.engine.hud.scrollText(this.text);
          // send to chat room - todo
          this.completed = true;
          skipChar = true;
          break;
      }
      // debounce keypresses
      // write to chat box
      if (!skipChar) {
        let char = this.engine.keyboard.lastPressedKey();
        if (char) {
          this.lastKey = time;
          this.text += '' + char;
        }
      }
    }
  },
};
