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
import { _buildBuffer } from "../utils/obj/utils.js";
export default class ModelObject {
  constructor(engine) {
    this.engine = engine;
    this.templateLoaded = false;
    this.drawOffset = new Vector(0, 0, 0);
    this.hotspotOffset = new Vector(0, 0, 0);
    this.pos = new Vector(0, 0, 0);
    this.size = new Vector(1, 1, 1);
    this.scale = new Vector(1, 1, 1);
    this.rotation = new Vector(0, 0, 0);
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
    if (this.loaded) return;
    // Zone Information
    this.zone = instanceData.zone;
    if (instanceData.id) this.id = instanceData.id;
    if (instanceData.pos) set(instanceData.pos, this.pos);
    if (instanceData.rotation) set(instanceData.rotation, this.rotation);
    if (instanceData.facing && instanceData.facing !== 0) this.facing = instanceData.facing;
    if (instanceData.zones && instanceData.zones !== null) this.zones = instanceData.zones;
    let mesh = instanceData.mesh;
    // Mesh bounds
    let maxX,
      minX = null;
    let maxY,
      minY = null;
    let maxZ,
      minZ = null;
    for (let i = 0; i < mesh.vertices.length; i = i + 3) {
      let v = mesh.vertices.slice(i, i + 3);
      // calculate size
      if (maxX == null || v[0] > maxX) maxX = v[0];
      if (minX == null || v[0] < minX) minX = v[0];
      if (maxY == null || v[1] > maxY) maxY = v[1];
      if (minY == null || v[1] < minY) minY = v[1];
      if (maxZ == null || v[2] > maxZ) maxZ = v[2];
      if (minZ == null || v[2] < minZ) minZ = v[2];
    }
    // normalize x, y to fit in tile (todo)
    let size = new Vector(maxX - minX, maxZ - minZ, maxY - minY);
    this.size = size;
    this.scale = new Vector(1 / Math.max(size.x, size.z), 1 / Math.max(size.x, size.z), 1 / Math.max(size.x, size.z));
    if (instanceData.useScale) this.scale = instanceData.useScale;
    this.drawOffset = new Vector(0.5, 0.5, 0);
    // mesh buffers
    this.mesh = mesh;
    this.engine.objLoader.initMeshBuffers(this.engine.gl, this.mesh);
    // Speech bubble
    if (this.enableSpeech) {
      this.speech = this.engine.loadSpeech(this.id, this.engine.mipmap);
      this.speech.runWhenLoaded(this.onTilesetOrTextureLoaded.bind(this));
      this.speechTexBuf = this.engine.createBuffer(this.getSpeechBubbleTexture(), this.engine.gl.DYNAMIC_DRAW, 2);
    }
    // load Portrait
    if (this.portraitSrc) {
      this.portrait = this.engine.loadTexture(this.portraitSrc);
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

  attach(texture) {
    let { gl } = this.engine;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(this.engine.shaderProgram.diffuseMapUniform, 0);
  }
  // draw obj model with materials
  drawTexturedObj() {
    let { engine, mesh } = this;
    // draw each piece of the object (per material)
    if (mesh.indicesPerMaterial.length >= 1 && Object.keys(mesh.materialsByIndex).length > 0) {
      mesh.indicesPerMaterial.forEach((x, i) => {
        // vertices
        engine.bindBuffer(mesh.vertexBuffer, engine.shaderProgram.aVertexPosition);
        // texture
        engine.bindBuffer(mesh.textureBuffer, engine.shaderProgram.aTextureCoord);
        // normal
        engine.bindBuffer(mesh.normalBuffer, engine.shaderProgram.aVertexNormal);
        // Diffuse
        engine.gl.uniform3fv(engine.shaderProgram.uDiffuse, mesh.materialsByIndex[i].diffuse);
        engine.gl.uniform1f(engine.shaderProgram.uSpecularExponent, mesh.materialsByIndex[i].specularExponent);
        // TODO -- Texture is not being displayed (needs fixing)
        if (mesh.materialsByIndex[i]?.mapDiffuse?.glTexture) this.attach(mesh.materialsByIndex[i].mapDiffuse.glTexture);
        // Specular
        engine.gl.uniform3fv(engine.shaderProgram.uSpecular, mesh.materialsByIndex[i].specular);
        // Specular Exponent
        engine.gl.uniform1f(engine.shaderProgram.uSpecularExponent, mesh.materialsByIndex[i].specularExponent);
        // indices
        let bufferInfo = _buildBuffer(engine.gl, engine.gl.ELEMENT_ARRAY_BUFFER, x, 1);
        engine.gl.bindBuffer(engine.gl.ELEMENT_ARRAY_BUFFER, bufferInfo);
        engine.shaderProgram.setMatrixUniforms(this.scale, 0.0);
        engine.gl.drawElements(engine.gl.TRIANGLES, bufferInfo.numItems, engine.gl.UNSIGNED_SHORT, 0);
      });
    } else {
      // no materials
      // vertices
      engine.bindBuffer(mesh.vertexBuffer, engine.shaderProgram.aVertexPosition);
      engine.bindBuffer(mesh.normalBuffer, engine.shaderProgram.aVertexNormal);
      engine.bindBuffer(mesh.textureBuffer, engine.shaderProgram.aTextureCoord);
      engine.gl.bindBuffer(engine.gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
      // Diffuse
      engine.gl.uniform3fv(engine.shaderProgram.uDiffuse, [0.6, 0.3, 0.6]);
      // Specular
      engine.gl.uniform3fv(engine.shaderProgram.uSpecular, [0.1, 0.1, 0.2]);
      // Specular Exponent
      engine.gl.uniform1f(engine.shaderProgram.uSpecularExponent, 2);
      engine.shaderProgram.setMatrixUniforms(this.scale, 0.0);
      engine.gl.drawElements(engine.gl.TRIANGLES, mesh.indexBuffer.numItems, engine.gl.UNSIGNED_SHORT, 0);
    }
  }

  // draw object with textures / materials
  drawObj() {
    let { engine, mesh } = this;
    engine.gl.disableVertexAttribArray(engine.shaderProgram.aTextureCoord);
    engine.bindBuffer(mesh.vertexBuffer, engine.shaderProgram.aVertexPosition);
    engine.bindBuffer(mesh.normalBuffer, engine.shaderProgram.aVertexNormal);
    engine.gl.bindBuffer(engine.gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
    engine.shaderProgram.setMatrixUniforms(this.scale, 1.0);
    engine.gl.drawElements(engine.gl.TRIANGLES, mesh.indexBuffer.numItems, engine.gl.UNSIGNED_SHORT, 0);
  }

  // Draw Object
  draw() {
    if (!this.loaded) return;
    let { engine, mesh } = this;
    // setup obj attributes
    engine.gl.enableVertexAttribArray(engine.shaderProgram.aVertexNormal);
    engine.gl.enableVertexAttribArray(engine.shaderProgram.aTextureCoord);
    // initialize buffers
    engine.mvPushMatrix();
    // position object
    translate(this.engine.uViewMat, this.engine.uViewMat, this.drawOffset.toArray());
    translate(this.engine.uViewMat, this.engine.uViewMat, this.pos.toArray());
    rotate(this.engine.uViewMat, this.engine.uViewMat, this.engine.degToRad(90), [1, 0, 0]);
    // rotate object
    if (this.rotation && this.rotation.toArray) {
      let rotation = Math.max(...this.rotation.toArray());
      if (rotation > 0)
        rotate(this.engine.uViewMat, this.engine.uViewMat, this.engine.degToRad(rotation), [
          this.rotation.x / rotation,
          this.rotation.y / rotation,
          this.rotation.z / rotation,
        ]);
    }
    // Draw Object
    if (!mesh.textures.length) {
      this.drawObj();
    } else {
      this.drawTexturedObj();
    }
    engine.mvPopMatrix();
    // clear obj rendering attributes
    engine.gl.enableVertexAttribArray(engine.shaderProgram.aTextureCoord);
    engine.gl.disableVertexAttribArray(engine.shaderProgram.aVertexNormal);
  }

  // Set Facing
  setFacing(facing) {
    console.log("setting direction for object to " + Direction.objectSequence(facing));
    if (facing) this.facing = facing;
    this.rotation = Direction.objectSequence(facing);
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
  setFacing(facing) {
    console.log("setting direction for object to " + Direction.objectSequence(facing));
    if (facing) this.facing = facing;
    this.rotation = Direction.objectSequence(facing);
  }

  // Set Facing
  faceDir(facing) {
    if (this.facing == facing || facing === Direction.None) return null;
    return new ActionLoader(this.engine, "face", [facing], this);
  }

  // set message (for chat bubbles)
  setGreeting(greeting) {
    if (this.speech.clearHud) {
      this.speech.clearHud();
    }
    this.speech.writeText(greeting);
    this.speech.loadImage();
    return new ActionLoader(this.engine, "greeting", [greeting, { autoclose: true }], this);
  }
}
