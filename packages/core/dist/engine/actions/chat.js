"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
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
/**
 * @fileoverview Chat action for Pixos game engine.
 * Handles dialogue input and display for sprites.
 */
/**
 * @typedef {object} ChatOptions
 * @property {boolean} [autoclose=false] - Whether to auto-close the chat after a time.
 * @property {number} [endTime] - Timestamp when to auto-close.
 */
/**
 * Chat action object for handling dialogue interactions.
 */
var _default = exports["default"] = {
  /**
   * Initializes the chat action.
   * @param {string} prompt - The initial prompt text.
   * @param {boolean} [scrolling=true] - Whether the text scrolls.
   * @param {ChatOptions} [options={}] - Additional options.
   */
  init: function init(prompt) {
    var scrolling = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    /** @type {import('../core/index.js').default} */
    this.engine = this.sprite.engine;
    /** @type {string} */
    this.text = '';
    /** @type {string} */
    this.prompt = prompt;
    /** @type {boolean} */
    this.scrolling = scrolling;
    /** @type {number} */
    this.line = 0;
    /** @type {ChatOptions} */
    this.options = options;
    /** @type {boolean} */
    this.completed = false;
    /** @type {number} */
    this.lastKey = new Date().getTime();
  },
  /**
   * Updates and scrolls the chat.
   * @param {number} time - The current time.
   * @returns {boolean} True if the chat is completed.
   */
  tick: function tick(time) {
    if (!this.loaded) return false;
    if (this.options && this.options.autoclose) {
      var _this$options$endTime;
      this.endTime = this.endTime ? this.endTime : (_this$options$endTime = this.options.endTime) !== null && _this$options$endTime !== void 0 ? _this$options$endTime : new Date().getTime() + 10000;
      if (time > this.endTime) {
        this.completed = true;
      }
    }
    this.checkInput(time);
    this.textbox = this.engine.hud.scrollText(this.prompt + this.text, this.scrolling, this.options);
    return this.completed;
  },
  /**
   * Handles keyboard input for the chat.
   * @param {number} time - The current time.
   */
  checkInput: function checkInput(time) {
    if (time > this.lastKey + 100) {
      var skipChar = false;
      switch (this.engine.keyboard.lastPressedCode()) {
        case 'Escape':
          this.completed = true;
          skipChar = true;
          break;
        case 'Backspace':
          var arr = this.text.split('');
          arr.pop();
          this.text = arr.join('');
          this.lastKey = time;
          skipChar = true;
          break;
        case 'Enter':
          this.sprite.setGreeting(this.text);
          if (this.sprite.speech.clearHud) this.sprite.speech.clearHud();
          this.speechbox = this.sprite.speech.scrollText(this.text);
          this.sprite.speech.loadImage();
          this.completed = true;
          skipChar = true;
          break;
      }
      if (!skipChar) {
        var _char = this.engine.keyboard.lastPressedKey();
        if (_char) {
          this.lastKey = time;
          this.text += '' + _char;
        }
      }
    }
  }
};