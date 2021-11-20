"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

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
var _default = {
  // Initialize Dialogue Object
  init: function init(prompt) {
    var scrolling = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
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
      switch (this.engine.keyboard.lastPressedCode()) {
        case "Escape":
          this.completed = true;
          break;

        case "Backspace":
          var arr = this.text.split("");
          arr.pop();
          this.text = arr.join("");
          this.lastKey = time;
          break;

        case "Enter":
          this.engine.setGreeting(this.text);
          this.completed = true;
          break;
      } // debounce keypresses
      // write to chat box


      var _char = this.engine.keyboard.lastPressed("abcdefghijklmnopqrstuvwxyz., ");

      if (_char) {
        this.lastKey = time;
        this.text += "" + _char;
      }
    }
  }
};
exports["default"] = _default;