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

import React from "react";
import { create, rotate, translate, perspective, set } from "../utils/math/matrix4.jsx";
import { Vector, negate } from "../utils/math/vector.jsx";
import Texture from "./texture.jsx";
import { textScrollBox } from "./hud.jsx";
import Speech from "./speech.jsx";
export default class GLEngine {
  constructor(canvas, hud, mipmap, width, height) {
    this.uViewMat = create();
    this.uProjMat = create();
    this.canvas = canvas;
    this.hud = hud;
    this.mipmap = mipmap;
    this.width = width;
    this.height = height;
    this.modelViewMatrixStack = [];
    this.globalStore = {};
    this.textures = [];
    this.speeches = [];
    this.cameraAngle = 45;
    this.cameraPosition = new Vector(8, 8, -1);
    this.cameraOffset = new Vector(0, 0, 0);
    this.setCamera = this.setCamera.bind(this);
    this.render = this.render.bind(this);
  }

  // Initialize a Scene object
  async init(scene, keyboard, touchHandler) {
    const ctx = this.hud.getContext("2d");
    const gl = this.canvas.getContext("webgl");
    if (!gl) {
      throw new Error("WebGL : unable to initialize");
    }
    if (!ctx) {
      throw new Error("Canvas : unable to initialize HUD");
    }
    this.gl = gl;
    this.ctx = ctx;
    this.time = new Date().getTime();
    this.scene = scene;
    this.keyboard = keyboard;
    this.touch = touchHandler;
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
      throw new Error(`WebGL unable to initialize the shader program: ${gl.getshaderProgramLog(shaderProgram)}`);
    }
    // Configure Shader
    gl.useProgram(shaderProgram);
    // Vertices
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
    // Texture Coord
    shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
    gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);
    // Uniform Locations
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
    // Uniform apply
    shaderProgram.setMatrixUniforms = function () {
      gl.uniformMatrix4fv(this.pMatrixUniform, false, self.uProjMat);
      gl.uniformMatrix4fv(this.mvMatrixUniform, false, self.uViewMat);
    };
    // return
    this.shaderProgram = shaderProgram;
    return shaderProgram;
  };

  // Set FOV and Perspective
  initProjection(gl) {
    const fieldOfView = this.degToRad(45);
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
    perspective(this.degToRad(45), gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, this.uProjMat);
    this.uViewMat = create();
  }

  // clear HUD overlay
  clearHud() {
    const { ctx } = this;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  // Write Text to HUD
  writeText(text, x, y) {
    const { ctx } = this;
    ctx.save();
    ctx.font = "20px invasion2000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "white";
    ctx.fillText(text, x ?? ctx.canvas.width / 2, y ?? ctx.canvas.height / 2);
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
    if (scrolling) {
      txt.scroll((Math.sin(new Date().getTime() / 3000) + 1) * txt.maxScroll * 0.5); // default oscillate
    }
    txt.render();
    return txt;
  }

  // Draws a button
  drawButton(x, y, w, h, colours) {
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

    ctx.restore();
  }

  // Render Frame
  render() {
    this.requestId = requestAnimationFrame(this.render);
    this.clearScreen();
    this.clearHud();
    this.scene.render(this, new Date().getTime());
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
    console.log('requesting speech', src)
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
