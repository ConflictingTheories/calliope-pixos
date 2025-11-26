"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/*                                                 *\
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
/**
 * Store - A singleton key-value store for game state and session data.
 */
var Store = exports["default"] = /*#__PURE__*/_createClass(
/**
 * Creates an instance of Store.
 * @returns {Store} The singleton instance.
 */
function Store() {
  var _this = this;
  _classCallCheck(this, Store);
  /**
   * Returns a copy of the key-values in the store (note - only a copy is provided).
   * @returns {Object.<string, any>} A copy of the store object.
   */
  _defineProperty(this, "all", function () {
    return Object.assign({}, _this.store);
  });
  /**
   * Gets list of keys (no values).
   * @returns {string[]} Array of keys.
   */
  _defineProperty(this, "keys", function () {
    return Object.keys(_this.store);
  });
  /**
   * Gets list of values from store (no keys).
   * @returns {any[]} Array of values.
   */
  _defineProperty(this, "values", function () {
    return Object.keys(_this.store).map(function (key) {
      return _this.store[key];
    });
  });
  /**
   * Returns size of keystore.
   * @returns {number} The number of keys in the store.
   */
  _defineProperty(this, "size", function () {
    return Object.keys(_this.store).length;
  });
  /**
   * Fetches value from store.
   * @param {string} key - The key to retrieve.
   * @returns {any} The value associated with the key.
   * @throws {string} If the key does not exist.
   */
  _defineProperty(this, "get", function (key) {
    if (!_this.store[key]) {
      throw 'no key set';
    }
    return _this.store[key];
  });
  /**
   * Adds key to store but only if not existing.
   * @param {string} key - The key to add.
   * @param {any} value - The value to store.
   * @returns {any} The stored value.
   * @throws {string} If the key already exists.
   */
  _defineProperty(this, "add", function (key, value) {
    if (!!_this.store[key]) {
      throw 'key already exists';
    }
    return _this.store[key] = _objectSpread({}, value);
  });
  /**
   * Sets key in store (no checks for existing - just overwrites).
   * @param {string} key - The key to set.
   * @param {any} changes - The value to store.
   * @returns {any} The stored value.
   */
  _defineProperty(this, "set", function (key, changes) {
    return _this.store[key] = _objectSpread({}, changes);
  });
  /**
   * Deletes key from store.
   * @param {string} key - The key to delete.
   * @returns {null} Null.
   */
  _defineProperty(this, "delete", function (key) {
    return _this.store[key] = null;
  });
  if (!Store._instance) {
    /** @type {Object.<string, any>} */
    this.store = {};
    Store._instance = this;
  }
  return Store._instance;
  // Store setup - session based
});