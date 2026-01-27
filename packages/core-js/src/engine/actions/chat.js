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
export default {
  /**
   * Initializes the chat action.
   * @param {string} prompt - The initial prompt text.
   * @param {boolean} [scrolling=true] - Whether the text scrolls.
   * @param {ChatOptions} [options={}] - Additional options.
   */
  init: function (prompt, scrolling = true, options = {}) {
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
  tick: function (time) {
    if (!this.loaded) return false;
    if (this.options && this.options.autoclose) {
      this.endTime = this.endTime
        ? this.endTime
        : (this.options.endTime ?? new Date().getTime() + 10000);
      if (time > this.endTime) {
        this.completed = true;
      }
    }
    this.checkInput(time);
    this.textbox = this.engine.hud.scrollText(
      this.prompt + this.text,
      this.scrolling,
      this.options
    );
    return this.completed;
  },

  /**
   * Handles keyboard input for the chat.
   * @param {number} time - The current time.
   */
  checkInput: function (time) {
    if (time > this.lastKey + 100) {
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
          this.sprite.setGreeting(this.text);
          if (this.sprite.speech.clearHud) this.sprite.speech.clearHud();
          this.speechbox = this.sprite.speech.scrollText(this.text);
          this.sprite.speech.loadImage();
          this.completed = true;
          skipChar = true;
          break;
      }
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
