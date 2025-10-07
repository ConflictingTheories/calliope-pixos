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
import { create, create3, normalFromMat4, frustum, perspective, set } from '../../utils/math/matrix4.jsx';
import { Vector, degToRad } from '../../utils/math/vector.jsx';
import { OBJ } from '../../utils/obj/index.js';

import CameraManager from './camera.jsx';
import LightManager from './light.jsx';
import SkyboxManager from './skybox.jsx';
import GLEngine from '../index.jsx';
import { fetchTransitionShaderFiles } from './shaders.jsx'

export default class RenderManager {
  /** Rendering Manager for Engine
   *
   * @param {GLEngine} engine
   */
  constructor(engine) {
    if (!RenderManager._instance) {
      this.engine = engine;
      this.fullscreen = engine.fullscreen;
      // Matrices
      this.uProjMat = create();
      this.uModelMat = create();
      this.normalMat = create3();
      this.modelViewMatrixStack = [];

      // Properties
      this.scale = new Vector(1, 1, 1);
      this.initializedWebGl = false;

      // Effects
      this.effects = [];
      this.effectPrograms = {};
      this.fb = null;

      // Transitions
      this.isTransitioning = false;
      // The following properties are used to drive custom transition effects. A
      // transition is considered active when `isTransitioning` is true. The
      // `transitionEffect` identifies which visual effect to draw (fade,
      // cross, swirl). `transitionDirection` is either "out" (overlay is
      // applied over the scene) or "in" (overlay is removed). `transitionStartTime`
      // and `transitionDuration` control the timing, while
      // `transitionCallback` is invoked once the transition completes.
      this.transition = null;
      this.transitionParams = {};
      this.transitionTexture = null;
      this.transitionDuration = 0;
      this.transitionTime = 0;
      this.transitionEffect = null;
      this.transitionDirection = 'out';
      this.transitionStartTime = 0;
      this.transitionCallback = null;
      this.transitionGL = {};

      this.debug = {
        tilesDrawn: 0,
        spritesDrawn: 0,
        objectsDrawn: 0,
      };

      // Camera
      this.cameraManager = new CameraManager(this);
      this.camera = this.cameraManager.camera;

      // Lights
      this.lightManager = new LightManager(this);

      // Skybox
      this.skyboxManager = new SkyboxManager(this);

      RenderManager._instance = this;
    }
    return RenderManager._instance;
  }

  /**
   *
   */
  init = () => {
    const { spritz, gl } = this.engine;

    // Configure GL
    gl.clearColor(0, 1.0, 0, 1.0);
    gl.clearDepth(1.0);

    this.fb = gl.createFramebuffer();

    // Initialize Shader Programs
    this.initShaderProgram(spritz.shaders);

    // intiialize picker shader (special shader which allows for picking objects on screen)
    this.initShaderEffects({
      id: 'picker',
      vs: require('../../shaders/picker/vs.jsx').default(),
      fs: require('../../shaders/picker/fs.jsx').default(),
      init: require('../../shaders/picker/init.jsx').default,
    });

    // Initialize Effects
    if (spritz.effects) {
      for (let i in spritz.effects) {
        // todo --- needs work --> Doesn't apply filter correctly
        // spritz.effectPrograms[i] = this.initShaderEffects(gl, spritz.effects[i]);
      }
    }

    // Initialize Project Matrix
    this.initProjection();

    // skybox
    this.skyboxManager.init();

    this.initializedWebGl = true;
  }

  /**
   * Load and Compile Shader Source
   * @param {*} type
   * @param {*} source
   * @returns
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
  }

  /**
   * Initialize Shader Program
   * @param {*} param1
   * @returns
   */
  initShaderProgram = ({ vs: vsSource, fs: fsSource }) => {
    const { gl } = this.engine;
    const self = this;
    const vertexShader = this.loadShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = this.loadShader(gl.FRAGMENT_SHADER, fsSource);

    // generate shader
    let shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.bindAttribLocation(shaderProgram, 0, 'aVertexPosition');
    gl.bindAttribLocation(shaderProgram, 1, 'aTextureCoord');

    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      throw new Error(`WebGL unable to initialize the shader program: ${shaderProgram}`);
    }

    // Normals (needs work)
    shaderProgram.aVertexNormal = gl.getAttribLocation(shaderProgram, 'aVertexNormal');
    gl.enableVertexAttribArray(shaderProgram.aVertexNormal);

    // Vertices
    shaderProgram.aVertexPosition = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
    gl.enableVertexAttribArray(shaderProgram.aVertexPosition);

    // Texture Coord
    shaderProgram.aTextureCoord = gl.getAttribLocation(shaderProgram, 'aTextureCoord');
    gl.enableVertexAttribArray(shaderProgram.aTextureCoord);

    // Uniform Locations
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

    // light uniforms
    shaderProgram.maxLights = 32;
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

    // Uniform apply
    shaderProgram.setMatrixUniforms = function ({ id = null, scale = null, sampler = 1.0, isSelected = false, colorMultiplier = null }) {
      gl.uniformMatrix4fv(this.pMatrixUniform, false, self.uProjMat);
      gl.uniformMatrix4fv(this.mMatrixUniform, false, self.uModelMat);
      gl.uniformMatrix4fv(this.vMatrixUniform, false, self.camera.uViewMat);

      // normal
      self.normalMat = create3();
      normalFromMat4(self.normalMat, self.uModelMat);
      gl.uniformMatrix3fv(this.nMatrixUniform, false, self.normalMat);

      // scale
      gl.uniform3fv(this.scale, scale ? scale.toArray() : self.scale.toArray());

      // selection
      gl.uniform4fv(this.id, id ? id : [1.0, 0.0, 0.0, 0.0]);
      gl.uniform1f(this.isSelected, isSelected ? 1.0 : 0.0);
      gl.uniform4fv(this.colorMultiplier, colorMultiplier ? colorMultiplier : [1.0, 1.0, 1.0, 1.0]);

      // use sampler or materials?
      gl.uniform1f(this.useSampler, sampler);

      // transitiion
      gl.uniform1f(this.runTransition, self.isTransitioning ? 1.0 : 0.0);

      // camera position
      gl.uniform3fv(this.cameraPosition, self.camera.cameraPosition.toArray());

      // point lights
      self.lightManager.setMatrixUniforms();
    };

    const attrs = {
      aVertexPosition: OBJ.Layout.POSITION.key,
      aVertexNormal: OBJ.Layout.NORMAL.key,
      aTextureCoord: OBJ.Layout.UV.key,
    };
    shaderProgram.applyAttributePointers = function (mesh) {
      const layout = mesh.vertexBuffer.layout;
      for (const attrName in attrs) {
        if (!attrs.hasOwnProperty(attrName) || shaderProgram[attrName] == -1) {
          continue;
        }
        const layoutKey = attrs[attrName];
        if (shaderProgram[attrName] != -1) {
          const attr = layout.attributeMap[layoutKey];
          gl.vertexAttribPointer(shaderProgram[attrName], attr.size, gl[attr.type], attr.normalized, attr.stride, attr.offset);
        }
      }
    };
    gl.disableVertexAttribArray(shaderProgram.aVertexNormal);
    // return
    this.shaderProgram = shaderProgram;
    return shaderProgram;
  };

  /**
   * Initialize Shader Effect (blur, depth of field, etc)
   * @returns
   */
  activateShaderProgram = () => {
    const { gl } = this.engine;

    gl.useProgram(this.shaderProgram);

    // no frame buffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    this.initProjection();
  };

  /**
   * Initialize Shader Picker for selection of objects
   * @returns
   */
  activatePickerShaderProgram = (useFrustum) => {
    const { gl } = this.engine;
    gl.useProgram(this.effectPrograms['picker']);

    // todo - improve performance - 1x1 pixel picker
    if (useFrustum) {
      // bind frame buffer (todo - not working)
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.fb);
      // todo -- needs work - doesn't seem to work
      this.initProjection();
      this.applyPixelFrustum();
    } else {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);

      this.initProjection();
    }
  };

  /**
   * Initialize Shader Effect (blur, depth of field, etc)
   * @param {*} id
   * @returns
   */
  activateShaderEffectProgram = (id) => {
    const { gl } = this.engine;
    gl.useProgram(this.effectPrograms[id]);
  };

  /**
   * Initialize Shader Effect (blur, depth of field, etc)
   * @param {*} param1
   * @returns
   */
  initShaderEffects = ({ vs: vsSource, fs: fsSource, id: id, init: init }) => {
    const { gl } = this.engine;
    const self = this;
    const vertexShader = this.loadShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = this.loadShader(gl.FRAGMENT_SHADER, fsSource);

    // generate shader
    let effectProgram = gl.createProgram();
    gl.attachShader(effectProgram, vertexShader);
    gl.attachShader(effectProgram, fragmentShader);
    gl.bindAttribLocation(effectProgram, 0, 'aVertexPosition');
    gl.bindAttribLocation(effectProgram, 1, 'aTextureCoord');
    gl.linkProgram(effectProgram);
    if (!gl.getProgramParameter(effectProgram, gl.LINK_STATUS)) {
      throw new Error(`WebGL unable to initialize the shader effect program: ${effectProgram}`);
    }

    // apply calLback
    this.effectPrograms[id] = init.call(self, effectProgram);
    this.effects.push(id);

    return this.effectPrograms[id];
  };

  /**
   * Set FOV and Perspective
   */
  initProjection = () => {
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
    this.camera.uViewMat = create();
    this.uProjMat[5] *= -1;
  }

  /**
   * Enable Culling
   * @returns
   */
  enableCulling = () => {
    const { gl } = this.engine;
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
  }

  /**
   * Disable Culling
   * @returns
   */
  disableCulling = () => {
    const { gl } = this.engine;
    gl.disable(gl.CULL_FACE);
  }

  /**
   * Enable Blending
   * @returns
   */
  enableBlending = () => {
    const { gl } = this.engine;
    gl.enable(gl.BLEND);
  }

  /**
   * Disable Blending
   * @returns
   */
  disableBlending = () => {
    const { gl } = this.engine;
    gl.disable(gl.BLEND);
  }

  /**
   * Clear Screen with Color (RGBA)
   */
  clearScreen = () => {
    const { gl } = this.engine;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    this.camera.uViewMat = create();
  }

  /**
   * Use a frustum to clip the scene to a 1x1 pixel area
   */
  applyPixelFrustum = () => {
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

    // compute the portion of the near plane covers the 1 pixel
    // under the mouse.
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
    gl.viewport(0, 0, 1, 1);

    this.uProjMat = frustum(subLeft, subLeft + subWidth, subBottom, subBottom + subHeight, zNear, zFar);
    this.uProjMat[5] *= -1;
    this.camera.uViewMat = create();
  }

  /**
   * Go Fullscreen
   */
  toggleFullscreen = () => {
    if (!this.fullscreen) {
      try {
        this.engine.gamepadcanvas.parentElement.requestFullscreen();
        this.fullscreen = true;
      } catch (e) {
        //
      }
    } else {
      try {
        document.exitFullscreen();
      } catch (e) {
        //
      }
      this.fullscreen = false;
    }
  }

  /**
   * push new matrix to model stack
   */
  mvPushMatrix = () => {
    let copy = create();
    set(this.uModelMat, copy);
    let m = create();
    set(this.camera.uViewMat, m);
    this.modelViewMatrixStack.push([copy, m]);
  }

  /**
   * pop model stack and apply view
   */
  mvPopMatrix = () => {
    if (this.modelViewMatrixStack.length == 0) {
      throw 'Invalid popMatrix!';
    }
    [this.uModelMat, this.camera.uViewMat] = this.modelViewMatrixStack.pop();
  }

  /**
   * Render Frame
   */
  transition = () => {
    let now = new Date().getMilliseconds();
    this.transition.draw(
      ((this.transitionTime - now) / this.transitionDuration) % 1,
      this.transitionTexture,
      this.transitionTexture,
      this.engine.gl.canvas.width,
      this.engine.gl.canvas.height,
      this.transitionParams
    );
    if (now >= this.transitionTime) {
      this.isTransitioning = false;
    }
  }

  /**
   * individual buffer
   * @param {*} contents
   * @param {*} type
   * @param {*} itemSize
   * @returns
   */
  createBuffer = (contents, type, itemSize) => {
    let { gl } = this.engine;
    let buf = gl.createBuffer();
    buf.itemSize = itemSize;
    buf.numItems = contents.length / itemSize;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(contents), type);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    return buf;
  }

  /**
   * update buffer
   * @param {*} buffer
   * @param {*} contents
   */
  updateBuffer = (buffer, contents) => {
    let { gl } = this.engine;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(contents));
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  /**
   * bind buffer
   * @param {*} buffer
   * @param {*} attribute
   */
  bindBuffer = (buffer, attribute) => {
    let { gl } = this.engine;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(attribute, buffer.itemSize, gl.FLOAT, false, 0, 0);
  }

  /**
   * Begin a custom screen transition. This will overlay an effect (fade, cross or swirl)
   * on top of the current scene for the specified duration. When the effect
   * completes the returned Promise resolves. If another transition is already
   * running this will queue a new one once the current one finishes.
   *
   * @param {{effect?: string, direction?: string, duration?: number}} params
   * @returns {Promise<void>} Resolves when the transition has completed.
   */
  startTransition = (params = {}) => {
    const { effect = 'fade', direction = 'out', duration = 1000 } = params;
    // If another transition is currently active we create a chained Promise that
    // will run after the existing one. This avoids overlapping transitions.
    const schedule = () => {
      this.isTransitioning = true;
      this.transitionEffect = effect;
      this.transitionDirection = direction;
      this.transitionDuration = duration;
      this.transitionStartTime = performance.now();
      return new Promise((resolve) => {
        this.transitionCallback = resolve;
      });
    };
    if (this.isTransitioning) {
      // chain onto the existing callback
      const prevCallback = this.transitionCallback;
      return new Promise((resolve) => {
        this.transitionCallback = () => {
          prevCallback?.();
          schedule().then(resolve);
        };
      });
    }
    return schedule();
  }

  /**
   * Update an in-progress transition. Should be called once per frame from
   * the engine render loop. When the transition ends it cleans up and calls
   * the stored callback.
   */
  updateTransition = () => {
    if (!this.isTransitioning) {
      return;
    }
    const now = performance.now();
    let progress = (now - this.transitionStartTime) / this.transitionDuration;
    if (progress >= 1.0) {
      progress = 1.0;
    }
    // Draw the overlay using a GPU full-screen quad. Each effect has its own
    // compiled shader. We lazily compile the program on first use via
    // `initTransitionProgram()` and then draw a quad using the effect.
    this.renderTransition(progress);
    if (progress >= 1.0) {
      // finalize
      this.isTransitioning = false;
      const cb = this.transitionCallback;
      this.transitionCallback = null;
      cb && cb();
    }
  }

  /**
   * Compile and cache a WebGL shader program for the requested transition
   * effect. The program draws a full-screen quad with a fragment shader
   * specific to the effect (fade, cross or swirl). This function is called
   * automatically by `renderTransition()` the first time an effect is used.
   *
   * @param {string} effect Name of the transition effect.
   */
  initTransitionProgram = (effect) => {
    const { gl } = this.engine;
    // If already initialized, do nothing.
    if (this.transitionGL[effect]) return;
    // Load shader sources from the transition shader files. We normalize
    // effect names that start with "fade" to the base "fade" directory.
    let effectName = effect;
    if (effectName.startsWith('fade')) {
      effectName = 'fade';
    }

    // Require the vertex and fragment shaders for the selected effect.
    let [vsSource, fsSource] = fetchTransitionShaderFiles(effectName);

    // Compile and link the program.
    const vertexShader = this.loadShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = this.loadShader(gl.FRAGMENT_SHADER, fsSource);
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.bindAttribLocation(program, 0, 'aPosition');
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error('Could not link transition shader program');
    }
    // Create a buffer for the quad vertices (-1 to 1). We'll use a
    // triangle strip with four vertices.
    const quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    // Four corners: bottom-left, top-left, bottom-right, top-right.
    const vertices = new Float32Array([
      -1.0, -1.0,
      -1.0, 1.0,
      1.0, -1.0,
      1.0, 1.0,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    // Get uniform locations.
    const uProgress = gl.getUniformLocation(program, 'uProgress');
    const uDirection = gl.getUniformLocation(program, 'uDirection');
    // Store compiled resources.
    this.transitionGL[effect] = {
      program: program,
      buffer: quadBuffer,
      uProgress: uProgress,
      uDirection: uDirection,
    };
    // No need to keep shaders after linking.
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
  }

  /**
   * Render the transition overlay. This draws a full-screen quad with the
   * precompiled shader corresponding to the current transition effect.
   *
   * @param {number} progress A value between 0 and 1 indicating the
   * progress of the transition.
   */
  renderTransition = (progress) => {
    if (!this.engine.spritz.loaded) return;
    const { gl } = this.engine;
    const effect = this.transitionEffect || 'fade';
    // Ensure the program is compiled.
    this.initTransitionProgram(effect);
    const trans = this.transitionGL[effect];
    if (!trans) return;
    // Save WebGL state that we'll modify. We need to disable the depth test and
    // set blending appropriately so the overlay blends over the 3D scene.
    const depthEnabled = gl.isEnabled(gl.DEPTH_TEST);
    const blendEnabled = gl.isEnabled(gl.BLEND);
    // Draw the quad.
    gl.useProgram(trans.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, trans.buffer);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    // Set uniforms: progress and direction (0 for out, 1 for in).
    gl.uniform1f(trans.uProgress, progress);
    const directionVal = this.transitionDirection === 'in' ? 1.0 : 0.0;
    gl.uniform1f(trans.uDirection, directionVal);
    // Configure blending and disable depth to ensure the overlay draws on top.
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    // Draw the quad as a triangle strip (4 vertices -> 2 triangles).
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    // Restore previous state.
    if (depthEnabled) {
      gl.enable(gl.DEPTH_TEST);
    } else {
      gl.disable(gl.DEPTH_TEST);
    }
    if (!blendEnabled) {
      gl.disable(gl.BLEND);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.useProgram(null);
  }

  /**
   * Display Skybox
   */
  renderSkybox = () => {
    if (!this.engine.spritz.loaded) return;
    this.skyboxManager.renderSkybox(this.uProjMat);
  }

  /**
   * Reset debug counters at the start of a new frame. This should be
   * invoked by the engine's render loop before any drawing takes place.
   */
  resetDebugCounters = () => {
    if (this.debug) {
      this.debug.tilesDrawn = 0;
      this.debug.spritesDrawn = 0;
      this.debug.objectsDrawn = 0;
    }
  }
}
