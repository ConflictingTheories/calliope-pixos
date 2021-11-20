"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TilesetLoader = exports.SpriteLoader = exports.ActionLoader = void 0;

var _resources = _interopRequireDefault(require("./resources"));

var _sprite = _interopRequireDefault(require("../sprite"));

var _tileset = _interopRequireDefault(require("../tileset"));

var _action = _interopRequireDefault(require("../action"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// Helps Loads New Tileset Instance
var TilesetLoader = /*#__PURE__*/function () {
  function TilesetLoader(engine) {
    _classCallCheck(this, TilesetLoader);

    this.engine = engine;
    this.tilesets = {};
  } // Load tileset asynchronously over network


  _createClass(TilesetLoader, [{
    key: "loadRemote",
    value: function () {
      var _loadRemote = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(name) {
        var tileset, fileResponse, content;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                tileset = this.tilesets[name];

                if (!tileset) {
                  _context.next = 3;
                  break;
                }

                return _context.abrupt("return", tileset);

              case 3:
                // Generate Tileset
                this.tilesets[name] = tileset = new _tileset["default"](this.engine);
                tileset.name = name; // Fetch Image and Apply

                _context.next = 7;
                return fetch(_resources["default"].tilesetRequestUrl(name));

              case 7:
                fileResponse = _context.sent;

                if (!fileResponse.ok) {
                  _context.next = 21;
                  break;
                }

                _context.prev = 9;
                _context.next = 12;
                return fileResponse.json();

              case 12:
                content = _context.sent;
                _context.next = 15;
                return tileset.onJsonLoaded(content);

              case 15:
                _context.next = 21;
                break;

              case 17:
                _context.prev = 17;
                _context.t0 = _context["catch"](9);
                console.error("Error parsing tileset '" + tileset.name + "' definition");
                console.error(_context.t0);

              case 21:
                return _context.abrupt("return", this.tilesets[name]);

              case 22:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[9, 17]]);
      }));

      function loadRemote(_x) {
        return _loadRemote.apply(this, arguments);
      }

      return loadRemote;
    }() // Load Tileset Directly (precompiled)

  }, {
    key: "load",
    value: function () {
      var _load = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(type) {
        var tileset, instance, json;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                tileset = this.tilesets[type];

                if (!tileset) {
                  _context2.next = 3;
                  break;
                }

                return _context2.abrupt("return", tileset);

              case 3:
                instance = new _tileset["default"](this.engine);
                this.tilesets[type] = instance;
                json = require("../../scene/tilesets/" + type + ".tileset.jsx")["default"];
                instance.onJsonLoaded(json);
                return _context2.abrupt("return", instance);

              case 8:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function load(_x2) {
        return _load.apply(this, arguments);
      }

      return load;
    }()
  }]);

  return TilesetLoader;
}(); // Helps Loads New Sprite Instance


exports.TilesetLoader = TilesetLoader;

var SpriteLoader = /*#__PURE__*/function () {
  function SpriteLoader(engine) {
    _classCallCheck(this, SpriteLoader);

    this.engine = engine;
    this.definitions = [];
    this.instances = {};
  } // Load Sprite


  _createClass(SpriteLoader, [{
    key: "load",
    value: function () {
      var _load2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(type) {
        var afterLoad,
            runConfigure,
            instance,
            _args3 = arguments;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                afterLoad = _args3[1];
                runConfigure = _args3[2];

                if (!this.instances[type]) {
                  this.instances[type] = [];
                } // New Instance


                instance = new _sprite["default"](this.engine);
                Object.assign(instance, require("../../scene/sprites/" + type + ".jsx")["default"]);
                instance.templateLoaded = true; // Update Existing

                this.instances[type].forEach(function (instance) {
                  if (instance.afterLoad) instance.afterLoad(instance.instance);
                }); // Configure if needed

                if (runConfigure) runConfigure(instance); // once loaded

                if (afterLoad) {
                  console.log("after load");
                  if (instance.templateLoaded) afterLoad(instance);else this.instances[type].push({
                    instance: instance,
                    afterLoad: afterLoad
                  });
                }

                return _context3.abrupt("return", instance);

              case 10:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function load(_x3) {
        return _load2.apply(this, arguments);
      }

      return load;
    }()
  }]);

  return SpriteLoader;
}(); // Helps Loads New Action Instance


exports.SpriteLoader = SpriteLoader;

var ActionLoader = /*#__PURE__*/function () {
  function ActionLoader(engine, type, args, sprite, id, time) {
    _classCallCheck(this, ActionLoader);

    this.engine = engine;
    this.type = type;
    this.args = args;
    this.sprite = sprite;
    this.instances = {};
    this.definitions = [];

    if (!time) {
      time = new Date().getTime();
    }

    if (!id) {
      id = sprite.id + "-" + type + "-" + time;
    }

    return this.load(type, function (action) {
      action.onLoad(args);
    }, function (action) {
      action.configure(type, sprite, id, time, args);
    });
  } // Load Action


  _createClass(ActionLoader, [{
    key: "load",
    value: function load(type) {
      var afterLoad = arguments[1];
      var runConfigure = arguments[2];

      if (!this.instances[type]) {
        this.instances[type] = [];
      } // New Instance (assigns properties loaded by type)


      var instance = new _action["default"](this.type, this.sprite);
      Object.assign(instance, require("../actions/" + type + ".jsx")["default"]);
      instance.templateLoaded = true; // Notify existing

      this.instances[type].forEach(function (instance) {
        if (instance.afterLoad) instance.afterLoad(instance.instance);
      }); // construct

      if (runConfigure) runConfigure(instance); // load

      if (afterLoad) {
        if (instance.templateLoaded) afterLoad(instance);else this.instances[type].push({
          instance: instance,
          afterLoad: afterLoad
        });
      }

      return instance;
    }
  }]);

  return ActionLoader;
}();

exports.ActionLoader = ActionLoader;