"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _vector = require("../../../engine/utils/math/vector");

var _matrix = require("../../../engine/utils/math/matrix4");

var _resources = _interopRequireDefault(require("../../../engine/utils/resources"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/*                                                 *\
** ----------------------------------------------- **
**             Calliope - Site Generator   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2021 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */
var _default = {
  // Character art from http://opengameart.org/content/twelve-16x18-rpg-character-sprites-including-npcs-and-elementals
  src: _resources["default"].artResourceUrl("sewer.png"),
  sheetSize: [256, 256],
  tileSize: [16, 16],
  // Frames
  frames: {
    up: [[0, 144], [16, 144], [32, 144], [48, 144], [64, 144], [80, 144]]
  },
  drawOffset: new _vector.Vector(0, 1, 0.001),
  hotspotOffset: new _vector.Vector(0.5, 0.5, 0),
  lastTime: 0,
  accumTime: 0,
  blowTime: 0,
  frameTime: 150,
  // Initialize
  init: function init() {
    this.blowTime = 1000 + Math.random() * 5000;
  },
  // Update each frame
  tick: function tick(time) {
    if (this.lastTime == 0) {
      this.lastTime = time;
      return;
    } // wait enough time


    this.accumTime += time - this.lastTime;
    if (this.accumTime < this.frameTime || this.animFrame == 0 && this.accumTime < this.blowTime) return; // reset animation

    if (this.animFrame == 5) {
      this.setFrame(0);
      this.blowTime = 1000 + Math.random() * 4000;
    } else {
      this.setFrame(this.animFrame + 1);
      this.accumTime = 0;
      this.lastTime = time;
    }
  },
  // Draw Frame
  draw: function draw(engine) {
    if (!this.loaded) return;
    engine.mvPushMatrix();
    (0, _matrix.translate)(engine.uViewMat, engine.uViewMat, this.pos.toArray()); // Lie flat on the ground

    (0, _matrix.translate)(engine.uViewMat, engine.uViewMat, this.drawOffset.toArray());
    (0, _matrix.rotate)(engine.uViewMat, engine.uViewMat, engine.degToRad(90), [1, 0, 0]);
    engine.bindBuffer(this.vertexPosBuf, engine.shaderProgram.vertexPositionAttribute);
    engine.bindBuffer(this.vertexTexBuf, engine.shaderProgram.textureCoordAttribute);
    this.texture.attach(); // Draw

    engine.shaderProgram.setMatrixUniforms();
    engine.gl.drawArrays(engine.gl.TRIANGLES, 0, this.vertexPosBuf.numItems);
    engine.mvPopMatrix();
  }
};
exports["default"] = _default;