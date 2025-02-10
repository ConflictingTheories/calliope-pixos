export default function init(shaderProgram) {
  const { gl } = this.engine;
  const self = this;

  // Vertices
  shaderProgram.aVertexNormal = gl.getAttribLocation(shaderProgram, 'aVertexNormal');
  gl.enableVertexAttribArray(shaderProgram.aVertexNormal);

  // Uniform Locations
  shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, 'uProjectionMatrix');
  shaderProgram.mMatrixUniform = gl.getUniformLocation(shaderProgram, 'uModelMatrix');
  shaderProgram.vMatrixUniform = gl.getUniformLocation(shaderProgram, 'uViewMatrix');
  shaderProgram.scale = gl.getUniformLocation(shaderProgram, 'u_scale');
  shaderProgram.id = gl.getUniformLocation(shaderProgram, 'u_id');

  shaderProgram.setMatrixUniforms = ({
    scale = null,
    id = null,
  }) => {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, self.uProjMat);
    gl.uniformMatrix4fv(shaderProgram.mMatrixUniform, false, self.uModelMat);
    gl.uniformMatrix4fv(shaderProgram.vMatrixUniform, false, self.camera.uViewMat);
    gl.uniform3fv(shaderProgram.scale, scale ? scale.toArray() : self.scale.toArray());
    gl.uniform4fv(shaderProgram.id, id ? id : [1.0, 0.0, 0.0, 0.0]);
  };

  // return
  return shaderProgram;
}
