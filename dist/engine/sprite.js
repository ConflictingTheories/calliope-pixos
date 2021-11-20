"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _vector = require("./utils/math/vector");

var _enums = require("./utils/enums");

var _queue = _interopRequireDefault(require("./queue"));

var _matrix = require("./utils/math/matrix4");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Sprite = /*#__PURE__*/function () {
  function Sprite(engine) {
    _classCallCheck(this, Sprite);

    this.engine = engine;
    this.templateLoaded = false;
    this.drawOffset = new _vector.Vector(0, 0, 0);
    this.hotspotOffset = new _vector.Vector(0, 0, 0);
    this.animFrame = 0;
    this.pos = new _vector.Vector(0, 0, 0);
    this.facing = _enums.Direction.Right;
    this.actionDict = {};
    this.actionList = [];
    this.onLoadActions = new _queue["default"]();
    this.getTexCoords = this.getTexCoords.bind(this);
  }

  _createClass(Sprite, [{
    key: "runWhenLoaded",
    value: function runWhenLoaded(action) {
      if (this.loaded) action();else this.onLoadActions.add(action);
    } // Load Texture / Location

  }, {
    key: "onLoad",
    value: function onLoad(instanceData) {
      if (this.loaded) return;

      if (!this.src || !this.sheetSize || !this.tileSize || !this.frames) {
        console.error("Invalid sprite definition");
        return;
      } // Zone Information


      this.zone = instanceData.zone;
      if (instanceData.id) this.id = instanceData.id;
      if (instanceData.pos) (0, _vector.set)(_construct(_vector.Vector, _toConsumableArray(instanceData.pos)), this.pos);
      if (instanceData.facing && instanceData.facing !== 0) this.facing = instanceData.facing;
      console.log('facing', _enums.Direction.spriteSequence(this.facing)); // Texture Buffer

      this.texture = this.engine.loadTexture(this.src);
      this.texture.runWhenLoaded(this.onTilesetOrTextureLoaded.bind(this));
      this.vertexTexBuf = this.engine.createBuffer(this.getTexCoords(), this.engine.gl.DYNAMIC_DRAW, 2);
      this.zone.tileset.runWhenDefinitionLoaded(this.onTilesetDefinitionLoaded.bind(this));
    } // Definition Loaded

  }, {
    key: "onTilesetDefinitionLoaded",
    value: function onTilesetDefinitionLoaded() {
      var s = this.zone.tileset.tileSize;
      var ts = [this.tileSize[0] / s, this.tileSize[1] / s];
      var v = [[0, 0, 0], [ts[0], 0, 0], [ts[0], 0, ts[1]], [0, 0, ts[1]]];
      var poly = [[v[2], v[3], v[0]], [v[2], v[0], v[1]]].flat(3);
      this.vertexPosBuf = this.engine.createBuffer(poly, this.engine.gl.STATIC_DRAW, 3);
      this.zone.tileset.runWhenLoaded(this.onTilesetOrTextureLoaded.bind(this));
    } // After Tileset / Texture Loaded

  }, {
    key: "onTilesetOrTextureLoaded",
    value: function onTilesetOrTextureLoaded() {
      if (this.loaded || !this.zone.tileset.loaded || !this.texture.loaded) return;
      this.init(); // Hook for sprite implementations

      this.loaded = true;
      this.onLoadActions.run();
      console.log("Initialized sprite '" + this.id + "' in zone '" + this.zone.id + "'");
    } // Get Texture Coordinates

  }, {
    key: "getTexCoords",
    value: function getTexCoords() {
      if (this.id == 'player') console.log('texture frames', this.facing, _enums.Direction.spriteSequence(this.facing));

      var t = this.frames[_enums.Direction.spriteSequence(this.facing)][this.animFrame % 4];

      var ss = this.sheetSize;
      var ts = this.tileSize;
      var bl = [(t[0] + ts[0]) / ss[0], t[1] / ss[1]];
      var tr = [t[0] / ss[0], (t[1] + ts[1]) / ss[1]];
      var v = [bl, [tr[0], bl[1]], tr, [bl[0], tr[1]]];
      var poly = [[v[0], v[1], v[2]], [v[0], v[2], v[3]]];
      return poly.flat(3);
    } // Draw Sprite Sprite

  }, {
    key: "draw",
    value: function draw() {
      if (!this.loaded) return;
      this.engine.mvPushMatrix(); // Undo rotation so that character plane is normal to LOS

      (0, _matrix.translate)(this.engine.uViewMat, this.engine.uViewMat, this.drawOffset.toArray());
      (0, _matrix.translate)(this.engine.uViewMat, this.engine.uViewMat, this.pos.toArray());
      (0, _matrix.rotate)(this.engine.uViewMat, this.engine.uViewMat, this.engine.degToRad(this.engine.cameraAngle), [1, 0, 0]); // Bind texture

      this.engine.bindBuffer(this.vertexPosBuf, this.engine.shaderProgram.vertexPositionAttribute);
      this.engine.bindBuffer(this.vertexTexBuf, this.engine.shaderProgram.textureCoordAttribute);
      this.texture.attach(); // Draw

      this.engine.shaderProgram.setMatrixUniforms();
      this.engine.gl.depthFunc(this.engine.gl.ALWAYS);
      this.engine.gl.drawArrays(this.engine.gl.TRIANGLES, 0, this.vertexPosBuf.numItems);
      this.engine.gl.depthFunc(this.engine.gl.LESS);
      this.engine.mvPopMatrix();
    } // Set Frame

  }, {
    key: "setFrame",
    value: function setFrame(frame) {
      this.animFrame = frame;
      this.engine.updateBuffer(this.vertexTexBuf, this.getTexCoords());
    } // Set Facing

  }, {
    key: "setFacing",
    value: function setFacing(facing) {
      console.log('setting face to ' + _enums.Direction.spriteSequence(facing));
      if (facing) this.facing = facing;
      this.setFrame(this.animFrame);
    } // Add Action to Queue

  }, {
    key: "addAction",
    value: function addAction(action) {
      console.log('adding action');
      if (this.actionDict[action.id]) this.removeAction(action.id);
      this.actionDict[action.id] = action;
      this.actionList.push(action);
    } // Remove Action

  }, {
    key: "removeAction",
    value: function removeAction(id) {
      console.log('removing action');
      this.actionList = this.actionList.filter(function (action) {
        return action.id !== id;
      });
      delete this.actionDict[id];
    } // Tick

  }, {
    key: "tickOuter",
    value: function tickOuter(time) {
      var _this = this;

      if (!this.loaded) return; // Sort activities by increasing startTime, then by id

      this.actionList.sort(function (a, b) {
        var dt = a.startTime - b.startTime;
        if (!dt) return dt;
        return a.id > b.id ? 1 : -1;
      }); // Run & Queue for Removal when complete

      var toRemove = [];
      this.actionList.forEach(function (action) {
        if (!action.loaded || action.startTime > time) return;
        if (action.tick(time)) toRemove.push(action);
      }); // clear completed activities

      toRemove.forEach(function (action) {
        return _this.removeAction(action.id);
      }); // tick

      if (this.tick) this.tick(time);
    } // Hook for sprite implementations

  }, {
    key: "init",
    value: function init() {
      console.log("- sprite hook", this.id, this.pos);
    }
  }]);

  return Sprite;
}();

exports["default"] = Sprite;