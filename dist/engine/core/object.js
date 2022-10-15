"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _vector = require("@Engine/utils/math/vector.jsx");

var _enums = require("@Engine/utils/enums.jsx");

var _queue = _interopRequireDefault(require("./queue.jsx"));

var _index = require("@Engine/utils/loaders/index.jsx");

var _matrix = require("@Engine/utils/math/matrix4.jsx");

var _utils = require("@Engine/utils/obj/utils.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

var ModelObject = /*#__PURE__*/function () {
  function ModelObject(engine) {
    _classCallCheck(this, ModelObject);

    this.engine = engine;
    this.templateLoaded = false;
    this.drawOffset = new _vector.Vector(0, 0, 0);
    this.hotspotOffset = new _vector.Vector(0, 0, 0);
    this.pos = new _vector.Vector(0, 0, 0);
    this.size = new _vector.Vector(1, 1, 1);
    this.scale = new _vector.Vector(1, 1, 1);
    this.rotation = new _vector.Vector(0, 0, 0);
    this.facing = _enums.Direction.Right;
    this.actionDict = {};
    this.actionList = [];
    this.speech = {};
    this.portrait = null;
    this.onLoadActions = new _queue["default"]();
    this.inventory = [];
    this.onTilesetOrTextureLoaded = this.onTilesetOrTextureLoaded.bind(this);
    this.blocking = true; // default - cannot passthrough

    this.override = false;
  }

  _createClass(ModelObject, [{
    key: "update",
    value: function update(data) {
      Object.assign(this, data);
    }
  }, {
    key: "runWhenLoaded",
    value: function runWhenLoaded(action) {
      if (this.loaded) action();else this.onLoadActions.add(action);
    } // Load Object and Materials

  }, {
    key: "onLoad",
    value: function onLoad(instanceData) {
      if (this.loaded) return; // Zone Information

      this.zone = instanceData.zone;
      if (instanceData.id) this.id = instanceData.id;
      if (instanceData.pos) (0, _vector.set)(instanceData.pos, this.pos);
      if (instanceData.rotation) (0, _vector.set)(instanceData.rotation, this.rotation);
      if (instanceData.facing && instanceData.facing !== 0) this.facing = instanceData.facing;
      if (instanceData.zones && instanceData.zones !== null) this.zones = instanceData.zones;
      var mesh = instanceData.mesh; // Mesh bounds

      var maxX,
          minX = null;
      var maxY,
          minY = null;
      var maxZ,
          minZ = null;

      for (var i = 0; i < mesh.vertices.length; i = i + 3) {
        var v = mesh.vertices.slice(i, i + 3); // calculate size

        if (maxX == null || v[0] > maxX) maxX = v[0];
        if (minX == null || v[0] < minX) minX = v[0];
        if (maxY == null || v[1] > maxY) maxY = v[1];
        if (minY == null || v[1] < minY) minY = v[1];
        if (maxZ == null || v[2] > maxZ) maxZ = v[2];
        if (minZ == null || v[2] < minZ) minZ = v[2];
      } // normalize x, y to fit in tile (todo)


      var size = new _vector.Vector(maxX - minX, maxZ - minZ, maxY - minY);
      this.size = size;
      this.scale = new _vector.Vector(1 / Math.max(size.x, size.z), 1 / Math.max(size.x, size.z), 1 / Math.max(size.x, size.z));
      if (instanceData.useScale) this.scale = instanceData.useScale;
      this.drawOffset = new _vector.Vector(0.5, 0.5, 0); // mesh buffers

      this.mesh = mesh;
      this.engine.objLoader.initMeshBuffers(this.engine.gl, this.mesh); // Speech bubble

      if (this.enableSpeech) {
        this.speech = this.engine.loadSpeech(this.id, this.engine.mipmap);
        this.speech.runWhenLoaded(this.onTilesetOrTextureLoaded.bind(this));
        this.speechTexBuf = this.engine.createBuffer(this.getSpeechBubbleTexture(), this.engine.gl.DYNAMIC_DRAW, 2);
      } // load Portrait


      if (this.portraitSrc) {
        this.portrait = this.engine.loadTexture(this.portraitSrc);
        this.portrait.runWhenLoaded(this.onTilesetOrTextureLoaded.bind(this));
      } //


      this.zone.tileset.runWhenDefinitionLoaded(this.onTilesetDefinitionLoaded.bind(this));
    } // Definition Loaded

  }, {
    key: "onTilesetDefinitionLoaded",
    value: function onTilesetDefinitionLoaded() {
      this.zone.tileset.runWhenLoaded(this.onTilesetOrTextureLoaded.bind(this));
    } // After Tileset / Texture Loaded

  }, {
    key: "onTilesetOrTextureLoaded",
    value: function onTilesetOrTextureLoaded() {
      if (!this || this.loaded || this.enableSpeech && this.speech && !this.speech.loaded || this.portrait && !this.portrait.loaded) return;
      this.init(); // Hook for sprite implementations

      if (this.enableSpeech && this.speech) {
        if (this.speech.clearHud) {
          this.speech.clearHud();
          this.speech.writeText(this.id);
          this.speech.loadImage();
        }
      }

      this.loaded = true;
      this.onLoadActions.run();
    } // Speech Area texture

  }, {
    key: "getSpeechBubbleTexture",
    value: function getSpeechBubbleTexture() {
      return [[1.0, 1.0], [0.0, 1.0], [0.0, 0.0], [1.0, 1.0], [0.0, 0.0], [1.0, 0.0]].flat(3);
    } // speech bubble position

  }, {
    key: "getSpeechBubbleVertices",
    value: function getSpeechBubbleVertices() {
      return [_construct(_vector.Vector, [2, 0, 4]).toArray(), _construct(_vector.Vector, [0, 0, 4]).toArray(), _construct(_vector.Vector, [0, 0, 2]).toArray(), _construct(_vector.Vector, [2, 0, 4]).toArray(), _construct(_vector.Vector, [0, 0, 2]).toArray(), _construct(_vector.Vector, [2, 0, 2]).toArray()].flat(3);
    }
  }, {
    key: "attach",
    value: function attach(texture) {
      var gl = this.engine.gl;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(this.engine.shaderProgram.diffuseMapUniform, 0);
    } // draw obj model with materials

  }, {
    key: "drawTexturedObj",
    value: function drawTexturedObj() {
      var _this = this;

      var engine = this.engine,
          mesh = this.mesh; // draw each piece of the object (per material)

      if (mesh.indicesPerMaterial.length >= 1 && Object.keys(mesh.materialsByIndex).length > 0) {
        mesh.indicesPerMaterial.forEach(function (x, i) {
          var _mesh$materialsByInde, _mesh$materialsByInde2;

          // vertices
          engine.bindBuffer(mesh.vertexBuffer, engine.shaderProgram.aVertexPosition); // texture

          engine.bindBuffer(mesh.textureBuffer, engine.shaderProgram.aTextureCoord); // normal

          engine.bindBuffer(mesh.normalBuffer, engine.shaderProgram.aVertexNormal); // Diffuse

          engine.gl.uniform3fv(engine.shaderProgram.uDiffuse, mesh.materialsByIndex[i].diffuse);
          engine.gl.uniform1f(engine.shaderProgram.uSpecularExponent, mesh.materialsByIndex[i].specularExponent); // TODO -- Texture is not being displayed (needs fixing)

          if ((_mesh$materialsByInde = mesh.materialsByIndex[i]) !== null && _mesh$materialsByInde !== void 0 && (_mesh$materialsByInde2 = _mesh$materialsByInde.mapDiffuse) !== null && _mesh$materialsByInde2 !== void 0 && _mesh$materialsByInde2.glTexture) _this.attach(mesh.materialsByIndex[i].mapDiffuse.glTexture); // Specular

          engine.gl.uniform3fv(engine.shaderProgram.uSpecular, mesh.materialsByIndex[i].specular); // Specular Exponent

          engine.gl.uniform1f(engine.shaderProgram.uSpecularExponent, mesh.materialsByIndex[i].specularExponent); // indices

          var bufferInfo = (0, _utils._buildBuffer)(engine.gl, engine.gl.ELEMENT_ARRAY_BUFFER, x, 1);
          engine.gl.bindBuffer(engine.gl.ELEMENT_ARRAY_BUFFER, bufferInfo);
          engine.shaderProgram.setMatrixUniforms(_this.scale, 0.0);
          engine.gl.drawElements(engine.gl.TRIANGLES, bufferInfo.numItems, engine.gl.UNSIGNED_SHORT, 0);
        });
      } else {
        // no materials
        // vertices
        engine.bindBuffer(mesh.vertexBuffer, engine.shaderProgram.aVertexPosition);
        engine.bindBuffer(mesh.normalBuffer, engine.shaderProgram.aVertexNormal);
        engine.bindBuffer(mesh.textureBuffer, engine.shaderProgram.aTextureCoord);
        engine.gl.bindBuffer(engine.gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer); // Diffuse

        engine.gl.uniform3fv(engine.shaderProgram.uDiffuse, [0.6, 0.3, 0.6]); // Specular

        engine.gl.uniform3fv(engine.shaderProgram.uSpecular, [0.1, 0.1, 0.2]); // Specular Exponent

        engine.gl.uniform1f(engine.shaderProgram.uSpecularExponent, 2);
        engine.shaderProgram.setMatrixUniforms(this.scale, 0.0);
        engine.gl.drawElements(engine.gl.TRIANGLES, mesh.indexBuffer.numItems, engine.gl.UNSIGNED_SHORT, 0);
      }
    } // draw object with textures / materials

  }, {
    key: "drawObj",
    value: function drawObj() {
      var engine = this.engine,
          mesh = this.mesh;
      engine.gl.disableVertexAttribArray(engine.shaderProgram.aTextureCoord);
      engine.bindBuffer(mesh.vertexBuffer, engine.shaderProgram.aVertexPosition);
      engine.bindBuffer(mesh.normalBuffer, engine.shaderProgram.aVertexNormal);
      engine.gl.bindBuffer(engine.gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
      engine.shaderProgram.setMatrixUniforms(this.scale, 1.0);
      engine.gl.drawElements(engine.gl.TRIANGLES, mesh.indexBuffer.numItems, engine.gl.UNSIGNED_SHORT, 0);
    } // Draw Object

  }, {
    key: "draw",
    value: function draw() {
      if (!this.loaded) return;
      var engine = this.engine,
          mesh = this.mesh; // setup obj attributes

      engine.gl.enableVertexAttribArray(engine.shaderProgram.aVertexNormal);
      engine.gl.enableVertexAttribArray(engine.shaderProgram.aTextureCoord); // initialize buffers

      engine.mvPushMatrix(); // position object

      (0, _matrix.translate)(this.engine.uViewMat, this.engine.uViewMat, this.drawOffset.toArray());
      (0, _matrix.translate)(this.engine.uViewMat, this.engine.uViewMat, this.pos.toArray());
      (0, _matrix.rotate)(this.engine.uViewMat, this.engine.uViewMat, this.engine.degToRad(90), [1, 0, 0]); // rotate object

      if (this.rotation && this.rotation.toArray) {
        var rotation = Math.max.apply(Math, _toConsumableArray(this.rotation.toArray()));
        if (rotation > 0) (0, _matrix.rotate)(this.engine.uViewMat, this.engine.uViewMat, this.engine.degToRad(rotation), [this.rotation.x / rotation, this.rotation.y / rotation, this.rotation.z / rotation]);
      } // Draw Object


      if (!mesh.textures.length) {
        this.drawObj();
      } else {
        this.drawTexturedObj();
      }

      engine.mvPopMatrix(); // clear obj rendering attributes

      engine.gl.enableVertexAttribArray(engine.shaderProgram.aTextureCoord);
      engine.gl.disableVertexAttribArray(engine.shaderProgram.aVertexNormal);
    } // Set Facing

  }, {
    key: "setFacing",
    value: // Set Facing
    function setFacing(facing) {
      if (facing) this.facing = facing;
      this.rotation = _enums.Direction.objectSequence(facing);
    } // Set Facing

  }, {
    key: "addAction",
    value: // Add Action to Queue
    function addAction(action) {
      if (this.actionDict[action.id]) this.removeAction(action.id);
      this.actionDict[action.id] = action;
      this.actionList.push(action);
    } // Remove Action

  }, {
    key: "removeAction",
    value: function removeAction(id) {
      this.actionList = this.actionList.filter(function (action) {
        return action.id !== id;
      });
      delete this.actionDict[id];
    } // Remove Action

  }, {
    key: "removeAllActions",
    value: function removeAllActions() {
      this.actionList = [];
      this.actionDict = {};
    } // Tick

  }, {
    key: "tickOuter",
    value: function tickOuter(time) {
      var _this2 = this;

      if (!this.loaded) return; // Sort activities by increasing startTime, then by id

      this.actionList.sort(function (a, b) {
        var dt = a.startTime - b.startTime;
        if (!dt) return dt;
        return a.id > b.id ? 1 : -1;
      }); // Run & Queue for Removal when complete

      var toRemove = [];
      this.actionList.forEach(function (action) {
        if (!action.loaded || action.startTime > time) return;

        if (action.tick(time)) {
          toRemove.push(action); // remove from backlog

          action.onComplete(); // call completion handler
        }
      }); // clear completed activities

      toRemove.forEach(function (action) {
        return _this2.removeAction(action.id);
      }); // tick

      if (this.tick) this.tick(time);
    } // Hook for sprite implementations

  }, {
    key: "init",
    value: function init() {
      console.log("- sprite hook", this.id, this.pos);
    } // speak

  }, {
    key: "speak",
    value: function speak(text) {
      var showBubble = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      if (!text) this.speech.clearHud();else {
        var _this$portrait;

        this.textbox = this.engine.scrollText(this.id + ":> " + text, true, {
          portrait: (_this$portrait = this.portrait) !== null && _this$portrait !== void 0 ? _this$portrait : false
        });

        if (showBubble && this.speech) {
          var _this$portrait2;

          this.speech.scrollText(text, false, {
            portrait: (_this$portrait2 = this.portrait) !== null && _this$portrait2 !== void 0 ? _this$portrait2 : false
          });
          this.speech.loadImage();
        }
      }
    } // handles interaction -- default (should be overridden in definition)

  }, {
    key: "interact",
    value: function interact(sprite, finish) {
      var ret = null; // React based on internal state

      switch (this.state) {
        default:
          break;
      } // If completion handler passed through - call it when done


      if (finish) finish(true);
      return ret;
    }
  }, {
    key: "faceDir",
    value: function faceDir(facing) {
      if (this.facing == facing || facing === _enums.Direction.None) return null;
      return new _index.ActionLoader(this.engine, "face", [facing], this);
    } // set message (for chat bubbles)

  }, {
    key: "setGreeting",
    value: function setGreeting(greeting) {
      if (this.speech.clearHud) {
        this.speech.clearHud();
      }

      this.speech.writeText(greeting);
      this.speech.loadImage();
      return new _index.ActionLoader(this.engine, "greeting", [greeting, {
        autoclose: true
      }], this);
    }
  }]);

  return ModelObject;
}();

exports["default"] = ModelObject;