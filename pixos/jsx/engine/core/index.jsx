/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2022 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */

// Third-party imports
import { store } from 'react-recollect';
import Dexie from 'dexie';

// Absolute imports
import { create, create3, normalFromMat4, rotate, translate, perspective, set } from '@Engine/utils/math/matrix4.jsx';
import { Vector, negate } from '@Engine/utils/math/vector.jsx';
import { Texture, ColorTexture } from '@Engine/core/texture.jsx';
import { textScrollBox } from '@Engine/core/hud.jsx';
import { GamePad } from '@Engine/utils/gamepad/index.jsx';
import { OBJ } from '@Engine/utils/obj';

// Relative imports
import { AudioLoader } from '../utils/loaders/AudioLoader.jsx';
import Speech from '@Engine/core/speech.jsx';
import Light from '@Engine/core/light.jsx';
import Keyboard from '@Engine/utils/keyboard.jsx';
import createTransition from 'gl-transition';

export default class GLEngine {
  
  /**
   * Core Pixos Graphics & Game Engine
   * @param {*} canvas
   * @param {*} hud
   * @param {*} mipmap
   * @param {*} gamepadcanvas
   * @param {*} fileUpload
   * @param {*} width
   * @param {*} height
   */
  constructor(canvas, hud, mipmap, gamepadcanvas, fileUpload, width, height) {
    this.uViewMat = create();
    this.uProjMat = create();
    this.normalMat = create3();
    this.scale = new Vector(1, 1, 1);
    this.canvas = canvas;
    this.hud = hud;
    this.gamepadcanvas = gamepadcanvas;
    this.mipmap = mipmap;
    this.fileUpload = fileUpload;
    this.width = width;
    this.height = height;
    this.modelViewMatrixStack = [];
    this.globalStore = {};
    this.textures = [];
    this.speeches = [];
    this.isTransitioning = false;
    this.transition = null;
    this.transitionParams = {};
    this.transitionTexture = null;
    this.transitionDuration = 0;
    this.transitionTime = new Date().getMilliseconds();
    this.cameraAngle = 45;
    this.cameraVector = new Vector(...[1, 0, 0]);
    this.cameraDir = 'N';
    this.lights = [];
    this.effects = [];
    this.fov = 45;
    this.cameraPosition = new Vector(8, 8, -1);
    this.cameraOffset = new Vector(0, 0, 0);
    this.setCamera = this.setCamera.bind(this);
    this.render = this.render.bind(this);
    this.panCameraCCW = this.panCameraCCW.bind(this);
    this.panCameraCW = this.panCameraCW.bind(this);
    this.tiltCameraCCW = this.tiltCameraCCW.bind(this);
    this.tiltCameraCW = this.tiltCameraCW.bind(this);
    this.pitchCameraCCW = this.pitchCameraCCW.bind(this);
    this.pitchCameraCW = this.pitchCameraCW.bind(this);
    this.objLoader = OBJ;
    this.voice = new SpeechSynthesisUtterance();
    this.audioLoader = new AudioLoader(this);
    this.Vector = Vector;
    // database
    this.db = new Dexie('hyperspace');
    this.db.version(1).stores({
      tileset: '++id, name, creator, type, checksum, signature, timestamp', // Primary key and indexed props
      inventory: '++id, name, creator, type, checksum, signature, timestamp', // Primary key and indexed props
      spirits: '++id, name, creator, type, checksum, signature, timestamp', // Primary key and indexed props
      abilities: '++id, name, creator, type checksum, signature, timestamp', // Primary key and indexed props
      models: '++id, name, creator, type, checksum, signature, timestamp', // Primary key and indexed props
      accounts: '++id, name, type, checksum, signature, timestamp', // Primary key and indexed props
      dht: '++id, name, type, ip, checksum, signature, timestamp', // Primary key and indexed props
      msg: '++id, name, type, ip, checksum, signature, timestamp', // Primary key and indexed props
      tmp: '++id, key, value, timestamp', // key-store
    });
    // Store setup - session based
    store.pixos = {};
    this.store = store.pixos;
  }

  /**
   * add a light source to the renderer
   * @param {*} id
   * @param {*} pos
   * @param {*} color
   * @param {*} attentuation
   * @param {*} enabled
   */
  addLight(id, pos, color, attentuation = [0.5, 0.1, 0.0], enabled = true) {
    this.lights.push(new Light(id, color, pos, attentuation, enabled));
  }

  /**
   * add a light source to the renderer
   * @param {*} id
   */
  removeLight(id) {
    this.lights = this.lights.filter((light) => light.id !== id);
  }

  /**
   * Initialize a Spritz object
   * @param {*} spritz
   */
  async init(spritz) {
    const ctx = this.hud.getContext('2d');
    const gl = this.canvas.getContext('webgl2');
    const gp = this.gamepadcanvas.getContext('2d');

    if (!gl) {
      throw new Error('WebGL : unable to initialize');
    }
    if (!ctx) {
      throw new Error('Canvas : unable to initialize HUD');
    }
    if (!gp) {
      throw new Error('Gamepad : unable to initialize Mobile Canvas');
    }

    // gamepad controller
    const gamepad = new GamePad(gp);
    gamepad.init();

    // Configure HUD
    ctx.canvas.width = gl.canvas.clientWidth;
    ctx.canvas.height = gl.canvas.clientHeight;

    this.initializedWebGl = true;
    this.gl = gl;
    this.ctx = ctx;
    this.gp = gp;
    this.time = new Date().getTime();
    this.spritz = spritz;
    this.keyboard = new Keyboard();
    this.fullscreen = false;
    this.touch = gamepad.listen.bind(gamepad);
    this.gamepad = gamepad;

    // Configure GL
    gl.clearColor(0, 1.0, 0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);

    // Initialize Shader
    this.initShaderProgram(gl, spritz.shaders);

    // Initialize Effects
    if (spritz.effects) {
      for (let i in spritz.effects) {
        // todo --- needs work --> Doesn't apply filter correctly
        // this.initShaderEffects(gl, spritz.effects[i]);
      }
    }

    // Initialize Project Matrix
    this.initProjection(gl);

    // Initialize Spritz
    await spritz.init(this);
  }

  /**
   * fetch value
   * @param {*} store
   * @param {*} key
   * @returns
   */
  async dbGet(store, key) {
    return await this.db[store].get(key);
  }

  /**
   * add key to db store and returns id
   * @param {*} store
   * @param {*} value
   * @returns
   */
  async dbAdd(store, value) {
    return await this.db[store].add({ ...value });
  }

  /**
   * update key to db store returns number of rows
   * @param {*} store
   * @param {*} id
   * @param {*} changes
   * @returns
   */
  async dbUpdate(store, id, changes) {
    return await this.db[store].update(id, { ...changes });
  }

  /**
   * update key to db store returns number of rows
   * @param {*} store
   * @param {*} id
   * @returns
   */
  async dbRemove(store, id) {
    return await this.db[store].delete(id);
  }

  /**
   * fetch value from store
   * @param {*} key
   * @returns
   */
  fetchStore(key) {
    return this.store[key];
  }

  /**
   * add key to store and returns id
   * @param {*} key
   * @param {*} value
   * @returns
   */
  addStore(key, value) {
    return (this.store[key] = { ...value });
  }

  /**
   * update key in store returns number of rows
   * @param {*} key
   * @param {*} changes
   * @returns
   */
  updateStore(key, changes) {
    return (this.store[key] = { ...changes });
  }

  /**
   * delete key from store returns number of rows
   * @param {*} key
   * @returns
   */
  delStore(key) {
    return (this.store[key] = null);
  }

  /**
   * Load and Compile Shader Source
   * @param {*} gl
   * @param {*} type
   * @param {*} source
   * @returns
   */
  loadShader(gl, type, source) {
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
   * @param {*} gl
   * @param {*} param1
   * @returns
   */
  initShaderProgram = (gl, { vs: vsSource, fs: fsSource }) => {
    const self = this;
    const vertexShader = this.loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = this.loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
    // generate shader
    let shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      throw new Error(`WebGL unable to initialize the shader program: ${shaderProgram}`);
    }
    // Configure Shader
    gl.useProgram(shaderProgram);
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
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, 'uPMatrix');
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, 'uMVMatrix');
    shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, 'uNormalMatrix');
    shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, 'uSampler');
    shaderProgram.diffuseMapUniform = gl.getUniformLocation(shaderProgram, 'uDiffuseMap');
    // lighting
    shaderProgram.uLightPosition = gl.getUniformLocation(shaderProgram, 'uLightPosition');
    shaderProgram.uLightColor = gl.getUniformLocation(shaderProgram, 'uLightColor');
    shaderProgram.uLightDirection = gl.getUniformLocation(shaderProgram, 'uLightDirection');
    shaderProgram.uLightIsDirectional = gl.getUniformLocation(shaderProgram, 'uLightIsDirectional');

    shaderProgram.uLightPosition = gl.getUniformLocation(shaderProgram, 'uLightPosition');
    shaderProgram.uLightColor = gl.getUniformLocation(shaderProgram, 'uLightColor');
    shaderProgram.uLightDirection = gl.getUniformLocation(shaderProgram, 'uLightDirection');
    shaderProgram.uLightIsDirectional = gl.getUniformLocation(shaderProgram, 'uLightIsDirectional');

    shaderProgram.useSampler = gl.getUniformLocation(shaderProgram, 'useSampler');
    shaderProgram.useLighting = gl.getUniformLocation(shaderProgram, 'useLighting');
    shaderProgram.useDiffuse = gl.getUniformLocation(shaderProgram, 'useDiffuse');
    shaderProgram.scale = gl.getUniformLocation(shaderProgram, 'u_scale');

    // light uniforms
    shaderProgram.uLights = gl.getUniformLocation(shaderProgram, 'uLights');
    shaderProgram.uLightVMatrix = gl.getUniformLocation(shaderProgram, 'uLightVMatrix');
    shaderProgram.uLightPMatrix = gl.getUniformLocation(shaderProgram, 'uLightPMatrix');

    // Uniform apply
    shaderProgram.setMatrixUniforms = function (scale = null, sampler = 1.0) {
      gl.uniformMatrix4fv(this.pMatrixUniform, false, self.uProjMat);
      gl.uniformMatrix4fv(this.mvMatrixUniform, false, self.uViewMat);
      // normal
      self.normalMat = create3();
      normalFromMat4(self.normalMat, self.uViewMat);
      gl.uniformMatrix3fv(this.nMatrixUniform, false, self.normalMat);

      // main - point lighting (OLD)
      gl.uniform3fv(this.uLightPosition, self.lights[0].pos);
      gl.uniform3fv(this.uLightColor, self.lights[0].color);
      gl.uniform3fv(this.uLightDirection, self.lights[0].direction ?? []);
      gl.uniform1f(this.uLightIsDirectional, 0.0);
      gl.uniform1f(this.useLighting, 0.0);

      // point lights
      self.updateLights();

      // scale
      gl.uniform3fv(this.scale, scale ? scale.toArray() : self.scale.toArray());
      // use sampler or materials?
      gl.uniform1f(this.useSampler, sampler);
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
   * Update Point lighting
   * @returns
   */
  updateLights() {
    for (let i = 0; i < this.lights.length; i++) {
      this.lights[i].tick();
      if (this.shaderProgram && this.shaderProgram.uLights) {
        let lightUniforms = this.shaderProgram.uLights[i];
        gl.uniform1f(lightUniforms.enabled, this.lights[i].enabled ? 1.0 : 0.0);
        gl.uniform3fv(lightUniforms.position, this.lights[i].pos);
        gl.uniform3fv(lightUniforms.color, this.lights[i].color);
        gl.uniform3fv(lightUniforms.attenuation, this.lights[i].attenuation);
      }
    }
  }

  /**
   * Initialize Shader Effect (blur, depth of field, etc)
   * @returns
   */
  activateShaderProgram = () => {
    this.gl.useProgram(this.shaderProgram);
  };

  /**
   * Initialize Shader Effect (blur, depth of field, etc)
   * @param {*} id
   * @returns
   */
  activateShaderEffectProgram = (id) => {
    this.gl.useProgram(this.effects[id]);
  };

  /**
   * Initialize Shader Effect (blur, depth of field, etc)
   * @param {*} gl
   * @param {*} param1
   * @returns
   */
  initShaderEffects = (gl, { vs: vsSource, fs: fsSource, id: id, callback: callback }) => {
    const self = this;
    console.log({ id, callback, vsSource, fsSource });
    const vertexShader = this.loadShader(gl, gl.VERTEX_SHADER, vsSource);
    console.log({ vsSource, vertexShader });
    const fragmentShader = this.loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
    console.log({ fsSource, fragmentShader });

    // generate shader
    let effectProgram = gl.createProgram();
    gl.attachShader(effectProgram, vertexShader);
    gl.attachShader(effectProgram, fragmentShader);
    gl.linkProgram(effectProgram);
    if (!gl.getProgramParameter(effectProgram, gl.LINK_STATUS)) {
      throw new Error(`WebGL unable to initialize the shader effect program: ${effectProgram}`);
    }
    // apply calLback
    this.effects[id] = callback.call(self, effectProgram);
    return this.effects[id];
  };

  /**
   * Set FOV and Perspective
   * @param {*} gl
   */
  initProjection(gl) {
    const fieldOfView = this.degToRad(this.fov);
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    this.uProjMat = perspective(fieldOfView, aspect, zNear, zFar);
    this.uViewMat = create();
    this.uProjMat[5] *= -1;
  }

  /**
   * Set Camera Pos & Angle
   */
  setCamera() {
    translate(this.uViewMat, this.uViewMat, [0.0, 0.0, -15.0]);
    rotate(this.uViewMat, this.uViewMat, this.degToRad(this.cameraAngle * this.cameraVector.x), [1, 0, 0]);
    rotate(this.uViewMat, this.uViewMat, this.degToRad(this.cameraAngle * this.cameraVector.y), [0, 1, 0]);
    rotate(this.uViewMat, this.uViewMat, this.degToRad(this.cameraAngle * this.cameraVector.z), [0, 0, 1]);
    negate(this.cameraPosition, this.cameraOffset);
    translate(this.uViewMat, this.uViewMat, this.cameraOffset.toArray());
  }

  // Set Camera Pos & Angle
  panCameraCW(radians = Math.PI / 4) {
    this.cameraVector.z -= Math.cos(radians);
  }
  panCameraCCW(radians = Math.PI / 4) {
    // different angles for facings
    // [1. 0, 4] - S (Reversed) (up/down)
    // [1. 0, 3] - SW (Iso)
    // [1. 0, 2] - W (left/right)
    // [1, 0, 1] - NW (Iso)
    // [1, 0, 0] - N (Normal) (up/down)
    // [1. 0, -1] - NE (Iso)
    // [1. 0, -2] - E (left/right)
    // [1. 0, -3] - SE (Iso)
    this.cameraVector.z += Math.cos(radians);
  }
  // Set Camera Pos & Angle
  pitchCameraCW(radians = Math.PI / 4) {
    this.cameraVector.x -= Math.cos(radians);
  }
  pitchCameraCCW(radians = Math.PI / 4) {
    this.cameraVector.x += Math.sin(radians);
  }
  // Set Camera Pos & Angle
  tiltCameraCW(radians = Math.PI / 4) {
    this.cameraVector.y -= Math.cos(radians);
  }
  tiltCameraCCW(radians = Math.PI / 4) {
    this.cameraVector.z += Math.sin(radians);
  }

  /**
   * Clear Screen with Color (RGBA)
   */
  clearScreen() {
    const { gl } = this;
    gl.viewport(0, 0, this.ctx.canvas.clientWidth, this.ctx.canvas.clientHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    perspective(this.degToRad(this.fov), this.ctx.canvas.clientWidth / this.ctx.canvas.clientHeight, 0.1, 100.0, this.uProjMat);
    this.uViewMat = create();
  }

  /**
   * clear HUD overlay
   */
  clearHud() {
    const { ctx } = this;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  /**
   * Write Text to HUD
   * @param {string} text
   * @param {number} x
   * @param {number} y
   * @param {string} src
   */
  writeText(text, x, y, src = null) {
    const { ctx } = this;
    ctx.save();
    ctx.font = '20px invasion2000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'white';
    if (src) {
      // draw portrait if set
      ctx.fillText(text, x ?? ctx.canvas.width / 2 + 76, y ?? ctx.canvas.height / 2);
      ctx.drawImage(src, x ?? ctx.canvas.width / 2, y ?? ctx.canvas.height / 2, 76, 76);
    } else {
      ctx.fillText(text, x ?? ctx.canvas.width / 2, y ?? ctx.canvas.height / 2);
    }
    ctx.restore();
  }

  /**
   * Text to Speech output
   * @param {string} text
   * @param {SpeechSynthesisVoice} voice
   * @param {string} lang
   * @param {number} rate
   * @param {number} volume
   * @param {number} pitch
   */
  speechSynthesis(text, voice = null, lang = 'en', rate = null, volume = null, pitch = null) {
    let speech = this.voice;
    let voices = window.speechSynthesis.getVoices() ?? [];
    // set voice
    speech.voice = voices[0];
    if (rate) speech.rate = rate;
    if (volume) speech.volume = volume;
    if (pitch) speech.pitch = pitch;
    speech.text = text;
    speech.lang = lang;
    // speak
    window.speechSynthesis.speak(speech);
  }

  /**
   * Greeting Text
   * @param {string} text
   */
  setGreeting(text) {
    this.globalStore.greeting = text;
  }

  /**
   * Scrolling Textbox
   * @param {string} text
   * @param {booleanq} scrolling
   * @param {*} options
   * @returns
   */
  scrollText(text, scrolling = false, options = {}) {
    let txt = new textScrollBox(this.ctx);
    txt.init(text, 10, (2 * this.canvas.clientHeight) / 3, this.canvas.clientWidth - 20, this.canvas.clientHeight / 3 - 20, options);
    txt.setOptions(options);
    if (scrolling) {
      txt.scroll((Math.sin(new Date().getTime() / 3000) + 1) * txt.maxScroll * 0.5); // default oscillate
    }
    txt.render();
    return txt;
  }

  /**
   * Screensize
   * @returns
   */
  screenSize() {
    return {
      width: this.canvas.clientWidth,
      height: this.canvas.clientHeight,
    };
  }

  /**
   * Draws a button
   * @param {string} text
   * @param {number} x
   * @param {number} y
   * @param {number} w
   * @param {number} h
   * @param {*} colours
   */
  drawButton(text, x, y, w, h, colours) {
    const { ctx } = this;

    let halfHeight = h / 2;

    ctx.save();

    // draw the button
    ctx.fillStyle = colours.background;

    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.rect(x, y, w, h);
    ctx.fill();
    ctx.clip();

    // light gradient
    var grad = ctx.createLinearGradient(x, y, x, y + halfHeight);
    grad.addColorStop(0, 'rgb(221,181,155)');
    grad.addColorStop(1, 'rgb(22,13,8)');
    ctx.fillStyle = grad;
    ctx.globalAlpha = 0.5;
    ctx.fillRect(x, y, w, h);

    // draw the top half of the button
    ctx.fillStyle = colours.top;

    // draw the top and bottom particles
    for (var i = 0; i < h; i += halfHeight) {
      ctx.fillStyle = i === 0 ? colours.top : colours.bottom;

      for (var j = 0; j < 50; j++) {
        // get random values for particle
        var partX = x + Math.random() * w;
        var partY = y + i + Math.random() * halfHeight;
        var width = Math.random() * 10;
        var height = Math.random() * 10;
        var rotation = Math.random() * 360;
        var alpha = Math.random();

        ctx.save();

        // rotate the canvas by 'rotation'
        ctx.translate(partX, partY);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-partX, -partY);

        // set alpha transparency to 'alpha'
        ctx.globalAlpha = alpha;

        ctx.fillRect(partX, partY, width, height);

        ctx.restore();
      }
    }

    ctx.font = '20px invasion2000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'white';
    ctx.fillText(text, x + w / 2, y + h / 2, w);

    ctx.restore();
  }

  /**
   * Render Frame
   */
  render() {
    this.requestId = requestAnimationFrame(this.render);
    this.clearScreen();
    this.clearHud();

    // core render loop
    this.activateShaderProgram();
    // this.updateLights();
    this.gamepad.render();
    this.spritz.render(this, new Date().getTime());

    // effect rendering - ex) blur depth of field
    Object.keys(this.effects).map((id) => {
      console.log([id]);
      this.activateShaderEffectProgram(id);
      this.effects[id].draw();
    });

    // transitions - todo - not working
    if (this.isTransitioning) {
      let now = new Date().getMilliseconds();
      this.transition.draw(
        ((this.transitionTime - now) / this.transitionDuration) % 1,
        this.transitionTexture,
        this.transitionTexture,
        this.gl.canvas.width,
        this.gl.canvas.height,
        this.transitionParams
      );
      if (now >= this.transitionTime) {
        this.isTransitioning = false;
      }
    }
  }

  /**
   * Go Fullscreen
   */
  toggleFullscreen() {
    if (!this.fullscreen) {
      try {
        this.gamepadcanvas.parentElement.requestFullscreen();
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
   * individual buffer
   * @param {*} contents
   * @param {*} type
   * @param {*} itemSize
   * @returns
   */
  createBuffer(contents, type, itemSize) {
    let { gl } = this;
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
    let { gl } = this;
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
    let { gl } = this;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(attribute, buffer.itemSize, gl.FLOAT, false, 0, 0);
  }

  /**
   * convert a stream to a video
   * @param {*} stream
   * @param {*} ref
   * @returns
   */
  streamToVideo(stream, ref) {
    let video = document.createElement('video');
    if (ref) {
      video = ref.current;
    }
    video.srcObject = stream;
    video.style.width = stream.width;
    video.style.height = stream.height;
    video.play();
    return video;
  }

  /**
   * convert a stream to an image
   * @param {*} stream
   * @param {*} ref
   * @returns
   */
  streamToImage(stream, ref) {
    let video = document.createElement('video');
    if (ref) {
      video = ref.current;
    }
    video.srcObject = stream;
    video.style.width = stream.width;
    video.style.height = stream.height;
    video.play();
    return video;
  }

  /**
   * convert a stream to a texture
   * @param {*} stream
   * @param {*} ref
   * @returns
   */
  streamToTexture(stream, ref) {
    let video = document.createElement('video');
    if (ref) {
      video = ref.current;
    }
    video.srcObject = stream;
    video.style.width = stream.width;
    video.style.height = stream.height;
    video.play();
    return video;
  }

  /**
   * load texture
   * @param {*} src
   * @returns
   */
  loadTexture(src) {
    if (this.textures[src]) return this.textures[src];
    this.textures[src] = new Texture(src, this);
    return this.textures[src];
  }

  /**
   * load texture from zip
   * @param {*} src
   * @param {*} zip
   * @returns
   */
  async loadTextureFromZip(src, zip) {
    if (this.textures[src]) return this.textures[src];
    let imageData = await zip.file(`textures/${src}`).async('arrayBuffer');
    let buffer = new Uint8Array(imageData);
    let blob = new Blob([buffer.buffer]);
    let dataUrl = URL.createObjectURL(blob);
    this.textures[src] = new Texture(dataUrl, this);
    return this.textures[src];
  }

  /**
   * load speech
   * @param {*} src
   * @param {*} canvas
   * @returns
   */
  loadSpeech(src, canvas) {
    if (this.speeches[src]) return this.speeches[src];
    this.speeches[src] = new Speech(canvas, this, src);
    return this.speeches[src];
  }

  /**
   * push new matrix to model stack
   */
  mvPushMatrix() {
    let copy = create();
    set(this.uViewMat, copy);
    this.modelViewMatrixStack.push(copy);
  }

  /**
   * Initalize Canvas from HUD and load as WebGL texture (TODO - make separate canvases)
   * @returns
   */
  initCanvasTexture() {
    let { gl } = this;
    let canvasTexture = gl.createTexture();
    this.handleLoadedTexture(canvasTexture, this.mipmap);
    return canvasTexture;
  }

  /**
   * Load canvas as texture
   * @param {*} texture
   * @param {*} textureCanvas
   */
  handleLoadedTexture(texture, textureCanvas) {
    let { gl } = this;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureCanvas); // This is the important line!
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  /**
   * pop model stack and apply view
   */
  mvPopMatrix() {
    if (this.modelViewMatrixStack.length == 0) {
      throw 'Invalid popMatrix!';
    }
    this.uViewMat = this.modelViewMatrixStack.pop();
  }

  /**
   * Clear Render Loop
   */
  close() {
    cancelAnimationFrame(this.requestId);
  }

  /**
   * Degrees to Radians
   * @param {number} degrees
   * @returns
   */
  degToRad(degrees) {
    return (degrees * Math.PI) / 180;
  }

  // transition (fade, swipe, etc)
  startTransition(type, params) {
    // TODO --- NEEDS SOME WORK....

    let gl = this.gl;

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
