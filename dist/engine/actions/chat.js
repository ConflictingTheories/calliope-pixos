"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

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
var _default = {
  // Initialize Dialogue Object
  init: function init(prompt) {
    var scrolling = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
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
  tick: function tick(time) {
    if (!this.loaded) return; // Check for Dialogue Completion (TODO - manual triggers + scroll / sections)

    if (this.options && this.options.autoclose) {
      var _this$options$endTime;

      this.endTime = this.endTime ? this.endTime : (_this$options$endTime = this.options.endTime) !== null && _this$options$endTime !== void 0 ? _this$options$endTime : new Date().getTime() + 10000; // 10 seconds default if autoclose

      if (time > this.endTime) {
        this.completed = true;
      }
    } // Handle Input


    this.checkInput(time);
    this.textbox = this.engine.scrollText(this.prompt + this.text, this.scrolling, this.options);
    return this.completed;
  },
  // Handle Keyboard
  checkInput: function checkInput(time) {
    if (time > this.lastKey + 100) {
      var skipChar = false;

      switch (this.engine.keyboard.lastPressedCode()) {
        case "Escape":
          this.completed = true;
          skipChar = true;
          break;

        case "Backspace":
          var arr = this.text.split("");
          arr.pop();
          this.text = arr.join("");
          this.lastKey = time;
          skipChar = true;
          break;

        case "Enter":
          this.engine.setGreeting(this.text);
          if (this.sprite.speech.clearHud) this.sprite.speech.clearHud();
          this.speechbox = this.sprite.speech.scrollText(this.text);
          this.sprite.speech.loadImage();
          this.completed = true;
          skipChar = true;
          break;
      } // debounce keypresses
      // write to chat box


      if (!skipChar) {
        var _char = this.engine.keyboard.lastPressedKey();

        if (_char) {
          this.lastKey = time;
          this.text += "" + _char;
        }
      }
    }
  }
};
exports["default"] = _default;