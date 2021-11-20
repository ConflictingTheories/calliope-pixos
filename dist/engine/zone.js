"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _enums = require("./utils/enums");

var _resources = _interopRequireDefault(require("./utils/resources"));

var _queue = _interopRequireDefault(require("./queue"));

var _loaders = require("./utils/loaders");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Zone = /*#__PURE__*/function () {
  function Zone(zoneId, world) {
    _classCallCheck(this, Zone);

    this.id = zoneId;
    this.world = world;
    this.data = {};
    this.spriteDict = {};
    this.spriteList = [];
    this.engine = world.engine;
    this.onLoadActions = new _queue["default"]();
    this.spriteLoader = new _loaders.SpriteLoader(world.engine);
    this.tsLoader = new _loaders.TilesetLoader(world.engine); // bind

    this.onTilesetDefinitionLoaded = this.onTilesetDefinitionLoaded.bind(this);
    this.onTilesetOrSpriteLoaded = this.onTilesetOrSpriteLoaded.bind(this);
    this.loadSprite = this.loadSprite.bind(this);
  } // Load Map Resource from URL


  _createClass(Zone, [{
    key: "loadRemote",
    value: function () {
      var _loadRemote = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var _this = this;

        var fileResponse, data;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return fetch(_resources["default"].zoneRequestUrl(this.id));

              case 2:
                fileResponse = _context.sent;

                if (!fileResponse.ok) {
                  _context.next = 25;
                  break;
                }

                _context.prev = 4;
                _context.next = 7;
                return fileResponse.json();

              case 7:
                data = _context.sent;
                this.bounds = data.bounds;
                this.size = [data.bounds[2] - data.bounds[0], data.bounds[3] - data.bounds[1]];
                this.cells = data.cells; // Load tileset and create level geometry & trigger updates

                _context.next = 13;
                return this.tsLoader.load(data.tileset);

              case 13:
                this.tileset = _context.sent;
                this.tileset.runWhenDefinitionLoaded(this.onTilesetDefinitionLoaded.bind(this));
                this.tileset.runWhenLoaded(this.onTilesetOrSpriteLoaded.bind(this)); // Load sprites from tileset

                _context.next = 18;
                return Promise.all(data.sprites.map(this.loadSprite));

              case 18:
                // Notify the zone sprites when the new sprite has loaded
                this.spriteList.forEach(function (sprite) {
                  return sprite.runWhenLoaded(_this.onTilesetOrSpriteLoaded.bind(_this));
                });
                _context.next = 25;
                break;

              case 21:
                _context.prev = 21;
                _context.t0 = _context["catch"](4);
                console.error("Error parsing zone " + this.id);
                console.error(_context.t0);

              case 25:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[4, 21]]);
      }));

      function loadRemote() {
        return _loadRemote.apply(this, arguments);
      }

      return loadRemote;
    }() // Load Tileset Directly (precompiled)

  }, {
    key: "load",
    value: function () {
      var _load = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        var _this2 = this;

        var data;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.prev = 0;
                // Extract and Read in Information
                data = require("../scene/maps/" + this.id + ".map.jsx")["default"];
                this.bounds = data.bounds;
                this.size = [data.bounds[2] - data.bounds[0], data.bounds[3] - data.bounds[1]];
                this.cells = data.cells; // Load tileset and create level geometry & trigger updates

                _context2.next = 7;
                return this.tsLoader.load(data.tileset);

              case 7:
                this.tileset = _context2.sent;
                this.tileset.runWhenDefinitionLoaded(this.onTilesetDefinitionLoaded.bind(this));
                this.tileset.runWhenLoaded(this.onTilesetOrSpriteLoaded.bind(this)); // Load sprites from tileset

                _context2.next = 12;
                return Promise.all(data.sprites.map(this.loadSprite));

              case 12:
                // Notify the zone sprites when the new sprite has loaded
                this.spriteList.forEach(function (sprite) {
                  return sprite.runWhenLoaded(_this2.onTilesetOrSpriteLoaded.bind(_this2));
                });
                _context2.next = 19;
                break;

              case 15:
                _context2.prev = 15;
                _context2.t0 = _context2["catch"](0);
                console.error("Error parsing zone " + this.id);
                console.error(_context2.t0);

              case 19:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[0, 15]]);
      }));

      function load() {
        return _load.apply(this, arguments);
      }

      return load;
    }() // Actions to run when the map has loaded

  }, {
    key: "runWhenLoaded",
    value: function runWhenLoaded(action) {
      if (this.loaded) action();else this.onLoadActions.add(action);
    } // When tileset loads

  }, {
    key: "onTilesetDefinitionLoaded",
    value: function onTilesetDefinitionLoaded() {
      this.vertexPosBuf = [];
      this.vertexTexBuf = [];
      this.walkability = []; // Determine Walkability and Load Vertices

      for (var j = 0, k = 0; j < this.size[1]; j++) {
        var vertices = [];
        var vertexTexCoords = []; // Loop over Tiles

        for (var i = 0; i < this.size[0]; i++, k++) {
          var cell = this.cells[k];
          this.walkability[k] = _enums.Direction.All;
          var n = Math.floor(cell.length / 3); // Calc Walk, Vertex positions and Textures for each cell

          for (var l = 0; l < n; l++) {
            var tilePos = [this.bounds[0] + i, this.bounds[1] + j, cell[3 * l + 2]];
            this.walkability[k] &= this.tileset.getWalkability(cell[3 * l]);
            vertices = vertices.concat(this.tileset.getTileVertices(cell[3 * l], tilePos));
            vertexTexCoords = vertexTexCoords.concat(this.tileset.getTileTexCoords(cell[3 * l], cell[3 * l + 1]));
          } // Custom walkability


          if (cell.length == 3 * n + 1) this.walkability[k] = cell[3 * n];
        }

        this.vertexPosBuf[j] = this.engine.createBuffer(vertices, this.engine.gl.STATIC_DRAW, 3);
        this.vertexTexBuf[j] = this.engine.createBuffer(vertexTexCoords, this.engine.gl.STATIC_DRAW, 2);
      }
    } // run after each tileset / sprite is loaded

  }, {
    key: "onTilesetOrSpriteLoaded",
    value: function onTilesetOrSpriteLoaded() {
      if (this.loaded || !this.tileset.loaded || !this.spriteList.every(function (sprite) {
        return sprite.loaded;
      })) return;
      console.log("Initialized zone '" + this.id + "'");
      this.loaded = true;
      this.onLoadActions.run();
    } // Load Sprite

  }, {
    key: "loadSprite",
    value: function () {
      var _loadSprite = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(data) {
        var newSprite;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                data.zone = this;
                _context3.next = 3;
                return this.spriteLoader.load(data.type, function (sprite) {
                  return sprite.onLoad(data);
                });

              case 3:
                newSprite = _context3.sent;
                this.spriteDict[data.id] = newSprite;
                this.spriteList.push(newSprite);

              case 6:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function loadSprite(_x) {
        return _loadSprite.apply(this, arguments);
      }

      return loadSprite;
    }() // Add an existing sprite to the zone

  }, {
    key: "addSprite",
    value: function addSprite(sprite) {
      sprite.zone = this;
      this.spriteDict[sprite.id] = sprite;
      this.spriteList.push(sprite);
    } // Remove an sprite from the zone

  }, {
    key: "removeSprite",
    value: function removeSprite(id) {
      this.spriteList = this.spriteList.filter(function (sprite) {
        return sprite.id !== id;
      });
      delete this.spriteDict[id];
    } // Calculate the height of a point in the zone

  }, {
    key: "getHeight",
    value: function getHeight(x, y) {
      if (!this.isInZone(x, y)) {
        console.error("Requesting height for [" + x + ", " + y + "] outside zone bounds");
        return 0;
      }

      var i = Math.floor(x);
      var j = Math.floor(y);
      var dp = [x - i, y - j]; // Calculate point inside a triangle

      var getUV = function getUV(t, p) {
        // Vectors relative to first vertex
        var u = [t[1][0] - t[0][0], t[1][1] - t[0][1]];
        var v = [t[2][0] - t[0][0], t[2][1] - t[0][1]]; // Calculate basis transformation

        var d = 1 / (u[0] * v[1] - u[1] * v[0]);
        var T = [d * v[1], -d * v[0], -d * u[1], d * u[0]]; // Return new coords

        u = (p[0] - t[0][0]) * T[0] + (p[1] - t[0][1]) * T[1];
        v = (p[0] - t[0][0]) * T[2] + (p[1] - t[0][1]) * T[3];
        return [u, v];
      }; // Check if any of the tiles defines a custom walk polygon


      var cell = this.cells[(j - this.bounds[1]) * this.size[0] + i - this.bounds[0]];
      var n = Math.floor(cell.length / 3);

      for (var l = 0; l < n; l++) {
        var poly = this.tileset.getTileWalkPoly(cell[3 * l]);
        if (!poly) continue; // Loop over triangles

        for (var p = 0; p < poly.length; p++) {
          var uv = getUV(poly[p], dp);
          var w = uv[0] + uv[1];
          if (w <= 1) return cell[3 * l + 2] + (1 - w) * poly[p][0][2] + uv[0] * poly[p][1][2] + uv[1] * poly[p][2][2];
        }
      } // Use the height of the first tile in the cell


      return cell[2];
    } // Draw Row of Zone

  }, {
    key: "drawRow",
    value: function drawRow(row) {
      this.engine.bindBuffer(this.vertexPosBuf[row], this.engine.shaderProgram.vertexPositionAttribute);
      this.engine.bindBuffer(this.vertexTexBuf[row], this.engine.shaderProgram.textureCoordAttribute);
      this.tileset.texture.attach();
      this.engine.shaderProgram.setMatrixUniforms();
      this.engine.gl.drawArrays(this.engine.gl.TRIANGLES, 0, this.vertexPosBuf[row].numItems);
    } // Draw Frame

  }, {
    key: "draw",
    value: function draw() {
      if (!this.loaded) return; // Organize by Depth

      this.spriteList.sort(function (a, b) {
        return a.pos.y - b.pos.y;
      });
      this.engine.mvPushMatrix();
      this.engine.setCamera(); // Draw Terrain

      var k = 0;

      for (var j = 0; j < this.size[1]; j++) {
        this.drawRow(j);

        while (k < this.spriteList.length && this.spriteList[k].pos.y - this.bounds[1] <= j) {
          this.spriteList[k++].draw(this.engine);
        }
      } // draw each Sprite


      while (k < this.spriteList.length) {
        this.spriteList[k++].draw(this.engine);
      }

      this.engine.mvPopMatrix();
    } // Update

  }, {
    key: "tick",
    value: function tick(time) {
      if (!this.loaded) return;
      this.spriteList.forEach( /*#__PURE__*/function () {
        var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(sprite) {
          return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
              switch (_context4.prev = _context4.next) {
                case 0:
                  return _context4.abrupt("return", sprite.tickOuter(time));

                case 1:
                case "end":
                  return _context4.stop();
              }
            }
          }, _callee4);
        }));

        return function (_x2) {
          return _ref.apply(this, arguments);
        };
      }());
    } // Check for zone inclusion

  }, {
    key: "isInZone",
    value: function isInZone(x, y) {
      return x >= this.bounds[0] && y >= this.bounds[1] && x < this.bounds[2] && y < this.bounds[3];
    } // Cell Walkable

  }, {
    key: "isWalkable",
    value: function isWalkable(x, y, direction) {
      if (!this.isInZone(x, y)) return null;
      return (this.walkability[(y - this.bounds[1]) * this.size[0] + x - this.bounds[0]] & direction) != 0;
    }
  }]);

  return Zone;
}();

exports["default"] = Zone;