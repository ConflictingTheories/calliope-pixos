/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2023 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */

import createTransition from 'gl-transition';

// Absolute imports
import { create, create3, normalFromMat4, rotate, translate, perspective, set } from '../../utils/math/matrix4.jsx';
import { Vector, negate, degToRad } from '../../utils/math/vector.jsx';
import { OBJ } from '../../utils/obj/index.js';

import CameraManager from './camera.jsx';
import LightManager from './light.jsx';
import GLEngine from '../index.jsx';

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

      // Transitions
      this.isTransitioning = false;
      this.transition = null;
      this.transitionParams = {};
      this.transitionTexture = null;
      this.transitionDuration = 0;
      this.transitionTime = new Date().getMilliseconds();

      // Camera
      this.camera = CameraManager.getInstance().createCamera(this);

      // Lights
      this.lightManager = LightManager.getInstance().createLightManager(this);

      // Methods
      this.initShaderProgram = this.initShaderProgram.bind(this);
      this.initShaderEffects = this.initShaderEffects.bind(this);
      this.activateShaderProgram = this.activateShaderProgram.bind(this);
      this.activateShaderEffectProgram = this.activateShaderEffectProgram.bind(this);
    }
    return RenderManager._instance;
  }

  /**
   *
   */
  init() {
    const { spritz, gl } = this.engine;

    // Configure GL
    gl.clearColor(0, 1.0, 0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);

    // Initialize Shader Programs
    this.initShaderProgram(spritz.shaders);

    // Initialize Effects
    if (spritz.effects) {
      for (let i in spritz.effects) {
        // todo --- needs work --> Doesn't apply filter correctly
        // spritz.effectPrograms[i] = this.initShaderEffects(gl, spritz.effects[i]);
      }
    }

    // Initialize Project Matrix
    this.initProjection();

    this.initializedWebGl = true;
  }

  /**
   * Load and Compile Shader Source
   * @param {*} type
   * @param {*} source
   * @returns
   */
  loadShader(type, source) {
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
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      throw new Error(`WebGL unable to initialize the shader program: ${shaderProgram}`);
    }

    // Configure Shader

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

    shaderProgram.useSampler = gl.getUniformLocation(shaderProgram, 'useSampler');
    shaderProgram.useDiffuse = gl.getUniformLocation(shaderProgram, 'useDiffuse');
    shaderProgram.scale = gl.getUniformLocation(shaderProgram, 'u_scale');

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
    shaderProgram.setMatrixUniforms = function (scale = null, sampler = 1.0) {
      gl.uniformMatrix4fv(this.pMatrixUniform, false, self.uProjMat);
      gl.uniformMatrix4fv(this.mMatrixUniform, false, self.uModelMat);
      gl.uniformMatrix4fv(this.vMatrixUniform, false, self.camera.uViewMat);

      // normal
      self.normalMat = create3();
      normalFromMat4(self.normalMat, self.uModelMat);
      gl.uniformMatrix3fv(this.nMatrixUniform, false, self.normalMat);

      // scale
      gl.uniform3fv(this.scale, scale ? scale.toArray() : self.scale.toArray());

      // use sampler or materials?
      gl.uniform1f(this.useSampler, sampler);

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

    gl.useProgram(shaderProgram);
    
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
  };

  /**
   * Initialize Shader Effect (blur, depth of field, etc)
   * @param {*} id
   * @returns
   */
  activateShaderEffectProgram = (id) => {
    const { gl } = this.engine;
    gl.useProgram(this.effects[id]);
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
    gl.linkProgram(effectProgram);
    if (!gl.getProgramParameter(effectProgram, gl.LINK_STATUS)) {
      throw new Error(`WebGL unable to initialize the shader effect program: ${effectProgram}`);
    }

    // apply calLback
    this.effects[id] = init.call(self, effectProgram);
    return this.effects[id];
  };

  /**
   * Set FOV and Perspective
   */
  initProjection() {
    const { gl } = this.engine;
    const fieldOfView = degToRad(this.camera.fov);
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    this.uProjMat = perspective(fieldOfView, aspect, zNear, zFar);
    this.camera.uViewMat = create();
    this.uProjMat[5] *= -1;
  }

  /**
   * Clear Screen with Color (RGBA)
   */
  clearScreen() {
    const { gl } = this.engine;
    gl.viewport(0, 0, gl.canvas.clientWidth, gl.canvas.clientHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    perspective(degToRad(this.camera.fov), gl.canvas.clientWidth / gl.canvas.clientHeight, 0.1, 100.0, this.uProjMat);
    this.camera.uViewMat = create();
  }

  /**
   * Go Fullscreen
   */
  toggleFullscreen() {
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
  mvPushMatrix() {
    let copy = create();
    set(this.uModelMat, copy);
    let m = create();
    set(this.camera.uViewMat, m);
    this.modelViewMatrixStack.push([copy, m]);
  }

  /**
   * pop model stack and apply view
   */
  mvPopMatrix() {
    if (this.modelViewMatrixStack.length == 0) {
      throw 'Invalid popMatrix!';
    }
    [this.uModelMat, this.camera.uViewMat] = this.modelViewMatrixStack.pop();
  }

  /**
   * Render Frame
   */
  transition() {
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
  createBuffer(contents, type, itemSize) {
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
  updateBuffer(buffer, contents) {
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
  bindBuffer(buffer, attribute) {
    let { gl } = this.engine;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(attribute, buffer.itemSize, gl.FLOAT, false, 0, 0);
  }

  // transition (fade, swipe, etc)
  startTransition(type, params) {
    // TODO --- NEEDS SOME WORK....
    let { gl } = this.engine;

    // transition textures
    this.transitionTexture = gl.createTexture();

    // create and bind to framebuffer
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.bindTexture(gl.TEXTURE_2D, this.transitionTexture);

    // render to the canvas
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // attach the texture as the first color attachment
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.transitionTexture, 0);

    // determine shader for the transition
    let glsl = '';
    let defaultParams = {};
    let paramsTypes = {};
    switch (type) {
      case 'glitch':
        glsl = `
            vec4 transition(vec2 p) {
              vec2 block = floor(p.xy / vec2(16));
              vec2 uv_noise = block / vec2(64);
              uv_noise += floor(vec2(progress) * vec2(1200.0, 3500.0)) / vec2(64);
              vec2 dist = progress > 0.0 ? (fract(uv_noise) - 0.5) * 0.3 *(1.0 -progress) : vec2(0.0);
              vec2 red = p + dist * 0.2;
              vec2 green = p + dist * .3;
              vec2 blue = p + dist * .5;
            
              return vec4(mix(getFromColor(red), getToColor(red), progress).r,mix(getFromColor(green), getToColor(green), progress).g,mix(getFromColor(blue), getToColor(blue), progress).b,1.0);
            }
          `;
        break;
      case 'doorway':
        defaultParams = { reflection: 0.4, perspective: 0.4, depth: 3 };
        paramsTypes = { reflection: 'float', perspective: 'float', depth: 'float' };
        glsl = `
              uniform float reflection; // = 0.4
              uniform float perspective; // = 0.4
              uniform float depth; // = 3
  
              const vec4 black = vec4(0.0, 0.0, 0.0, 1.0);
              const vec2 boundMin = vec2(0.0, 0.0);
              const vec2 boundMax = vec2(1.0, 1.0);
  
              bool inBounds (vec2 p) {
                return all(lessThan(boundMin, p)) && all(lessThan(p, boundMax));
              }
  
              vec2 project (vec2 p) {
                return p * vec2(1.0, -1.2) + vec2(0.0, -0.02);
              }
  
              vec4 bgColor (vec2 p, vec2 pto) {
                vec4 c = black;
                pto = project(pto);
                if (inBounds(pto)) {
                  c += mix(black, getToColor(pto), reflection * mix(1.0, 0.0, pto.y));
                }
                return c;
              }
  
              vec4 transition (vec2 p) {
                vec2 pfr = vec2(-1.), pto = vec2(-1.);
                float middleSlit = 2.0 * abs(p.x-0.5) - progress;
                if (middleSlit > 0.0) {
                  pfr = p + (p.x > 0.5 ? -1.0 : 1.0) * vec2(0.5*progress, 0.0);
                  float d = 1.0/(1.0+perspective*progress*(1.0-middleSlit));
                  pfr.y -= d/2.;
                  pfr.y *= d;
                  pfr.y += d/2.;
                }
                float size = mix(1.0, depth, 1.-progress);
                pto = (p + vec2(-0.5, -0.5)) * vec2(size, size) + vec2(0.5, 0.5);
                if (inBounds(pfr)) {
                  return getFromColor(pfr);
                }
                else if (inBounds(pto)) {
                  return getToColor(pto);
                }
                else {
                  return bgColor(p, pto);
                }
              }
            `;
        break;
      case 'fade-out':
        glsl = `
            vec4 transition (vec2 uv) {
              return mix(
                getFromColor(uv),
                getToColor(uv),
                progress
              );
            }
          `;
        break;
      case 'swipe':
        break;
      case 'pixelize':
      default:
        defaultParams = { squaresMind: [20, 20], steps: 50 };
        paramsTypes = { squaresMind: 'vec2', steps: 'int' };
        glsl = `
            uniform ivec2 squaresMin/* = ivec2(20) */; // minimum number of squares (when the effect is at its higher level)
            uniform int steps /* = 50 */; // zero disable the stepping
  
            float d = min(progress, 1.0 - progress);
            float dist = steps>0 ? ceil(d * float(steps)) / float(steps) : d;
            vec2 squareSize = 2.0 * dist / vec2(squaresMin);
  
            vec4 transition(vec2 uv) {
              vec2 p = dist>0.0 ? (floor(uv / squareSize) + 0.5) * squareSize : uv;
              return mix(getFromColor(p), getToColor(p), progress);
            }
          `;
        break;
    }

    // transition object
    let transitionObject = {
      name: params.name ?? 'transition',
      author: params.author ?? 'unknown',
      license: params.author ?? 'unknown',
      glsl: glsl,
      defaultParams: defaultParams,
      paramsTypes: paramsTypes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // setup transition & duration
    this.transition = createTransition(gl, transitionObject);
    this.isTransitioning = true;
    this.transitionDuration = (params.duration ?? 1) * 1000;
    this.transitionTime = new Date().getMilliseconds + this.transitionDuration;
    this.transitionParams = params;
  }
}
