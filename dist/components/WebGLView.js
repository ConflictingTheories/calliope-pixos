"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _core = _interopRequireDefault(require("../engine/core"));

var _enums = require("../engine/utils/enums");

var _keyboard = _interopRequireDefault(require("../engine/utils/keyboard"));

var _hud = require("../engine/hud");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

//
var WebGLView = function WebGLView(_ref) {
  var width = _ref.width,
      height = _ref.height,
      SceneProvider = _ref.SceneProvider,
      string = _ref["class"];
  var ref = (0, _react.useRef)();
  var hudRef = (0, _react.useRef)();
  var keyboard = new _keyboard["default"]();
  var onMouseEvent = SceneProvider.onMouseEvent;
  var onKeyEvent = SceneProvider.onKeyEvent;
  (0, _react.useEffect)( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    var canvas, hud, engine;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            canvas = ref.current;
            hud = hudRef.current; // Webgl Engine

            engine = new _core["default"](canvas, hud, width, height); // load fonts

            _context.next = 5;
            return _hud.minecraftia.load();

          case 5:
            document.fonts.add(_hud.minecraftia); // Initialize Scene

            _context.next = 8;
            return engine.init(SceneProvider, keyboard);

          case 8:
            // render loop
            engine.render(); // cleanup

            return _context.abrupt("return", function () {
              engine.close();
            });

          case 10:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  })), [SceneProvider]);
  return /*#__PURE__*/_react["default"].createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/_react["default"].createElement("canvas", {
    style: {
      position: 'absolute',
      zIndex: 1,
      top: 0,
      left: 0
    },
    ref: ref,
    width: width,
    height: height,
    className: string
  }), /*#__PURE__*/_react["default"].createElement("canvas", {
    style: {
      zIndex: 2,
      top: 0,
      left: 0,
      background: 'none'
    },
    tabIndex: 0,
    ref: hudRef,
    width: width,
    height: height,
    className: string,
    onKeyDownCapture: function onKeyDownCapture(e) {
      return onKeyEvent(e.nativeEvent);
    },
    onKeyUpCapture: function onKeyUpCapture(e) {
      return onKeyEvent(e.nativeEvent);
    },
    onContextMenu: function onContextMenu(e) {
      return onMouseEvent(e.nativeEvent.clientX, e.nativeEvent.clientY, _enums.Mouse.UP, true, e);
    },
    onMouseUp: function onMouseUp(e) {
      return onMouseEvent(e.nativeEvent.clientX, e.nativeEvent.clientY, _enums.Mouse.UP, e.nativeEvent.button == 3, e);
    },
    onMouseDown: function onMouseDown(e) {
      return onMouseEvent(e.nativeEvent.clientX, e.nativeEvent.clientY, _enums.Mouse.DOWN, e.nativeEvent.button == 3, e);
    },
    onMouseMove: function onMouseMove(e) {
      return onMouseEvent(e.nativeEvent.clientX, e.nativeEvent.clientY, _enums.Mouse.MOVE, e.nativeEvent.button == 3, e);
    }
  }));
};

WebGLView.propTypes = {
  width: _propTypes["default"].number.isRequired,
  height: _propTypes["default"].number.isRequired,
  SceneProvider: _propTypes["default"].object.isRequired,
  "class": _propTypes["default"].string.isRequired
};
var _default = WebGLView;
exports["default"] = _default;