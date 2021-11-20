"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
var Keyboard = /*#__PURE__*/function () {
  function Keyboard() {
    _classCallCheck(this, Keyboard);

    // Instance
    if (!Keyboard._instance) {
      this.activeKeys = [];
      this.activeCodes = [];
      this.shift = false;
      Keyboard._instance = this;
    }

    return Keyboard._instance;
  }

  _createClass(Keyboard, [{
    key: "onKeyDown",
    value: function onKeyDown(e) {
      e.preventDefault();
      var c = String.fromCharCode(e.keyCode).toLowerCase();
      if (Keyboard._instance.activeKeys.indexOf(c) < 0) Keyboard._instance.activeKeys.push(c);
      if (Keyboard._instance.activeCodes.indexOf(e.key) < 0) Keyboard._instance.activeCodes.push(e.key);
      Keyboard._instance.shift = e.shiftKey;
    }
  }, {
    key: "onKeyUp",
    value: function onKeyUp(e) {
      var c = String.fromCharCode(e.keyCode).toLowerCase();

      var index = Keyboard._instance.activeKeys.indexOf(c);

      Keyboard._instance.activeKeys.splice(index, 1);

      Keyboard._instance.activeCodes.splice(index, 1);
    } // Return the last pressed key from provided keys

  }, {
    key: "lastPressed",
    value: function lastPressed(keys) {
      var lower = keys.toLowerCase();
      var max = null;
      var maxI = -1;

      for (var i = 0; i < keys.length; i++) {
        var k = lower[i];

        var index = Keyboard._instance.activeKeys.indexOf(k);

        if (index > maxI) {
          max = k;
          maxI = index;
        }
      }

      return max;
    } // Return the last pressed key in keys

  }, {
    key: "lastPressedCode",
    value: function lastPressedCode() {
      var ignore = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
      var last = Keyboard._instance.activeCodes[Keyboard._instance.activeCodes.length - 1];
      var lower = ignore.toLowerCase();

      for (var i = 0; i < lower.length; i++) {
        var index = Keyboard._instance.activeKeys.indexOf(last);

        if (index < 0) {
          last = Keyboard._instance.activeCodes.pop();
        }
      }

      return last;
    } // Return the last pressed key in keys

  }, {
    key: "lastPressedKey",
    value: function lastPressedKey() {
      return Keyboard._instance.activeKeys[Keyboard._instance.activeCodes.length - 1];
    }
  }]);

  return Keyboard;
}();

exports["default"] = Keyboard;