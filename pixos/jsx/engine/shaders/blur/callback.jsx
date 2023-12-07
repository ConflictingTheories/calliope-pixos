export default function callback(effectProgram) {
  // Depth of Field Blur Effect
  const gl = this.gl;

  console.log({ msg: 'made it' });

  effectProgram.hblurBuffer = gl.createFramebuffer();
  effectProgram.dofUniformBuffer = gl.createBuffer();

  // Configure Shader
  effectProgram.texelOffsetLocation = gl.getUniformLocation(effectProgram, 'uTexelOffset');
  effectProgram.textureLocation = gl.getUniformLocation(effectProgram, 'uColor');
  effectProgram.depthLocation = gl.getUniformLocation(effectProgram, 'uDepth');

  effectProgram.quadArray = gl.createVertexArray();
  gl.bindVertexArray(effectProgram.quadArray);

  effectProgram.quadPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, effectProgram.quadPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, 1,
      -1, -1,
      1, -1,
      -1, 1,
      1, -1,
      1, 1,
  ]), gl.STATIC_DRAW);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(0);

  effectProgram.depthTarget = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, effectProgram.depthTarget);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texStorage2D(gl.TEXTURE_2D, 1, gl.DEPTH_COMPONENT16, gl.drawingBufferWidth, gl.drawingBufferHeight);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, effectProgram.depthTarget, 0);

  gl.bindFramebuffer(gl.FRAMEBUFFER, effectProgram.hblurBuffer);

  effectProgram.hblurTarget = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, effectProgram.hblurTarget);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA8, gl.drawingBufferWidth, gl.drawingBufferHeight);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, effectProgram.hblurTarget, 0);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  // draw
  effectProgram.draw = function () {
    gl.uniform1i(effectProgram.depthLocation, 2);

    ////////////////////
    // HORIZONTAL BLUR
    ////////////////////

    gl.bindFramebuffer(gl.FRAMEBUFFER, effectProgram.hblurBuffer);
    gl.bindVertexArray(effectProgram.quadArray);
    gl.bindBufferBase(gl.UNIFORM_BUFFER, 2, effectProgram.dofUniformBuffer);
    gl.bindBuffer(gl.UNIFORM_BUFFER, effectProgram.dofUniformBuffer);

    gl.uniform1i(effectProgram.textureLocation, 1);
    gl.uniform2fv(effectProgram.texelOffsetLocation, [1.0, 0.0]);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    ////////////////////
    // VERTICAL BLUR
    ////////////////////

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindVertexArray(effectProgram.quadArray);
    gl.uniform1i(effectProgram.textureLocation, 3);
    gl.uniform2fv(effectProgram.texelOffsetLocation, [0.0, 1.0]);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };

  // return
  return effectProgram;
}
