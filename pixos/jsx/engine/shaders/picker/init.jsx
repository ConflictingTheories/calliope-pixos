export default function init(effectProgram) {
  const gl = this.gl;

  console.log({ msg: 'picker shader program - made it' });

  // Vertices
  shaderProgram.aVertexPosition = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
  gl.enableVertexAttribArray(shaderProgram.aVertexPosition);

  // Uniform Locations
  shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, 'uProjectionMatrix');
  shaderProgram.mMatrixUniform = gl.getUniformLocation(shaderProgram, 'uModelMatrix');
  shaderProgram.vMatrixUniform = gl.getUniformLocation(shaderProgram, 'uViewMatrix');
  shaderProgram.scale = gl.getUniformLocation(shaderProgram, 'u_scale');

  // return
  return effectProgram;
}
