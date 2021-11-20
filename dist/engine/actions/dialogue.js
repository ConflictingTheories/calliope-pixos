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
  init: function init(text) {
    var scrolling = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    console.log("loading - dialogue");
    this.engine = this.sprite.engine;
    this.text = text;
    this.scrolling = scrolling;
    this.options = options;
    this.completed = false;
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


    this.checkInput();
    this.textbox = this.engine.scrollText(this.text, this.scrolling, this.options);
    return this.completed;
  },
  // Handle Keyboard
  checkInput: function checkInput() {
    switch (this.engine.keyboard.lastPressed("q")) {
      // close dialogue on q key press
      case "q":
        console.log("closing dialogue");
        this.completed = true;
      // toggle

      default:
        return null;
    }
  }
};
exports["default"] = _default;