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
  init: function (menu, scrolling = true, options = {}) {
    console.log("loading - menu");
    this.engine = this.sprite.engine;
    this.text = "";
    this.scrolling = scrolling;
    this.line = 0;
    this.options = options;
    this.completed = false;
    this.lastKey = new Date().getTime();
    this.listenerId = this.engine.gamepad.attachListener(this.hookListener());
    this.touches = [];
    this.menu = menu ?? [];
    this.activeMenu = menu ?? [];
    this.isTouched = false;
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

    // Draw Screen
    this.activeMenu.map((section) => {
      let colors = section.colours;
      if (section.active) {
        colors["background"] = "#555";
      }
      this.engine.drawButton(section.text, section.x, section.y, section.w, section.h, section.colours);
    });

    this.textbox = this.engine.scrollText(this.prompt + this.text, this.scrolling, this.options);

    if (this.completed) this.unhookListener();
    return this.completed;
  },

  unhookListener: function () {
    // remove listener
    this.engine.gamepad.removeListener(this.listenerId);
    this.listenerId = null;
  },

  hookListener: function () {
    let touchstart = (touches) => {
      console.log("touching - start", touches);
      this.isTouched = true;
      this.touches = touches;
    };
    let touchend = (touches) => {
      console.log("touching - end", touches);
      this.isTouched = false;
      this.touches = [];
    };
    let touchmove = touchstart;
    let mousemove = touchstart;
    let mousedown = touchstart;
    let mouseup = touchend;
    return {
      touchstart,
      touchmove,
      touchend,
      mousedown,
      mousemove,
      mouseup,
    };
  },
  // Handle Keyboard & Mouse & Touch
  checkInput: function (time) {
    // Mouse
    if (this.isTouched) {
      let x = this.touches[0].x;
      let y = this.touches[0].y;
      this.activeMenu = this.menu
        .filter((w) => {
          if (w.active && w < w.x + w.w && x > w.x && y < w.y + w.h && y > w.y) {
            return true;
          }
          return false;
        })
        .map((w) => {
          if (w.trigger) w.trigger();
          if (w.children)
            return w.children.map((c) => {
              c.active = true;
              return c;
            });
          return w;
        });
    }

    // Keyboard
    if (time > this.lastKey + 100) {
      let skipChar = false;
      switch (this.engine.keyboard.lastPressedCode()) {
        case "Escape":
          this.completed = true;
          skipChar = true;
          break;
        case "Backspace":
          let arr = this.text.split("");
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
      }
      // debounce keypresses
      // write to chat box
      if (!skipChar) {
        let char = this.engine.keyboard.lastPressedKey();
        if (char) {
          this.lastKey = time;
          this.text += "" + char;
        }
      }
    }
  },
};
