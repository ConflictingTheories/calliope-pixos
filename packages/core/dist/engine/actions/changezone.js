"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _vector = require("@Engine/utils/math/vector.js");
var _enums = require("@Engine/utils/enums.js");
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
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
    var _init = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(fromZoneId, from, toZoneId, to, length) {
      var _this$sprite$zone,
        _this = this,
        _this$sprite3;
      var engine, spritesAtDest, _this$sprite$hotspotO, _this$sprite, _this$sprite$hotspotO2, _this$sprite2, fHx, fHy, _this$from$toArray, _this$from$toArray2, _this$from, _this$to$toArray, _this$to$toArray2, _this$to, _fHx, _fHy, tHx, tHy, _this$sprite4;
      return _regenerator().w(function (_context) {
        while (1) switch (_context.n) {
          case 0:
            // When changing zones we fade out of the current zone, load the new zone(s)
            // and then fade back in. This makes the transition smoother and hides
            // asset loading. The duration can be tweaked if needed.
            engine = (_this$sprite$zone = this.sprite.zone) === null || _this$sprite$zone === void 0 || (_this$sprite$zone = _this$sprite$zone.world) === null || _this$sprite$zone === void 0 ? void 0 : _this$sprite$zone.engine;
            if (!(engine !== null && engine !== void 0 && engine.renderManager)) {
              _context.n = 1;
              break;
            }
            // fade out
            console.log('fading out...');
            _context.n = 1;
            return engine.renderManager.startTransition({
              effect: 'cross',
              direction: 'out',
              duration: 500
            });
          case 1:
            _context.n = 2;
            return this.sprite.zone.world.loadZone(fromZoneId, false, false, null);
          case 2:
            this.fromZone = _context.v;
            _context.n = 3;
            return this.sprite.zone.world.loadZone(toZoneId, false, false, null);
          case 3:
            this.toZone = _context.v;
            this.from = _construct(_vector.Vector, _toConsumableArray(from));
            this.to = _construct(_vector.Vector, _toConsumableArray(to));
            this.facing = _enums.Direction.fromOffset([Math.round(to.x - from.x), Math.round(to.y - from.y)]);
            this.length = length;
            // Determine if the transition should preserve height (e.g., portals/doors)
            try {
              spritesAtDest = this.toZone ? this.toZone.spriteList.filter(function (s) {
                return s.pos.x === _this.to.x && s.pos.y === _this.to.y;
              }) : [];
              this.preserveHeight = spritesAtDest.some(function (s) {
                return s.preserveHeightOnWalk === true;
              });
              if (this.preserveHeight && this.from && (this.from.z === null || this.from.z === undefined)) {
                fHx = this.from.x + ((_this$sprite$hotspotO = (_this$sprite = this.sprite) === null || _this$sprite === void 0 || (_this$sprite = _this$sprite.hotspotOffset) === null || _this$sprite === void 0 ? void 0 : _this$sprite.x) !== null && _this$sprite$hotspotO !== void 0 ? _this$sprite$hotspotO : 0);
                fHy = this.from.y + ((_this$sprite$hotspotO2 = (_this$sprite2 = this.sprite) === null || _this$sprite2 === void 0 || (_this$sprite2 = _this$sprite2.hotspotOffset) === null || _this$sprite2 === void 0 ? void 0 : _this$sprite2.y) !== null && _this$sprite$hotspotO2 !== void 0 ? _this$sprite$hotspotO2 : 0);
                this.from.z = typeof this.fromZone.getHeight === 'function' ? this.fromZone.getHeight(fHx, fHy) : 0;
                this.preserveHeightSourceZ = this.from.z;
              }
            } catch (e) {
              // ignore and continue
            }
            if (this.preserveHeight && (_this$sprite3 = this.sprite) !== null && _this$sprite3 !== void 0 && (_this$sprite3 = _this$sprite3.zone) !== null && _this$sprite3 !== void 0 && (_this$sprite3 = _this$sprite3.engine) !== null && _this$sprite3 !== void 0 && _this$sprite3.debug) {
              console.log('[changezone.init] preserveHeight true for transition from', (_this$from$toArray = (_this$from$toArray2 = (_this$from = this.from).toArray) === null || _this$from$toArray2 === void 0 ? void 0 : _this$from$toArray2.call(_this$from)) !== null && _this$from$toArray !== void 0 ? _this$from$toArray : this.from, 'to', (_this$to$toArray = (_this$to$toArray2 = (_this$to = this.to).toArray) === null || _this$to$toArray2 === void 0 ? void 0 : _this$to$toArray2.call(_this$to)) !== null && _this$to$toArray !== void 0 ? _this$to$toArray : this.to);
            }
            // Compute the z height for from/to so we interpolate vertically across zones
            try {
              _fHx = this.from.x + (this.sprite ? this.sprite.hotspotOffset.x : 0);
              _fHy = this.from.y + (this.sprite ? this.sprite.hotspotOffset.y : 0);
              tHx = this.to.x + (this.sprite ? this.sprite.hotspotOffset.x : 0);
              tHy = this.to.y + (this.sprite ? this.sprite.hotspotOffset.y : 0);
              if (this.from && (this.from.z === null || this.from.z === undefined)) this.from.z = typeof this.fromZone.getHeight === 'function' ? this.fromZone.getHeight(_fHx, _fHy) : 0;
              if (this.to && (this.to.z === null || this.to.z === undefined)) this.to.z = typeof this.toZone.getHeight === 'function' ? this.toZone.getHeight(tHx, tHy) : 0;
            } catch (e) {
              if ((_this$sprite4 = this.sprite) !== null && _this$sprite4 !== void 0 && (_this$sprite4 = _this$sprite4.zone) !== null && _this$sprite4 !== void 0 && (_this$sprite4 = _this$sprite4.engine) !== null && _this$sprite4 !== void 0 && _this$sprite4.debug) console.warn('changezone.init failed to compute z for from/to', (e === null || e === void 0 ? void 0 : e.message) || e);
            }
            console.log({
              renderManager: engine === null || engine === void 0 ? void 0 : engine.renderManager,
              fromZoneId: fromZoneId,
              toZoneId: toZoneId,
              from: from,
              to: to,
              length: length
            });
            if (!(engine !== null && engine !== void 0 && engine.renderManager)) {
              _context.n = 4;
              break;
            }
            console.log('fading in...');
            // fade in once the new zones are ready
            _context.n = 4;
            return engine.renderManager.startTransition({
              effect: 'cross',
              direction: 'in',
              duration: 500
            });
          case 4:
            return _context.a(2);
        }
      }, _callee, this);
    }));
    function init(_x, _x2, _x3, _x4, _x5) {
      return _init.apply(this, arguments);
    }
    return init;
  }(),
  tick: function tick(time) {
    if (!this.toZone.loaded || !this.fromZone.loaded) return;
    // Set facing
    if (this.facing && this.facing != this.sprite.facing) {
      this.sprite.facing = this.facing;
      this.sprite.setFrame(0);
    }
    // Time Animation
    var endTime = this.startTime + this.length;
    var frac = (time - this.startTime) / this.length;
    if (time >= endTime) {
      (0, _vector.set)(this.to, this.sprite.pos);
      frac = 1;
    } else {
      // Lerp X and Y only, handle Z separately
      this.sprite.pos.x = this.from.x + frac * (this.to.x - this.from.x);
      this.sprite.pos.y = this.from.y + frac * (this.to.y - this.from.y);
      // Calculate height based on current zone and position
      var hx = this.sprite.pos.x + this.sprite.hotspotOffset.x;
      var hy = this.sprite.pos.y + this.sprite.hotspotOffset.y;
      var zLerp = typeof this.from.z === 'number' && typeof this.to.z === 'number' ? this.from.z + frac * (this.to.z - this.from.z) : null;
      if (!this.switchRenderZone && !this.fromZone.isInZone(hx, hy)) {
        this.switchRenderZone = true;
      }
      if (this.preserveHeight) {
        var _this$preserveHeightS, _this$sprite$zone$eng;
        this.sprite.pos.z = (_this$preserveHeightS = this.preserveHeightSourceZ) !== null && _this$preserveHeightS !== void 0 ? _this$preserveHeightS : this.sprite.pos.z;
        if ((_this$sprite$zone$eng = this.sprite.zone.engine) !== null && _this$sprite$zone$eng !== void 0 && _this$sprite$zone$eng.debug && !this.__preserveLog) {
          this.__preserveLog = true;
          console.log('[changezone.tick] preserveHeight applied for sprite', this.sprite.id, 'sourceZ=', this.preserveHeightSourceZ);
        }
      } else {
        var _this$sprite$zone$eng2;
        var zZone = (this.switchRenderZone ? this.toZone : this.fromZone).getHeight(hx, hy);
        if (zLerp !== null) {
          this.sprite.pos.z = zLerp;
        } else {
          this.sprite.pos.z = zZone;
        }
        if ((_this$sprite$zone$eng2 = this.sprite.zone.engine) !== null && _this$sprite$zone$eng2 !== void 0 && _this$sprite$zone$eng2.debug && this.__tickLogCount < 3) {
          if (!this.__tickLogCount) this.__tickLogCount = 0;
          this.__tickLogCount++;
          console.log('[changezone.tick] sprite', this.sprite.id, 'frac=', frac.toFixed(2), 'hx,hy=', hx.toFixed(2), hy.toFixed(2), 'zLerp=', zLerp === null || zLerp === void 0 ? void 0 : zLerp.toFixed(2), 'zZone=', zZone === null || zZone === void 0 ? void 0 : zZone.toFixed(2), 'pos.z=', this.sprite.pos.z.toFixed(2));
        }
      }
    }
    // New Frame
    var newFrame = Math.floor(frac * 4);
    if (newFrame != this.sprite.animFrame) this.sprite.setFrame(newFrame);
    // Move into the new zone
    if (!this.sprite.zone.isInZone(this.sprite.pos.x, this.sprite.pos.y)) {
      this.fromZone.removeSprite(this.sprite.id);
      // Defer until aftertick to stop the sprite being ticked twice
      this.sprite.zone.world.runAfterTick(function () {
        this.toZone.addSprite(this.sprite);
      }.bind(this));
    }
    return time >= endTime;
  }
};