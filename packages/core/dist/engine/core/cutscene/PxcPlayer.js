"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toArray(r) { return _arrayWithHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
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
 * PxcPlayer - .pxc Cutscene Player
 * Plays SpritzCut DSL format cutscenes with audio, backdrops, and dialogue
 * 
 * This is the enhanced engine version that renders directly to the HUD canvas
 * and integrates with the engine's resource loading system.
 */
var PxcPlayer = exports["default"] = /*#__PURE__*/function () {
  function PxcPlayer(engine) {
    var callbacks = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    _classCallCheck(this, PxcPlayer);
    this.engine = engine;
    this.callbacks = {
      onDialogueShow: callbacks.onDialogueShow || null,
      onDialogueHide: callbacks.onDialogueHide || null,
      onBackdropChange: callbacks.onBackdropChange || null,
      onCutsceneStart: callbacks.onStart || callbacks.onCutsceneStart || null,
      onCutsceneEnd: callbacks.onEnd || callbacks.onCutsceneEnd || null
    };

    // Character definitions from @char commands
    this.characters = {};

    // Visual state
    this.currentBackdrop = null;
    this.backdropImage = null;
    this.portraitImage = null;
    this.cutinImage = null;
    this.currentSpeaker = '';
    this.currentText = '';
    this.displayedText = '';
    this.isTyping = false;

    // Playback state
    this.isPlaying = false;
    this.isPaused = false;
    this.skipRequested = false;

    // Configuration
    this.typewriterSpeed = 40; // ms per character
    this.autoAdvance = false;
    this.autoAdvanceDelay = 1500; // ms to wait after text completes

    // Audio refs
    this.bgmAudio = null;
    this.sfxAudio = null;
    this.voiceAudio = null;

    // Resource cache
    this.resourceCache = {};

    // Dialogue box styling
    this.dialogueStyle = {
      boxColor: 'rgba(20, 30, 50, 0.9)',
      borderColor: '#4a9eff',
      textColor: '#ffffff',
      speakerColor: '#4af0ff',
      font: '20px minecraftia',
      speakerFont: '16px minecraftia',
      padding: 20,
      portraitSize: 100
    };
  }

  /**
   * Parse .pxc script into events
   */
  return _createClass(PxcPlayer, [{
    key: "parseScript",
    value: function parseScript(scriptText) {
      var lines = scriptText.split('\n');
      var events = [];
      var currentDialogue = null;
      var multilineMode = false;
      var multilineText = [];
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();

        // Skip empty lines and comments
        if (!line || line.startsWith('#')) continue;

        // Multi-line dialogue end
        if (multilineMode && line.includes('"""')) {
          line = line.replace('"""', '').trim();
          if (line) multilineText.push(line);
          currentDialogue.text = multilineText.join('\n');
          events.push(currentDialogue);
          currentDialogue = null;
          multilineMode = false;
          multilineText = [];
          continue;
        }

        // Multi-line dialogue content
        if (multilineMode) {
          multilineText.push(line);
          continue;
        }

        // Commands
        if (line.startsWith('@')) {
          var event = this.parseCommand(line);
          if (event) events.push(event);
          continue;
        }

        // Special commands without @
        if (line.startsWith('wait ')) {
          events.push({
            type: 'wait',
            duration: parseInt(line.replace('wait', '').trim())
          });
          continue;
        }
        if (line === 'waitInput' || line === 'wait_input') {
          events.push({
            type: 'waitInput'
          });
          continue;
        }

        // Dialogue lines
        if (line.includes(':')) {
          var isCutin = line.startsWith('*');
          if (isCutin) line = line.substring(1).trim();
          var _line$split = line.split(':'),
            _line$split2 = _toArray(_line$split),
            speaker = _line$split2[0],
            rest = _arrayLikeToArray(_line$split2).slice(1);
          var remaining = rest.join(':').trim();

          // Parse bracket metadata
          var bracketMatch = remaining.match(/^\[([^\]]+)\]/);
          var meta = bracketMatch ? this.parseBracket(bracketMatch[1]) : {};
          var text = bracketMatch ? remaining.substring(bracketMatch[0].length).trim() : remaining;

          // Check for multi-line start
          if (text.startsWith('"""')) {
            text = text.replace('"""', '').trim();
            multilineMode = true;
            multilineText = text ? [text] : [];
            currentDialogue = {
              type: 'dialogue',
              actor: speaker.trim(),
              text: '',
              // Will be filled when multiline ends
              isCutin: isCutin,
              meta: meta
            };
            continue;
          }

          // Single line dialogue
          events.push({
            type: 'dialogue',
            actor: speaker.trim(),
            text: text.replace(/^["']|["']$/g, ''),
            isCutin: isCutin,
            meta: meta
          });
        }
      }
      return events;
    }

    /**
     * Parse command line
     */
  }, {
    key: "parseCommand",
    value: function parseCommand(line) {
      var parts = line.substring(1).trim().split(/\s+/);
      var cmd = parts[0];
      var rest = parts.slice(1).join(' ');

      // Parse bracket args
      var bracketMatch = rest.match(/\[([^\]]+)\]/);
      var args = bracketMatch ? this.parseBracket(bracketMatch[1]) : {};
      var remaining = bracketMatch ? rest.replace(bracketMatch[0], '').trim() : rest;
      switch (cmd) {
        case 'backdrop':
          return {
            type: 'backdrop',
            url: remaining || args.url || args.file,
            options: args
          };
        case 'char':
          var charParts = remaining.split(/\s+/);
          var charName = charParts[0];
          // Parse inline attributes like sprite=path
          var charArgs = _objectSpread({}, args);
          charParts.slice(1).forEach(function (p) {
            if (p.includes('=')) {
              var _p$split = p.split(/=(.+)/),
                _p$split2 = _slicedToArray(_p$split, 2),
                k = _p$split2[0],
                v = _p$split2[1];
              charArgs[k] = v.replace(/^"|"$/g, '');
            }
          });
          return {
            type: 'char',
            name: charName,
            sprite: charArgs.sprite,
            portrait: charArgs.portrait,
            options: charArgs
          };
        case 'action':
          // @action CharName verb [args]
          var actionParts = remaining.match(/(?:[^\s\[]+|\[[^\]]*\])/g) || [];
          var actorName = actionParts[0];
          var verb = actionParts[1];
          return {
            type: 'action',
            actor: actorName,
            verb: verb,
            args: args
          };
        case 'do':
          var hookAction = remaining.split(/\s+/)[0];
          return {
            type: 'hook',
            action: hookAction,
            args: args
          };
        case 'transition':
          return {
            type: 'transition',
            effect: remaining || args.effect || 'fade',
            direction: args.direction || 'out',
            options: args
          };
        case 'end':
          return {
            type: 'end'
          };
        default:
          console.warn('[PxcPlayer] Unknown command:', cmd);
          return null;
      }
    }

    /**
     * Parse bracket metadata [key=value,key2=value2,flag]
     */
  }, {
    key: "parseBracket",
    value: function parseBracket(bracketContent) {
      var result = {};
      var pairs = bracketContent.split(',');
      var _iterator = _createForOfIteratorHelper(pairs),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var pair = _step.value;
          var trimmed = pair.trim();
          if (trimmed.includes('=')) {
            var _trimmed$split = trimmed.split('='),
              _trimmed$split2 = _toArray(_trimmed$split),
              key = _trimmed$split2[0],
              valueParts = _arrayLikeToArray(_trimmed$split2).slice(1);
            var value = valueParts.join('=').trim().replace(/^"|"$/g, '');
            // Type coercion
            if (/^\d+$/.test(value)) value = parseInt(value, 10);else if (/^\d+\.\d+$/.test(value)) value = parseFloat(value);else if (value === 'true') value = true;else if (value === 'false') value = false;
            result[key.trim()] = value;
          } else {
            result[trimmed] = true;
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return result;
    }

    /**
     * Load an asset (image, audio) via engine resource system
     */
  }, {
    key: "loadAsset",
    value: (function () {
      var _loadAsset = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(path) {
        var _this$engine;
        var isBackdrop,
          _name,
          _placeholder,
          url,
          zipEntry,
          blob,
          _url,
          name,
          placeholder,
          _args = arguments,
          _t,
          _t2;
        return _regenerator().w(function (_context) {
          while (1) switch (_context.p = _context.n) {
            case 0:
              isBackdrop = _args.length > 1 && _args[1] !== undefined ? _args[1] : false;
              if (path) {
                _context.n = 1;
                break;
              }
              return _context.a(2, null);
            case 1:
              if (!this.resourceCache[path]) {
                _context.n = 2;
                break;
              }
              return _context.a(2, this.resourceCache[path]);
            case 2:
              if (!path.startsWith('data:')) {
                _context.n = 3;
                break;
              }
              _name = path.replace('data:', '');
              _placeholder = this.generatePlaceholder(_name, isBackdrop);
              this.resourceCache[path] = _placeholder;
              return _context.a(2, _placeholder);
            case 3:
              if (!(this.engine && this.engine.resourceManager)) {
                _context.n = 8;
                break;
              }
              _context.p = 4;
              _context.n = 5;
              return this.engine.resourceManager.loadResource(path);
            case 5:
              url = _context.v;
              if (!url) {
                _context.n = 6;
                break;
              }
              this.resourceCache[path] = url;
              return _context.a(2, url);
            case 6:
              _context.n = 8;
              break;
            case 7:
              _context.p = 7;
              _t = _context.v;
              console.warn("[PxcPlayer] Failed to load asset: ".concat(path), _t);
            case 8:
              if (!((_this$engine = this.engine) !== null && _this$engine !== void 0 && (_this$engine = _this$engine.spritz) !== null && _this$engine !== void 0 && (_this$engine = _this$engine.world) !== null && _this$engine !== void 0 && _this$engine.zip)) {
                _context.n = 13;
                break;
              }
              _context.p = 9;
              zipEntry = this.engine.spritz.world.zip.getEntry(path);
              if (!zipEntry) {
                _context.n = 11;
                break;
              }
              _context.n = 10;
              return zipEntry.async('blob');
            case 10:
              blob = _context.v;
              _url = URL.createObjectURL(blob);
              this.resourceCache[path] = _url;
              return _context.a(2, _url);
            case 11:
              _context.n = 13;
              break;
            case 12:
              _context.p = 12;
              _t2 = _context.v;
              console.warn("[PxcPlayer] Failed to load from zip: ".concat(path), _t2);
            case 13:
              // Fallback to placeholder
              name = path.split('/').pop() || (isBackdrop ? 'BACKDROP' : 'SPRITE');
              placeholder = this.generatePlaceholder(name, isBackdrop);
              this.resourceCache[path] = placeholder;
              return _context.a(2, placeholder);
          }
        }, _callee, this, [[9, 12], [4, 7]]);
      }));
      function loadAsset(_x) {
        return _loadAsset.apply(this, arguments);
      }
      return loadAsset;
    }()
    /**
     * Generate a placeholder image as data URL
     */
    )
  }, {
    key: "generatePlaceholder",
    value: function generatePlaceholder(name) {
      var isBackdrop = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var displayName = (name || 'UNKNOWN').toUpperCase();
      if (isBackdrop) {
        var svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1600\" height=\"900\"><rect width=\"100%\" height=\"100%\" fill=\"#08202a\"/><text x=\"50%\" y=\"80%\" font-size=\"64\" fill=\"#aee6ff\" text-anchor=\"middle\" font-family=\"system-ui, sans-serif\" font-weight=\"bold\">".concat(displayName, "</text></svg>");
        return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
      } else {
        var _svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"512\" height=\"512\"><rect width=\"100%\" height=\"100%\" fill=\"#112430\"/><text x=\"50%\" y=\"50%\" font-size=\"72\" fill=\"#7dd3fc\" text-anchor=\"middle\" dominant-baseline=\"middle\" font-family=\"system-ui, sans-serif\" font-weight=\"bold\">".concat(displayName, "</text></svg>");
        return 'data:image/svg+xml;utf8,' + encodeURIComponent(_svg);
      }
    }

    /**
     * Load an image from URL and return Image object
     */
  }, {
    key: "loadImage",
    value: (function () {
      var _loadImage = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(url) {
        return _regenerator().w(function (_context2) {
          while (1) switch (_context2.n) {
            case 0:
              return _context2.a(2, new Promise(function (resolve, reject) {
                var img = new Image();
                img.onload = function () {
                  return resolve(img);
                };
                img.onerror = function (err) {
                  return reject(err);
                };
                img.src = url;
              }));
          }
        }, _callee2);
      }));
      function loadImage(_x2) {
        return _loadImage.apply(this, arguments);
      }
      return loadImage;
    }()
    /**
     * Play cutscene from script text
     */
    )
  }, {
    key: "playCutscene",
    value: (function () {
      var _playCutscene = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(scriptText) {
        var events, _iterator2, _step2, event, _t3;
        return _regenerator().w(function (_context3) {
          while (1) switch (_context3.p = _context3.n) {
            case 0:
              if (!this.isPlaying) {
                _context3.n = 1;
                break;
              }
              console.warn('[PxcPlayer] Cutscene already playing');
              return _context3.a(2);
            case 1:
              this.isPlaying = true;
              this.skipRequested = false;
              events = this.parseScript(scriptText);
              console.log('[PxcPlayer] Playing cutscene with', events.length, 'events');

              // Notify start callback
              if (this.callbacks.onCutsceneStart) {
                this.callbacks.onCutsceneStart();
              }
              _iterator2 = _createForOfIteratorHelper(events);
              _context3.p = 2;
              _iterator2.s();
            case 3:
              if ((_step2 = _iterator2.n()).done) {
                _context3.n = 7;
                break;
              }
              event = _step2.value;
              if (this.isPlaying) {
                _context3.n = 4;
                break;
              }
              return _context3.a(3, 7);
            case 4:
              if (!this.skipRequested) {
                _context3.n = 5;
                break;
              }
              return _context3.a(3, 7);
            case 5:
              _context3.n = 6;
              return this.handleEvent(event);
            case 6:
              _context3.n = 3;
              break;
            case 7:
              _context3.n = 9;
              break;
            case 8:
              _context3.p = 8;
              _t3 = _context3.v;
              _iterator2.e(_t3);
            case 9:
              _context3.p = 9;
              _iterator2.f();
              return _context3.f(9);
            case 10:
              this.isPlaying = false;
              this.cleanup();
              if (this.callbacks.onCutsceneEnd) {
                this.callbacks.onCutsceneEnd();
              }
            case 11:
              return _context3.a(2);
          }
        }, _callee3, this, [[2, 8, 9, 10]]);
      }));
      function playCutscene(_x3) {
        return _playCutscene.apply(this, arguments);
      }
      return playCutscene;
    }()
    /**
     * Play cutscene from file path (loads from zip/resources)
     */
    )
  }, {
    key: "playCutsceneFile",
    value: (function () {
      var _playCutsceneFile = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(filePath) {
        var _this$engine2, scriptText, zipEntry, response, _t4;
        return _regenerator().w(function (_context4) {
          while (1) switch (_context4.p = _context4.n) {
            case 0:
              _context4.p = 0;
              scriptText = null; // Try loading from zip
              if (!((_this$engine2 = this.engine) !== null && _this$engine2 !== void 0 && (_this$engine2 = _this$engine2.spritz) !== null && _this$engine2 !== void 0 && (_this$engine2 = _this$engine2.world) !== null && _this$engine2 !== void 0 && _this$engine2.zip)) {
                _context4.n = 2;
                break;
              }
              zipEntry = this.engine.spritz.world.zip.getEntry(filePath);
              if (!zipEntry) {
                _context4.n = 2;
                break;
              }
              _context4.n = 1;
              return zipEntry.async('string');
            case 1:
              scriptText = _context4.v;
            case 2:
              if (scriptText) {
                _context4.n = 5;
                break;
              }
              _context4.n = 3;
              return fetch(filePath);
            case 3:
              response = _context4.v;
              _context4.n = 4;
              return response.text();
            case 4:
              scriptText = _context4.v;
            case 5:
              if (!scriptText) {
                _context4.n = 7;
                break;
              }
              _context4.n = 6;
              return this.playCutscene(scriptText);
            case 6:
              _context4.n = 8;
              break;
            case 7:
              console.error('[PxcPlayer] Could not load cutscene file:', filePath);
            case 8:
              _context4.n = 10;
              break;
            case 9:
              _context4.p = 9;
              _t4 = _context4.v;
              console.error('[PxcPlayer] Error loading cutscene:', _t4);
            case 10:
              return _context4.a(2);
          }
        }, _callee4, this, [[0, 9]]);
      }));
      function playCutsceneFile(_x4) {
        return _playCutsceneFile.apply(this, arguments);
      }
      return playCutsceneFile;
    }()
    /**
     * Handle individual event
     */
    )
  }, {
    key: "handleEvent",
    value: (function () {
      var _handleEvent = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5(event) {
        var _t5;
        return _regenerator().w(function (_context5) {
          while (1) switch (_context5.n) {
            case 0:
              _t5 = event.type;
              _context5.n = _t5 === 'backdrop' ? 1 : _t5 === 'char' ? 3 : _t5 === 'dialogue' ? 5 : _t5 === 'action' ? 7 : _t5 === 'hook' ? 9 : _t5 === 'transition' ? 11 : _t5 === 'wait' ? 13 : _t5 === 'waitInput' ? 15 : _t5 === 'end' ? 17 : 18;
              break;
            case 1:
              _context5.n = 2;
              return this.showBackdrop(event.url, event.options);
            case 2:
              return _context5.a(3, 19);
            case 3:
              _context5.n = 4;
              return this.defineCharacter(event.name, event.sprite, event.portrait, event.options);
            case 4:
              return _context5.a(3, 19);
            case 5:
              _context5.n = 6;
              return this.showDialogue(event);
            case 6:
              return _context5.a(3, 19);
            case 7:
              _context5.n = 8;
              return this.doAction(event.actor, event.verb, event.args);
            case 8:
              return _context5.a(3, 19);
            case 9:
              _context5.n = 10;
              return this.doHook(event.action, event.args);
            case 10:
              return _context5.a(3, 19);
            case 11:
              _context5.n = 12;
              return this.doTransition(event.effect, event.options);
            case 12:
              return _context5.a(3, 19);
            case 13:
              _context5.n = 14;
              return this.wait(event.duration);
            case 14:
              return _context5.a(3, 19);
            case 15:
              _context5.n = 16;
              return this.waitForInput();
            case 16:
              return _context5.a(3, 19);
            case 17:
              this.isPlaying = false;
              return _context5.a(3, 19);
            case 18:
              console.warn('[PxcPlayer] Unknown event type:', event.type);
            case 19:
              return _context5.a(2);
          }
        }, _callee5, this);
      }));
      function handleEvent(_x5) {
        return _handleEvent.apply(this, arguments);
      }
      return handleEvent;
    }()
    /**
     * Show backdrop
     */
    )
  }, {
    key: "showBackdrop",
    value: (function () {
      var _showBackdrop = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6(url) {
        var options,
          _this$engine3,
          imageUrl,
          _args6 = arguments,
          _t6;
        return _regenerator().w(function (_context6) {
          while (1) switch (_context6.p = _context6.n) {
            case 0:
              options = _args6.length > 1 && _args6[1] !== undefined ? _args6[1] : {};
              this.currentBackdrop = url;
              console.log('[PxcPlayer] Backdrop:', url, options);
              _context6.p = 1;
              _context6.n = 2;
              return this.loadAsset(url, true);
            case 2:
              imageUrl = _context6.v;
              _context6.n = 3;
              return this.loadImage(imageUrl);
            case 3:
              this.backdropImage = _context6.v;
              // Set backdrop in HUD for rendering
              if ((_this$engine3 = this.engine) !== null && _this$engine3 !== void 0 && _this$engine3.hud) {
                this.engine.hud.setBackdrop(this.backdropImage);
              }
              _context6.n = 5;
              break;
            case 4:
              _context6.p = 4;
              _t6 = _context6.v;
              console.warn('[PxcPlayer] Failed to load backdrop:', url, _t6);
            case 5:
              if (this.callbacks.onBackdropChange) {
                this.callbacks.onBackdropChange(url, options);
              }

              // If fadeIn specified, wait for it
              if (!options.fadeIn) {
                _context6.n = 6;
                break;
              }
              _context6.n = 6;
              return this.wait(parseInt(options.fadeIn));
            case 6:
              return _context6.a(2);
          }
        }, _callee6, this, [[1, 4]]);
      }));
      function showBackdrop(_x6) {
        return _showBackdrop.apply(this, arguments);
      }
      return showBackdrop;
    }()
    /**
     * Define character
     */
    )
  }, {
    key: "defineCharacter",
    value: (function () {
      var _defineCharacter = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee7(name, sprite, portrait) {
        var options,
          portraitPath,
          portraitUrl,
          _args7 = arguments,
          _t7;
        return _regenerator().w(function (_context7) {
          while (1) switch (_context7.p = _context7.n) {
            case 0:
              options = _args7.length > 3 && _args7[3] !== undefined ? _args7[3] : {};
              this.characters[name] = {
                sprite: sprite,
                portrait: portrait,
                options: options
              };
              console.log('[PxcPlayer] Defined character:', name, sprite, portrait);

              // Pre-load character portrait if available
              portraitPath = portrait || sprite;
              if (!portraitPath) {
                _context7.n = 5;
                break;
              }
              _context7.p = 1;
              _context7.n = 2;
              return this.loadAsset(portraitPath, false);
            case 2:
              portraitUrl = _context7.v;
              _context7.n = 3;
              return this.loadImage(portraitUrl);
            case 3:
              this.characters[name].portraitImage = _context7.v;
              _context7.n = 5;
              break;
            case 4:
              _context7.p = 4;
              _t7 = _context7.v;
              console.warn('[PxcPlayer] Failed to load portrait for', name, _t7);
            case 5:
              return _context7.a(2);
          }
        }, _callee7, this, [[1, 4]]);
      }));
      function defineCharacter(_x7, _x8, _x9) {
        return _defineCharacter.apply(this, arguments);
      }
      return defineCharacter;
    }()
    /**
     * Show dialogue with typewriter effect
     */
    )
  }, {
    key: "showDialogue",
    value: (function () {
      var _showDialogue = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee8(event) {
        var _event$meta, _event$meta2, _event$meta3;
        var _char, sprite, portrait, portraitImg, portraitUrl, voicePromise, _event$meta4, _event$meta5, _t8;
        return _regenerator().w(function (_context8) {
          while (1) switch (_context8.p = _context8.n) {
            case 0:
              _char = this.characters[event.actor];
              sprite = (_char === null || _char === void 0 ? void 0 : _char.sprite) || ((_event$meta = event.meta) === null || _event$meta === void 0 ? void 0 : _event$meta.sprite);
              portrait = (_char === null || _char === void 0 ? void 0 : _char.portrait) || ((_event$meta2 = event.meta) === null || _event$meta2 === void 0 ? void 0 : _event$meta2.portrait);
              this.currentSpeaker = event.actor;
              this.currentText = event.text;
              this.displayedText = '';
              this.isTyping = true;
              console.log('[PxcPlayer] Dialogue:', event.actor, event.text);

              // Load portrait if specified
              portraitImg = (_char === null || _char === void 0 ? void 0 : _char.portraitImage) || null;
              if (!(!portraitImg && (portrait || sprite))) {
                _context8.n = 5;
                break;
              }
              _context8.p = 1;
              _context8.n = 2;
              return this.loadAsset(portrait || sprite, false);
            case 2:
              portraitUrl = _context8.v;
              _context8.n = 3;
              return this.loadImage(portraitUrl);
            case 3:
              portraitImg = _context8.v;
              _context8.n = 5;
              break;
            case 4:
              _context8.p = 4;
              _t8 = _context8.v;
              console.warn('[PxcPlayer] Failed to load portrait:', portrait || sprite, _t8);
            case 5:
              if (event.isCutin) {
                this.cutinImage = portraitImg;
                this.portraitImage = null;
              } else {
                this.portraitImage = portraitImg;
                this.cutinImage = null;
              }

              // Start voice-over if specified
              voicePromise = null;
              if ((_event$meta3 = event.meta) !== null && _event$meta3 !== void 0 && _event$meta3.voice) {
                voicePromise = this.playVoiceBlocking(event.meta.voice);
              }

              // Typewriter effect
              _context8.n = 6;
              return this.typeText(event.text);
            case 6:
              if (!voicePromise) {
                _context8.n = 7;
                break;
              }
              _context8.n = 7;
              return voicePromise;
            case 7:
              // Notify callback
              if (this.callbacks.onDialogueShow) {
                this.callbacks.onDialogueShow({
                  actor: event.actor,
                  text: event.text,
                  sprite: sprite,
                  portrait: portraitImg,
                  expression: ((_event$meta4 = event.meta) === null || _event$meta4 === void 0 ? void 0 : _event$meta4.expression) || 'neutral',
                  position: ((_event$meta5 = event.meta) === null || _event$meta5 === void 0 ? void 0 : _event$meta5.position) || 'center',
                  isCutin: event.isCutin,
                  meta: event.meta
                });
              }

              // Auto-advance or wait for input
              if (!this.autoAdvance) {
                _context8.n = 9;
                break;
              }
              _context8.n = 8;
              return this.wait(this.autoAdvanceDelay);
            case 8:
              _context8.n = 10;
              break;
            case 9:
              _context8.n = 10;
              return this.waitForInput();
            case 10:
              this.isTyping = false;
              if (this.callbacks.onDialogueHide) {
                this.callbacks.onDialogueHide();
              }
            case 11:
              return _context8.a(2);
          }
        }, _callee8, this, [[1, 4]]);
      }));
      function showDialogue(_x0) {
        return _showDialogue.apply(this, arguments);
      }
      return showDialogue;
    }()
    /**
     * Typewriter text effect - renders to HUD canvas
     */
    )
  }, {
    key: "typeText",
    value: (function () {
      var _typeText = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee9(text) {
        var chars, i, delay;
        return _regenerator().w(function (_context9) {
          while (1) switch (_context9.n) {
            case 0:
              chars = text.split('');
              this.displayedText = '';
              i = 0;
            case 1:
              if (!(i < chars.length)) {
                _context9.n = 4;
                break;
              }
              if (!(!this.isPlaying || this.skipRequested)) {
                _context9.n = 2;
                break;
              }
              this.displayedText = text; // Show full text on skip
              return _context9.a(3, 4);
            case 2:
              this.displayedText += chars[i];

              // Render the current state to HUD
              this.renderDialogue();

              // Calculate delay (longer for punctuation)
              delay = this.typewriterSpeed;
              if (/[.,!?;:]/.test(chars[i])) {
                delay += this.typewriterSpeed * 1.5;
              }
              _context9.n = 3;
              return this.wait(delay);
            case 3:
              i++;
              _context9.n = 1;
              break;
            case 4:
              // Final render
              this.renderDialogue();
            case 5:
              return _context9.a(2);
          }
        }, _callee9, this);
      }));
      function typeText(_x1) {
        return _typeText.apply(this, arguments);
      }
      return typeText;
    }()
    /**
     * Render dialogue box to HUD canvas
     */
    )
  }, {
    key: "renderDialogue",
    value: function renderDialogue() {
      var _this$engine4;
      if (!((_this$engine4 = this.engine) !== null && _this$engine4 !== void 0 && (_this$engine4 = _this$engine4.hud) !== null && _this$engine4 !== void 0 && _this$engine4.ctx)) return;
      var ctx = this.engine.hud.ctx;
      var canvas = ctx.canvas;
      var style = this.dialogueStyle;

      // Use HUD's scrollText for consistent rendering
      if (this.engine.hud.scrollText) {
        var options = {
          portrait: this.portraitImage ? {
            image: this.portraitImage
          } : null,
          fontStyle: style.textColor,
          background: style.boxColor,
          border: {
            lineWidth: 2,
            style: style.borderColor,
            corner: 'round'
          }
        };

        // Draw cutscene elements (backdrop) first
        if (this.engine.hud.drawCutsceneElements) {
          this.engine.hud.drawCutsceneElements();
        }

        // Draw speaker name
        ctx.font = style.speakerFont;
        ctx.fillStyle = style.speakerColor;
        ctx.textAlign = 'left';
        var boxY = 2 * canvas.height / 3;
        ctx.fillText(this.currentSpeaker, style.padding + (this.portraitImage ? style.portraitSize + 10 : 0), boxY - 25);

        // Draw dialogue text with scrollbox
        this.engine.hud.scrollText(this.displayedText, false, options);
      }
    }

    /**
     * Do action (animation, movement, etc.)
     */
  }, {
    key: "doAction",
    value: (function () {
      var _doAction = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee0(actor, verb) {
        var args,
          _args0 = arguments,
          _t9;
        return _regenerator().w(function (_context0) {
          while (1) switch (_context0.n) {
            case 0:
              args = _args0.length > 2 && _args0[2] !== undefined ? _args0[2] : {};
              console.log('[PxcPlayer] Action:', actor, verb, args);
              _t9 = verb;
              _context0.n = _t9 === 'moveTo' ? 1 : _t9 === 'fadeIn' ? 3 : _t9 === 'fadeOut' ? 5 : _t9 === 'shake' ? 7 : 9;
              break;
            case 1:
              _context0.n = 2;
              return this.wait(args.duration || 300);
            case 2:
              return _context0.a(3, 10);
            case 3:
              _context0.n = 4;
              return this.wait(args.duration || 500);
            case 4:
              return _context0.a(3, 10);
            case 5:
              _context0.n = 6;
              return this.wait(args.duration || 500);
            case 6:
              return _context0.a(3, 10);
            case 7:
              _context0.n = 8;
              return this.wait(args.duration || 200);
            case 8:
              return _context0.a(3, 10);
            case 9:
              console.warn('[PxcPlayer] Unknown action verb:', verb);
            case 10:
              return _context0.a(2);
          }
        }, _callee0, this);
      }));
      function doAction(_x10, _x11) {
        return _doAction.apply(this, arguments);
      }
      return doAction;
    }()
    /**
     * Execute hook action
     */
    )
  }, {
    key: "doHook",
    value: (function () {
      var _doHook = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee1(action, args) {
        var _this$engine5, _this$engine6;
        var _args$value, _t0, _t1;
        return _regenerator().w(function (_context1) {
          while (1) switch (_context1.p = _context1.n) {
            case 0:
              console.log('[PxcPlayer] Hook:', action, args);
              _t0 = action;
              _context1.n = _t0 === 'playBgm' ? 1 : _t0 === 'playSfx' ? 2 : _t0 === 'playVoice' ? 3 : _t0 === 'stopBgm' ? 5 : _t0 === 'stopAll' ? 6 : _t0 === 'setFlag' ? 7 : _t0 === 'runScript' ? 8 : 13;
              break;
            case 1:
              this.playBgm(args.name);
              return _context1.a(3, 14);
            case 2:
              this.playSfx(args.name);
              return _context1.a(3, 14);
            case 3:
              _context1.n = 4;
              return this.playVoiceBlocking(args.name);
            case 4:
              return _context1.a(3, 14);
            case 5:
              this.stopBgm();
              return _context1.a(3, 14);
            case 6:
              this.stopAll();
              return _context1.a(3, 14);
            case 7:
              if ((_this$engine5 = this.engine) !== null && _this$engine5 !== void 0 && _this$engine5.store && args.name) {
                this.engine.store.set(args.name, (_args$value = args.value) !== null && _args$value !== void 0 ? _args$value : true);
              }
              return _context1.a(3, 14);
            case 8:
              if (!((_this$engine6 = this.engine) !== null && _this$engine6 !== void 0 && (_this$engine6 = _this$engine6.spritz) !== null && _this$engine6 !== void 0 && _this$engine6.interpreter && args.name)) {
                _context1.n = 12;
                break;
              }
              _context1.p = 9;
              _context1.n = 10;
              return this.engine.spritz.interpreter.runScript(args.name);
            case 10:
              _context1.n = 12;
              break;
            case 11:
              _context1.p = 11;
              _t1 = _context1.v;
              console.warn('[PxcPlayer] Script execution failed:', args.name, _t1);
            case 12:
              return _context1.a(3, 14);
            case 13:
              console.warn('[PxcPlayer] Unknown hook action:', action);
            case 14:
              return _context1.a(2);
          }
        }, _callee1, this, [[9, 11]]);
      }));
      function doHook(_x12, _x13) {
        return _doHook.apply(this, arguments);
      }
      return doHook;
    }()
    /**
     * Play background music (looping)
     */
    )
  }, {
    key: "playBgm",
    value: function playBgm(audioPath) {
      var _this = this;
      this.stopBgm(); // Stop previous BGM

      console.log('[PxcPlayer] Playing BGM:', audioPath);
      this.loadAsset(audioPath).then(function (audioUrl) {
        if (!audioUrl) return;
        _this.bgmAudio = new Audio(audioUrl);
        _this.bgmAudio.loop = true;
        _this.bgmAudio.volume = 0.7;
        _this.bgmAudio.play()["catch"](function (e) {
          return console.warn('[PxcPlayer] BGM autoplay blocked:', e);
        });
      })["catch"](function (e) {
        return console.error('[PxcPlayer] Failed to load BGM:', e);
      });
    }

    /**
     * Play sound effect (one-shot)
     */
  }, {
    key: "playSfx",
    value: function playSfx(audioPath) {
      console.log('[PxcPlayer] Playing SFX:', audioPath);
      this.loadAsset(audioPath).then(function (audioUrl) {
        if (!audioUrl) return;
        var sfx = new Audio(audioUrl);
        sfx.volume = 0.8;
        sfx.play()["catch"](function (e) {
          return console.warn('[PxcPlayer] SFX autoplay blocked:', e);
        });
      })["catch"](function (e) {
        return console.error('[PxcPlayer] Failed to load SFX:', e);
      });
    }

    /**
     * Play voice-over (blocking - waits for completion)
     */
  }, {
    key: "playVoiceBlocking",
    value: (function () {
      var _playVoiceBlocking = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee11(audioPath) {
        var _this2 = this;
        return _regenerator().w(function (_context11) {
          while (1) switch (_context11.n) {
            case 0:
              console.log('[PxcPlayer] Playing Voice:', audioPath);
              return _context11.a(2, new Promise(/*#__PURE__*/function () {
                var _ref = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee10(resolve) {
                  var audioUrl, _t10;
                  return _regenerator().w(function (_context10) {
                    while (1) switch (_context10.p = _context10.n) {
                      case 0:
                        _context10.p = 0;
                        _context10.n = 1;
                        return _this2.loadAsset(audioPath);
                      case 1:
                        audioUrl = _context10.v;
                        if (audioUrl) {
                          _context10.n = 2;
                          break;
                        }
                        resolve();
                        return _context10.a(2);
                      case 2:
                        // Stop previous voice
                        if (_this2.voiceAudio) {
                          _this2.voiceAudio.pause();
                        }
                        _this2.voiceAudio = new Audio(audioUrl);
                        _this2.voiceAudio.volume = 1.0;
                        _this2.voiceAudio.onended = function () {
                          _this2.voiceAudio = null;
                          resolve();
                        };
                        _this2.voiceAudio.onerror = function () {
                          _this2.voiceAudio = null;
                          resolve();
                        };
                        _this2.voiceAudio.play()["catch"](function (e) {
                          console.warn('[PxcPlayer] Voice autoplay blocked:', e);
                          resolve();
                        });
                        _context10.n = 4;
                        break;
                      case 3:
                        _context10.p = 3;
                        _t10 = _context10.v;
                        console.error('[PxcPlayer] Failed to load voice:', _t10);
                        resolve();
                      case 4:
                        return _context10.a(2);
                    }
                  }, _callee10, null, [[0, 3]]);
                }));
                return function (_x15) {
                  return _ref.apply(this, arguments);
                };
              }()));
          }
        }, _callee11);
      }));
      function playVoiceBlocking(_x14) {
        return _playVoiceBlocking.apply(this, arguments);
      }
      return playVoiceBlocking;
    }()
    /**
     * Stop background music
     */
    )
  }, {
    key: "stopBgm",
    value: function stopBgm() {
      if (this.bgmAudio) {
        this.bgmAudio.pause();
        this.bgmAudio = null;
      }
    }

    /**
     * Stop all audio
     */
  }, {
    key: "stopAll",
    value: function stopAll() {
      this.stopBgm();
      if (this.sfxAudio) {
        this.sfxAudio.pause();
        this.sfxAudio = null;
      }
      if (this.voiceAudio) {
        this.voiceAudio.pause();
        this.voiceAudio = null;
      }
    }

    /**
     * Transition effect
     */
  }, {
    key: "doTransition",
    value: (function () {
      var _doTransition = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee12(effect) {
        var _this$engine7;
        var options,
          duration,
          direction,
          _args12 = arguments;
        return _regenerator().w(function (_context12) {
          while (1) switch (_context12.n) {
            case 0:
              options = _args12.length > 1 && _args12[1] !== undefined ? _args12[1] : {};
              console.log('[PxcPlayer] Transition:', effect, options);
              if (!((_this$engine7 = this.engine) !== null && _this$engine7 !== void 0 && _this$engine7.renderManager)) {
                _context12.n = 2;
                break;
              }
              duration = options.duration || 500;
              direction = options.direction || 'out';
              _context12.n = 1;
              return this.engine.renderManager.startTransition({
                effect: effect,
                direction: direction,
                duration: duration
              });
            case 1:
              _context12.n = 3;
              break;
            case 2:
              _context12.n = 3;
              return this.wait(options.duration || 500);
            case 3:
              return _context12.a(2);
          }
        }, _callee12, this);
      }));
      function doTransition(_x16) {
        return _doTransition.apply(this, arguments);
      }
      return doTransition;
    }()
    /**
     * Wait for duration
     */
    )
  }, {
    key: "wait",
    value: function wait(duration) {
      return new Promise(function (resolve) {
        return setTimeout(resolve, duration);
      });
    }

    /**
     * Wait for user input (click, key, or touch)
     */
  }, {
    key: "waitForInput",
    value: function waitForInput() {
      return new Promise(function (resolve) {
        var _handler = function handler(e) {
          // Ignore if modifier keys are held
          if (e.ctrlKey || e.altKey || e.metaKey) return;
          document.removeEventListener('click', _handler);
          document.removeEventListener('keydown', _handler);
          document.removeEventListener('touchend', _handler);
          resolve();
        };
        document.addEventListener('click', _handler);
        document.addEventListener('keydown', _handler);
        document.addEventListener('touchend', _handler);
      });
    }

    /**
     * Skip current dialogue/event
     */
  }, {
    key: "skip",
    value: function skip() {
      this.skipRequested = true;
    }

    /**
     * Pause playback
     */
  }, {
    key: "pause",
    value: function pause() {
      this.isPaused = true;
    }

    /**
     * Resume playback
     */
  }, {
    key: "resume",
    value: function resume() {
      this.isPaused = false;
    }

    /**
     * Cleanup resources
     */
  }, {
    key: "cleanup",
    value: function cleanup() {
      var _this$engine8;
      this.stopAll();
      this.characters = {};
      this.currentBackdrop = null;
      this.backdropImage = null;
      this.portraitImage = null;
      this.cutinImage = null;
      this.currentSpeaker = '';
      this.currentText = '';
      this.displayedText = '';

      // Clear HUD backdrop
      if ((_this$engine8 = this.engine) !== null && _this$engine8 !== void 0 && _this$engine8.hud) {
        this.engine.hud.setBackdrop(null);
        this.engine.hud.setCutouts([]);
      }

      // Revoke object URLs from cache
      Object.values(this.resourceCache).forEach(function (url) {
        if (url && typeof url === 'string' && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      this.resourceCache = {};
    }

    /**
     * Stop playback
     */
  }, {
    key: "stop",
    value: function stop() {
      this.isPlaying = false;
      this.cleanup();
    }

    /**
     * Set typewriter speed
     */
  }, {
    key: "setSpeed",
    value: function setSpeed(msPerChar) {
      this.typewriterSpeed = msPerChar;
    }

    /**
     * Enable/disable auto-advance
     */
  }, {
    key: "setAutoAdvance",
    value: function setAutoAdvance(enabled) {
      var delay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1500;
      this.autoAdvance = enabled;
      this.autoAdvanceDelay = delay;
    }

    /**
     * Set dialogue styling
     */
  }, {
    key: "setDialogueStyle",
    value: function setDialogueStyle(style) {
      Object.assign(this.dialogueStyle, style);
    }
  }]);
}();