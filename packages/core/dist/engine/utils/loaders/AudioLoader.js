"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AudioTrack = exports.AudioLoader = void 0;
var _realtimeBpmAnalyzer = require("realtime-bpm-analyzer");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /*                                                 *\
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
// Loads Audio
var AudioLoader = exports.AudioLoader = /*#__PURE__*/function () {
  function AudioLoader(engine) {
    _classCallCheck(this, AudioLoader);
    this.engine = engine;
    this.definitions = [];
    this.instances = {};
  }

  // Load Audio Track
  return _createClass(AudioLoader, [{
    key: "load",
    value: function load(src) {
      var loop = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      if (this.instances[src]) {
        return this.instances[src];
      }
      var instance = new AudioTrack(src, loop);
      this.instances[src] = instance;
      // Stop other loops
      var loader = this;
      if (loop) {
        Object.keys(loader.instances).filter(function (instance) {
          return src !== instance;
        }).forEach(function (instance) {
          if (loader.instances[instance]) {
            loader.instances[instance].pauseAudio();
          }
        });
      }
      // once loaded
      instance.loaded = true;
      return instance;
    }

    // Load Audio Track
  }, {
    key: "loadFromZip",
    value: function () {
      var _loadFromZip = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(zip, src) {
        var loop,
          blob,
          url,
          instance,
          loader,
          _args = arguments;
        return _regenerator().w(function (_context) {
          while (1) switch (_context.n) {
            case 0:
              loop = _args.length > 2 && _args[2] !== undefined ? _args[2] : false;
              if (!this.instances[src]) {
                _context.n = 1;
                break;
              }
              return _context.a(2, this.instances[src]);
            case 1:
              console.log({
                msg: 'let the beat roll in!'
              });
              _context.n = 2;
              return zip.file("audio/".concat(src)).async('arrayBuffer').then(function (audioData) {
                var buffer = new Uint8Array(audioData);
                return new Blob([buffer.buffer]);
              });
            case 2:
              blob = _context.v;
              url = URL.createObjectURL(blob);
              console.log({
                msg: 'loading audio track...',
                url: url
              });
              instance = new AudioTrack(url, loop);
              this.instances[src] = instance;
              // Stop other loops
              loader = this;
              if (loop) {
                Object.keys(loader.instances).filter(function (instance) {
                  return src !== instance;
                }).forEach(function (instance) {
                  if (loader.instances[instance]) {
                    loader.instances[instance].pauseAudio();
                  }
                });
              }
              // once loaded
              instance.loaded = true;
              return _context.a(2, instance);
          }
        }, _callee, this);
      }));
      function loadFromZip(_x, _x2) {
        return _loadFromZip.apply(this, arguments);
      }
      return loadFromZip;
    }()
  }]);
}();
var AudioTrack = exports.AudioTrack = /*#__PURE__*/function () {
  function AudioTrack(src) {
    var _this = this;
    var loop = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    _classCallCheck(this, AudioTrack);
    this.src = src;
    this.playing = false;
    this.audio = new Audio(src);
    this.audioContext = new AudioContext();
    this.bpm = 0;
    this.analyser = this.audioContext.createAnalyser();
    this.audioSource = this.audioContext.createMediaElementSource(this.audio);
    this.audioSource.connect(this.analyser);
    // this.audioSource.connect(this.audioContext.destination);
    this.audioNode = this.audioContext.createScriptProcessor(4096, 1, 1);
    this.audioNode.connect(this.audioContext.destination);
    // Connect everythings together
    this.audioSource.connect(this.audioNode);
    this.audioSource.connect(this.audioContext.destination);
    // bpm analyzer
    var onAudioProcess = new _realtimeBpmAnalyzer.RealTimeBPMAnalyzer({
      scriptNode: {
        bufferSize: 4096
      },
      pushTime: 2000,
      pushCallback: function pushCallback(err, bpm) {
        _this.bpm = bpm;
      }
    });
    this.audioNode.onaudioprocess = function (e) {
      onAudioProcess.analyze(e);
    };

    // loop if set
    if (loop) {
      this.audio.addEventListener('ended', function () {
        this.currentTime = 0;
        this.play();
      }, false);
    }
    this.audio.load();
  }
  return _createClass(AudioTrack, [{
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
        audioPromise.then(function (_) {
          // autoplay started
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
        audioPromise.then(function (_) {
          // autoplay started
        })["catch"](function (err) {
          // catch dom exception
          console.info(err);
        });
      }
    }
  }]);
}();