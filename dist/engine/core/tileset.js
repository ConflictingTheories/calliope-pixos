"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _queue = _interopRequireDefault(require("@Engine/core/queue.jsx"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

var Tileset = /*#__PURE__*/function () {
  function Tileset(engine) {
    _classCallCheck(this, Tileset);

    this.engine = engine;
    this.src = null;
    this.sheetSize = [0, 0];
    this.tileSize = 0;
    this.tiles = {};
    this.loaded = false;
    this.onLoadActions = new _queue["default"]();
    this.onDefinitionLoadActions = new _queue["default"]();
    this.onTextureLoaded = this.onTextureLoaded.bind(this);
  }

  _createClass(Tileset, [{
    key: "runWhenLoaded",
    value: function runWhenLoaded(action) {
      if (this.loaded) action();else this.onLoadActions.add(action);
    } // Actions to run after the tileset definition has loaded,
    // but before the texture is ready

  }, {
    key: "runWhenDefinitionLoaded",
    value: function runWhenDefinitionLoaded(action) {
      if (this.definitionLoaded) action();else this.onDefinitionLoadActions.add(action);
    } // Received tileset definition JSON

  }, {
    key: "onJsonLoaded",
    value: function onJsonLoaded(data) {
      var _this = this;

      // Merge tileset definition into this object
      Object.keys(data).map(function (k) {
        _this[k] = data[k];
      }); // Definition actions must always run before loaded actions

      this.definitionLoaded = true;
      this.onDefinitionLoadActions.run(); // load texture

      this.texture = this.engine.loadTexture(this.src);
      this.texture.runWhenLoaded(this.onTextureLoaded);
      console.log('texture loaded', this.texture); // set background colour

      if (this.bgColor) this.engine.gl.clearColor(this.bgColor[0] / 255, this.bgColor[1] / 255, this.bgColor[2] / 255, 1.0);
    } // run when loaded

  }, {
    key: "onTextureLoaded",
    value: function onTextureLoaded() {
      this.loaded = true;
      this.onLoadActions.run();
    } // Get vertices for tile

  }, {
    key: "getTileVertices",
    value: function getTileVertices(id, offset) {
      return this.geometry[id].vertices.map(function (poly) {
        return poly.map(function (vertex) {
          return [vertex[0] + offset[0], vertex[1] + offset[1], vertex[2] + offset[2]];
        });
      }).flat(3);
    } // get texture coordinates

  }, {
    key: "getTileTexCoords",
    value: function getTileTexCoords(id, texId) {
      var tileOffset = this.textures[texId];
      var size = [this.tileSize / this.sheetSize[0], this.tileSize / this.sheetSize[1]];
      return this.geometry[id].surfaces.map(function (poly) {
        return poly.map(function (vertex) {
          return [(vertex[0] + tileOffset[0]) * size[0], (vertex[1] + tileOffset[1]) * size[1]];
        });
      }).flat(3);
    } // determine walkability

  }, {
    key: "getWalkability",
    value: function getWalkability(tileId) {
      return this.geometry[tileId].type;
    } // get poly for walk

  }, {
    key: "getTileWalkPoly",
    value: function getTileWalkPoly(tileId) {
      return this.geometry[tileId].walkPoly;
    }
  }]);

  return Tileset;
}();

exports["default"] = Tileset;