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
var _default = exports["default"] = {
  // Initialize Dialogue Object
  init: function init(menu, activeMenus) {
    var scrolling = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    this.engine = this.sprite.engine;
    this.text = '';
    this.scrolling = scrolling;
    this.line = 0;
    this.options = options;
    this.completed = false;
    this.lastKey = new Date().getTime();
    this.listenerId = this.engine.gamepad.attachListener(this.hookListener());
    this.touches = [];
    this.menuDict = menu !== null && menu !== void 0 ? menu : {};
    this.activeMenus = activeMenus !== null && activeMenus !== void 0 ? activeMenus : [];
    this.selectedMenu = {};
    this.selectedMenuId = null;
    this.isTouched = false;
  },
  // Update & Scroll
  tick: function tick(time) {
    var _this = this;
    if (!this.loaded) return;
    // Check for Dialogue Completion (TODO - manual triggers + scroll / sections)
    if (this.options && this.options.autoclose) {
      var _this$options$endTime;
      this.endTime = this.endTime ? this.endTime : (_this$options$endTime = this.options.endTime) !== null && _this$options$endTime !== void 0 ? _this$options$endTime : new Date().getTime() + 10000; // 10 seconds default if autoclose
      if (time > this.endTime) {
        this.completed = true;
      }
    }

    // Handle Input
    this.checkInput(time);
    // Draw Active Menus to Screen
    Object.keys(this.menuDict).filter(function (key) {
      return _this.activeMenus.includes(key);
    }).map(function (id) {
      var section = _this.menuDict[id];
      var colors = section.colours;
      if (section.active) {
        colors['background'] = '#555';
      }
      _this.engine.hud.drawButton(section.text, section.x, section.y, section.w, section.h, section.colours);
    });
    this.textbox = this.engine.hud.scrollText(this.prompt + this.text, this.scrolling, this.options);
    if (this.completed) {
      this.unhookListener();
      // this.engine.hud.clearHud();
    }
    return this.completed;
  },
  unhookListener: function unhookListener() {
    // remove listener
    this.engine.gamepad.removeListener(this.listenerId);
    this.listenerId = null;
  },
  hookListener: function hookListener() {
    var _this2 = this;
    /**
     * Normalize event to extract touches array.
     * Works with mouse events, touch events, and pre-processed events from WebGLView.
     */
    var normalizeTouches = function normalizeTouches(e) {
      // Pre-computed canvas coordinates from WebGLView
      if (e.canvasX !== undefined && e.canvasY !== undefined) {
        return [{
          x: e.canvasX,
          y: e.canvasY,
          identifier: 'normalized'
        }];
      }
      // Touch events
      if (e.touches && e.touches.length > 0) {
        return Array.from(e.touches).map(function (t) {
          return {
            x: t.clientX,
            y: t.clientY,
            identifier: t.identifier
          };
        });
      }
      // Touch end uses changedTouches
      if (e.changedTouches && e.changedTouches.length > 0) {
        return Array.from(e.changedTouches).map(function (t) {
          return {
            x: t.clientX,
            y: t.clientY,
            identifier: t.identifier
          };
        });
      }
      // Mouse events
      if (e.clientX !== undefined && e.clientY !== undefined) {
        return [{
          x: e.clientX,
          y: e.clientY,
          identifier: 'mouse'
        }];
      }
      // Already normalized (legacy format)
      if (e.touches) {
        return e.touches;
      }
      return [];
    };
    var touchstart = function touchstart(e) {
      var touches = normalizeTouches(e);
      _this2.isTouched = true;
      _this2.touches = touches;
      if (_this2.isTouched && _this2.touches.length > 0 && _this2.lastKey + 100 < new Date().getTime()) {
        var x = _this2.touches[0].x;
        var y = _this2.touches[0].y;
        var self = _this2;
        self.activeMenus.filter(function (key) {
          var w = self.menuDict[key];
          if (x < w.x + w.w && x > w.x && y < w.y + w.h && y > w.y) {
            return true;
          }
          return false;
        }).map(function (key) {
          var w = self.menuDict[key];
          if (w.trigger) w.trigger(_this2);
          if (w.children) {
            self.activeMenus = w.children;
          }
        });
      }
    };
    var touchmove = function touchmove(e) {
      _this2.touches = normalizeTouches(e);
    };
    var touchend = function touchend(e) {
      _this2.isTouched = false;
      _this2.touches = normalizeTouches(e);
    };
    var mousemove = touchmove;
    var mousedown = touchstart;
    var mouseup = touchend;
    return {
      touchstart: touchstart,
      touchmove: touchmove,
      touchend: touchend,
      mousedown: mousedown,
      mousemove: mousemove,
      mouseup: mouseup
    };
  },
  // Handle Keyboard & Mouse & Touch
  checkInput: function checkInput(time) {
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
    if (time > this.lastKey + 200) {
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
      // debounce keypresses
      // write to chat box
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