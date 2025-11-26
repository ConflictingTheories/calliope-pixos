"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _construct(t, e, r) { if (_isNativeReflectConstruct()) return Reflect.construct.apply(null, arguments); var o = [null]; o.push.apply(o, e); var p = new (t.bind.apply(t, o))(); return r && _setPrototypeOf(p, r.prototype), p; }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
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
 * NetworkManager - Handles WebSocket connections for multiplayer functionality.
 * Manages client-server communication, zone joining, player synchronization, and action broadcasting.
 */
var NetworkManager = exports["default"] = /*#__PURE__*/function () {
  /**
   * Creates an instance of NetworkManager.
   * @param {import('../index.js').default} engine - The main game engine instance.
   */
  function NetworkManager(engine) {
    _classCallCheck(this, NetworkManager);
    /** @type {import('../index.js').default} */
    this.engine = engine;
    /** @type {WebSocket|null} */
    this.ws = null;
    /** @type {string|null} */
    this.clientId = null;
    /** @type {Map<string, object>} */
    this.players = new Map();
    /** @type {string} */
    this.authority = 'server'; // Default to server authority, can be overridden by manifest
    /** @type {string|null} */
    this.zoneId = null;
    this.setAuthorityFromManifest();
  }

  // Lazy import for action loader fallback
  return _createClass(NetworkManager, [{
    key: "connect",
    value: (
    /**
     * Establishes a WebSocket connection to the server.
     * @param {string} url - The WebSocket URL to connect to.
     * @returns {Promise<void>} A promise that resolves when the connection is established.
     */
    function () {
      var _connect = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(url) {
        var _this = this;
        return _regenerator().w(function (_context) {
          while (1) switch (_context.n) {
            case 0:
              if (this.ws) {
                this.disconnect();
              }
              this.ws = new WebSocket(url);
              return _context.a(2, new Promise(function (resolve, reject) {
                _this.ws.onopen = function () {
                  console.log('WebSocket connection established');
                  resolve();
                };
                _this.ws.onmessage = function (event) {
                  _this.handleMessage(event.data);
                };
                _this.ws.onclose = function () {
                  console.log('WebSocket connection closed');
                };
                _this.ws.onerror = function (error) {
                  console.error('WebSocket error:', error);
                  reject(error);
                };
              }));
          }
        }, _callee, this);
      }));
      function connect(_x) {
        return _connect.apply(this, arguments);
      }
      return connect;
    }()
    /**
     * Safely stringify an object for logging (avoids circular refs).
     * @param {any} obj
     */
    )
  }, {
    key: "safeStringify",
    value: function safeStringify(obj) {
      try {
        return JSON.stringify(obj);
      } catch (e) {
        try {
          // Fallback: show a minimal shallow representation
          var out = {};
          Object.keys(obj || {}).forEach(function (k) {
            var v = obj[k];
            if (v && _typeof(v) === 'object') out[k] = Array.isArray(v) ? "[Array(".concat(v.length, ")]") : "{".concat(v.constructor && v.constructor.name, "}");else out[k] = v;
          });
          return JSON.stringify(out);
        } catch (e2) {
          return String(obj);
        }
      }
    }

    /**
     * Disconnects the WebSocket connection.
     */
  }, {
    key: "disconnect",
    value: function disconnect() {
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }
    }

    /**
     * Sends a message to the server.
     * @param {string} type - The message type.
     * @param {object} payload - The message payload.
     */
  }, {
    key: "send",
    value: function send(type, payload) {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          type: type,
          payload: payload
        }));
      }
    }

    /**
     * Handles incoming messages from the server.
     * @param {string} message - The raw message string.
     */
  }, {
    key: "handleMessage",
    value: function handleMessage(message) {
      try {
        var data = JSON.parse(message);
        console.log('Received message from server:', data);
        switch (data.type) {
          case 'connected':
            this.clientId = data.clientId;
            this.engine.store.set("clientId", this.clientId);
            console.log("Connected to server with client ID: ".concat(this.clientId));
            break;
          case 'zone-loaded':
            this.handleZoneLoaded(data.payload);
            break;
          case 'zone-change':
            this.handleZoneChange(data.payload);
            break;
          case 'zone-joined':
            this.handleZoneJoined(data.payload);
            break;
          case 'player-joined':
            this.handlePlayerJoined(data.payload);
            break;
          case 'player-left':
            this.handlePlayerLeft(data.payload);
            break;
          case 'players-update':
            this.handlePlayersUpdate(data.payload);
            break;
          case 'zone-state':
            this.handleZoneState(data.payload);
            break;
          case 'avatar-update':
            this.handleAvatarUpdate(data.payload);
            break;
          case 'action':
            this.handleAction(data.payload);
            break;
          default:
            console.log("Unknown message type: ".concat(data.type));
        }
      } catch (error) {
        // Avoid serializing circular structures in the incoming message; log a safe preview instead.
        var preview = typeof message === 'string' ? message.length > 1000 ? message.slice(0, 1000) + '... (truncated)' : message : this.safeStringify(message);
        console.error('Failed to parse message from server. Parse error:', error);
        console.error('Raw message preview:', preview);
      }
    }

    /**
     * Loads a zone on the server.
     * @param {string} zoneId - The ID of the zone to load.
     * @param {object} zone - The zone object.
     */
  }, {
    key: "loadZone",
    value: function loadZone(zoneId, zone) {
      var zoneData = zone.getZoneData ? zone.getZoneData() : zone;
      // Try to remove circular references safely; fall back to a minimal payload if needed
      var cleanZoneData;
      try {
        cleanZoneData = JSON.parse(JSON.stringify(zoneData));
      } catch (e) {
        console.warn('Zone data contains circular refs, sending minimal zone info instead');
        cleanZoneData = {
          id: zoneId,
          name: zone && zone.name
        };
      }
      this.send('load-zone', {
        zoneId: zoneId,
        zone: cleanZoneData
      });
    }

    /**
     * Joins a zone.
     * @param {string} zoneId - The ID of the zone to join.
     */
  }, {
    key: "joinZone",
    value: function joinZone(zoneId) {
      this.zoneId = zoneId;
      var avatar = this.engine.spritz.world.getAvatar();
      var avatarData = avatar.getAvatarData();
      // Build a safe, plain avatar payload to avoid circular refs (DOM/React objects may be attached)
      var cleanAvatarData = {
        id: avatarData.id || avatar.objId || avatar.id || 'avatar',
        templateLoaded: !!avatarData.templateLoaded,
        animFrame: avatarData.animFrame || 0,
        facing: avatarData.facing || 0,
        fixed: !!avatarData.fixed,
        isSelected: !!avatarData.isSelected,
        // simple position
        x: avatar && avatar.pos ? avatar.pos.x : avatarData.pos && avatarData.pos.x || 0,
        y: avatar && avatar.pos ? avatar.pos.y : avatarData.pos && avatarData.pos.y || 0,
        z: avatar && avatar.pos ? avatar.pos.z : avatarData.pos && avatarData.pos.z || 0,
        // include small useful bits, but avoid large or circular objects
        drawOffset: avatarData.drawOffset ? {
          x: avatarData.drawOffset.x,
          y: avatarData.drawOffset.y
        } : undefined,
        hotspotOffset: avatarData.hotspotOffset ? {
          x: avatarData.hotspotOffset.x,
          y: avatarData.hotspotOffset.y
        } : undefined,
        scale: avatarData.scale ? {
          x: avatarData.scale.x,
          y: avatarData.scale.y
        } : undefined
      };
      this.send('join-zone', {
        zoneId: zoneId,
        avatar: cleanAvatarData
      });
    }

    /**
     * Sends an action to the server or handles locally based on authority.
     * @param {object} action - The action object.
     * @param {object} sprite - The sprite performing the action.
     */
  }, {
    key: "sendAction",
    value: function sendAction(action, sprite) {
      if (this.authority === 'server') {
        var data = {
          action: action.constructor.name.toLowerCase(),
          params: action.params,
          spriteId: sprite.id
        };
        this.send('action', data);
      } else {
        // Client authority: handle locally and broadcast
        this.handleAction({
          clientId: this.clientId,
          action: action.constructor.name.toLowerCase(),
          params: action.params,
          spriteId: sprite.id
        });
      }
    }

    /**
     * Updates the client's avatar position on the server.
     * @param {object} avatar - The avatar sprite.
     */
  }, {
    key: "updateAvatarPosition",
    value: function updateAvatarPosition(avatar) {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        var data = {
          avatar: {
            id: avatar.id,
            x: avatar.pos.x,
            y: avatar.pos.y,
            z: avatar.pos.z,
            facing: avatar.facing
          }
        };
        // Remove circular references
        var cleanData = JSON.parse(JSON.stringify(data));
        this.send('update-avatar', cleanData);
      }
    }

    /**
     * Handles zone loaded message.
     * @param {object} payload - The payload containing zoneId.
     */
  }, {
    key: "handleZoneLoaded",
    value: function handleZoneLoaded(payload) {
      console.log("Loaded zone ".concat(payload.zoneId));
      // Automatically join the zone after loading
      this.joinZone(payload.zoneId);
    }

    /**
     * Handles zone joined message.
     * @param {object} payload - The payload containing zoneId and players.
     */
  }, {
    key: "handleZoneJoined",
    value: function handleZoneJoined(payload) {
      var _this2 = this;
      console.log("Joined zone ".concat(payload.zoneId, " with players:"), payload.players);
      // Create avatars for existing players in the zone
      payload.players.forEach(function (playerData) {
        return _this2.handlePlayerJoined({
          client: playerData
        });
      });
      // Request zone state from server to sync all sprites
      this.send('zone-state-request', {
        zoneId: payload.zoneId
      });
    }
  }, {
    key: "getZoneSprites",
    value: function getZoneSprites(zoneId) {
      var world = this.engine.spritz.world;
      if (!world) return [];
      var zone = world.getZoneById(zoneId);
      if (!zone) return [];
      return zone.spriteList.map(function (sprite) {
        return {
          id: sprite.id,
          objId: sprite.objId,
          x: sprite.pos.x,
          y: sprite.pos.y,
          z: sprite.pos.z,
          avatar: sprite.getAvatarData ? sprite.getAvatarData() : sprite
        };
      });
    }

    /**
     * Handles zone change message.
     * @param {object} payload - The payload containing zoneId.
     */
  }, {
    key: "handleZoneChange",
    value: function handleZoneChange(payload) {
      console.log("Change zone ".concat(payload.zoneId));
      // Handle zone changes to state - this could be from triggers in other zones
    }

    /**
     * Handles player joined message.
     * @param {object} payload - The payload containing client info.
     */
  }, {
    key: "handlePlayerJoined",
    value: function handlePlayerJoined(payload) {
      if (payload.client.clientId === this.clientId) return;
      console.log("Player ".concat(payload.client.clientId, " joined the zone"));
      // HUD / quick notification if available
      try {
        if (this.engine && this.engine.hud && typeof this.engine.hud.scrollText === 'function') {
          this.engine.hud.scrollText("Player ".concat(payload.client.clientId, " joined"), true, {
            autoclose: true,
            duration: 3000
          });
        }
      } catch (e) {/* ignore HUD errors */}
      var world = this.engine.spritz.world;
      if (world) {
        // Use world.addRemoteAvatar to create a remote avatar representation
        world.addRemoteAvatar(payload.client.clientId, payload.client.avatar);
        // store a lightweight player entry keyed by clientId
        this.players.set(payload.client.clientId, Object.assign({}, payload.client.avatar, {
          clientId: payload.client.clientId
        }));
      }
    }

    /**
     * Handles player left message.
     * @param {object} payload - The payload containing clientId.
     */
  }, {
    key: "handlePlayerLeft",
    value: function handlePlayerLeft(payload) {
      console.log("Player ".concat(payload.clientId, " left the zone"));
      try {
        if (this.engine && this.engine.hud && typeof this.engine.hud.scrollText === 'function') {
          this.engine.hud.scrollText("Player ".concat(payload.clientId, " left"), true, {
            autoclose: true,
            duration: 3000
          });
        }
      } catch (e) {/* ignore HUD errors */}
      var player = this.players.get(payload.clientId);
      if (player) {
        var world = this.engine.spritz.world;
        if (world) world.removeAvatar(player);
        this.players["delete"](payload.clientId);
      }
    }

    /**
     * Handles players update message.
     * @param {object} payload - The payload containing updated players list.
     */
  }, {
    key: "handlePlayersUpdate",
    value: function handlePlayersUpdate(payload) {
      var _this3 = this;
      console.log('Players update:', payload.players);
      try {
        if (this.engine && this.engine.hud && typeof this.engine.hud.scrollText === 'function') {
          this.engine.hud.scrollText("Players in zone: ".concat(payload.players.map(function (p) {
            return p.clientId;
          }).join(', ')), true, {
            autoclose: true,
            duration: 3000
          });
        }
      } catch (e) {/* ignore HUD errors */}
      // Update local players map
      var existingPlayers = new Set(this.players.keys());
      var newPlayers = new Set(payload.players.map(function (p) {
        return p.clientId;
      }));

      // Remove players no longer in the zone
      var _iterator = _createForOfIteratorHelper(existingPlayers),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var clientId = _step.value;
          if (!newPlayers.has(clientId)) {
            // Remove remote avatar via world API
            var world = this.engine.spritz.world;
            if (world) world.removeRemoteAvatar(clientId);
            this.players["delete"](clientId);
          }
        }

        // Add or update players
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      payload.players.forEach(function (playerData) {
        if (playerData.clientId !== _this3.clientId) {
          var world = _this3.engine.spritz.world;
          if (world) {
            if (_this3.players.has(playerData.clientId)) {
              // Update remote avatar data
              world.updateRemoteAvatar(playerData.clientId, playerData.avatar);
              _this3.players.set(playerData.clientId, playerData.avatar);
            } else {
              world.addRemoteAvatar(playerData.clientId, playerData.avatar);
              _this3.players.set(playerData.clientId, playerData.avatar);
            }
          }
        }
      });
    }

    /**
     * Handles action message.
     * @param {object} payload - The payload containing action details.
     */
  }, {
    key: "handleAction",
    value: function handleAction(payload) {
      if (payload.clientId === this.clientId) return; // Skip own actions to prevent double application
      console.log("Received action from ".concat(payload.clientId, ":"), payload);
      var player = this.engine.spritz.world.remoteAvatars.get(payload.clientId); // Only handle remote avatars
      if (!player) return;
      try {
        var Action = null;
        var world = this.engine.spritz && this.engine.spritz.world;
        if (world && typeof world.actionFactory === 'function') {
          Action = world.actionFactory(payload.action);
        }
        // Fallback: use ActionLoader to construct action if factory missing
        if (!Action) {
          if (!NetworkManager._ActionLoader) NetworkManager._ActionLoader = require('@Engine/utils/loaders/ActionLoader.js').ActionLoader;
          var loader = new NetworkManager._ActionLoader(this.engine, payload.action, payload.params || {}, player, function () {});
          // loader.load returns an instance of Action (synchronously in our loader implementation)
          var instance = loader;
          // Some path: ActionLoader returns an Action instance via its load helper
          if (instance && instance.instances == null) {
            // unlikely shape; log and skip
            console.warn('ActionLoader returned unexpected instance for action', payload.action, instance);
          }
          // ActionLoader already enqueued the action on the sprite via its callbacks;
        } else {
          var action = _construct(Action, [player].concat(_toConsumableArray(Object.values(payload.params || {}))));
          player.addAction(action);
        }
      } catch (e) {
        console.warn('Failed to handle action payload', payload, e);
      }
    }

    /**
     * Handles zone state message to synchronize all sprites in the zone.
     * @param {object} payload - The payload containing zoneId and sprites.
     */
  }, {
    key: "handleZoneState",
    value: function handleZoneState(payload) {
      var _this4 = this;
      console.log("Received zone state for ".concat(payload.zoneId, ":"), payload.sprites);
      var world = this.engine.spritz.world;
      if (!world) return;
      var zone = world.getZoneById(payload.zoneId);
      if (!zone) return;

      // Update or create sprites based on zone state
      payload.sprites.forEach(function (spriteData) {
        // Skip own avatar (identified by clientId)
        if (spriteData.clientId === _this4.clientId) return;
        try {
          // Prefer updating remote avatars by clientId to avoid id mismatch between clients and server
          if (spriteData.clientId && world.remoteAvatars && world.remoteAvatars.has(spriteData.clientId)) {
            // Use existing remote avatar mapping
            world.updateRemoteAvatar(spriteData.clientId, _objectSpread({
              x: spriteData.x,
              y: spriteData.y,
              z: spriteData.z || 0,
              facing: spriteData.avatar && spriteData.avatar.facing || spriteData.facing,
              animFrame: spriteData.avatar && spriteData.avatar.animFrame || spriteData.animFrame
            }, spriteData.avatar || {}));
          } else {
            // Fallback: try to match by sprite id in zone spriteDict
            var existingSprite = zone.spriteDict[spriteData.id];
            if (existingSprite) {
              existingSprite.pos.x = spriteData.x;
              existingSprite.pos.y = spriteData.y;
              existingSprite.pos.z = spriteData.z || 0;
              if (spriteData.avatar) {
                if (spriteData.avatar.facing != null) existingSprite.facing = spriteData.avatar.facing;
                if (spriteData.avatar.animFrame != null) existingSprite.animFrame = spriteData.avatar.animFrame;
              }
            } else {
              // Create remote avatar using world.addRemoteAvatar if possible, providing clientId-aware data
              var avatarPayload = _objectSpread({
                id: spriteData.id || "player-".concat(spriteData.clientId),
                x: spriteData.x,
                y: spriteData.y,
                z: spriteData.z || 0,
                facing: spriteData.avatar && spriteData.avatar.facing || spriteData.facing,
                animFrame: spriteData.avatar && spriteData.avatar.animFrame || spriteData.animFrame
              }, spriteData.avatar || {});
              if (spriteData.clientId && typeof world.addRemoteAvatar === 'function') {
                world.addRemoteAvatar(spriteData.clientId, avatarPayload);
              } else if (typeof world.createAvatar === 'function') {
                world.createAvatar(avatarPayload);
              }
            }
          }
        } catch (e) {
          console.warn('Error handling zone state sprite update:', e);
        }
      });
    }

    /**
     * Sets the network authority from the manifest.
     */
  }, {
    key: "setAuthorityFromManifest",
    value: function setAuthorityFromManifest() {
      if (this.engine && this.engine.spritz && this.engine.spritz.manifest && this.engine.spritz.manifest.network) {
        this.authority = this.engine.spritz.manifest.network.authority || 'server';
      }
    }

    /**
     * Handles avatar update message to synchronize avatar positions.
     * @param {object} payload - The payload containing clientId and avatar data.
     */
  }, {
    key: "handleAvatarUpdate",
    value: function handleAvatarUpdate(payload) {
      console.log("Received avatar update for ".concat(payload.clientId, ":"), payload.avatar);
      // Update remote avatar via world helper
      var world = this.engine.spritz.world;
      if (world) {
        var updated = world.updateRemoteAvatar(payload.clientId, payload.avatar);
        if (!updated) {
          // If avatar didn't exist, create it
          world.addRemoteAvatar(payload.clientId, _objectSpread({
            id: payload.avatar.id || "player-".concat(payload.clientId)
          }, payload.avatar));
          this.players.set(payload.clientId, payload.avatar);
        } else {
          this.players.set(payload.clientId, payload.avatar);
        }
      }
    }

    /**
     * Sets the network authority.
     * @param {string} authority - 'server' or 'client'.
     */
  }, {
    key: "setAuthority",
    value: function setAuthority(authority) {
      this.authority = authority;
    }
  }]);
}();
_defineProperty(NetworkManager, "_ActionLoader", null);