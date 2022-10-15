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
  init: function init(menu, activeMenus) {
    var _this = this;

    var scrolling = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {
      autoclose: false,
      closeOnEnter: false
    };
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
    this.menuDict = menu !== null && menu !== void 0 ? menu : {};
    this.activeMenus = activeMenus !== null && activeMenus !== void 0 ? activeMenus : [];
    this.selectedMenu = {};
    this.selectedMenuId = null;
    this.isTouched = false;
    this.speechOutput = false;
    this.quittable = true; // load voices and then play

    window.speechSynthesis.onvoiceschanged = function () {
      _this.speechOutput = true;
    };
  },
  // Update & Scroll
  tick: function tick(time) {
    var _this2 = this;

    if (!this.loaded) return; // Check for Dialogue Completion (TODO - manual triggers + scroll / sections)

    if (this.options && this.options.autoclose) {
      var _this$options$endTime;

      this.endTime = this.endTime ? this.endTime : (_this$options$endTime = this.options.endTime) !== null && _this$options$endTime !== void 0 ? _this$options$endTime : new Date().getTime() + 10000; // 10 seconds default if autoclose

      if (time > this.endTime) {
        this.completed = true;
      }
    } // Handle Input


    this.checkInput(time); // Draw Active Menus to Screen

    Object.keys(this.menuDict).filter(function (key) {
      return _this2.activeMenus.includes(key);
    }).map(function (id) {
      var section = _this2.menuDict[id];
      var colors = section.colours;

      if (section.active) {
        colors["background"] = "#555";
      }

      _this2.engine.drawButton(section.text, section.x, section.y, section.w, section.h, section.colours);

      if (section.prompt) {
        if (_this2.speechOutput) {
          _this2.engine.speechSynthesis(section.prompt);
        }

        _this2.textbox = _this2.engine.scrollText(section.prompt, _this2.scrolling, _this2.options);
      }
    }); // don't keep repeating speech

    this.speechOutput = false;

    if (this.completed) {
      this.unhookListener();
      window.speechSynthesis.cancel();
    }

    return this.completed;
  },
  // Unhook from the Touch & mouse handler
  unhookListener: function unhookListener() {
    // remove listener
    this.engine.gamepad.removeListener(this.listenerId);
    this.listenerId = null;
  },
  // Hook into the Touch & Mouse handler
  hookListener: function hookListener() {
    var _this3 = this;

    // open hook
    if (this.onOpen) this.onOpen(this); // attach handler

    var touchstart = function touchstart(_ref) {
      var touches = _ref.touches;
      _this3.isTouched = true;
      _this3.touches = touches;

      if (_this3.isTouched && _this3.touches.length > 0 && _this3.lastKey + 100 < new Date().getTime()) {
        var x = _this3.touches[0].x;
        var y = _this3.touches[0].y;
        var self = _this3;
        self.activeMenus.filter(function (key) {
          var w = self.menuDict[key];

          if (x < w.x + w.w && x > w.x && y < w.y + w.h && y > w.y) {
            return true;
          }

          return false;
        }).map(function (key) {
          var w = self.menuDict[key];
          if (w.trigger) w.trigger(_this3);

          if (w.children) {
            self.activeMenus = w.children;
          }
        });
      }
    };

    var touchmove = function touchmove(touches) {
      _this3.touches = touches;
    };

    var touchend = function touchend(touches) {
      _this3.isTouched = false;
      _this3.touches = touches;
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
  // Handle Keyboard & Input States
  checkInput: function checkInput(time) {
    var _this4 = this;

    // Keyboard
    if (time > this.lastKey + 100) {
      switch (this.engine.keyboard.lastPressedCode()) {
        case "Escape":
          if (this.quittable) {
            this.completed = true;
          }

          break;

        case "Enter":
          Object.keys(this.menuDict).filter(function (key) {
            return _this4.activeMenus.includes(key);
          }).map(function (id) {
            var section = _this4.menuDict[id];
            if (section.onEnter) section.trigger(_this4);
          });

          if (this.quittable || this.options.closeOnEnter) {
            this.completed = true;
          }

          break;
      }
    }
  }
};
exports["default"] = _default;