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

export default {
  // Initialize Dialogue Object
  init: function (menu, activeMenus, scrolling = true, options = { autoclose: false, closeOnEnter: false }) {
    this.engine = this.world.engine;
    this.text = "";
    this.prompt = "";
    this.scrolling = scrolling;
    this.line = 0;
    this.options = options;
    this.completed = false;
    this.lastKey = new Date().getTime();
    this.listenerId = this.engine.gamepad.attachListener(this.hookListener());
    this.touches = [];
    this.menuDict = menu ?? {};
    this.activeMenus = activeMenus ?? [];
    this.selectedMenu = {};
    this.selectedMenuId = null;
    this.isTouched = false;
    this.speechOutput = false;
    this.quittable = true;
    // load voices and then play
    window.speechSynthesis.onvoiceschanged = () => {
      this.speechOutput = true;
    };
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
    // Draw Active Menus to Screen
    Object.keys(this.menuDict)
      .filter((key) => this.activeMenus.includes(key))
      .map((id) => {
        let section = this.menuDict[id];
        let colors = section.colours;
        if (section.active) {
          colors["background"] = "#555";
        }
        this.engine.drawButton(section.text, section.x, section.y, section.w, section.h, section.colours);
        if (section.prompt) {
          if (this.speechOutput) {
            this.engine.speechSynthesis(section.prompt);
          }
          this.textbox = this.engine.scrollText(section.prompt, this.scrolling, this.options);
        }
      });
    // don't keep repeating speech
    this.speechOutput = false;

    if (this.completed) {
      this.unhookListener();
      window.speechSynthesis.cancel();
    }
    return this.completed;
  },

  unhookListener: function () {
    // remove listener
    this.engine.gamepad.removeListener(this.listenerId);
    this.listenerId = null;
  },

  hookListener: function () {
    // open hook
    if (this.onOpen) this.onOpen(this);
    // attach handler
    let touchstart = ({ touches }) => {
      this.isTouched = true;
      this.touches = touches;
      if (this.isTouched && this.touches.length > 0 && this.lastKey + 100 < new Date().getTime()) {
        let x = this.touches[0].x;
        let y = this.touches[0].y;
        let self = this;
        self.activeMenus
          .filter((key) => {
            let w = self.menuDict[key];
            if (x < w.x + w.w && x > w.x && y < w.y + w.h && y > w.y) {
              return true;
            }
            return false;
          })
          .map((key) => {
            let w = self.menuDict[key];
            if (w.trigger) w.trigger(this);
            if (w.children) {
              self.activeMenus = w.children;
            }
          });
      }
    };
    let touchmove = (touches) => {
      this.touches = touches;
    };
    let touchend = (touches) => {
      this.isTouched = false;
      this.touches = touches;
    };
    let mousemove = touchmove;
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
    // Keyboard
    if (time > this.lastKey + 100) {
      switch (this.engine.keyboard.lastPressedCode()) {
        case "Escape":
          if (this.quittable) {
            this.completed = true;
          }
          break;
        case "Enter":
          Object.keys(this.menuDict)
            .filter((key) => this.activeMenus.includes(key))
            .map((id) => {
              let section = this.menuDict[id];
              if (section.onEnter) section.trigger(this);
            });
          if (this.quittable || this.options.closeOnEnter) {
            this.completed = true;
          }
          break;
      }
    }
  },
};
