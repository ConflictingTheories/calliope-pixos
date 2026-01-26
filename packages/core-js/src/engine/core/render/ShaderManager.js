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

// Absolute imports
import { create, create3, normalFromMat4, frustum, perspective, set } from '../../utils/math/matrix4.js';
import { Vector, degToRad } from '../../utils/math/vector.js';

/**
 * ShaderManager - Manages WebGL shader programs.
 * Extracted from RenderManager to improve separation of concerns.
 */
export default class ShaderManager {
  /**
   * Creates an instance of ShaderManager.
   * @param {import('./manager.js').default} renderManager - The render manager instance.
   */
  constructor(renderManager) {
    /** @type {import('./manager.js').default} */
    this.renderManager = renderManager;
    /** @type {import('../index.js').default} */
    this.engine = renderManager.engine;

    /** @type {WebGLProgram|null} */
    this.mainShaderProgram = null;
    /** @type {WebGLProgram|null} */
    this.particleShaderProgram = null;
    /** @type {Object.<string, WebGLProgram>} */
    this.effectPrograms = {};
  }

  /**
   * Initializes the main shader program.
   * @param {Object} shaderSource - Shader source with vs and fs properties.
   * @returns {WebGLProgram} The initialized shader program.
   */
  initMainShader(shaderSource) {
    const gl = this.engine.gl;
    const { vs: vsSource, fs: fsSource } = shaderSource;

    const vertexShader = this.renderManager.loadShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = this.renderManager.loadShader(gl.FRAGMENT_SHADER, fsSource);
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.bindAttribLocation(shaderProgram, 0, 'aVertexPosition');
    gl.bindAttribLocation(shaderProgram, 1, 'aTextureCoord');
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      throw new Error(`WebGL unable to initialize the shader program: ${gl.getProgramInfoLog(shaderProgram)}`);
    }

    // Get attribute locations
    shaderProgram.aVertexPosition = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
    shaderProgram.aTextureCoord = gl.getAttribLocation(shaderProgram, 'aTextureCoord');

    // Get uniform locations
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, 'uProjectionMatrix');
    shaderProgram.mMatrixUniform = gl.getUniformLocation(shaderProgram, 'uModelMatrix');
    shaderProgram.vMatrixUniform = gl.getUniformLocation(shaderProgram, 'uViewMatrix');
    shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, 'uNormalMatrix');
    shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, 'uSampler');
    shaderProgram.diffuseMapUniform = gl.getUniformLocation(shaderProgram, 'uDiffuseMap');

    shaderProgram.cameraPosition = gl.getUniformLocation(shaderProgram, `uCameraPosition`);

    shaderProgram.runTransition = gl.getUniformLocation(shaderProgram, 'runTransition');
    shaderProgram.useSampler = gl.getUniformLocation(shaderProgram, 'useSampler');
    shaderProgram.useDiffuse = gl.getUniformLocation(shaderProgram, 'useDiffuse');
    shaderProgram.isSelected = gl.getUniformLocation(shaderProgram, 'isSelected');
    shaderProgram.colorMultiplier = gl.getUniformLocation(shaderProgram, 'uColorMultiplier');
    shaderProgram.scale = gl.getUniformLocation(shaderProgram, 'u_scale');
    shaderProgram.id = gl.getUniformLocation(shaderProgram, 'u_id');

    // Light uniforms
    shaderProgram.maxLights = 32; // Max number of lights supported by the shader
    shaderProgram.uLights = [];
    for (let i = 0; i < shaderProgram.maxLights; i++) {
      shaderProgram.uLights[i] = {
        enabled: gl.getUniformLocation(shaderProgram, `uLights[${i}].enabled`),
        color: gl.getUniformLocation(shaderProgram, `uLights[${i}].color`),
        position: gl.getUniformLocation(shaderProgram, `uLights[${i}].position`),
        attenuation: gl.getUniformLocation(shaderProgram, `uLights[${i}].attenuation`),
        direction: gl.getUniformLocation(shaderProgram, `uLights[${i}].direction`),
        scatteringCoefficients: gl.getUniformLocation(shaderProgram, `uLights[${i}].scatteringCoefficients`),
        density: gl.getUniformLocation(shaderProgram, `uLights[${i}].density`),
      };
    }

    // Add setMatrixUniforms method
    const self = this.renderManager;
    shaderProgram.setMatrixUniforms = function ({ id = null, scale = null, sampler = 1.0, isSelected = false, colorMultiplier = null }) {
      // Ensure this program is active before setting uniforms
      gl.useProgram(shaderProgram);

      gl.uniformMatrix4fv(this.pMatrixUniform, false, self.uProjMat);
      gl.uniformMatrix4fv(this.mMatrixUniform, false, self.uModelMat);
      gl.uniformMatrix4fv(this.vMatrixUniform, false, self.camera.uViewMat);

      // Normal matrix (for transforming normals correctly with model-view transformations)
      self.normalMatrix = create3();
      normalFromMat4(self.normalMatrix, self.uModelMat);
      gl.uniformMatrix3fv(this.nMatrixUniform, false, self.normalMatrix);

      // Scale
      gl.uniform3fv(this.scale, scale ? scale.toArray() : self.scale.toArray());

      // Selection and color multiplier
      gl.uniform4fv(this.id, id ? id : [1.0, 0.0, 0.0, 0.0]); // Default to a non-zero ID if not provided
      gl.uniform1f(this.isSelected, isSelected ? 1.0 : 0.0);
      gl.uniform4fv(this.colorMultiplier, colorMultiplier ? colorMultiplier : [1.0, 1.0, 1.0, 1.0]);

      // Use sampler or materials?
      gl.uniform1f(this.useSampler, sampler);

      // Transition state
      gl.uniform1f(this.runTransition, self.transitionManager.isTransitioning ? 1.0 : 0.0);

      // Camera position for lighting calculations
      gl.uniform3fv(this.cameraPosition, self.camera.cameraPosition.toArray());

      // Point lights
      self.lightManager.setMatrixUniforms();
    };

    // Attribute layout keys for vertex data
    const attrs = {
      aVertexPosition: 'position',
      aVertexNormal: 'normal',
      aTextureCoord: 'uv',
    };
    shaderProgram.applyAttributePointers = function (mesh) {
      const layout = mesh.vertexBuffer.layout;
      for (const attrName in attrs) {
        if (!attrs.hasOwnProperty(attrName) || shaderProgram[attrName] === -1) {
          continue;
        }
        const layoutKey = attrs[attrName];
        if (shaderProgram[attrName] !== -1) {
          const attr = layout.attributeMap[layoutKey];
          gl.vertexAttribPointer(shaderProgram[attrName], attr.size, gl[attr.type], attr.normalized, attr.stride, attr.offset);
        }
      }
    };

    // Store reference
    this.mainShaderProgram = shaderProgram;

    return shaderProgram;
  }

  /**
   * Initializes the particle shader program.
   * @param {string} [vsSource] - Vertex shader source (optional, uses default if not provided).
   * @param {string} [fsSource] - Fragment shader source (optional, uses default if not provided).
   * @returns {WebGLProgram} The initialized particle shader program.
   */
  initParticleShader(vsSource = null, fsSource = null) {
    const gl = this.engine.gl;
    const self = this.renderManager;

    // Use provided sources or get from renderManager
    if (!vsSource) vsSource = self.particleVsSource || '';
    if (!fsSource) fsSource = self.particleFsSource || '';

    const vertexShader = self.loadShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = self.loadShader(gl.FRAGMENT_SHADER, fsSource);
    const particleShaderProgram = gl.createProgram();
    gl.attachShader(particleShaderProgram, vertexShader);
    gl.attachShader(particleShaderProgram, fragmentShader);
    gl.bindAttribLocation(particleShaderProgram, 0, 'aVertexPosition');
    gl.bindAttribLocation(particleShaderProgram, 1, 'aTextureCoord');
    gl.linkProgram(particleShaderProgram);

    if (!gl.getProgramParameter(particleShaderProgram, gl.LINK_STATUS)) {
      throw new Error(`WebGL unable to initialize the particle shader program: ${gl.getProgramInfoLog(particleShaderProgram)}`);
    }

    // Get attribute locations
    particleShaderProgram.aVertexPosition = gl.getAttribLocation(particleShaderProgram, 'aVertexPosition');
    particleShaderProgram.aTextureCoord = gl.getAttribLocation(particleShaderProgram, 'aTextureCoord');
    particleShaderProgram.aInstancePosition = gl.getAttribLocation(particleShaderProgram, 'aInstancePosition');
    particleShaderProgram.aInstanceColor = gl.getAttribLocation(particleShaderProgram, 'aInstanceColor');
    particleShaderProgram.aInstanceSize = gl.getAttribLocation(particleShaderProgram, 'aInstanceSize');

    // Get uniform locations
    particleShaderProgram.pMatrixUniform = gl.getUniformLocation(particleShaderProgram, 'uProjectionMatrix');
    particleShaderProgram.mMatrixUniform = gl.getUniformLocation(particleShaderProgram, 'uModelMatrix');
    particleShaderProgram.vMatrixUniform = gl.getUniformLocation(particleShaderProgram, 'uViewMatrix');
    particleShaderProgram.scaleUniform = gl.getUniformLocation(particleShaderProgram, 'uScale');
    particleShaderProgram.particleColorUniform = gl.getUniformLocation(particleShaderProgram, 'uParticleColor');
    particleShaderProgram.alphaUniform = gl.getUniformLocation(particleShaderProgram, 'uAlpha');
    particleShaderProgram.instancedUniform = gl.getUniformLocation(particleShaderProgram, 'uInstanced');

    // Add setMatrixUniforms method
    particleShaderProgram.setMatrixUniforms = function ({ color = null, scale = null, alpha = 1.0, instanced = false }) {
      gl.useProgram(particleShaderProgram);
      gl.uniformMatrix4fv(this.pMatrixUniform, false, self.uProjMat);
      gl.uniformMatrix4fv(this.mMatrixUniform, false, self.uModelMat);
      gl.uniformMatrix4fv(this.vMatrixUniform, false, self.camera.uViewMat);
      gl.uniform1i(this.instancedUniform, instanced ? 1 : 0);
      gl.uniform3fv(this.scaleUniform, scale ? scale.toArray() : self.scale.toArray());
      gl.uniform3fv(this.particleColorUniform, color ? color : [1.0, 1.0, 1.0]);
      gl.uniform1f(this.alphaUniform, alpha);
    };

    // Store reference
    this.particleShaderProgram = particleShaderProgram;

    return particleShaderProgram;
  }

  /**
   * Initializes an effect shader program.
   * @param {Object} config - Effect shader configuration.
   * @param {string} config.id - Unique identifier.
   * @param {string} config.vs - Vertex shader source.
   * @param {string} config.fs - Fragment shader source.
   * @param {Function} config.init - Initialization function.
   * @returns {WebGLProgram} The initialized effect shader program.
   */
  initEffectShader(config) {
    const gl = this.engine.gl;
    const { vs: vsSource, fs: fsSource, id, init } = config;

    const vertexShader = this.renderManager.loadShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = this.renderManager.loadShader(gl.FRAGMENT_SHADER, fsSource);
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(`WebGL unable to initialize effect shader "${id}": ${gl.getProgramInfoLog(program)}`);
    }

    // Run initialization function if provided
    if (init && typeof init === 'function') {
      init.call(this.renderManager, program);
    }

    this.effectPrograms[id] = program;
    return program;
  }

  /**
   * Gets a shader program by ID.
   * @param {string} id - Shader program ID.
   * @returns {WebGLProgram|null} The shader program or null.
   */
  getProgram(id) {
    if (id === 'main') return this.mainShaderProgram;
    if (id === 'particle') return this.particleShaderProgram;
    return this.effectPrograms[id] || null;
  }

  /**
   * Cleans up all shader programs.
   * @returns {void}
   */
  cleanup() {
    const gl = this.engine.gl;

    if (this.mainShaderProgram) {
      gl.deleteProgram(this.mainShaderProgram);
      this.mainShaderProgram = null;
    }

    if (this.particleShaderProgram) {
      gl.deleteProgram(this.particleShaderProgram);
      this.particleShaderProgram = null;
    }

    for (const program of Object.values(this.effectPrograms)) {
      gl.deleteProgram(program);
    }
    this.effectPrograms = {};
  }
}
