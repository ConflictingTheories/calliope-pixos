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
  init: function (menu, activeMenus, scrolling = true, options = {}) {
    this.engine = this.sprite.engine;
    this.text = '';
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
          colors['background'] = '#555';
        }
        this.engine.drawButton(section.text, section.x, section.y, section.w, section.h, section.colours);
      });

    this.textbox = this.engine.scrollText(this.prompt + this.text, this.scrolling, this.options);

    if (this.completed) {
      this.unhookListener();
      // this.engine.clearHud();
    }
    return this.completed;
  },

  unhookListener: function () {
    // remove listener
    this.engine.gamepad.removeListener(this.listenerId);
    this.listenerId = null;
  },

  hookListener: function () {
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
    // Mouse
    // if (this.isTouched && this.touches.length > 0 && this.lastKey + 100 < time) {
    //   let x = this.touches[0].x;
    //   let y = this.touches[0].y;
    //   let self = this;
    //   self.activeMenu
    //     .filter((w) => {
    //       if (w.active && x < w.x + w.w && x > w.x && y < w.y + w.h && y > w.y) {
    //         return true;
    //       }
    //       return false;
    //     })
    //     .map((w) => {
    //       if (w.trigger) w.trigger();
    //       if (w.children) {
    //         self.activeMenu = w.children.map((c) => {
    //           c.active = true;
    //           return c;
    //         });
    //       }
    //     });
    // }

    // Keyboard
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
          this.text += '' + char;
        }
      }
    }
  },
};
