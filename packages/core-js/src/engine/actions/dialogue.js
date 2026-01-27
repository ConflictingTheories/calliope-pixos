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
 * Dialogue Action - Handles dialogue display with manual advancement,
 * scrolling sections, and completion callbacks.
 *
 * Options:
 *   - autoclose: boolean - Auto-close after duration (default: false)
 *   - duration: number - Duration in seconds before auto-close
 *   - manualAdvance: boolean - Require input to advance (default: true)
 *   - sections: boolean - Enable scrollable sections for long text (default: false)
 *   - linesPerSection: number - Lines to show per section (default: 3)
 *   - onSection: function(sectionIndex, totalSections) - Callback on section change
 *   - onClose: function - Callback when dialogue closes
 *   - onComplete: function - Callback when all dialogue completes
 */
export default {
  // Initialize Dialogue Object
  init: function (text, scrolling = true, options = {}) {
    this.engine = this.sprite.engine;
    this.text = text; // holds queue of dialogue
    this.displayText = typeof text === 'string' ? text : this.text.shift(); // current statement
    this.scrolling = scrolling;
    this.options = {
      autoclose: false,
      manualAdvance: true,
      sections: false,
      linesPerSection: 3,
      ...options,
    };
    this.completed = false;
    this.lastText = false;
    this.speechOutput = true;
    this.lastKey = new Date().getTime();
    this.loaded = true;

    // Section state for scrolling long text
    this.currentSection = 0;
    this.totalSections = 1;
    this.sectionLines = [];

    // Initialize sections if enabled
    if (this.options.sections && this.displayText) {
      this._initSections(this.displayText);
    }

    // Register this dialogue as an active HUD element so it gets re-rendered each frame
    this.engine.hud.registerElement(`dialogue-${this.sprite.id}-${Date.now()}`, this);
  },

  /**
   * Initialize scrollable sections from text
   * @param {string} text - The full text to split into sections
   * @private
   */
  _initSections: function (text) {
    const lines = text.split('\n');
    const linesPerSection = this.options.linesPerSection || 3;
    this.sectionLines = [];

    for (let i = 0; i < lines.length; i += linesPerSection) {
      this.sectionLines.push(lines.slice(i, i + linesPerSection).join('\n'));
    }

    this.totalSections = this.sectionLines.length;
    this.currentSection = 0;
    this.displayText = this.sectionLines[0] || text;

    // Notify section change
    if (this.options.onSection) {
      this.options.onSection(this.currentSection, this.totalSections);
    }
  },

  /**
   * Advance to the next section
   * @returns {boolean} True if there are more sections, false if this was the last
   * @private
   */
  _nextSection: function () {
    if (this.currentSection < this.totalSections - 1) {
      this.currentSection++;
      this.displayText = this.sectionLines[this.currentSection];

      // Reset speech for new section
      window.speechSynthesis.cancel();
      this.speechOutput = true;

      // Notify section change
      if (this.options.onSection) {
        this.options.onSection(this.currentSection, this.totalSections);
      }

      return true;
    }
    return false;
  },

  // Update & Scroll
  tick: function (time) {
    if (!this.loaded) return;

    // Check for Dialogue Completion - autoclose mode
    if (this.options.autoclose) {
      this.endTime =
        this.endTime ||
        this.options.endTime ||
        new Date().getTime() + (this.options.duration * 1000 || 10000);
      if (time > this.endTime) {
        this.completed = true;
      }
    }

    // Handle Input (only if manual advance is enabled or not autoclose)
    if (this.options.manualAdvance) {
      this.checkInput(time);
    }

    // Dialogue
    this.sprite.speak(this.displayText, false, this);

    // Callback on Completion
    if (this.completed) {
      if (this.sprite.speech?.clearHud) {
        this.sprite.speech.clearHud();
      }
      if (this.options.onClose) {
        this.options.onClose();
      }
      if (this.options.onComplete && (typeof this.text === 'string' || this.text.length === 0)) {
        this.options.onComplete();
      }
    }
    return this.completed;
  },

  /**
   * Renders the dialogue UI without processing input.
   * This is called by the HUD rendering system each frame to ensure dialogue stays visible.
   */
  render: function () {
    if (!this.engine || !this.sprite || !this.displayText) return;

    // Re-render dialogue text
    this.sprite.speak(this.displayText, false, this);
  },

  // Handle Keyboard
  checkInput: function (time) {
    if (time > this.lastKey + 100) {
      const keyCode = this.engine.keyboard.lastPressedCode();
      const gamepadA = this.engine.gamepad.keyPressed('a');

      // Check for advance input (Enter or gamepad A)
      if (keyCode === 'Enter' || gamepadA) {
        this.lastKey = time;
        this._handleAdvance();
        return;
      }

      // Check for skip input (Escape)
      if (keyCode === 'Escape') {
        this.lastKey = time;
        this._handleSkip();
        return;
      }

      // Check for section scroll (Arrow keys for section mode)
      if (this.options.sections && this.sectionLines.length > 1) {
        if (keyCode === 'ArrowUp') {
          this.lastKey = time;
          this._prevSection();
          return;
        }
        if (keyCode === 'ArrowDown') {
          this.lastKey = time;
          this._nextSection();
          return;
        }
      }
    }
  },

  /**
   * Handle advance input (Enter/A button)
   * @private
   */
  _handleAdvance: function () {
    // If sections mode, try to advance section first
    if (this.options.sections && this._nextSection()) {
      this.sprite.speak(this.displayText, false, this);
      return;
    }

    // If we have more dialogue in the queue
    if (typeof this.text !== 'string' && this.text.length > 0) {
      this.displayText = this.text.shift();
      window.speechSynthesis.cancel();
      this.speechOutput = true;

      // Re-init sections if enabled
      if (this.options.sections) {
        this._initSections(this.displayText);
      }

      this.sprite.speak(this.displayText, false, this);
      return;
    }

    // All dialogue complete
    this.sprite.speak(false);
    this.completed = true;
  },

  /**
   * Handle skip input (Escape)
   * @private
   */
  _handleSkip: function () {
    this.sprite.speak(false);
    window.speechSynthesis.cancel();
    this.completed = true;
  },

  /**
   * Go to previous section (for scrollable sections)
   * @private
   */
  _prevSection: function () {
    if (this.currentSection > 0) {
      this.currentSection--;
      this.displayText = this.sectionLines[this.currentSection];
      window.speechSynthesis.cancel();
      this.speechOutput = true;

      if (this.options.onSection) {
        this.options.onSection(this.currentSection, this.totalSections);
      }

      this.sprite.speak(this.displayText, false, this);
    }
  },
};
