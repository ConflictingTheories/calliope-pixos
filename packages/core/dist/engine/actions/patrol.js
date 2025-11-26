"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _vector = require("@Engine/utils/math/vector.js");
var _enums = require("@Engine/utils/enums.js");
var _index = require("@Engine/utils/loaders/index.js");
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _construct(t, e, r) { if (_isNativeReflectConstruct()) return Reflect.construct.apply(null, arguments); var o = [null]; o.push.apply(o, e); var p = new (t.bind.apply(t, o))(); return r && _setPrototypeOf(p, r.prototype), p; }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
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
    var _init = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(from, to, moveLength, zone) {
      var _this$sprite$patrolSo;
      var _this$sprite$zone$wor, _this$sprite$zone$wor2;
      return _regenerator().w(function (_context) {
        while (1) switch (_context.n) {
          case 0:
            this.zone = zone;
            this.from = _construct(_vector.Vector, _toConsumableArray(from));
            this.to = _construct(_vector.Vector, _toConsumableArray(to));
            this.lastKey = new Date().getTime();
            this.completed = false;
            this.direction = 1;
            _context.n = 1;
            return this.zone.engine.resourceManager.audioLoader.loadFromZip(this.sprite.zip, (_this$sprite$patrolSo = this.sprite.patrolSound) !== null && _this$sprite$patrolSo !== void 0 ? _this$sprite$patrolSo : 'sewer-beat.mp3', true);
          case 1:
            this.audio = _context.v;
            _this$sprite$zone$wor = this.sprite.zone.world.pathFind(from, to);
            _this$sprite$zone$wor2 = _slicedToArray(_this$sprite$zone$wor, 2);
            this.hasMoves = _this$sprite$zone$wor2[0];
            this.moveList = _this$sprite$zone$wor2[1];
            if (!this.hasMoves) {
              this.completed = true; // no path - do not patrol
            }
            this.moveIndex = 1; // holds index position
            this.moveLength = moveLength; // length of time per move

            if (this.zone.audio) this.zone.audio.pauseAudio();
            if (this.audio) this.audio.playAudio();
          case 2:
            return _context.a(2);
        }
      }, _callee, this);
    }));
    function init(_x, _x2, _x3, _x4) {
      return _init.apply(this, arguments);
    }
    return init;
  }(),
  tick: function tick(time) {
    if (!this.loaded) return;
    this.checkInput(time);
    // load up moves - todo (improve this and make it less manual)
    var endTime = this.startTime + this.moveLength;
    if (time > endTime) {
      var move = this.moveList[this.moveIndex];
      if (this.moveList.length > 2) {
        // last position (for facing)
        var last = this.moveIndex == 0 ? this.moveList[this.moveIndex + 1] : this.moveIndex + 1 >= this.moveList.length ? this.moveList[this.moveList.length - 1] : this.moveList[this.moveIndex - 1];
        var facing = _enums.Direction.fromOffset([Math.round(move[0] - last[0]), Math.round(move[1] - last[1])]);
        // Check for zone change
        if (!this.sprite.zone.isInZone(move[0], move[1])) {
          var zone = this.sprite.zone.world.zoneContaining(move[0], move[1]);
          if (!zone || !zone.loaded || !zone.isWalkable(move[0], move[1], _enums.Direction.reverse(facing))) {
            this.currentAction = this.sprite.faceDir(facing);
          } else {
            this.currentAction = new _index.ActionLoader(this.sprite.engine, 'changezone', [this.sprite.zone.id, this.sprite.pos.toArray(), zone.id, move, this.moveLength], this.sprite);
          }
        } else {
          // Load Next move
          this.currentAction = new _index.ActionLoader(this.sprite.engine, 'move', [last, move, this.moveLength, this.zone], this.sprite);
        }
        if (this.sprite.facing !== facing) {
          this.currentAction = this.sprite.faceDir(facing);
          // return this.completed;
        }
        if (this.currentAction) {
          this.currentAction.facing = facing;
          this.sprite.addAction(Promise.resolve(this.currentAction)).then(function () {});
        }
      }
      // stop when done
      if (this.moveIndex + this.direction >= this.moveList.length) {
        this.direction *= -1;
        this.completed = true;
        if (this.zone.audio) this.zone.audio.playAudio();
        if (this.audio) this.audio.pauseAudio();
      }
      this.moveIndex += this.direction;
      this.startTime = time;
    }
    return this.completed; // loop
  },
  // Handle Keyboard
  checkInput: function checkInput(time) {
    if (time > this.lastKey + Math.max(this.moveLength, 200)) {
      switch (this.sprite.engine.keyboard.lastPressed('q')) {
        // quit on q key press
        case 'q':
          if (this.zone.audio) this.zone.audio.playAudio();
          if (this.audio) this.audio.pauseAudio();
          this.completed = true;
        // toggle
        default:
          this.lastKey = new Date().getTime();
          return null;
      }
    }
  }
};