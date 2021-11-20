"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _matrix = require("./utils/math/matrix4.jsx");

var _vector = require("./utils/math/vector.jsx");

var _texture = _interopRequireDefault(require("./texture"));

var _hud = require("./hud");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var GLEngine = /*#__PURE__*/function () {
  function GLEngine(canvas, hud, width, height) {
    var _this = this;

    _classCallCheck(this, GLEngine);

    _defineProperty(this, "initShaderProgram", function (gl, _ref) {
      var vsSource = _ref.vs,
          fsSource = _ref.fs;
      var self = _this;

      var vertexShader = _this.loadShader(gl, gl.VERTEX_SHADER, vsSource);

      var fragmentShader = _this.loadShader(gl, gl.FRAGMENT_SHADER, fsSource); // generate shader


      var shaderProgram = gl.createProgram();
      gl.attachShader(shaderProgram, vertexShader);
      gl.attachShader(shaderProgram, fragmentShader);
      gl.linkProgram(shaderProgram);

      if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        throw new Error("WebGL unable to initialize the shader program: ".concat(gl.getshaderProgramLog(shaderProgram)));
      } // Configure Shader


      gl.useProgram(shaderProgram); // Vertices

      shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
      gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute); // Texture Coord

      shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
      gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute); // Uniform Locations

      shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
      shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
      shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler"); // Uniform apply

      shaderProgram.setMatrixUniforms = function () {
        gl.uniformMatrix4fv(this.pMatrixUniform, false, self.uProjMat);
        gl.uniformMatrix4fv(this.mvMatrixUniform, false, self.uViewMat);
      }; // return


      _this.shaderProgram = shaderProgram;
      return shaderProgram;
    });

    this.uViewMat = (0, _matrix.create)();
    this.uProjMat = (0, _matrix.create)();
    this.canvas = canvas;
    this.hud = hud;
    this.width = width;
    this.height = height;
    this.modelViewMatrixStack = [];
    this.globalStore = {};
    this.textures = [];
    this.cameraAngle = 45;
    this.cameraPosition = new _vector.Vector(0, 0, 0);
    this.cameraOffset = new _vector.Vector(0, 0, 0);
    this.setCamera = this.setCamera.bind(this);
    this.render = this.render.bind(this);
  } // Initialize a Scene object


  _createClass(GLEngine, [{
    key: "init",
    value: function () {
      var _init = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(scene, keyboard) {
        var ctx, gl;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                ctx = this.hud.getContext("2d");
                gl = this.canvas.getContext("webgl");

                if (gl) {
                  _context.next = 4;
                  break;
                }

                throw new Error("WebGL : unable to initialize");

              case 4:
                if (ctx) {
                  _context.next = 6;
                  break;
                }

                throw new Error("Canvas : unable to initialize HUD");

              case 6:
                this.gl = gl;
                this.ctx = ctx;
                this.time = new Date().getTime();
                this.scene = scene;
                this.keyboard = keyboard; // Configure HUD

                ctx.canvas.width = this.canvas.width;
                ctx.canvas.height = this.canvas.height; // Configure GL

                gl.viewportWidth = this.canvas.width;
                gl.viewportHeight = this.canvas.height;
                gl.clearColor(0, 1.0, 0, 1.0);
                gl.clearDepth(1.0);
                gl.enable(gl.DEPTH_TEST);
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                gl.enable(gl.BLEND);
                this.initializedWebGl = true; // flag
                // Initialize Shader

                this.initShaderProgram(gl, scene.shaders); // Initialize Project Matrix

                this.initProjection(gl); // Initialize Scene

                _context.next = 25;
                return scene.init(this);

              case 25:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function init(_x, _x2) {
        return _init.apply(this, arguments);
      }

      return init;
    }() // Load and Compile Shader Source

  }, {
    key: "loadShader",
    value: function loadShader(gl, type, source) {
      var shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader); // if error clear

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        var log = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error("An error occurred compiling the shaders: ".concat(log));
      }

      return shader;
    } // Initialize Shader Program

  }, {
    key: "initProjection",
    value: // Set FOV and Perspective
    function initProjection(gl) {
      var fieldOfView = this.degToRad(45);
      var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
      var zNear = 0.1;
      var zFar = 100.0;
      this.uProjMat = (0, _matrix.perspective)(fieldOfView, aspect, zNear, zFar);
      this.uViewMat = (0, _matrix.create)();
      this.uProjMat[5] *= -1;
    } // Set Camera Pos & Angle

  }, {
    key: "setCamera",
    value: function setCamera() {
      (0, _matrix.translate)(this.uViewMat, this.uViewMat, [0.0, 0.0, -15.0]);
      (0, _matrix.rotate)(this.uViewMat, this.uViewMat, this.degToRad(this.cameraAngle), [1, 0, 0]);
      (0, _vector.negate)(this.cameraPosition, this.cameraOffset);
      (0, _matrix.translate)(this.uViewMat, this.uViewMat, this.cameraOffset.toArray());
    } // Clear Screen with Color (RGBA)

  }, {
    key: "clearScreen",
    value: function clearScreen() {
      var gl = this.gl;
      gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      (0, _matrix.perspective)(this.degToRad(45), gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, this.uProjMat);
      this.uViewMat = (0, _matrix.create)();
    } // clear HUD overlay

  }, {
    key: "clearHud",
    value: function clearHud() {
      var ctx = this.ctx;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    } // Write Text to HUD

  }, {
    key: "writeText",
    value: function writeText(text, x, y) {
      var ctx = this.ctx;
      ctx.save();
      ctx.font = "20px minecraftia";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "white";
      ctx.fillText(text, x !== null && x !== void 0 ? x : ctx.canvas.width / 2, y !== null && y !== void 0 ? y : ctx.canvas.height / 2);
      ctx.restore();
    } // Greeting Text

  }, {
    key: "setGreeting",
    value: function setGreeting(text) {
      this.globalStore.greeting = text;
    } // Scrolling Textbox

  }, {
    key: "scrollText",
    value: function scrollText(text) {
      var scrolling = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var txt = new _hud.textScrollBox(this.ctx);
      txt.init(text, 10, 2 * this.canvas.height / 3, this.canvas.width - 20, this.canvas.height / 3 - 20, options);

      if (scrolling) {
        txt.scroll((Math.sin(new Date().getTime() / 3000) + 1) * txt.maxScroll * 0.5); // default oscillate
      }

      txt.render();
      return txt;
    } // Draws a button

  }, {
    key: "drawButton",
    value: function drawButton(x, y, w, h, colours) {
      var ctx = this.ctx;
      var halfHeight = h / 2;
      ctx.save(); // draw the button

      ctx.fillStyle = colours.background;
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.rect(x, y, w, h);
      ctx.fill();
      ctx.clip(); // light gradient

      var grad = ctx.createLinearGradient(x, y, x, y + halfHeight);
      grad.addColorStop(0, "rgb(221,181,155)");
      grad.addColorStop(1, "rgb(22,13,8)");
      ctx.fillStyle = grad;
      ctx.globalAlpha = 0.5;
      ctx.fillRect(x, y, w, h); // draw the top half of the button

      ctx.fillStyle = colours.top; // draw the top and bottom particles

      for (var i = 0; i < h; i += halfHeight) {
        ctx.fillStyle = i === 0 ? colours.top : colours.bottom;

        for (var j = 0; j < 50; j++) {
          // get random values for particle
          var partX = x + Math.random() * w;
          var partY = y + i + Math.random() * halfHeight;
          var width = Math.random() * 10;
          var height = Math.random() * 10;
          var rotation = Math.random() * 360;
          var alpha = Math.random();
          ctx.save(); // rotate the canvas by 'rotation'

          ctx.translate(partX, partY);
          ctx.rotate(rotation * Math.PI / 180);
          ctx.translate(-partX, -partY); // set alpha transparency to 'alpha'

          ctx.globalAlpha = alpha;
          ctx.fillRect(partX, partY, width, height);
          ctx.restore();
        }
      }

      ctx.restore();
    } // Render Frame

  }, {
    key: "render",
    value: function render() {
      var _this$globalStore$gre;

      this.requestId = requestAnimationFrame(this.render);
      this.clearScreen();
      this.clearHud();
      this.scene.render(this, new Date().getTime());
      this.writeText((_this$globalStore$gre = this.globalStore.greeting) !== null && _this$globalStore$gre !== void 0 ? _this$globalStore$gre : ""); // greeting text
    } // individual buffer

  }, {
    key: "createBuffer",
    value: function createBuffer(contents, type, itemSize) {
      var gl = this.gl;
      var buf = gl.createBuffer();
      buf.itemSize = itemSize;
      buf.numItems = contents.length / itemSize;
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(contents), type);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      return buf;
    } // update buffer

  }, {
    key: "updateBuffer",
    value: function updateBuffer(buffer, contents) {
      var gl = this.gl;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(contents));
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
    } // bind buffer

  }, {
    key: "bindBuffer",
    value: function bindBuffer(buffer, attribute) {
      var gl = this.gl;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.vertexAttribPointer(attribute, buffer.itemSize, gl.FLOAT, false, 0, 0);
    } // load texture

  }, {
    key: "loadTexture",
    value: function loadTexture(src) {
      if (this.textures[src]) return this.textures[src];
      this.textures[src] = new _texture["default"](src, this);
      return this.textures[src];
    } // push new matrix to model stack

  }, {
    key: "mvPushMatrix",
    value: function mvPushMatrix() {
      var copy = (0, _matrix.create)();
      (0, _matrix.set)(this.uViewMat, copy);
      this.modelViewMatrixStack.push(copy);
    } // pop model stack and apply view

  }, {
    key: "mvPopMatrix",
    value: function mvPopMatrix() {
      if (this.modelViewMatrixStack.length == 0) {
        throw "Invalid popMatrix!";
      }

      this.uViewMat = this.modelViewMatrixStack.pop();
    } // Clear Render Loop

  }, {
    key: "close",
    value: function close() {
      cancelAnimationFrame(this.requestId);
    } // Degrees to Radians

  }, {
    key: "degToRad",
    value: function degToRad(degrees) {
      return degrees * Math.PI / 180;
    }
  }]);

  return GLEngine;
}();

exports["default"] = GLEngine;