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

import CameraManager from './camera.js';
import LightManager from './light.js';
import SkyboxManager from './skybox.js';
import ParticleManager from './ParticleManager.js';
import FrustumCuller from './FrustumCuller.js';
import CameraEffects from './CameraEffects.js';
import LODManager from './LODManager.js';
import TextureAtlas from './TextureAtlas.js';
import EffectManager from './EffectManager.js';
import TransitionManager from './TransitionManager.js';
import ShaderManager from './ShaderManager.js';

// Shader imports
import particlesVs from '../../shaders/particles/vs.js';
import particlesFs from '../../shaders/particles/fs.js';
import pickerVs from '../../shaders/picker/vs.js';
import pickerFs from '../../shaders/picker/fs.js';
import pickerInit from '../../shaders/picker/init.js';

/**
 * @typedef {object} ShaderSource
 * @property {string} vs - Vertex shader source code.
 * @property {string} fs - Fragment shader source code.
 */

/**
 * @typedef {object} EffectShaderConfig
 * @property {string} id - Unique identifier for the effect shader.
 * @property {string} vs - Vertex shader source code.
 * @property {string} fs - Fragment shader source code.
 * @property {function(RenderManager, WebGLProgram): WebGLProgram} init - Initialization function for the effect shader program.
 */

/**
 * @typedef {object} LightUniform
 * @property {WebGLUniformLocation|null} enabled - Whether the light is enabled.
 * @property {WebGLUniformLocation|null} color - Light color.
 * @property {WebGLUniformLocation|null} position - Light position.
 * @property {WebGLUniformLocation|null} attenuation - Light attenuation.
 * @property {WebGLUniformLocation|null} direction - Light direction.
 * @property {WebGLUniformLocation|null} scatteringCoefficients - Scattering coefficients.
 * @property {WebGLUniformLocation|null} density - Light density.
 */

/**
 * RenderManager - Manages all WebGL rendering operations, including shaders, cameras, lights,
 * and screen transitions. Acts as a central point for drawing the game world.
 */
export default class RenderManager {
  /**
   * Creates an instance of RenderManager.
   * @param {import('../index.js').default} engine - The main game engine instance.
   * @returns {RenderManager} The singleton instance.
   */
  constructor(engine) {
    if (!RenderManager._instance) {
      RenderManager._instance = this;
      /** @type {import('../index.js').default} */
      this.engine = engine;
      /** @type {boolean} */
      this.fullscreen = engine.fullscreen;

      // Matrices
      /** @type {Float32Array} */
      this.uProjMat = create();
      /** @type {Float32Array} */
      this.uModelMat = create();
      /** @type {Float32Array} */
      this.normalMatrix = create3();
      /** @type {Array<[Float32Array, Float32Array]>} */
      this.modelViewMatrixStack = [];

      // Properties
      /** @type {Vector} */
      this.scale = new Vector(1, 1, 1);
      /** @type {boolean} */
      this.initializedWebGl = false;

      // Effects
      /** @type {string[]} */
      this.effects = [];
      /** @type {Object.<string, WebGLProgram>} */
      this.effectPrograms = {};
      /** @type {WebGLFramebuffer|null} */
      this.framebuffer = null; // Framebuffer for off-screen rendering (e.g., picker)

      // Picker State - true when rendering for object picking
      /** @type {boolean} */
      this.isPickerPass = false;

      // Transition Manager
      /** @type {TransitionManager} */
      this.transitionManager = new TransitionManager(this);

      // Shader Manager
      /** @type {ShaderManager} */
      this.shaderManager = new ShaderManager(this);

      /** @type {{tilesDrawn: number, spritesDrawn: number, objectsDrawn: number}} */
      this.debug = {
        tilesDrawn: 0,
        spritesDrawn: 0,
        objectsDrawn: 0,
      };

      // Camera
      /** @type {CameraManager} */
      this.cameraManager = new CameraManager(this);
      /** @type {import('./camera.js').Camera} */
      this.camera = this.cameraManager.camera;
      this.camera.setCamera(); // Initialize camera view matrix for legacy compatibility

      // Initialize camera effects after camera is created
      this.cameraEffects = new CameraEffects(this.camera);

      // Lights
      /** @type {LightManager} */
      this.lightManager = new LightManager(this);

      // Skybox
      /** @type {SkyboxManager} */
      this.skyboxManager = new SkyboxManager(this);

      // Particle system
      /** @type {ParticleManager} */
      this.particleManager = new ParticleManager(this);

      // Frustum culling for performance optimization
      /** @type {FrustumCuller} */
      this.frustumCuller = new FrustumCuller(this);

      // Level of Detail manager for performance optimization
      /** @type {LODManager} */
      this.lodManager = new LODManager(this);

      // Texture atlas for batched rendering
      /** @type {TextureAtlas} */
      this.textureAtlas = new TextureAtlas(this);

      // Camera effects (shake, follow, fade, etc.)
      /** @type {CameraEffects} */
      this.cameraEffects = null; // Initialized after camera

      // Particle shader program
      /** @type {WebGLProgram|null} */
      this.particleShaderProgram = null;

      /** @type {WebGLProgram|null} */
      this.shaderProgram = null; // The main shader program for rendering game objects

      // Effect Manager for post-processing
      /** @type {EffectManager} */
      this.effectManager = new EffectManager(this);
    }
    return RenderManager._instance;
  }

  /**
   * Initializes the rendering manager, setting up WebGL context, shaders, and projection.
   * @returns {void}
   */
  init = () => {
    /** @type {import('../index.js').SpritzGame} */
    const { spritz, gl } = this.engine;

    // Configure GL
    gl.clearColor(0, 1.0, 0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST); // Enable depth testing
    gl.depthFunc(gl.LEQUAL); // Near things obscure far things

    this.framebuffer = gl.createFramebuffer();

    // Initialize Optimized Picker FBO (1x1 pixel for efficient picking)
    this._initPickerFBO();

    // Store particle shader sources for ShaderManager
    this.particleVsSource = particlesVs();
    this.particleFsSource = particlesFs();

    // Initialize Main Shader Program
    this.shaderProgram = this.shaderManager.initMainShader(spritz.shaders);

    // Initialize Particle Shader Program
    this.particleShaderProgram = this.shaderManager.initParticleShader(this.particleVsSource, this.particleFsSource);

    // Initialize picker shader (special shader which allows for picking objects on screen)
    this.effectPrograms['picker'] = this.shaderManager.initEffectShader({
      id: 'picker',
      vs: pickerVs(),
      fs: pickerFs(),
      init: pickerInit,
    });

    // Initialize Effects (TODO: Needs work, doesn't apply filter correctly)
    if (spritz.effects) {
      for (let i in spritz.effects) {
        // spritz.effectPrograms[i] = this.initShaderEffects(gl, spritz.effects[i]);
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Effect "${i}" is present but not fully implemented in RenderManager.`);
        }
      }
    }

    // Initialize Projection Matrix
    this.initProjection();

    // Initialize skybox
    this.skyboxManager.init();

    // Initialize texture atlas for batched rendering
    this.textureAtlas.init();

    // Initialize effect manager
    this.effectManager.init();

    this.initializedWebGl = true;
  }

  /**
   * Initializes the optimized 1x1 pixel picker framebuffer.
   * This FBO is used for efficient object picking by rendering only a narrow
   * frustum around the mouse cursor to a tiny buffer.
   * @private
   * @returns {void}
   */
  _initPickerFBO = () => {
    const { gl } = this.engine;

    // Create the picker framebuffer
    this.pickerFBO = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.pickerFBO);

    // Create color texture for picker (1x1 pixel RGBA)
    this.pickerTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.pickerTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.pickerTexture, 0);

    // Create depth renderbuffer for picker (1x1 pixel)
    this.pickerDepthBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.pickerDepthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, 1, 1);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.pickerDepthBuffer);

    // Check framebuffer is complete
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
      console.warn('Picker FBO is not complete:', status);
    }

    // Unbind
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
  }

  /**
   * Loads and compiles a WebGL shader from source.
   * @param {number} type - The type of shader (e.g., `gl.VERTEX_SHADER` or `gl.FRAGMENT_SHADER`).
   * @param {string} source - The GLSL source code for the shader.
   * @returns {WebGLShader} The compiled shader.
   * @throws {Error} If the shader fails to compile.
   */
  loadShader = (type, source) => {
    /** @type {WebGL2RenderingContext} */
    const { gl } = this.engine;
    /** @type {WebGLShader} */
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    // If error, log and delete
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(`An error occurred compiling the shaders: ${log}`);
    }
    return shader;
  }

  /**
   * Initializes the main shader program used for rendering game objects.
   * Delegates to ShaderManager for actual implementation.
   * @param {ShaderSource} shaders - An object containing vertex and fragment shader source.
   * @returns {WebGLProgram} The initialized shader program.
   * @throws {Error} If the shader program fails to link.
   */
  initShaderProgram = ({ vs: vsSource, fs: fsSource }) => {
    // Delegate to ShaderManager but keep full implementation for backward compatibility
    // TODO: Fully migrate to ShaderManager
    if (this.shaderManager && this.shaderManager.mainShaderProgram) {
      return this.shaderManager.mainShaderProgram;
    }
    /** @type {WebGL2RenderingContext} */
    const { gl } = this.engine;
    const self = this;
    /** @type {WebGLShader} */
    const vertexShader = this.loadShader(gl.VERTEX_SHADER, vsSource);
    /** @type {WebGLShader} */
    const fragmentShader = this.loadShader(gl.FRAGMENT_SHADER, fsSource);

    // Generate shader program
    /** @type {WebGLProgram} */
    let shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.bindAttribLocation(shaderProgram, 0, 'aVertexPosition');
    gl.bindAttribLocation(shaderProgram, 1, 'aTextureCoord');

    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      throw new Error(`WebGL unable to initialize the shader program: ${gl.getProgramInfoLog(shaderProgram)}`);
    }

    // Get attribute locations (don't enable them here - enable during render)
    shaderProgram.aVertexNormal = gl.getAttribLocation(shaderProgram, 'aVertexNormal');

    shaderProgram.aVertexPosition = gl.getAttribLocation(shaderProgram, 'aVertexPosition');

    shaderProgram.aTextureCoord = gl.getAttribLocation(shaderProgram, 'aTextureCoord');

    // Get uniform locations
    shaderProgram.uDiffuse = gl.getUniformLocation(shaderProgram, 'uDiffuse');
    shaderProgram.uSpecular = gl.getUniformLocation(shaderProgram, 'uSpecular');
    shaderProgram.uSpecularExponent = gl.getUniformLocation(shaderProgram, 'uSpecularExponent');
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
    /** @type {LightUniform[]} */
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

    /**
     * Sets the matrix and other common uniforms for the shader program.
     * @param {object} [options] - Options for setting uniforms.
     * @param {number[]|null} [options.id=null] - The object ID for picking (RGBA format).
     * @param {Vector|null} [options.scale=null] - The scale vector for the model.
     * @param {number} [options.sampler=1.0] - Whether to use a texture sampler (1.0) or material color (0.0).
     * @param {boolean} [options.isSelected=false] - Whether the object is currently selected.
     * @param {number[]|null} [options.colorMultiplier=null] - A color multiplier to apply to the object.
     * @returns {void}
     */
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
    // These correspond to the standard vertex attribute names used in OBJ mesh layouts
    const attrs = {
      aVertexPosition: 'position',
      aVertexNormal: 'normal',
      aTextureCoord: 'uv',
    };
    /**
     * Applies attribute pointers for a given mesh, linking mesh buffer data to shader attributes.
     * @param {object} mesh - The mesh object containing vertex buffer layout.
     * @returns {void}
     */
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
    // Disable aVertexNormal by default if not always used, or ensure it's enabled when needed.
    // For now, keeping it enabled as per original code, but noting it for potential optimization.
    // gl.disableVertexAttribArray(shaderProgram.aVertexNormal);

    this.shaderProgram = shaderProgram;
    return shaderProgram;
  };

  /**
   * Initializes the particle shader program for optimized particle rendering.
   * @returns {WebGLProgram} The initialized particle shader program.
   * @throws {Error} If the particle shader program fails to link.
   */
  initParticleShaderProgram = () => {
    /** @type {WebGL2RenderingContext} */
    const { gl } = this.engine;
    const self = this;

    const vsSource = particlesVs();
    const fsSource = particlesFs();

    /** @type {WebGLShader} */
    const vertexShader = this.loadShader(gl.VERTEX_SHADER, vsSource);
    /** @type {WebGLShader} */
    const fragmentShader = this.loadShader(gl.FRAGMENT_SHADER, fsSource);

    // Generate particle shader program
    /** @type {WebGLProgram} */
    let particleShaderProgram = gl.createProgram();
    gl.attachShader(particleShaderProgram, vertexShader);
    gl.attachShader(particleShaderProgram, fragmentShader);
    gl.bindAttribLocation(particleShaderProgram, 0, 'aVertexPosition');
    gl.bindAttribLocation(particleShaderProgram, 1, 'aTextureCoord');

    gl.linkProgram(particleShaderProgram);
    if (!gl.getProgramParameter(particleShaderProgram, gl.LINK_STATUS)) {
      throw new Error(`WebGL unable to initialize the particle shader program: ${gl.getProgramInfoLog(particleShaderProgram)}`);
    }

    // Get attribute locations (don't enable them here - enable during render)
    particleShaderProgram.aVertexPosition = gl.getAttribLocation(particleShaderProgram, 'aVertexPosition');

    particleShaderProgram.aTextureCoord = gl.getAttribLocation(particleShaderProgram, 'aTextureCoord');

    // Get uniform locations
    particleShaderProgram.pMatrixUniform = gl.getUniformLocation(particleShaderProgram, 'uProjectionMatrix');
    particleShaderProgram.mMatrixUniform = gl.getUniformLocation(particleShaderProgram, 'uModelMatrix');
    particleShaderProgram.vMatrixUniform = gl.getUniformLocation(particleShaderProgram, 'uViewMatrix');
    particleShaderProgram.scaleUniform = gl.getUniformLocation(particleShaderProgram, 'uScale');
    particleShaderProgram.particleColorUniform = gl.getUniformLocation(particleShaderProgram, 'uParticleColor');
    particleShaderProgram.alphaUniform = gl.getUniformLocation(particleShaderProgram, 'uAlpha');
    particleShaderProgram.instancedUniform = gl.getUniformLocation(particleShaderProgram, 'uInstanced');

    // Get instanced attribute locations
    particleShaderProgram.aInstancePosition = gl.getAttribLocation(particleShaderProgram, 'aInstancePosition');
    particleShaderProgram.aInstanceColor = gl.getAttribLocation(particleShaderProgram, 'aInstanceColor');
    particleShaderProgram.aInstanceSize = gl.getAttribLocation(particleShaderProgram, 'aInstanceSize');

    /**
     * Sets the matrix and other common uniforms for the particle shader program.
     * @param {object} [options] - Options for setting uniforms.
     * @param {Vector|null} [options.scale=null] - The scale vector for the particle.
     * @param {number[]|null} [options.color=null] - The color of the particle.
     * @param {number} [options.alpha=1.0] - The alpha transparency of the particle.
     * @param {boolean} [options.instanced=false] - Whether instancing is active.
     * @returns {void}
     */
    particleShaderProgram.setMatrixUniforms = function ({ color = null, scale = null, alpha = 1.0, instanced = false }) {
      // Ensure this program is active before setting uniforms
      gl.useProgram(particleShaderProgram);

      gl.uniformMatrix4fv(this.pMatrixUniform, false, self.uProjMat);
      gl.uniformMatrix4fv(this.mMatrixUniform, false, self.uModelMat);
      gl.uniformMatrix4fv(this.vMatrixUniform, false, self.camera.uViewMat);

      // Instanced toggle
      gl.uniform1i(this.instancedUniform, instanced ? 1 : 0);

      // Scale
      gl.uniform3fv(this.scaleUniform, scale ? scale.toArray() : self.scale.toArray());

      // Color
      gl.uniform3fv(this.particleColorUniform, color ? color : [1.0, 1.0, 1.0]);

      // Alpha
      gl.uniform1f(this.alphaUniform, alpha);
    };

    this.particleShaderProgram = particleShaderProgram;
    return particleShaderProgram;
  };

  /**
   * Updates particles. Call from engine loop with timestamp.
   * @param {number} timestamp - The current timestamp.
   * @returns {void}
   */
  updateParticles = (timestamp) => {
    if (this.particleManager && typeof this.particleManager.update === 'function') {
      this.particleManager.update(timestamp);
    }
  }

  /**
   * Renders particles. Should be called after main scene draw or where appropriate.
   * @returns {void}
   */
  renderParticles = () => {
    if (this.particleManager && typeof this.particleManager.render === 'function') {
      this.particleManager.render();
    }
  }

  /**
   * Resets all vertex attribute arrays to a clean state.
   * This should be called when switching between different shader programs
   * to prevent WebGL errors from enabled but unbound attributes.
   * @returns {void}
   */
  resetVertexAttribArrays = () => {
    /** @type {WebGL2RenderingContext} */
    const { gl } = this.engine;
    // Disable a reasonable number of attrib arrays (most shaders use < 8)
    for (let i = 0; i < 8; i++) {
      gl.disableVertexAttribArray(i);
    }
  }

  /**
   * Activates the main shader program for rendering.
   * Sets the program as current and binds the default framebuffer.
   * @returns {void}
   */
  activateShaderProgram = () => {
    /** @type {WebGL2RenderingContext} */
    const { gl } = this.engine;

    // Clear picker pass flag - back to normal rendering
    this.isPickerPass = false;

    // Reset vertex attrib state before switching shader
    this.resetVertexAttribArrays();

    gl.useProgram(this.shaderProgram);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); // Render to screen
    this.initProjection(); // Re-initialize projection in case canvas size changed
  };

  /**
   * Activates the picker shader program for object selection.
   * Renders objects with unique color IDs for picking.
   * @returns {void}
   */
  activatePickerShaderProgram = () => {
    /** @type {WebGL2RenderingContext} */
    const { gl } = this.engine;

    // Set picker pass flag - objects will check this to use picker uniforms only
    this.isPickerPass = true;

    gl.useProgram(this.effectPrograms['picker']);

    // Use the optimized 1x1 pixel FBO
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.pickerFBO);

    // Clear the FBO (both color and depth)
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Setup 1x1 pixel frustum projection
    this.initProjection(); // Reset base state
    this.applyPixelFrustum();
  };

  /**
   * Activates a specific shader effect program.
   * @param {string} id - The ID of the effect program to activate.
   * @returns {void}
   */
  activateShaderEffectProgram = (id) => {
    /** @type {WebGL2RenderingContext} */
    const { gl } = this.engine;
    gl.useProgram(this.effectPrograms[id]);
  };

  /**
   * Initializes a shader effect program.
   * Delegates to ShaderManager for actual implementation.
   * @param {EffectShaderConfig} config - Configuration object for the effect shader.
   * @returns {WebGLProgram} The initialized effect shader program.
   * @throws {Error} If the shader effect program fails to link.
   */
  initShaderEffects = ({ vs: vsSource, fs: fsSource, id: id, init: init }) => {
    // Delegate to ShaderManager
    if (this.shaderManager) {
      return this.shaderManager.initEffectShader({ vs: vsSource, fs: fsSource, id, init });
    }
    // Fallback to original implementation for backward compatibility
    /** @type {WebGL2RenderingContext} */
    const { gl } = this.engine;
    const self = this;
    /** @type {WebGLShader} */
    const vertexShader = this.loadShader(gl.VERTEX_SHADER, vsSource);
    /** @type {WebGLShader} */
    const fragmentShader = this.loadShader(gl.FRAGMENT_SHADER, fsSource);

    // Generate shader program
    /** @type {WebGLProgram} */
    let effectProgram = gl.createProgram();
    gl.attachShader(effectProgram, vertexShader);
    gl.attachShader(effectProgram, fragmentShader);
    gl.bindAttribLocation(effectProgram, 0, 'aVertexPosition');
    gl.bindAttribLocation(effectProgram, 1, 'aTextureCoord');
    gl.linkProgram(effectProgram);
    if (!gl.getProgramParameter(effectProgram, gl.LINK_STATUS)) {
      throw new Error(`WebGL unable to initialize the shader effect program: ${gl.getProgramInfoLog(effectProgram)}`);
    }

    // Apply callback to initialize effect-specific uniforms/attributes
    this.effectPrograms[id] = init.call(self, effectProgram);
    this.effects.push(id);

    // No need to keep shaders after linking.
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    return this.effectPrograms[id];
  };

  /**
   * Sets up the projection matrix based on the camera's field of view and canvas aspect ratio.
   * Configures the WebGL viewport and depth/blend states.
   * @returns {void}
   */
  initProjection = () => {
    /** @type {WebGL2RenderingContext} */
    const { gl } = this.engine;
    const fieldOfView = degToRad(this.camera.fov);
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;

    gl.enable(gl.DEPTH_TEST);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    this.uProjMat = perspective(fieldOfView, aspect, zNear, zFar);
    // Do not reinitialize camera.uViewMat here — the Camera instance manages its own view matrix.
    // Overwriting it each frame would discard any runtime modifications (e.g., FreeCam).
    if (!this.camera.uViewMat) {
      this.camera.uViewMat = create();
    }
    // TODO: Investigate why projectionMatrix[5] is multiplied by -1. This often indicates
    // a coordinate system mismatch (e.g., WebGL's Y-up vs. a different convention).
    // It might be a workaround that could be resolved by adjusting camera or model matrices.
    this.uProjMat[5] *= -1;
  }

  /**
   * Enables back-face culling.
   * @returns {void}
   */
  enableCulling = () => {
    /** @type {WebGL2RenderingContext} */
    const { gl } = this.engine;
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
  }

  /**
   * Disables back-face culling.
   * @returns {void}
   */
  disableCulling = () => {
    /** @type {WebGL2RenderingContext} */
    const { gl } = this.engine;
    gl.disable(gl.CULL_FACE);
  }

  /**
   * Enables blending.
   * @returns {void}
   */
  enableBlending = () => {
    /** @type {WebGL2RenderingContext} */
    const { gl } = this.engine;
    gl.enable(gl.BLEND);
  }

  /**
   * Disables blending.
   * @returns {void}
   */
  disableBlending = () => {
    /** @type {WebGL2RenderingContext} */
    const { gl } = this.engine;
    gl.disable(gl.BLEND);
  }

  /**
   * Clears the color and depth buffers of the WebGL canvas.
   * @returns {void}
   */
  clearScreen = () => {
    /** @type {WebGL2RenderingContext} */
    const { gl } = this.engine;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  /**
   * Applies a 1x1 pixel frustum for optimized object picking.
   * Narrows the view to a single pixel under the mouse cursor.
   * TODO: This functionality needs to be thoroughly tested and potentially refined as it's marked as "not working" in `activatePickerShaderProgram`.
   * @returns {void}
   */
  applyPixelFrustum = () => {
    /** @type {WebGL2RenderingContext} */
    const { gl } = this.engine;
    const zNear = 0.1;
    const zFar = 100.0;

    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const top = Math.tan(degToRad(this.camera.fov) * 0.5) * zNear;
    const bottom = -top;
    const left = aspect * bottom;
    const right = aspect * top;
    const width = Math.abs(right - left);
    const height = Math.abs(top - bottom);

    // Compute the portion of the near plane that covers the 1 pixel under the mouse.
    const mouseX = this.engine.gamepad.x || 0;
    const mouseY = this.engine.gamepad.y || 0;
    const pixelX = (mouseX * gl.canvas.width) / gl.canvas.clientWidth;
    const pixelY = gl.canvas.height - (mouseY * gl.canvas.height) / gl.canvas.clientHeight - 1;

    const subLeft = left + (pixelX * width) / gl.canvas.width;
    const subBottom = bottom + (pixelY * height) / gl.canvas.height;
    const subWidth = width / gl.canvas.width;
    const subHeight = height / gl.canvas.height;

    gl.enable(gl.DEPTH_TEST);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
    gl.viewport(0, 0, 1, 1); // Set viewport to 1x1 pixel

    this.uProjMat = frustum(subLeft, subLeft + subWidth, subBottom, subBottom + subHeight, zNear, zFar);
    this.uProjMat[5] *= -1; // Apply the same Y-axis inversion as in initProjection
  }

  /**
   * Toggles fullscreen mode for the game canvas.
   * @returns {void}
   */
  toggleFullscreen = () => {
    if (!this.fullscreen) {
      try {
        this.engine.gamepadcanvas.parentElement.requestFullscreen();
        this.fullscreen = true;
      } catch (e) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to enter fullscreen:', e);
        }
      }
    } else {
      try {
        document.exitFullscreen();
      } catch (e) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to exit fullscreen:', e);
        }
      }
      this.fullscreen = false;
    }
  }

  /**
   * Pushes the current model and view matrices onto a stack.
   * Useful for hierarchical transformations where a parent's transformation needs to be temporarily saved before applying child transformations.
   * @returns {void}
   */
  mvPushMatrix = () => {
    let copyModel = create();
    set(this.uModelMat, copyModel);
    let copyView = create();
    set(this.camera.uViewMat, copyView);
    this.modelViewMatrixStack.push([copyModel, copyView]);
  }

  /**
   * Pops the last saved model and view matrices from the stack and applies them.
   * Restores the transformation state to a previous point.
   * @throws {Error} If the matrix stack is empty.
   * @returns {void}
   */
  mvPopMatrix = () => {
    if (this.modelViewMatrixStack.length === 0) {
      throw new Error('Invalid popMatrix! Matrix stack is empty.');
    }
    [this.uModelMat, this.camera.uViewMat] = this.modelViewMatrixStack.pop();
  }



  /**
   * Creates a new WebGL buffer.
   * @param {number[]} contents - The data to put into the buffer.
   * @param {number} type - The buffer usage type (e.g., `gl.STATIC_DRAW`, `gl.DYNAMIC_DRAW`).
   * @param {number} itemSize - The number of components per item (e.g., 3 for vec3, 2 for vec2).
   * @returns {WebGLBuffer} The created WebGL buffer.
   */
  createBuffer = (contents, type, itemSize) => {
    /** @type {WebGL2RenderingContext} */
    let { gl } = this.engine;
    /** @type {WebGLBuffer} */
    let buf = gl.createBuffer();
    buf.itemSize = itemSize;
    buf.numItems = contents.length / itemSize;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(contents), type);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    return buf;
  }

  /**
   * Updates the data in an existing WebGL buffer.
   * @param {WebGLBuffer} buffer - The buffer to update.
   * @param {number[]} contents - The new data to put into the buffer.
   * @returns {void}
   */
  updateBuffer = (buffer, contents) => {
    /** @type {WebGL2RenderingContext} */
    let { gl } = this.engine;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(contents));
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  /**
   * Binds a WebGL buffer to an attribute location.
   * @param {WebGLBuffer} buffer - The buffer to bind.
   * @param {number} attribute - The attribute location to bind the buffer to.
   * @returns {void}
   */
  bindBuffer = (buffer, attribute) => {
    /** @type {WebGL2RenderingContext} */
    let { gl } = this.engine;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(attribute);
    gl.vertexAttribPointer(attribute, buffer.itemSize, gl.FLOAT, false, 0, 0);
  }

  /**
   * Begins a custom screen transition. Delegates to TransitionManager.
   * @param {{effect?: string, direction?: 'out'|'in', duration?: number}} params - Transition parameters.
   * @returns {Promise<void>} Resolves when the transition has completed.
   */
  startTransition = (params = {}) => {
    return this.transitionManager.start(params);
  }

  /**
   * Updates an in-progress transition. Delegates to TransitionManager.
   * @returns {void}
   */
  updateTransition = () => {
    this.transitionManager.update();
  }

  /**
   * @deprecated Use transitionManager.initProgram() instead.
   * @param {string} effect - Name of the transition effect.
   * @returns {void}
   */
  initTransitionProgram = (effect) => {
    this.transitionManager.initProgram(effect);
  }

  /**
   * @deprecated Use transitionManager.render() instead.
   * @param {number} progress - Progress value between 0 and 1.
   * @returns {void}
   */
  renderTransition = (progress) => {
    this.transitionManager.render(progress);
  }

  /**
   * Renders the skybox.
   * @returns {void}
   */
  renderSkybox = () => {
    if (!this.engine.spritz.loaded) return;
    this.skyboxManager.renderSkybox(this.uProjMat);
  }

  /**
   * Handles canvas resize events. Updates projection matrix and viewport.
   * @param {number} width - The new canvas width.
   * @param {number} height - The new canvas height.
   * @returns {void}
   */
  handleResize = (width, height) => {
    /** @type {WebGL2RenderingContext} */
    const { gl } = this.engine;

    // Update viewport
    gl.viewport(0, 0, width, height);

    // Recalculate projection matrix with new aspect ratio
    const fieldOfView = degToRad(this.camera.fov);
    const aspect = width / height;
    const zNear = 0.1;
    const zFar = 100.0;

    this.uProjMat = perspective(fieldOfView, aspect, zNear, zFar);
    // Maintain Y-flip for coordinate system compatibility
    this.uProjMat[5] *= -1;

    // Update effect manager
    this.effectManager.handleResize(width, height);
  }

  /**
   * Internal pass for beginning a scene render (for post-processing).
   */
  beginScene = () => {
    this.effectManager.beginScene();
  }

  /**
   * Internal pass for ending a scene render (for post-processing).
   * @param {number} timestamp - Current timestamp.
   */
  endScene = (timestamp) => {
    this.effectManager.endScene(timestamp);
  }

  /**
   * Resets debug counters at the start of a new frame. Should be invoked by the engine's render loop before any drawing takes place.
   * @returns {void}
   */
  resetDebugCounters = () => {
    if (this.debug) {
      this.debug.tilesDrawn = 0;
      this.debug.spritesDrawn = 0;
      this.debug.objectsDrawn = 0;
    }
  }
}
