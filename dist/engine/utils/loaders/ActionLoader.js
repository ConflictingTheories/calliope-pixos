"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ActionLoader = void 0;

var _action = _interopRequireDefault(require("@Engine/core/action.jsx"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

// Helps Loads New Action Instance
var ActionLoader = /*#__PURE__*/function () {
  function ActionLoader(engine, type, args, sprite, callback) {
    _classCallCheck(this, ActionLoader);

    this.engine = engine;
    this.type = type;
    this.args = args;
    this.sprite = sprite;
    this.callback = callback;
    this.instances = {};
    this.definitions = [];
    this.assets = {};
    var time = new Date().getTime();
    var id = sprite.id + "-" + type + "-" + time;
    return this.load(type, function (action) {
      action.onLoad(args);
    }, function (action) {
      action.configure(type, sprite, id, time, args);
    });
  } // Load Internal Action


  _createClass(ActionLoader, [{
    key: "load",
    value: function load(type) {
      var afterLoad = arguments[1];
      var runConfigure = arguments[2];

      if (!this.instances[type]) {
        this.instances[type] = [];
      } // New Instance (assigns properties loaded by type)


      var instance = new _action["default"](this.type, this.sprite, this.callback);
      Object.assign(instance, require("@Engine/actions/" + type + ".jsx")["default"]);
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