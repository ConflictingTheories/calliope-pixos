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

import { create, normalFromMat4, frustum, perspective, set } from '../../utils/math/matrix4.js';
import { Vector, degToRad } from '../../utils/math/vector.js';
import { Texture } from '../resource/texture.js';
import { fetchSkyboxShaderFiles } from './shaders.js';

/**
 * SkyboxManager - Manages skybox rendering, including shader switching and cubemap setup.
 */
export default class SkyboxManager {
  /**
   * Changes the active skybox shader at runtime.
   * @param {string} shaderName - The shader name (e.g., 'cosmic', 'sunset', 'morning', 'sky').
   */
  async setSkyboxShader(shaderName) {
    if (!this.engine.gl) return;
    this.gl = this.engine.gl;
    // Use static imports via fetchSkyboxShaderFiles
    const [vs, fs] = fetchSkyboxShaderFiles(shaderName);
    this.shaderProgram = this.initSkyboxShaderProgram(vs, fs);
    // Optionally re-init buffer/cubemap if needed
  }

  /**
   * Creates an instance of SkyboxManager.
   * @param {RenderManager} renderManager - The render manager instance.
   * @returns {SkyboxManager} The singleton instance.
   */
  constructor(renderManager) {
    if (!SkyboxManager.instance) {
      /** @type {RenderManager} */
      this.renderManager = renderManager;
      /** @type {GLEngine} */
      this.engine = renderManager.engine;
      SkyboxManager.instance = this;
    }

    return SkyboxManager.instance;
  }

  /**
   * Initializes the skybox with optional texture and shader.
   * @param {string|null} textureSrc - The texture source (TODO: allow custom texture loading).
   * @param {string} shaderName - The shader name.
   * @param {number[]} centre - The skybox center [x, y, z].
   */
  async init(textureSrc = null, shaderName = 'cosmic', centre = [0.0, 0.0, 0.0]) {
    if (!this.engine.gl) return;
    this.gl = this.engine.gl;

    if (textureSrc) {
      // todo - load in custom texture and apply to skybox
      this.texture = await this.engine.resourceManager.loadTextureFromZip(
        textureSrc,
        this.engine.spritz.zip
      );
      this.texture.runWhenLoaded(this.createTextureSkyboxProgram);
    } else {
      // default - cosmic (via static imports)
      const [vsCosmic, fsCosmic] = fetchSkyboxShaderFiles(shaderName);
      this.shaderProgram = this.initSkyboxShaderProgram(vsCosmic, fsCosmic);
    }

    // Create cubemap for skybox
    this.cubeMap = this.createDefaultCubeMap();
    this.skyboxCenter = centre;
    this.buffer = this.createSkyboxBuffer();
    this.initialized = true;
  }

  /**
   * Creates a default cubemap (placeholder, replace with actual cubemap loading).
   * @returns {WebGLTexture} The cubemap texture.
   */
  createDefaultCubeMap() {
    const gl = this.gl;
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
    // Fill each face with a solid color for now
    const faceInfos = [
      { target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, color: [255, 0, 0, 255] },
      { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, color: [0, 255, 0, 255] },
      { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, color: [0, 0, 255, 255] },
      { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, color: [255, 255, 0, 255] },
      { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, color: [0, 255, 255, 255] },
      { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, color: [255, 0, 255, 255] },
    ];
    // set colours as cubemap textures
    faceInfos.forEach(faceInfo => {
      const { target, color } = faceInfo;
      const data = new Uint8Array(color);
      gl.texImage2D(target, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    });
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return texture;
  }

  /**
   * Creates the cube vertex buffer for the skybox (cube skybox - TODO: look into other shapes like sphere).
   * @returns {WebGLBuffer} The vertex buffer.
   */
  createSkyboxBuffer() {
    this.vertices = [
      -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0,
      1.0, -1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,
      -1.0, -1.0, -1.0, -1.0, -1.0, 1.0,
    ];

    this.numVertices = this.vertices.length / 3;

    const buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.vertices), this.gl.STATIC_DRAW);
    return buffer;
  }

  /**
   * Initializes the skybox shader program.
   * @param {string} vsSource - The vertex shader source.
   * @param {string} fsSource - The fragment shader source.
   * @returns {WebGLProgram} The shader program.
   */
  initSkyboxShaderProgram(vsSource, fsSource) {
    const { gl } = this.engine;

    // Load and compile the shaders from the provided source code.
    const vertexShader = this.loadShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = this.loadShader(gl.FRAGMENT_SHADER, fsSource);
    let shaderProgram = gl.createProgram();

    // Attach the vertex and fragment shaders to the shader program.
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);

    // Link the shader program together.
    gl.linkProgram(shaderProgram);

    // Check if the shader program was successfully linked.
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      throw new Error('WebGL unable to initialize the skybox shader program');
    }

    // Set up and cache the attribute location for 'aPosition'.
    shaderProgram.aPosition = gl.getAttribLocation(shaderProgram, 'aPosition');
    // Note: Don't enable vertex attrib array here - do it at render time to avoid WebGL state issues

    // Cache the uniform locations for various uniforms used in the shaders.
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, 'uProjectionMatrix');
    shaderProgram.uSkybox = gl.getUniformLocation(shaderProgram, 'uSkybox');
    shaderProgram.uViewDirectionProjectionInverse = gl.getUniformLocation(
      shaderProgram,
      'uViewDirectionProjectionInverse'
    );
    shaderProgram.uTime = gl.getUniformLocation(shaderProgram, 'uTime');
    shaderProgram.uResolution = gl.getUniformLocation(shaderProgram, 'uResolution');

    // Return the initialized shader program for use in rendering or further configuration.
    return shaderProgram;
  }

  /**
   * Loads and compiles shader source.
   * @param {number} type - The shader type (gl.VERTEX_SHADER or gl.FRAGMENT_SHADER).
   * @param {string} source - The shader source code.
   * @returns {WebGLShader} The compiled shader.
   */
  loadShader = (type, source) => {
    const { gl } = this.engine;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    // if error clear
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(`An error occurred compiling the shaders: ${log}`);
    }
    return shader;
  };

  /**
   * Renders the skybox using the specified shader program.
   * @param {Float32Array} viewDirectionProjectionInverse - The inverse view-direction-projection matrix.
   */
  renderSkybox(viewDirectionProjectionInverse) {
    if (!this.initialized || !this.shaderProgram) return; // Exit if the shader program is not initialized or available

    const { gl } = this.engine;

    // Reset all vertex attrib arrays to prevent errors from other shaders
    for (let i = 0; i < 8; i++) {
      gl.disableVertexAttribArray(i);
    }

    // Use the shader program for rendering
    gl.useProgram(this.shaderProgram);

    // Bind the buffer containing vertex data (assuming it's already set up)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

    // Enable the attribute array for 'aPosition'
    gl.enableVertexAttribArray(this.shaderProgram.aPosition);

    // Specify how the buffer data should be read from the currently bound buffer
    gl.vertexAttribPointer(this.shaderProgram.aPosition, 3, gl.FLOAT, false, 0, 0);

    // Bind the cubemap texture to a texture unit and set it as the active texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.cubeMap);
    gl.uniform1i(this.shaderProgram.uSkybox, 0); // Set the sampler2D uniform to use texture unit 0

    // Set the viewDirectionProjectionInverse matrix uniform for the shader
    gl.uniformMatrix4fv(
      this.shaderProgram.uViewDirectionProjectionInverse,
      false,
      viewDirectionProjectionInverse
    );

    // Set the uTime uniform with the current time (assuming it's used in the shader)
    // pass time in seconds
    const time = Date.now() * 0.001;
    if (this.shaderProgram.uTime !== -1 && this.shaderProgram.uTime !== null) {
      gl.uniform1f(this.shaderProgram.uTime, time);
    }

    // pass resolution if the shader expects it
    if (this.shaderProgram.uResolution !== undefined) {
      // try to grab drawing buffer size
      const resX = gl.drawingBufferWidth || this.engine.canvas.width || 800;
      const resY = gl.drawingBufferHeight || this.engine.canvas.height || 600;
      gl.uniform2f(this.shaderProgram.uResolution, resX, resY);
    }

    // Draw the skybox using TRIANGLE_STRIP and the specified number of vertices
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.numVertices);

    // Disable the vertex attrib array and unbind the buffer/program after drawing
    gl.disableVertexAttribArray(this.shaderProgram.aPosition);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.useProgram(null);
  }

  /**
   * Initializes the texture shader program (TODO: not working yet - needs to load from zip).
   * @param {Object} param1 - The shader sources.
   * @param {string} param1.vs - The vertex shader source.
   * @param {string} param1.fs - The fragment shader source.
   * @returns {WebGLProgram} The shader program.
   */
  initTextureShaderProgram = ({ vs: vsSource, fs: fsSource }) => {
    const { gl } = this.engine;
    const self = this;
    const vertexShader = this.loadShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = this.loadShader(gl.FRAGMENT_SHADER, fsSource);

    // generate shader program
    let shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      throw new Error(`WebGL unable to initialize the shader program: ${shaderProgram}`);
    }

    // Set up attribute locations
    shaderProgram.aVertexPosition = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
    gl.enableVertexAttribArray(shaderProgram.aVertexPosition);

    // Set up uniform locations
    shaderProgram.uSkyboxTexture = gl.getUniformLocation(shaderProgram, 'uSkyboxTexture');
    shaderProgram.uSkyboxCenter = gl.getUniformLocation(shaderProgram, 'uSkyboxCenter');
    shaderProgram.uProjectionMatrix = gl.getUniformLocation(shaderProgram, 'uProjectionMatrix');
    shaderProgram.uModelMatrix = gl.getUniformLocation(shaderProgram, 'uModelMatrix');
    shaderProgram.uViewMatrix = gl.getUniformLocation(shaderProgram, 'uViewMatrix');
    // Set up uniform functions
    shaderProgram.setMatrixUniforms = function () {
      const modelMatrix = self.uModelMat;
      const viewMatrix = self.camera.uViewMat;
      const projectionMatrix = self.uProjMat;
      gl.uniformMatrix4fv(this.uProjectionMatrix, false, projectionMatrix);
      gl.uniformMatrix4fv(this.uModelMatrix, false, modelMatrix);
      gl.uniformMatrix4fv(this.uViewMatrix, false, viewMatrix);
    };

    this.shaderProgram = shaderProgram;
    return shaderProgram;
  };

  /**
   * Creates the texture skybox program (TODO: move into shader files).
   * @returns {WebGLProgram} The shader program.
   */
  createTextureSkyboxProgram() {
    const vertexShaderSource = `#version 300 es
        in vec3 aVertexPosition;
        uniform mat4 uProjectionMatrix;
        uniform mat4 uModelMatrix;
        uniform mat4 uViewMatrix;
        void main() {
            gl_Position = uProjectionMatrix * uModelMatrix * uViewMatrix * vec4(aVertexPosition, 1.0);
        }
        `;

    const fragmentShaderSource = `#version 300 es
        precision highp float;
        uniform sampler2D uSkyboxTexture;
        uniform vec3 uSkyboxCenter;
        out vec4 outColor;
        void main() {
            vec3 direction = normalize(gl_FragCoord.xyz - uSkyboxCenter);
            vec4 skyboxColor = texture(uSkyboxTexture, direction.xy);
            float dotProduct = dot(direction, skyboxColor.rgb);
            if (dotProduct < 0.01) {
                discard;
            } else {
                outColor = vec4(dotProduct, dotProduct, dotProduct, 1.0);
            }
        }
        `;

    return this.initShaderProgram({ vs: vertexShaderSource, fs: fragmentShaderSource });
  }
}
