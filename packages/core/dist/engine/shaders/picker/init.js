"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = init;
/*                                                 *\
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

function init(shaderProgram) {
  var gl = this.engine.gl;
  var self = this;

  // Get attribute locations - CRITICAL for picking to work!
  shaderProgram.aVertexPosition = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
  if (shaderProgram.aVertexPosition >= 0) {
    gl.enableVertexAttribArray(shaderProgram.aVertexPosition);
  }
  shaderProgram.aTextureCoord = gl.getAttribLocation(shaderProgram, 'aTextureCoord');
  if (shaderProgram.aTextureCoord >= 0) {
    gl.enableVertexAttribArray(shaderProgram.aTextureCoord);
  }
  shaderProgram.aVertexNormal = gl.getAttribLocation(shaderProgram, 'aVertexNormal');
  if (shaderProgram.aVertexNormal >= 0) {
    gl.enableVertexAttribArray(shaderProgram.aVertexNormal);
  }

  // Uniform Locations
  shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, 'uProjectionMatrix');
  shaderProgram.mMatrixUniform = gl.getUniformLocation(shaderProgram, 'uModelMatrix');
  shaderProgram.vMatrixUniform = gl.getUniformLocation(shaderProgram, 'uViewMatrix');
  shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, 'uSampler');
  shaderProgram.useSampler = gl.getUniformLocation(shaderProgram, 'useSampler');
  shaderProgram.scale = gl.getUniformLocation(shaderProgram, 'u_scale');
  shaderProgram.id = gl.getUniformLocation(shaderProgram, 'u_id');
  shaderProgram.setMatrixUniforms = function (_ref) {
    var _ref$scale = _ref.scale,
      scale = _ref$scale === void 0 ? null : _ref$scale,
      _ref$id = _ref.id,
      id = _ref$id === void 0 ? null : _ref$id,
      _ref$sampler = _ref.sampler,
      sampler = _ref$sampler === void 0 ? 1.0 : _ref$sampler;
    // NOTE: Caller (RenderManager.activatePickerShaderProgram) ensures this program is active.
    // Do NOT call gl.useProgram here - it would interfere with render pass state management.

    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, self.uProjMat);
    gl.uniformMatrix4fv(shaderProgram.mMatrixUniform, false, self.uModelMat);
    gl.uniformMatrix4fv(shaderProgram.vMatrixUniform, false, self.camera.uViewMat);
    gl.uniform3fv(shaderProgram.scale, scale ? scale.toArray() : self.scale.toArray());
    gl.uniform4fv(shaderProgram.id, id ? id : [1.0, 0.0, 0.0, 0.0]);
    gl.uniform1f(shaderProgram.useSampler, sampler);
    gl.uniform1i(shaderProgram.samplerUniform, 0);
  };

  // return
  return shaderProgram;
}