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
import { Vector, set } from '@Engine/utils/math/vector.jsx';
import { Direction } from '@Engine/utils/enums.jsx';
import ActionQueue from '../queue/index.jsx';
import { ActionLoader } from '@Engine/utils/loaders/index.jsx';
import { rotate, translate } from '@Engine/utils/math/matrix4.jsx';
import { _buildBuffer } from '@Engine/utils/obj/utils.js';
import Loadable from '@Engine/core/queue/loadable.jsx';
import { degToRad } from '../../utils/math/vector.jsx';
export default class ModelObject extends Loadable {
  /**
   * 3D Model Objects
   * @param {*} engine
   */
  constructor(engine) {
    super();
    this.objId = Math.floor(Math.random() * 100);
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
    this.isLit = true;
    this.lightColor = [1.0, 1.0, 1.0];
    this.lightIndex = null;
    this.onLoadActions = new ActionQueue();
    this.inventory = [];
    this.onTilesetOrTextureLoaded = this.onTilesetOrTextureLoaded.bind(this);
    this.blocking = true; // default - cannot passthrough
    this.override = false;
    this.isSelected = false;
  }

  /**
   * Load Object and Materials
   * @param {*} instanceData
   * @returns
   */
  onLoad(instanceData) {
    if (this.loaded) return;

    // Zone Information
    this.zone = instanceData.zone;
    if (instanceData.id) this.id = instanceData.id;
    if (instanceData.pos) this.pos = instanceData.pos;
    if (instanceData.isLit) this.isLit = instanceData.isLit;
    if (instanceData.lightColor) this.lightColor = instanceData.lightColor;
    if (instanceData.attenuation) this.attenuation = instanceData.attenuation;
    if (instanceData.direction) this.direction = instanceData.direction;
    if (instanceData.rotation) this.rotation = instanceData.rotation;
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
    this.engine.resourceManager.objLoader.initMeshBuffers(this.engine.gl, this.mesh);

    // Speech bubble
    if (this.enableSpeech) {
      this.speech = this.engine.resourceManager.loadSpeech(this.id, this.engine.mipmap);
      this.speech.runWhenLoaded(this.onTilesetOrTextureLoaded.bind(this));
      this.speechTexBuf = this.engine.renderManager.createBuffer(this.getSpeechBubbleTexture(), this.engine.gl.DYNAMIC_DRAW, 2);
    }

    // load Portrait
    if (this.portraitSrc) {
      this.portrait = this.engine.resourceManager.loadTexture(this.portraitSrc);
      this.portrait.runWhenLoaded(this.onTilesetOrTextureLoaded.bind(this));
    }

    // lighting?
    if (this.isLit) {
      this.lightIndex = this.engine.renderManager.lightManager.addLight(this.id, this.pos.toArray(), this.lightColor, [0.01, 0.01, 0.01]);
    }

    //
    this.zone.tileset.runWhenDefinitionLoaded(this.onTilesetDefinitionLoaded.bind(this));
  }

  /**
   * Load Object and Materials
   * @param {*} instanceData
   * @param {*} zip
   * @returns
   */
  async onLoadFromZip(instanceData, zip) {
    if (this.loaded) return;

    // Zone Information
    this.zone = instanceData.zone;
    if (instanceData.id) this.id = instanceData.id;
    if (instanceData.pos) this.pos = instanceData.pos;
    if (instanceData.isLit) this.isLit = instanceData.isLit;
    if (instanceData.lightColor) this.lightColor = instanceData.lightColor;
    if (instanceData.attenuation) this.attenuation = instanceData.attenuation;
    if (instanceData.density) this.density = instanceData.density;
    if (instanceData.scatteringCoefficients) this.scatteringCoefficients = instanceData.scatteringCoefficients;
    if (instanceData.direction) this.direction = instanceData.direction;
    if (instanceData.rotation) this.rotation = instanceData.rotation;
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
    this.engine.resourceManager.objLoader.initMeshBuffers(this.engine.gl, this.mesh);

    // Speech bubble
    if (this.enableSpeech) {
      this.speech = this.engine.resourceManager.loadSpeech(this.id, this.engine.mipmap);
      this.speech.runWhenLoaded(this.onTilesetOrTextureLoaded.bind(this));
      this.speechTexBuf = this.engine.renderManager.createBuffer(this.getSpeechBubbleTexture(), this.engine.gl.DYNAMIC_DRAW, 2);
    }

    // load Portrait
    if (this.portraitSrc) {
      this.portrait = await this.engine.resourceManager.loadTextureFromZip(this.portraitSrc, zip);
      this.portrait.runWhenLoaded(this.onTilesetOrTextureLoaded.bind(this));
    }

    // lighting?
    if (this.isLit) {
      this.lightIndex = this.engine.renderManager.lightManager.addLight(
        this.id,
        this.pos.toArray(),
        this.lightColor,
        this.attenuation,
        this.direction,
        this.density,
        this.scatteringCoefficients,
        true
      );
    }

    //
    this.zone.tileset.runWhenDefinitionLoaded(this.onTilesetDefinitionLoaded.bind(this));
  }

  /**
   * Definition Loaded
   */
  onTilesetDefinitionLoaded() {
    this.zone.tileset.runWhenLoaded(this.onTilesetOrTextureLoaded.bind(this));
  }

  /**
   * After Tileset / Texture Loaded
   * @returns
   */
  onTilesetOrTextureLoaded() {
    if (!this || this.loaded || (this.enableSpeech && this.speech && !this.speech.loaded) || (this.portrait && !this.portrait.loaded)) return;

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

  /**
   * Speech Area texture
   * @returns
   */
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

  /**
   * speech bubble position
   * @returns
   */
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

  /**
   * bind texture
   * @param {*} texture
   */
  attach(texture) {
    let { gl } = this.engine;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(this.engine.renderManager.shaderProgram.diffuseMapUniform, 0);
  }

  /**
   * draw obj model with materials and textures (needs work)
   */
  drawTexturedObj() {
    let { engine, mesh } = this;
    // draw each piece of the object (per material)
    if (mesh.indicesPerMaterial.length >= 1 && Object.keys(mesh.materialsByIndex).length > 0) {
      mesh.indicesPerMaterial.forEach((x, i) => {
        // vertices
        engine.renderManager.bindBuffer(mesh.vertexBuffer, engine.renderManager.shaderProgram.aVertexPosition);
        // texture
        engine.renderManager.bindBuffer(mesh.textureBuffer, engine.renderManager.shaderProgram.aTextureCoord);
        // normal
        engine.renderManager.bindBuffer(mesh.normalBuffer, engine.renderManager.shaderProgram.aVertexNormal);
        // Diffuse
        engine.gl.uniform3fv(engine.renderManager.shaderProgram.uDiffuse, mesh.materialsByIndex[i].diffuse);
        engine.gl.uniform1f(engine.renderManager.shaderProgram.uSpecularExponent, mesh.materialsByIndex[i].specularExponent);
        // TODO -- Texture is not being displayed (needs fixing)
        if (mesh.materialsByIndex[i]?.mapDiffuse?.glTexture) this.attach(mesh.materialsByIndex[i].mapDiffuse.glTexture);
        // Specular
        engine.gl.uniform3fv(engine.renderManager.shaderProgram.uSpecular, mesh.materialsByIndex[i].specular);
        // Specular Exponent
        engine.gl.uniform1f(engine.renderManager.shaderProgram.uSpecularExponent, mesh.materialsByIndex[i].specularExponent);
        // indices
        let bufferInfo = _buildBuffer(engine.gl, engine.gl.ELEMENT_ARRAY_BUFFER, x, 1);
        engine.gl.bindBuffer(engine.gl.ELEMENT_ARRAY_BUFFER, bufferInfo);

        // picking id
        engine.renderManager.effectPrograms['picker'].setMatrixUniforms({ scale: this.scale, id: this.getPickingId(), sampler: 0.0 });
        engine.renderManager.shaderProgram.setMatrixUniforms({
          isSelected: this.isSelected,
          colorMultiplier: this.engine.frameCount & 0x8 ? [1, 0, 0, 1] : [1, 1, 0, 1],
          scale: this.scale,
          sampler: 0.0,
        });
        engine.gl.drawElements(engine.gl.TRIANGLES, bufferInfo.numItems, engine.gl.UNSIGNED_SHORT, 0);
      });
    } else {
      // no materials
      // vertices
      engine.renderManager.bindBuffer(mesh.vertexBuffer, engine.renderManager.shaderProgram.aVertexPosition);
      engine.renderManager.bindBuffer(mesh.normalBuffer, engine.renderManager.shaderProgram.aVertexNormal);
      engine.renderManager.bindBuffer(mesh.textureBuffer, engine.renderManager.shaderProgram.aTextureCoord);
      engine.gl.bindBuffer(engine.gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
      // Diffuse
      engine.gl.uniform3fv(engine.renderManager.shaderProgram.uDiffuse, [0.6, 0.3, 0.6]);
      // Specular
      engine.gl.uniform3fv(engine.renderManager.shaderProgram.uSpecular, [0.1, 0.1, 0.2]);
      // Specular Exponent
      engine.gl.uniform1f(engine.renderManager.shaderProgram.uSpecularExponent, 2);

      engine.renderManager.effectPrograms['picker'].setMatrixUniforms({ scale: this.scale, id: this.getPickingId(), sampler: 0.0 });
      engine.renderManager.shaderProgram.setMatrixUniforms({
        isSelected: this.isSelected,
        colorMultiplier: this.engine.frameCount & 0x8 ? [1, 0, 0, 1] : [1, 1, 0, 1],
        scale: this.scale,
        sampler: 0.0,
      });
      engine.gl.drawElements(engine.gl.TRIANGLES, mesh.indexBuffer.numItems, engine.gl.UNSIGNED_SHORT, 0);
    }
  }

  /**
   * Return id for picking
   * @returns
   */
  getPickingId() {
    const id = [
      ((this.objId >> 0) & 0xff) / 0xff,
      ((this.objId >> 8) & 0xff) / 0xff,
      ((this.objId >> 16) & 0xff) / 0xff,
      255,
    ];
    return id;
  }

  /**
   * draw object with textures / materials
   */
  drawObj() {
    let { engine, mesh } = this;
    engine.gl.disableVertexAttribArray(engine.renderManager.shaderProgram.aTextureCoord);
    engine.renderManager.bindBuffer(mesh.vertexBuffer, engine.renderManager.shaderProgram.aVertexPosition);
    engine.renderManager.bindBuffer(mesh.normalBuffer, engine.renderManager.shaderProgram.aVertexNormal);
    engine.gl.bindBuffer(engine.gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);

    engine.renderManager.effectPrograms['picker'].setMatrixUniforms({ scale: this.scale, id: this.getPickingId(), sampler: 1.0 });
    engine.renderManager.shaderProgram.setMatrixUniforms({ scale: this.scale, sampler: 1.0 });
    engine.gl.drawElements(engine.gl.TRIANGLES, mesh.indexBuffer.numItems, engine.gl.UNSIGNED_SHORT, 0);
  }

  /**
   * Draw Object
   * @returns
   */
  draw() {
    if (!this.loaded) return;
    let { engine, mesh } = this;
    // setup obj attributes
    engine.gl.enableVertexAttribArray(engine.renderManager.shaderProgram.aVertexNormal);
    engine.gl.enableVertexAttribArray(engine.renderManager.shaderProgram.aTextureCoord);
    // initialize buffers
    engine.renderManager.mvPushMatrix();
    // position object
    translate(this.engine.renderManager.uModelMat, this.engine.renderManager.uModelMat, this.drawOffset.toArray());
    translate(this.engine.renderManager.uModelMat, this.engine.renderManager.uModelMat, this.pos.toArray());
    rotate(this.engine.renderManager.uModelMat, this.engine.renderManager.uModelMat, degToRad(90), [1, 0, 0]);
    // rotate object
    if (this.rotation && this.rotation.toArray) {
      let rotation = Math.max(...this.rotation.toArray());
      if (rotation > 0)
        rotate(this.engine.renderManager.uModelMat, this.engine.renderManager.uModelMat, degToRad(rotation), [
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
    engine.renderManager.mvPopMatrix();
    // clear obj rendering attributes
    engine.gl.enableVertexAttribArray(engine.renderManager.shaderProgram.aTextureCoord);
    engine.gl.disableVertexAttribArray(engine.renderManager.shaderProgram.aVertexNormal);
  }

  /**
   * Set Facing
   * @param {*} facing
   */
  setFacing(facing) {
    if (facing) this.facing = facing;
    this.rotation = Direction.objectSequence(facing);
  }

  /**
   * Add Action to Queue
   * @param {*} action
   */
  async addAction(action) {
    action = await Promise.resolve(action);
    if (this.actionDict[action.id]) this.removeAction(action.id);
    this.actionDict[action.id] = action;
    this.actionList.push(action);
  }

  /**
   * Remove Action
   * @param {*} id
   */
  removeAction(id) {
    this.actionList = this.actionList.filter((action) => action.id !== id);
    delete this.actionDict[id];
  }

  /**
   * Remove Action
   */
  removeAllActions() {
    this.actionList = [];
    this.actionDict = {};
  }

  /**
   * Outer Tick Handler
   * @param {number} time
   * @returns
   */
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

  /**
   * Hook for sprite implementations
   */
  init() {
    console.log('- object hook', this.id, this.pos, this.objId);
  }

  /**
   * speak
   * @param {*} text
   * @param {*} showBubble
   */
  speak(text, showBubble = false) {
    if (!text) this.speech.clearHud();
    else {
      this.textbox = this.engine.hud.scrollText(this.id + ':> ' + text, true, {
        portrait: this.portrait ?? false,
      });
      if (showBubble && this.speech) {
        this.speech.scrollText(text, false, {
          portrait: this.portrait ?? false,
        });
        this.speech.loadImage();
      }
    }
  }

  /**
   * handles interaction -- default (should be overridden in definition)
   * @param {*} sprite
   * @param {*} finish
   * @returns
   */
  async interact(sprite, finish) {
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

  /**
   * Set Facing
   * @param {*} facing
   */
  setFacing(facing) {
    if (facing) this.facing = facing;
    this.rotation = Direction.objectSequence(facing);
  }

  /**
   * Change direction
   * @param {*} facing
   * @returns
   */
  faceDir(facing) {
    if (this.facing == facing || facing === Direction.None) return null;
    return new ActionLoader(this.engine, 'face', [facing], this);
  }

  /**
   * set message (for chat bubbles)
   */
  setGreeting(greeting) {
    if (this.speech.clearHud) {
      this.speech.clearHud();
    }
    this.speech.writeText(greeting);
    this.speech.loadImage();
    return new ActionLoader(this.engine, 'greeting', [greeting, { autoclose: true }], this);
  }
}
