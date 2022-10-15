"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

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
var Event = /*#__PURE__*/function () {
  function Event(type, world, callback) {
    _classCallCheck(this, Event);

    this.type = type;
    this.world = world;
    this.callback = callback;
    this.time = new Date().getTime();
    this.id = world.id + "-" + type + "-" + this.time;
  } // configure action


  _createClass(Event, [{
    key: "configure",
    value: function configure(type, world, id, time, args) {
      this.world = world;
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
        world: this.world.id,
        type: this.type,
        args: this.creationArgs
      };
    } // callback on completion

  }, {
    key: "onComplete",
    value: function onComplete() {
      return this.callback ? this.callback() : null;
    }
  }]);

  return Event;
}();

exports["default"] = Event;