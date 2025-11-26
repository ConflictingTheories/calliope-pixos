"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _enums = require("@Engine/utils/enums.js");
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; } /*                                                 *\
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
  init: function () {
    var _init = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(moveLength, zone) {
      var _this$sprite$danceSou;
      return _regenerator().w(function (_context) {
        while (1) switch (_context.n) {
          case 0:
            this.zone = zone;
            this.moveLength = moveLength;
            this.startTime = new Date().getTime();
            this.lastKey = new Date().getTime();
            this.completed = false;
            _context.n = 1;
            return this.zone.engine.resourceManager.audioLoader.loadFromZip(this.sprite.zip, (_this$sprite$danceSou = this.sprite.danceSound) !== null && _this$sprite$danceSou !== void 0 ? _this$sprite$danceSou : '/pixospritz/audio/sewer-beat.mp3', true);
          case 1:
            this.audio = _context.v;
            if (this.zone.audio) this.zone.audio.pauseAudio();
            if (this.audio) this.audio.playAudio();
          case 2:
            return _context.a(2);
        }
      }, _callee, this);
    }));
    function init(_x, _x2) {
      return _init.apply(this, arguments);
    }
    return init;
  }(),
  tick: function tick(time) {
    if (!this.loaded) return;
    // listen to audio freq data
    var fbc_array = new Uint8Array(this.audio.analyser.frequencyBinCount);
    this.audio.analyser.getByteFrequencyData(fbc_array);

    // load up moves - todo (improve this and make it less manual)
    this.checkInput(time);
    var endTime = this.startTime + this.moveLength;
    if (time > endTime) {
      //   // set facing based on audio
      var facing = this.sprite.facing == _enums.Direction.Right ? _enums.Direction.Left : _enums.Direction.Right;
      var bar_pos,
        bar_width,
        bar_height = null;
      for (var i = 0; i < 16; i++) {
        bar_pos = i * 4;
        bar_width = 2;
        bar_height = -(fbc_array[i] / 2);
      }
      if (bar_height > 80) {
        facing = this.sprite.facing == _enums.Direction.Right ? _enums.Direction.Down : _enums.Direction.Left;
      } else {
        facing = this.sprite.facing == _enums.Direction.Up ? _enums.Direction.Left : _enums.Direction.Down;
      }
      this.sprite.addAction(this.sprite.faceDir(facing)).then(function () {});
      this.startTime = time;
    }

    // change on the beat (NEEDS WORK)
    // let facing = this.sprite.facing;
    // let beat = this.audio.bpm ? time % ((this.audio.bpm[0].tempo ?? 1) * 1000) : 1;
    // while (beat === 0) {
    //   switch (this.sprite.facing) {
    //     case Direction.Up:
    //       facing = Direction.Left;
    //       break;
    //     case Direction.Down:
    //       facing = Direction.Right;
    //       break;
    //     case Direction.Right:
    //       facing = Direction.Up;
    //       break;
    //     case Direction.Left:
    //       facing = Direction.Down;
    //       break;
    //     default:
    //       facing = Direction.Down;
    //       break;
    //   }
    // }
    // this.sprite.addAction(this.sprite.faceDir(facing));
    // this.startTime = time;
    // }

    // next move
    return this.completed; // loop
  },
  // Handle Keyboard
  checkInput: function checkInput(time) {
    if (time > this.lastKey + this.moveLength) {
      switch (this.sprite.engine.keyboard.lastPressed('q')) {
        // close dialogue on q key press
        case 'q':
          if (this.audio) {
            this.audio.pauseAudio();
          }
          this.completed = true;
        // toggle
        default:
          this.lastKey = new Date().getTime();
          return null;
      }
    }
  }
};