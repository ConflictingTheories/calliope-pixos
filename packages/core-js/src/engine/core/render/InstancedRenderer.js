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

/**
 * InstancedRenderer - Provides instanced rendering for sprites and other entities.
 * Groups entities by texture/shader and renders them in batches using WebGL2 instancing.
 * 
 * This significantly reduces draw calls when rendering many similar objects.
 * For example: 100 sprites with the same texture = 1 draw call instead of 100.
 */
export default class InstancedRenderer {
  /**
   * Creates an instance of InstancedRenderer.
   * @param {import('./manager.js').default} renderManager - The render manager instance.
   */
  constructor(renderManager) {
    /** @type {import('./manager.js').default} */
    this.renderManager = renderManager;
    /** @type {import('../index.js').default} */
    this.engine = renderManager.engine;
    
    /** @type {boolean} */
    this.initialized = false;
    
    /** @type {number} */
    this.maxInstances = 10000;
    
    // Instance data buffers
    /** @type {WebGLBuffer|null} */
    this.instancePositionBuf = null;
    /** @type {WebGLBuffer|null} */
    this.instanceRotationBuf = null;
    /** @type {WebGLBuffer|null} */
    this.instanceScaleBuf = null;
    /** @type {WebGLBuffer|null} */
    this.instanceColorBuf = null;
    /** @type {WebGLBuffer|null} */
    this.instanceTexCoordBuf = null;
    
    // Pre-allocated typed arrays
    /** @type {Float32Array|null} */
    this.instancePositions = null;
    /** @type {Float32Array|null} */
    this.instanceRotations = null;
    /** @type {Float32Array|null} */
    this.instanceScales = null;
    /** @type {Float32Array|null} */
    this.instanceColors = null;
    /** @type {Float32Array|null} */
    this.instanceTexCoords = null;
  }

  /**
   * Initializes GL buffers for instanced rendering.
   * @returns {void}
   */
  init() {
    const gl = this.engine.gl;
    if (!gl) return;

    // Pre-allocate typed arrays for instance data
    this.instancePositions = new Float32Array(this.maxInstances * 3);
    this.instanceRotations = new Float32Array(this.maxInstances * 4); // quaternion
    this.instanceScales = new Float32Array(this.maxInstances * 3);
    this.instanceColors = new Float32Array(this.maxInstances * 4);
    this.instanceTexCoords = new Float32Array(this.maxInstances * 4); // u0, v0, u1, v1

    // Create instance buffers
    this.instancePositionBuf = gl.createBuffer();
    this.instanceRotationBuf = gl.createBuffer();
    this.instanceScaleBuf = gl.createBuffer();
    this.instanceColorBuf = gl.createBuffer();
    this.instanceTexCoordBuf = gl.createBuffer();

    this.initialized = true;
  }

  /**
   * Renders a batch of sprites using instanced rendering.
   * All sprites must share the same texture and shader.
   * 
   * @param {Array<Object>} sprites - Array of sprite data objects with:
   *   - position: [x, y, z]
   *   - rotation: [x, y, z, w] (quaternion) or angle (number)
   *   - scale: [x, y, z] or number
   *   - color: [r, g, b, a] (optional)
   *   - texCoords: [u0, v0, u1, v1] (optional)
   * @param {WebGLTexture} texture - Shared texture for all sprites.
   * @param {WebGLProgram} shaderProgram - Shader program to use.
   * @param {WebGLBuffer} vertexBuffer - Base vertex buffer (quad).
   * @param {WebGLBuffer} texCoordBuffer - Base texture coordinate buffer.
   * @returns {number} - Number of instances rendered.
   */
  renderInstanced(sprites, texture, shaderProgram, vertexBuffer, texCoordBuffer) {
    if (!this.initialized) this.init();
    if (!this.initialized || !sprites.length) return 0;

    const gl = this.engine.gl;
    if (!gl) return 0;

    const count = Math.min(sprites.length, this.maxInstances);

    // Fill instance arrays
    for (let i = 0; i < count; i++) {
      const sprite = sprites[i];

      // Position (x, y, z)
      const pos = sprite.position || [0, 0, 0];
      this.instancePositions[i * 3] = pos[0];
      this.instancePositions[i * 3 + 1] = pos[1];
      this.instancePositions[i * 3 + 2] = pos[2];

      // Rotation (quaternion: x, y, z, w)
      if (sprite.rotation) {
        if (Array.isArray(sprite.rotation) && sprite.rotation.length === 4) {
          // Quaternion
          this.instanceRotations[i * 4] = sprite.rotation[0];
          this.instanceRotations[i * 4 + 1] = sprite.rotation[1];
          this.instanceRotations[i * 4 + 2] = sprite.rotation[2];
          this.instanceRotations[i * 4 + 3] = sprite.rotation[3];
        } else {
          // Angle (convert to quaternion around Z-axis)
          const angle = typeof sprite.rotation === 'number' ? sprite.rotation : 0;
          const halfAngle = angle * 0.5;
          this.instanceRotations[i * 4] = 0;
          this.instanceRotations[i * 4 + 1] = 0;
          this.instanceRotations[i * 4 + 2] = Math.sin(halfAngle);
          this.instanceRotations[i * 4 + 3] = Math.cos(halfAngle);
        }
      } else {
        // Default: no rotation
        this.instanceRotations[i * 4] = 0;
        this.instanceRotations[i * 4 + 1] = 0;
        this.instanceRotations[i * 4 + 2] = 0;
        this.instanceRotations[i * 4 + 3] = 1;
      }

      // Scale (x, y, z)
      if (sprite.scale) {
        if (Array.isArray(sprite.scale)) {
          this.instanceScales[i * 3] = sprite.scale[0] || 1;
          this.instanceScales[i * 3 + 1] = sprite.scale[1] || 1;
          this.instanceScales[i * 3 + 2] = sprite.scale[2] || 1;
        } else {
          const s = sprite.scale;
          this.instanceScales[i * 3] = s;
          this.instanceScales[i * 3 + 1] = s;
          this.instanceScales[i * 3 + 2] = s;
        }
      } else {
        this.instanceScales[i * 3] = 1;
        this.instanceScales[i * 3 + 1] = 1;
        this.instanceScales[i * 3 + 2] = 1;
      }

      // Color (r, g, b, a)
      const color = sprite.color || [1, 1, 1, 1];
      this.instanceColors[i * 4] = color[0] || 1;
      this.instanceColors[i * 4 + 1] = color[1] || 1;
      this.instanceColors[i * 4 + 2] = color[2] || 1;
      this.instanceColors[i * 4 + 3] = color[3] !== undefined ? color[3] : 1;

      // Texture coordinates (u0, v0, u1, v1)
      const texCoords = sprite.texCoords || [0, 0, 1, 1];
      this.instanceTexCoords[i * 4] = texCoords[0];
      this.instanceTexCoords[i * 4 + 1] = texCoords[1];
      this.instanceTexCoords[i * 4 + 2] = texCoords[2];
      this.instanceTexCoords[i * 4 + 3] = texCoords[3];
    }

    // Upload to GPU
    gl.bindBuffer(gl.ARRAY_BUFFER, this.instancePositionBuf);
    gl.bufferData(gl.ARRAY_BUFFER, this.instancePositions.subarray(0, count * 3), gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceRotationBuf);
    gl.bufferData(gl.ARRAY_BUFFER, this.instanceRotations.subarray(0, count * 4), gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceScaleBuf);
    gl.bufferData(gl.ARRAY_BUFFER, this.instanceScales.subarray(0, count * 3), gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceColorBuf);
    gl.bufferData(gl.ARRAY_BUFFER, this.instanceColors.subarray(0, count * 4), gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceTexCoordBuf);
    gl.bufferData(gl.ARRAY_BUFFER, this.instanceTexCoords.subarray(0, count * 4), gl.DYNAMIC_DRAW);

    // Setup rendering
    gl.useProgram(shaderProgram);

    // Bind base vertex data
    gl.enableVertexAttribArray(shaderProgram.aVertexPosition);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(shaderProgram.aVertexPosition, 3, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(shaderProgram.aTextureCoord);
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.vertexAttribPointer(shaderProgram.aTextureCoord, 2, gl.FLOAT, false, 0, 0);

    // Bind instance attributes (if shader supports them)
    if (shaderProgram.aInstancePosition >= 0) {
      gl.enableVertexAttribArray(shaderProgram.aInstancePosition);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.instancePositionBuf);
      gl.vertexAttribPointer(shaderProgram.aInstancePosition, 3, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(shaderProgram.aInstancePosition, 1);
    }

    if (shaderProgram.aInstanceRotation >= 0) {
      gl.enableVertexAttribArray(shaderProgram.aInstanceRotation);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceRotationBuf);
      gl.vertexAttribPointer(shaderProgram.aInstanceRotation, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(shaderProgram.aInstanceRotation, 1);
    }

    if (shaderProgram.aInstanceScale >= 0) {
      gl.enableVertexAttribArray(shaderProgram.aInstanceScale);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceScaleBuf);
      gl.vertexAttribPointer(shaderProgram.aInstanceScale, 3, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(shaderProgram.aInstanceScale, 1);
    }

    if (shaderProgram.aInstanceColor >= 0) {
      gl.enableVertexAttribArray(shaderProgram.aInstanceColor);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceColorBuf);
      gl.vertexAttribPointer(shaderProgram.aInstanceColor, 4, gl.FLOAT, false, 0, 0);
      gl.vertexAttribDivisor(shaderProgram.aInstanceColor, 1);
    }

    // Bind texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    if (shaderProgram.samplerUniform) {
      gl.uniform1i(shaderProgram.samplerUniform, 0);
    }

    // Set matrices
    if (shaderProgram.setMatrixUniforms) {
      shaderProgram.setMatrixUniforms({ instanced: true });
    }

    // Draw all instances
    if (typeof gl.drawArraysInstanced === 'function') {
      gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, count); // 6 vertices for quad
    } else {
      // Fallback: individual draws
      for (let i = 0; i < count; i++) {
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
    }

    // Cleanup: reset divisors
    if (shaderProgram.aInstancePosition >= 0) {
      gl.vertexAttribDivisor(shaderProgram.aInstancePosition, 0);
      gl.disableVertexAttribArray(shaderProgram.aInstancePosition);
    }
    if (shaderProgram.aInstanceRotation >= 0) {
      gl.vertexAttribDivisor(shaderProgram.aInstanceRotation, 0);
      gl.disableVertexAttribArray(shaderProgram.aInstanceRotation);
    }
    if (shaderProgram.aInstanceScale >= 0) {
      gl.vertexAttribDivisor(shaderProgram.aInstanceScale, 0);
      gl.disableVertexAttribArray(shaderProgram.aInstanceScale);
    }
    if (shaderProgram.aInstanceColor >= 0) {
      gl.vertexAttribDivisor(shaderProgram.aInstanceColor, 0);
      gl.disableVertexAttribArray(shaderProgram.aInstanceColor);
    }

    gl.disableVertexAttribArray(shaderProgram.aVertexPosition);
    gl.disableVertexAttribArray(shaderProgram.aTextureCoord);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.useProgram(null);

    return count;
  }

  /**
   * Checks if instanced rendering is supported.
   * @returns {boolean}
   */
  isSupported() {
    const gl = this.engine.gl;
    return gl && typeof gl.drawArraysInstanced === 'function';
  }
}
