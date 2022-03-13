/*                                                 *\
** ----------------------------------------------- **
**             Calliope - Site Generator   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2021 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */

import { create, create3, normalFromMat4, rotate, translate, perspective, set } from "@Engine/utils/math/matrix4.jsx";
import { Vector, negate } from "@Engine/utils/math/vector.jsx";
import { Texture, ColorTexture } from "./texture.jsx";
import { textScrollBox } from "./hud.jsx";
import { GamePad } from "@Engine/utils/gamepad.jsx";
import Speech from "./speech.jsx";
import { OBJ } from "@Engine/utils/obj";
import Dexie from "dexie";
import { store } from "react-recollect";

export default class GLEngine {
  constructor(canvas, hud, mipmap, gamepadcanvas, width, height) {
    this.uViewMat = create();
    this.uProjMat = create();
    this.normalMat = create3();
    this.scale = new Vector(1, 1, 1);
    this.canvas = canvas;
    this.hud = hud;
    this.gamepadcanvas = gamepadcanvas;
    this.mipmap = mipmap;
    this.width = width;
    this.height = height;
    this.modelViewMatrixStack = [];
    this.globalStore = {};
    this.textures = [];
    this.speeches = [];
    this.cameraAngle = 45;
    this.fov = 45;
    this.cameraPosition = new Vector(8, 8, -1);
    this.cameraOffset = new Vector(0, 0, 0);
    this.setCamera = this.setCamera.bind(this);
    this.render = this.render.bind(this);
    this.objLoader = OBJ;
    // database
    this.db = new Dexie("hyperspace");
    this.db.version(1).stores({
      tileset: "++id, name, creator, type, checksum, signature, timestamp", // Primary key and indexed props
      inventory: "++id, name, creator, type, checksum, signature, timestamp", // Primary key and indexed props
      spirits: "++id, name, creator, type, checksum, signature, timestamp", // Primary key and indexed props
      abilities: "++id, name, creator, type checksum, signature, timestamp", // Primary key and indexed props
      models: "++id, name, creator, type, checksum, signature, timestamp", // Primary key and indexed props
      accounts: "++id, name, type, checksum, signature, timestamp", // Primary key and indexed props
      dht: "++id, name, type, ip, checksum, signature, timestamp", // Primary key and indexed props
      msg: "++id, name, type, ip, checksum, signature, timestamp", // Primary key and indexed props
      tmp: "++id, key, value, timestamp", // key-store
    });
    // Store setup - session based
    store.pixos = {};
    this.store = store.pixos;
  }

  // Initialize a Scene object
  async init(scene, keyboard) {
    // set up canvas
    const ctx = this.hud.getContext("2d");
    const gl = this.canvas.getContext("webgl");
    const gp = this.gamepadcanvas.getContext("2d");
    if (!gl) {
      throw new Error("WebGL : unable to initialize");
    }
    if (!ctx) {
      throw new Error("Canvas : unable to initialize HUD");
    }
    if (!gp) {
      throw new Error("Gamepad : unable to initialize Mobile Canvas");
    }
    this.gl = gl;
    this.ctx = ctx;
    this.gp = gp;
    this.time = new Date().getTime();
    this.scene = scene;
    this.keyboard = keyboard;
    this.fullscreen = false;
    // Configure Mobile Gamepad (if Mobile)
    let gamepad = new GamePad(gp);
    gamepad.init();
    this.touch = gamepad.listen.bind(gamepad);
    this.gamepad = gamepad;
    // Configure HUD
    ctx.canvas.width = this.canvas.width;
    ctx.canvas.height = this.canvas.height;
    // Configure GL
    gl.viewportWidth = this.canvas.width;
    gl.viewportHeight = this.canvas.height;
    gl.clearColor(0, 1.0, 0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
    this.initializedWebGl = true; // flag
    // Initialize Shader
    this.initShaderProgram(gl, scene.shaders);
    // Initialize Project Matrix
    this.initProjection(gl);
    // Initialize Scene
    await scene.init(this);
  }

  // fetch value
  async dbGet(store, key) {
    return await this.db[store].get(key);
  }

  // add key to db store and returns id
  async dbAdd(store, value) {
    return await this.db[store].add({ ...value });
  }

  // update key to db store returns number of rows
  async dbUpdate(store, id, changes) {
    return await this.db[store].update(id, { ...changes });
  }

  // update key to db store returns number of rows
  async dbRemove(store, id) {
    return await this.db[store].delete(id);
  }

  // fetch value from store
  fetchStore(key) {
    return this.store[key];
  }

  // add key to store and returns id
  addStore(key, value) {
    return (this.store[key] = { ...value });
  }

  // update key in store returns number of rows
  updateStore(key, changes) {
    return (this.store[key] = { ...changes });
  }

  // delete key from store returns number of rows
  delStore(key) {
    return (this.store[key] = null);
  }

  // Load and Compile Shader Source
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

  // Initialize Shader Program
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
    shaderProgram.aVertexNormal = gl.getAttribLocation(shaderProgram, "aVertexNormal");
    gl.enableVertexAttribArray(shaderProgram.aVertexNormal);
    // Vertices
    shaderProgram.aVertexPosition = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.aVertexPosition);
    // Texture Coord
    shaderProgram.aTextureCoord = gl.getAttribLocation(shaderProgram, "aTextureCoord");
    gl.enableVertexAttribArray(shaderProgram.aTextureCoord);
    // Uniform Locations
    shaderProgram.uDiffuse = gl.getUniformLocation(shaderProgram, "uDiffuse");
    shaderProgram.uSpecular = gl.getUniformLocation(shaderProgram, "uSpecular");
    shaderProgram.uSpecularExponent = gl.getUniformLocation(shaderProgram, "uSpecularExponent");
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNormalMatrix");
    shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
    shaderProgram.diffuseMapUniform = gl.getUniformLocation(shaderProgram, "uDiffuseMap");
    shaderProgram.scale = gl.getUniformLocation(shaderProgram, "u_scale");
    shaderProgram.useSampler = gl.getUniformLocation(shaderProgram, "useSampler");
    shaderProgram.useDiffuse = gl.getUniformLocation(shaderProgram, "useDiffuse");
    // Uniform apply
    shaderProgram.setMatrixUniforms = function (scale = null, sampler = 1.0) {
      gl.uniformMatrix4fv(this.pMatrixUniform, false, self.uProjMat);
      gl.uniformMatrix4fv(this.mvMatrixUniform, false, self.uViewMat);
      // normal
      self.normalMat = create3();
      normalFromMat4(self.normalMat, self.uViewMat);
      gl.uniformMatrix3fv(this.nMatrixUniform, false, self.normalMat);
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

  // Set FOV and Perspective
  initProjection(gl) {
    const fieldOfView = this.degToRad(this.fov);
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    this.uProjMat = perspective(fieldOfView, aspect, zNear, zFar);
    this.uViewMat = create();
    this.uProjMat[5] *= -1;
  }

  // Set Camera Pos & Angle
  setCamera() {
    translate(this.uViewMat, this.uViewMat, [0.0, 0.0, -15.0]);
    rotate(this.uViewMat, this.uViewMat, this.degToRad(this.cameraAngle), [1, 0, 0]);
    negate(this.cameraPosition, this.cameraOffset);
    translate(this.uViewMat, this.uViewMat, this.cameraOffset.toArray());
  }

  // Clear Screen with Color (RGBA)
  clearScreen() {
    const { gl } = this;
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    perspective(this.degToRad(this.fov), gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, this.uProjMat);
    this.uViewMat = create();
  }

  // clear HUD overlay
  clearHud() {
    const { ctx } = this;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  // Write Text to HUD
  writeText(text, x, y, src = null) {
    const { ctx } = this;
    ctx.save();
    ctx.font = "20px invasion2000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "white";
    if (src) {
      // draw portrait if set
      ctx.fillText(text, x ?? ctx.canvas.width / 2 + 76, y ?? ctx.canvas.height / 2);
      ctx.drawImage(src, x ?? ctx.canvas.width / 2, y ?? ctx.canvas.height / 2, 76, 76);
    } else {
      ctx.fillText(text, x ?? ctx.canvas.width / 2, y ?? ctx.canvas.height / 2);
    }
    ctx.restore();
  }

  // Greeting Text
  setGreeting(text) {
    this.globalStore.greeting = text;
  }

  // Scrolling Textbox
  scrollText(text, scrolling = false, options = {}) {
    let txt = new textScrollBox(this.ctx);
    txt.init(text, 10, (2 * this.canvas.height) / 3, this.canvas.width - 20, this.canvas.height / 3 - 20, options);
    txt.setOptions(options);
    if (scrolling) {
      txt.scroll((Math.sin(new Date().getTime() / 3000) + 1) * txt.maxScroll * 0.5); // default oscillate
    }
    txt.render();
    return txt;
  }

  // Screensize
  screenSize() {
    return {
      width: this.canvas.width,
      height: this.canvas.height,
    };
  }

  // Draws a button
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
    grad.addColorStop(0, "rgb(221,181,155)");
    grad.addColorStop(1, "rgb(22,13,8)");
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

    ctx.font = "20px invasion2000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "white";
    ctx.fillText(text, x + w / 2, y + h / 2, w);

    ctx.restore();
  }

  // Render Frame
  render() {
    this.requestId = requestAnimationFrame(this.render);
    this.clearScreen();
    this.clearHud();
    this.gamepad.render();
    this.scene.render(this, new Date().getTime());
  }

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

  // individual buffer
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

  // update buffer
  updateBuffer(buffer, contents) {
    let { gl } = this;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(contents));
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  // bind buffer
  bindBuffer(buffer, attribute) {
    let { gl } = this;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(attribute, buffer.itemSize, gl.FLOAT, false, 0, 0);
  }

  // load texture
  loadTexture(src) {
    if (this.textures[src]) return this.textures[src];
    this.textures[src] = new Texture(src, this);
    return this.textures[src];
  }

  // load texture
  loadSpeech(src, canvas) {
    if (this.speeches[src]) return this.speeches[src];
    this.speeches[src] = new Speech(canvas, this, src);
    return this.speeches[src];
  }

  // push new matrix to model stack
  mvPushMatrix() {
    let copy = create();
    set(this.uViewMat, copy);
    this.modelViewMatrixStack.push(copy);
  }

  // Initalize Canvas from HUD and load as WebGL texture (TODO - make separate canvases)
  initCanvasTexture() {
    let { gl } = this;
    let canvasTexture = gl.createTexture();
    this.handleLoadedTexture(canvasTexture, this.mipmap);
    return canvasTexture;
  }

  // Load canvas as texture
  handleLoadedTexture(texture, textureCanvas) {
    let { gl } = this;
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureCanvas); // This is the important line!
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  // pop model stack and apply view
  mvPopMatrix() {
    if (this.modelViewMatrixStack.length == 0) {
      throw "Invalid popMatrix!";
    }
    this.uViewMat = this.modelViewMatrixStack.pop();
  }

  // Clear Render Loop
  close() {
    cancelAnimationFrame(this.requestId);
  }

  // Degrees to Radians
  degToRad(degrees) {
    return (degrees * Math.PI) / 180;
  }
}
