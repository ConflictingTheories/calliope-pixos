"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _react = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _index = _interopRequireDefault(require("@Engine/core/index.js"));
var _index2 = require("@Engine/core/hud/index.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
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
\*                                                 */
//
var WebGLView = function WebGLView(_ref) {
  var width = _ref.width,
    height = _ref.height,
    SpritzProvider = _ref.SpritzProvider,
    string = _ref["class"],
    zipData = _ref.zipData;
  // Canvas
  var ref = (0, _react.useRef)();
  var hudRef = (0, _react.useRef)();
  var gamepadRef = (0, _react.useRef)();
  var fileRef = (0, _react.useRef)();
  var mmRef = (0, _react.useRef)();
  var engineInitialized = (0, _react.useRef)(false);

  // keyboard & touch - use wrapper functions to guard against uninitialized engine
  var onKeyEvent = function onKeyEvent(e) {
    try {
      if (SpritzProvider && SpritzProvider.onKeyEvent) SpritzProvider.onKeyEvent(e);
    } catch (err) {
      // swallow until engine initialized
    }
  };

  /**
   * Handles touch/mouse events with proper coordinate transformation.
   * The canvas element may be scaled via CSS to fit the viewport, but its
   * internal resolution (width/height attributes) can differ from the display
   * size (getBoundingClientRect). This function computes the correct canvas
   * coordinates by accounting for the scale difference and any offset.
   */
  var onTouchEvent = function onTouchEvent(e) {
    try {
      var canvas = hudRef.current;
      if (!canvas) {
        if (SpritzProvider && SpritzProvider.onTouchEvent) SpritzProvider.onTouchEvent(e);
        return;
      }
      var rect = canvas.getBoundingClientRect();

      // Handle both mouse and touch events
      var clientX, clientY;
      if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if (e.changedTouches && e.changedTouches.length > 0) {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      // Calculate scale factors between internal canvas size and displayed size
      var scaleX = canvas.width / rect.width;
      var scaleY = canvas.height / rect.height;

      // Calculate position relative to canvas with proper scaling
      var canvasX = (clientX - rect.left) * scaleX;
      var canvasY = (clientY - rect.top) * scaleY;

      // Create adjusted event with canvas-relative coordinates
      var adjustedEvent = _objectSpread(_objectSpread({}, e), {}, {
        type: e.type,
        clientX: clientX,
        clientY: clientY,
        // Pre-computed canvas coordinates for the engine
        canvasX: canvasX,
        canvasY: canvasY,
        pageX: canvasX + rect.left,
        pageY: canvasY + rect.top,
        _canvasRect: rect,
        _scaleX: scaleX,
        _scaleY: scaleY
      });
      if (SpritzProvider && SpritzProvider.onTouchEvent) {
        SpritzProvider.onTouchEvent(adjustedEvent);
      }
    } catch (err) {
      console.warn('onTouchEvent error:', err);
    }
  };
  var engine = null;

  // Resize
  var _useState = (0, _react.useState)({
      dynamicWidth: Math.max(window.innerWidth || 480, 480),
      dynamicHeight: Math.max(window.innerHeight || 640, 640)
    }),
    _useState2 = _slicedToArray(_useState, 2),
    screenSize = _useState2[0],
    getDimension = _useState2[1];

  // window dimensions
  var setDimension = function setDimension() {
    getDimension({
      dynamicWidth: Math.max(window.innerWidth || 480, 480),
      dynamicHeight: Math.max(window.innerHeight || 640, 640)
    });
  };

  // Calculate canvas dimensions early (needed before useEffect initializes engine)
  var wrapperHeight = screenSize.dynamicWidth * 3 / 4 > 1080 ? 1080 : screenSize.dynamicHeight;
  var canvasHeight = screenSize.dynamicWidth * 3 / 4 > 1080 ? wrapperHeight : wrapperHeight - 200;
  var canvasWidth = screenSize.dynamicWidth > 1920 ? 1920 : screenSize.dynamicWidth;
  var showGamepad = screenSize.dynamicWidth <= 900;
  var gamepadHeight = 200;

  // load fonts
  function loadFonts() {
    return _loadFonts.apply(this, arguments);
  }
  function _loadFonts() {
    _loadFonts = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
      return _regenerator().w(function (_context2) {
        while (1) switch (_context2.n) {
          case 0:
            _context2.n = 1;
            return _index2.minecraftia.load();
          case 1:
            document.fonts.add(_index2.minecraftia);
          case 2:
            return _context2.a(2);
        }
      }, _callee2);
    }));
    return _loadFonts.apply(this, arguments);
  }
  function stopTouchScrolling(canvas) {
    // Prevent scrolling when touching the canvas
    document.body.addEventListener('touchstart', function (e) {
      if (e.target == canvas) {
        e.preventDefault();
      }
    }, {
      passive: false
    });
    document.body.addEventListener('touchend', function (e) {
      if (e.target == canvas) {
        e.preventDefault();
      }
    }, {
      passive: false
    });
    document.body.addEventListener('touchmove', function (e) {
      if (e.target == canvas) {
        e.preventDefault();
      }
    }, {
      passive: false
    });
  }
  (0, _react.useLayoutEffect)(function () {
    // This runs AFTER the DOM is rendered but BEFORE browser paint
    // Ensures canvas elements are in the DOM with proper dimensions

    // handle resize
    window.addEventListener('resize', setDimension);

    // setup canvases
    var canvas = ref.current;
    var hud = hudRef.current;
    var mipmap = mmRef.current;
    var gamepad = gamepadRef.current;
    var fileUpload = fileRef.current;

    // Validate canvas elements exist AND have valid dimensions
    if (!canvas || !hud || !mipmap || !gamepad) {
      console.error('Canvas initialization failed: One or more canvas refs are null');
      return;
    }

    // Critical: Check that canvas has actual dimensions before proceeding
    // This ensures the canvas is properly rendered in the DOM
    if (canvas.width <= 0 || canvas.height <= 0 || canvas.clientWidth <= 0 || canvas.clientHeight <= 0) {
      console.warn('Canvas not yet rendered with valid dimensions, deferring initialization');
      return;
    }

    // Create ResizeObserver for proper canvas resize handling
    var resizeObserver = null;

    // Async initialization - defer engine creation until right before init to avoid race condition
    var initEngine = /*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
        var canvasStyle;
        return _regenerator().w(function (_context) {
          while (1) switch (_context.n) {
            case 0:
              if (!engineInitialized.current) {
                _context.n = 1;
                break;
              }
              return _context.a(2);
            case 1:
              engineInitialized.current = true;

              // CRITICAL: Re-validate canvas state immediately before creating engine
              // Canvas may have become hidden/resized between useLayoutEffect and now
              canvasStyle = window.getComputedStyle(canvas);
              if (!(canvasStyle.display === 'none' || canvasStyle.visibility === 'hidden' || canvasStyle.opacity === '0')) {
                _context.n = 2;
                break;
              }
              throw new Error('Canvas became hidden between initialization check and async init');
            case 2:
              if (!(canvas.clientWidth <= 0 || canvas.clientHeight <= 0)) {
                _context.n = 3;
                break;
              }
              throw new Error('Canvas dimensions became invalid between initialization check and async init');
            case 3:
              // Create engine NOW (at init time, not in useLayoutEffect)
              // This ensures canvas state is validated immediately before use
              engine = new _index["default"](canvas, hud, mipmap, gamepad, fileUpload, width, height);

              // load fonts
              _context.n = 4;
              return loadFonts();
            case 4:
              _context.n = 5;
              return engine.init(SpritzProvider);
            case 5:
              // Setup ResizeObserver after init
              if (typeof ResizeObserver !== 'undefined') {
                resizeObserver = new ResizeObserver(function (entries) {
                  var _iterator = _createForOfIteratorHelper(entries),
                    _step;
                  try {
                    for (_iterator.s(); !(_step = _iterator.n()).done;) {
                      var entry = _step.value;
                      if (entry.target === canvas || entry.target === hud) {
                        // Notify engine of resize
                        if (engine && engine.handleResize) {
                          engine.handleResize();
                        }
                      }
                    }
                  } catch (err) {
                    _iterator.e(err);
                  } finally {
                    _iterator.f();
                  }
                });
                resizeObserver.observe(canvas);
                resizeObserver.observe(hud);
              }

              // render loop
              engine.render();
            case 6:
              return _context.a(2);
          }
        }, _callee);
      }));
      return function initEngine() {
        return _ref2.apply(this, arguments);
      };
    }();
    initEngine()["catch"](function (err) {
      console.error('Engine initialization failed:', err);
    });

    // cleanup
    return function () {
      stopTouchScrolling(canvas);
      stopTouchScrolling(gamepad);
      stopTouchScrolling(hud);
      window.removeEventListener('resize', setDimension);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (engine) {
        engine.close();
      }
    };
  }, [SpritzProvider]);
  return /*#__PURE__*/_react["default"].createElement("div", {
    style: {
      marginLeft: 'auto',
      marginRight: 'auto'
    }
  }, /*#__PURE__*/_react["default"].createElement("div", {
    style: {
      position: 'relative',
      padding: 'none',
      background: 'var(--color-bg, #0a0a0f)',
      height: canvasHeight + 'px',
      width: canvasWidth + 'px'
    },
    onKeyDownCapture: function onKeyDownCapture(e) {
      return onKeyEvent(e.nativeEvent);
    },
    onKeyUpCapture: function onKeyUpCapture(e) {
      return onKeyEvent(e.nativeEvent);
    },
    tabIndex: 0
  }, /*#__PURE__*/_react["default"].createElement("div", null, /*#__PURE__*/_react["default"].createElement("canvas", {
    style: {
      position: 'absolute',
      zIndex: 1,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%'
    },
    ref: ref,
    width: canvasWidth,
    height: canvasHeight,
    className: string
  }), /*#__PURE__*/_react["default"].createElement("canvas", {
    style: {
      position: 'absolute',
      zIndex: 2,
      top: 0,
      left: 0,
      background: 'none',
      width: '100%',
      height: '100%',
      touchAction: 'none',
      // Prevent browser gestures
      cursor: 'pointer'
    },
    ref: hudRef,
    width: canvasWidth,
    height: canvasHeight,
    className: string,
    onMouseUp: function onMouseUp(e) {
      e.stopPropagation();
      onTouchEvent(e.nativeEvent);
    },
    onMouseDown: function onMouseDown(e) {
      e.stopPropagation();
      onTouchEvent(e.nativeEvent);
    },
    onMouseMove: function onMouseMove(e) {
      e.stopPropagation();
      onTouchEvent(e.nativeEvent);
    },
    onClick: function onClick(e) {
      e.stopPropagation();
      onTouchEvent(e.nativeEvent);
    },
    onTouchStart: function onTouchStart(e) {
      e.stopPropagation();
      onTouchEvent(e.nativeEvent);
    },
    onTouchEnd: function onTouchEnd(e) {
      e.stopPropagation();
      onTouchEvent(e.nativeEvent);
    },
    onTouchMove: function onTouchMove(e) {
      e.stopPropagation();
      onTouchEvent(e.nativeEvent);
    },
    onTouchCancel: function onTouchCancel(e) {
      e.stopPropagation();
      onTouchEvent(e.nativeEvent);
    }
  }), /*#__PURE__*/_react["default"].createElement("canvas", {
    style: {
      display: 'none'
    },
    ref: mmRef,
    width: 256,
    height: 256
  }))), /*#__PURE__*/_react["default"].createElement("div", {
    style: {
      width: canvasWidth + 'px',
      height: showGamepad ? gamepadHeight + 'px' : '1px',
      marginTop: showGamepad ? '10px' : '0px',
      position: 'relative',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/_react["default"].createElement("canvas", {
    style: {
      position: 'absolute',
      zIndex: 5,
      top: 0,
      left: 0,
      background: 'none',
      width: '100%',
      height: '100%',
      display: showGamepad ? 'block' : 'none'
    },
    ref: gamepadRef,
    width: canvasWidth,
    height: gamepadHeight,
    className: string,
    onMouseUp: function onMouseUp(e) {
      return onTouchEvent(e.nativeEvent);
    },
    onMouseDown: function onMouseDown(e) {
      return onTouchEvent(e.nativeEvent);
    },
    onMouseMove: function onMouseMove(e) {
      return onTouchEvent(e.nativeEvent);
    },
    onTouchMoveCapture: function onTouchMoveCapture(e) {
      return onTouchEvent(e.nativeEvent);
    },
    onTouchCancelCapture: function onTouchCancelCapture(e) {
      return onTouchEvent(e.nativeEvent);
    },
    onTouchStartCapture: function onTouchStartCapture(e) {
      return onTouchEvent(e.nativeEvent);
    },
    onTouchEndCapture: function onTouchEndCapture(e) {
      return onTouchEvent(e.nativeEvent);
    }
  })), /*#__PURE__*/_react["default"].createElement("div", null, /*#__PURE__*/_react["default"].createElement("input", {
    type: "file",
    ref: fileRef,
    src: zipData !== null && zipData !== void 0 ? zipData : null,
    hidden: true
  })));
};
WebGLView.propTypes = {
  width: _propTypes["default"].number.isRequired,
  height: _propTypes["default"].number.isRequired,
  SpritzProvider: _propTypes["default"].object.isRequired,
  "class": _propTypes["default"].string.isRequired
};
var _default = exports["default"] = WebGLView;