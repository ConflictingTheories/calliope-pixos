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
import { Vector, set } from "../utils/math/vector.jsx";
import { Direction } from "../utils/enums.jsx";
import ActionQueue from "./queue.jsx";
import { ActionLoader } from "../utils/loaders.jsx";
import { rotate, translate } from "../utils/math/matrix4.jsx";

export default class ModelObject {
  constructor(engine) {
    this.engine = engine;
    this.templateLoaded = false;
    this.drawOffset = new Vector(0, 0, 0);
    this.hotspotOffset = new Vector(0, 0, 0);
    this.pos = new Vector(0, 0, 0);
    this.facing = Direction.Right;
    this.actionDict = {};
    this.actionList = [];
    this.speech = {};
    this.portrait = null;
    this.onLoadActions = new ActionQueue();
    this.inventory = [];
    this.onTilesetOrTextureLoaded = this.onTilesetOrTextureLoaded.bind(this);
    this.blocking = true; // default - cannot passthrough
    this.override = false;
  }

  update(data) {
    Object.assign(this, data);
  }

  runWhenLoaded(action) {
    if (this.loaded) action();
    else this.onLoadActions.add(action);
  }

  // Load Object and Materials
  onLoad(instanceData) {
    console.log("loading", instanceData);
    if (this.loaded) return;
    if (!instanceData.mesh.vertexBuffer || !instanceData.mesh.indexBuffer) {
      console.error("Invalid object file");
      return;
    }
    // Zone Information
    this.zone = instanceData.zone;
    if (instanceData.id) this.id = instanceData.id;
    if (instanceData.pos) set(instanceData.pos, this.pos);
    if (instanceData.facing && instanceData.facing !== 0) this.facing = instanceData.facing;
    if (instanceData.zones && instanceData.zones !== null) this.zones = instanceData.zones;
    // Adjust Vertices based on position
    this.mesh = instanceData.mesh;
    this.engine.objLoader.initMeshBuffers(this.engine.gl, instanceData.mesh);
    // Speech bubble
    if (this.enableSpeech) {
      this.speech = this.engine.loadSpeech(this.id, this.engine.mipmap);
      console.log("speech ---->>");
      this.speech.runWhenLoaded(this.onTilesetOrTextureLoaded.bind(this));
      this.speechTexBuf = this.engine.createBuffer(this.getSpeechBubbleTexture(), this.engine.gl.DYNAMIC_DRAW, 2);
    }
    // load Portrait
    if (this.portraitSrc) {
      this.portrait = this.engine.loadTexture(this.portraitSrc);
      console.log("portrait ---->>");
      this.portrait.runWhenLoaded(this.onTilesetOrTextureLoaded.bind(this));
    }
    //
    this.zone.tileset.runWhenDefinitionLoaded(this.onTilesetDefinitionLoaded.bind(this));
  }

  // Definition Loaded
  onTilesetDefinitionLoaded() {
    this.zone.tileset.runWhenLoaded(this.onTilesetOrTextureLoaded.bind(this));
  }

  // After Tileset / Texture Loaded
  onTilesetOrTextureLoaded() {
    if (
      !this ||
      this.loaded ||
      (this.enableSpeech && this.speech && !this.speech.loaded) ||
      (this.portrait && !this.portrait.loaded)
    )
      return;

    this.init(); // Hook for sprite implementations
    if (this.enableSpeech && this.speech) {
      if (this.speech.clearHud) {
        this.speech.clearHud();
        this.speech.writeText(this.id);
        this.speech.loadImage();
      }
    }
    this.loaded = true;
    this.onLoadActions.run();
    console.log("Initialized object '" + this.id + "' in zone '" + this.zone.id + "'");
  }

  // Speech Area texture
  getSpeechBubbleTexture() {
    return [
      [1.0, 1.0],
      [0.0, 1.0],
      [0.0, 0.0],
      [1.0, 1.0],
      [0.0, 0.0],
      [1.0, 0.0],
    ].flat(3);
  }

  // speech bubble position
  getSpeechBubbleVertices() {
    return [
      new Vector(...[2, 0, 4]).toArray(),
      new Vector(...[0, 0, 4]).toArray(),
      new Vector(...[0, 0, 2]).toArray(),
      new Vector(...[2, 0, 4]).toArray(),
      new Vector(...[0, 0, 2]).toArray(),
      new Vector(...[2, 0, 2]).toArray(),
    ].flat(3);
  }

  // Draw Object
  draw() {
    if (!this.loaded) return;
    let { engine, mesh } = this;
    engine.objLoader.initMeshBuffers(engine.gl, mesh);
    engine.mvPushMatrix();
    // Vertices
    engine.bindBuffer(mesh.vertexBuffer, engine.shaderProgram.vertexPositionAttribute);
    // Texture
    if (!mesh.textures.length) {
      engine.gl.disableVertexAttribArray(engine.shaderProgram.textureCoordAttribute);
    } else {
      engine.bindBuffer(mesh.textureBuffer, engine.shaderProgram.textureCoordAttribute);
      this.tileset.texture.attach();
    }
    // Normals
    engine.bindBuffer(mesh.normalBuffer, engine.shaderProgram.vertexNormalAttribute);
    // Indices
    engine.gl.bindBuffer(engine.gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
    // draw triangles
    engine.shaderProgram.setMatrixUniforms();
    engine.gl.uniformMatrix4fv(this.normalMatrixUniform, false, engine.normalMat);
    engine.gl.drawElements(engine.gl.TRIANGLES, mesh.indexBuffer.numItems, engine.gl.UNSIGNED_SHORT, 0);
    // Draw
    engine.mvPopMatrix();
    engine.gl.enableVertexAttribArray(engine.shaderProgram.textureCoordAttribute);
  }

  // Set Facing
  setFacing(facing) {
    console.log("setting face to " + Direction.spriteSequence(facing));
    if (facing) this.facing = facing;
    this.setFrame(this.animFrame);
  }

  // Add Action to Queue
  addAction(action) {
    console.log("adding action to sprite", action.id);
    if (this.actionDict[action.id]) this.removeAction(action.id);
    this.actionDict[action.id] = action;
    this.actionList.push(action);
  }

  // Remove Action
  removeAction(id) {
    console.log("removing action");
    this.actionList = this.actionList.filter((action) => action.id !== id);
    delete this.actionDict[id];
  }

  // Remove Action
  removeAllActions() {
    this.actionList = [];
    this.actionDict = {};
  }

  // Tick
  tickOuter(time) {
    if (!this.loaded) return;
    // Sort activities by increasing startTime, then by id
    this.actionList.sort((a, b) => {
      let dt = a.startTime - b.startTime;
      if (!dt) return dt;
      return a.id > b.id ? 1 : -1;
    });
    // Run & Queue for Removal when complete
    let toRemove = [];
    this.actionList.forEach((action) => {
      if (!action.loaded || action.startTime > time) return;
      if (action.tick(time)) {
        toRemove.push(action); // remove from backlog
        action.onComplete(); // call completion handler
      }
    });
    // clear completed activities
    toRemove.forEach((action) => this.removeAction(action.id));
    // tick
    if (this.tick) this.tick(time);
  }

  // Hook for sprite implementations
  init() {
    console.log("- sprite hook", this.id, this.pos);
  }

  // speak
  speak(text, showBubble = false) {
    if (!text) this.speech.clearHud();
    else {
      this.textbox = this.engine.scrollText(this.id + ":> " + text, true, { portrait: this.portrait ?? false });
      if (showBubble && this.speech) {
        this.speech.scrollText(text, false, { portrait: this.portrait ?? false });
        this.speech.loadImage();
      }
    }
  }

  // handles interaction -- default (should be overridden in definition)
  interact(sprite, finish) {
    let ret = null;
    // React based on internal state
    switch (this.state) {
      default:
        break;
    }
    // If completion handler passed through - call it when done
    if (finish) finish(true);
    return ret;
  }

  // Set Facing
  faceDir(facing) {
    if (this.facing == facing || facing === Direction.None) return null;
    return new ActionLoader(this.engine, "face", [facing], this);
  }

  // set message (for chat bubbles)
  setGreeting(greeting) {
    this.speech.clearHud();
    this.speech.writeText(greeting);
    this.speech.loadImage();
    return new ActionLoader(this.engine, "greeting", [greeting, { autoclose: true }], this);
  }
}