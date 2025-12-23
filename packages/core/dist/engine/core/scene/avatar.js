"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _vector = require("@Engine/utils/math/vector.js");
var _enums = require("@Engine/utils/enums.js");
var _index = require("@Engine/utils/loaders/index.js");
var _sprite = _interopRequireDefault(require("@Engine/core/scene/sprite.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _construct(t, e, r) { if (_isNativeReflectConstruct()) return Reflect.construct.apply(null, arguments); var o = [null]; o.push.apply(o, e); var p = new (t.bind.apply(t, o))(); return r && _setPrototypeOf(p, r.prototype), p; }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == _typeof(e) || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
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
\*                                                 */ /**
 * @fileoverview Avatar class for Pixos game engine.
 * Represents the player-controlled character.
 */
/**
 * @typedef {object} AvatarData
 * @property {number} id - The avatar's object ID.
 * @property {boolean} templateLoaded - Whether the template is loaded.
 * @property {Vector} drawOffset - The draw offset.
 * @property {Vector} hotspotOffset - The hotspot offset.
 * @property {number} animFrame - The animation frame.
 * @property {boolean} fixed - Whether the avatar is fixed.
 * @property {Vector} pos - The position.
 * @property {Vector} scale - The scale.
 * @property {string} facing - The facing direction.
 * @property {object} actionDict - The action dictionary.
 * @property {Array} actionList - The action list.
 * @property {string} gender - The gender.
 * @property {object} speech - The speech object.
 * @property {string} portrait - The portrait.
 * @property {Array} inventory - The inventory.
 * @property {boolean} blocking - Whether blocking.
 * @property {boolean} override - Whether overriding.
 * @property {boolean} isLit - Whether lit.
 * @property {number} lightIndex - The light index.
 * @property {Array<number>} lightColor - The light color.
 * @property {number} density - The density.
 * @property {boolean} isSelected - Whether selected.
 */
/**
 * Avatar - Represents the player-controlled character in the game.
 */
var Avatar = exports["default"] = /*#__PURE__*/function (_Sprite) {
  /**
   * Creates an instance of Avatar.
   * @param {import('../index.js').default} engine - The game engine instance.
   */
  function Avatar(engine) {
    var _this;
    _classCallCheck(this, Avatar);
    _this = _callSuper(this, Avatar, [engine]);
    /** @type {boolean} */
    /**
     * Gets the avatar data for serialization or debugging.
     * @returns {AvatarData} The avatar data object.
     */
    _defineProperty(_this, "getAvatarData", function () {
      return {
        id: _this.objId,
        templateLoaded: _this.templateLoaded,
        drawOffset: _this.drawOffset,
        hotspotOffset: _this.hotspotOffset,
        animFrame: _this.animFrame,
        fixed: _this.fixed,
        pos: _this.pos,
        scale: _this.scale,
        facing: _this.facing,
        actionDict: _this.actionDict,
        actionList: _this.actionList,
        gender: _this.gender,
        speech: _this.speech,
        portrait: _this.portrait,
        inventory: _this.inventory,
        blocking: _this.blocking,
        override: _this.override,
        isLit: _this.isLit,
        lightIndex: _this.lightIndex,
        lightColor: _this.lightColor,
        density: _this.density,
        isSelected: _this.isSelected
      };
    });
    /**
     * Initialization hook for the avatar.
     */
    _defineProperty(_this, "init", function () {
      console.log({
        msg: '- avatar hook',
        id: _this.id,
        pos: _this.pos,
        avatar: _this
      });
    });
    /**
     * Updates the avatar each frame.
     * @param {number} time - The current time.
     */
    _defineProperty(_this, "tick", function (time) {
      if (!_this.actionList.length) {
        var ret = _this.checkInput();
        if (ret) {
          _this.addAction(ret).then(function () {
            if (_this.engine.networkManager && _this.engine.networkManager.ws && _this.engine.networkManager.ws.readyState === WebSocket.OPEN) {
              _this.engine.networkManager.sendAction(ret, _this);
            }
          });
        }
      }
      if (_this.engine.networkManager && _this.engine.networkManager.ws && _this.engine.networkManager.ws.readyState === WebSocket.OPEN) {
        _this.engine.networkManager.updateAvatarPosition(_this);
      }
      if (_this.bindCamera) (0, _vector.set)(_this.pos, _this.engine.renderManager.camera.cameraPosition);
    });
    /**
     * Checks input from the Input Manager.
     * @returns {ActionLoader|null} Action to perform or null.
     */
    _defineProperty(_this, "checkInput", function () {
      return _this.engine.inputManager.getAvatarAction(_this);
    });
    /**
     * Opens a menu for the avatar.
     * @param {object} menuConfig - The menu configuration.
     * @param {Array} defaultMenus - The default menus.
     * @returns {ActionLoader} The action loader for the menu.
     */
    _defineProperty(_this, "openMenu", function () {
      var menuConfig = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var defaultMenus = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      return new _index.ActionLoader(_this.engine, 'prompt', [menuConfig, defaultMenus, false, {
        autoclose: false
      }], _this);
    });
    /**
     * Handles walking input.
     * @param {string} key - The key pressed.
     * @param {object} touchmap - The touch map for mobile input.
     * @param {number} [forceFacing=null] - Optional forced facing direction (overrides key-based direction).
     * @returns {ActionLoader|null} The action loader or null.
     */
    _defineProperty(_this, "handleWalk", function (key, touchmap) {
      var forceFacing = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var moveTime = 600;
      var facing = forceFacing !== null ? forceFacing : _enums.Direction.None;

      // Only use key-based direction if no forced facing is provided
      if (forceFacing === null) {
        switch (key) {
          case 'w':
            facing = _enums.Direction.Up;
            break;
          case 's':
            facing = _enums.Direction.Down;
            break;
          case 'a':
            facing = _enums.Direction.Left;
            break;
          case 'd':
            facing = _enums.Direction.Right;
            break;
          case 'p':
            return new _index.ActionLoader(_this.engine, 'patrol', [_this.pos.toArray(), new _vector.Vector(8, 13, _this.pos.z).toArray(), 600, _this.zone], _this);
          case 'r':
            return new _index.ActionLoader(_this.engine, 'patrol', [_this.pos.toArray(), new _vector.Vector(8, 13, _this.pos.z).toArray(), 200, _this.zone], _this);
        }
      }
      if (touchmap['x-dir'] === 1) {
        facing = _enums.Direction.Right;
      }
      if (touchmap['x-dir'] === -1) {
        facing = _enums.Direction.Left;
      }
      if (touchmap['y-dir'] === 1) {
        facing = _enums.Direction.Down;
      }
      if (touchmap['y-dir'] === -1) {
        facing = _enums.Direction.Up;
      }
      if (_this.engine.keyboard.shift || _this.engine.gamepad.keyPressed('y')) {
        moveTime = 200;
      } else {
        moveTime = 600;
      }
      if (_this.facing !== facing) {
        return _this.faceDir(facing);
      }
      var from = _this.pos;
      var dp = _enums.Direction.toOffset(facing);
      var to = _construct(_vector.Vector, [Math.round(from.x + dp[0]), Math.round(from.y + dp[1]), 0]);
      if (!_this.zone.isInZone(to.x, to.y)) {
        var z = _this.zone.world.zoneContaining(to.x, to.y);
        if (!z || !z.loaded || !z.isWalkable(to.x, to.y, _enums.Direction.reverse(facing))) {
          return _this.faceDir(facing);
        }
        return new _index.ActionLoader(_this.engine, 'changezone', [_this.zone.id, _this.pos.toArray(), z.id, to.toArray(), moveTime], _this);
      }
      if (!_this.zone.isWalkable(to.x, to.y, _enums.Direction.reverse(facing))) {
        return _this.faceDir(facing);
      }
      return new _index.ActionLoader(_this.engine, 'move', [_this.pos.toArray(), to.toArray(), moveTime, _this.zone], _this);
    });
    _this.isLit = true;
    /** @type {boolean} */
    _this.isSelected = true;
    return _this;
  }
  _inherits(Avatar, _Sprite);
  return _createClass(Avatar);
}(_sprite["default"]);