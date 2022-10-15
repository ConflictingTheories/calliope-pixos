"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AudioTrack = exports.AudioLoader = void 0;

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
// Loads Audio
var AudioLoader = /*#__PURE__*/function () {
  function AudioLoader(engine) {
    _classCallCheck(this, AudioLoader);

    this.engine = engine;
    this.definitions = [];
    this.instances = {};
  } // Load Audio Track


  _createClass(AudioLoader, [{
    key: "load",
    value: function load(src) {
      var loop = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (this.instances[src]) {
        return this.instances[src];
      }

      var instance = new AudioTrack(src, loop);
      this.instances[src] = instance; // Stop other loops

      var loader = this;

      if (loop) {
        Object.keys(loader.instances).filter(function (instance) {
          return src !== instance;
        }).forEach(function (instance) {
          loader.instances[instance].pauseAudio();
        });
      } // once loaded


      instance.loaded = true;
      return instance;
    }
  }]);

  return AudioLoader;
}();

exports.AudioLoader = AudioLoader;

var AudioTrack = /*#__PURE__*/function () {
  function AudioTrack(src) {
    var loop = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    _classCallCheck(this, AudioTrack);

    this.src = src;
    this.playing = false;
    this.audio = new Audio(src); // loop if set

    if (loop) {
      this.audio.addEventListener("ended", function () {
        this.currentTime = 0;
        this.play();
      }, false);
    }

    this.audio.load();
  }

  _createClass(AudioTrack, [{
    key: "isPlaying",
    value: function isPlaying() {
      return this.playing;
    }
  }, {
    key: "playAudio",
    value: function playAudio() {
      var audioPromise = this.audio.play();
      this.playing = true;

      if (audioPromise !== undefined) {
        audioPromise.then(function (_) {// autoplay started
        })["catch"](function (err) {
          // catch dom exception
          console.info(err);
        });
      }
    }
  }, {
    key: "pauseAudio",
    value: function pauseAudio() {
      var audioPromise = this.audio.pause();
      this.playing = false;

      if (audioPromise !== undefined) {
        audioPromise.then(function (_) {// autoplay started
        })["catch"](function (err) {
          // catch dom exception
          console.info(err);
        });
      }
    }
  }]);

  return AudioTrack;
}();

exports.AudioTrack = AudioTrack;