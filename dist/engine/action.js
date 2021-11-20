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
var Action = /*#__PURE__*/function () {
  function Action(type, sprite) {
    _classCallCheck(this, Action);

    this.type = type;
    this.sprite = sprite;
    this.time = new Date().getTime();
    this.id = sprite.id + "-" + type + "-" + this.time;
  } // configure action


  _createClass(Action, [{
    key: "configure",
    value: function configure(type, sprite, id, time, args) {
      this.sprite = sprite;
      this.id = id;
      this.type = type;
      this.startTime = time;
      this.creationArgs = args;
    } // initialize on load

  }, {
    key: "onLoad",
    value: function onLoad(args) {
      this.init.apply(this, args);
      this.loaded = true;
    } // serialize

  }, {
    key: "serialize",
    value: function serialize() {
      return {
        id: this.id,
        time: this.startTime,
        zone: this.sprite.zone.id,
        sprite: this.sprite.id,
        type: this.type,
        args: this.creationArgs
      };
    }
  }]);

  return Action;
}();

exports["default"] = Action;