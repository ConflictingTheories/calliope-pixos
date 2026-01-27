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

import { Vector, set } from '@Engine/utils/math/vector.js';
import { AABB } from '../../utils/math/collision.js';
import { Direction } from '@Engine/utils/enums.js';
import ActionQueue from '../queue/index.js';
import { ActionLoader } from '@Engine/utils/loaders/index.js';
import { rotate, translate } from '@Engine/utils/math/matrix4.js';
import Loadable from '@Engine/core/queue/loadable.js';
import { degToRad } from '../../utils/math/vector.js';

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
    this.blocking = true; // default - cannot passthrough
    this.override = false;
    this.isSelected = false;
  }

  /**
   * Load Object and Materials
   * @param {*} instanceData
   * @returns
   */
  onLoad = instanceData => {
    if (this.loaded) return;

    // Zone Information
    this.zone = instanceData.zone;
    if (instanceData.id) this.id = instanceData.id;
    if (instanceData.pos) {
      this.pos = instanceData.pos;
      // If z is not defined, compute height from the zone
      if (this.pos && (this.pos.z === null || this.pos.z === undefined)) {
        try {
          const hx = this.pos.x + (this.hotspotOffset?.x ?? 0);
          const hy = this.pos.y + (this.hotspotOffset?.y ?? 0);
          const z = this.zone.getHeight(hx, hy);
          this.pos.z = typeof z === 'number' ? z : 0;
        } catch (err) {
          console.warn('Error computing object height from zone', err);
          this.pos.z = 0;
        }
      }
    }
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
    this.scale = new Vector(
      1 / Math.max(size.x, size.z),
      1 / Math.max(size.x, size.z),
      1 / Math.max(size.x, size.z)
    );
    if (instanceData.useScale) this.scale = instanceData.useScale;
    this.drawOffset = new Vector(0.5, 0.5, 0);

    // mesh buffers - using modern ObjHelper
    this.mesh = mesh;
    this.engine.resourceManager.objHelper.initLegacyBuffers(this.mesh);

    // Speech bubble
    if (this.enableSpeech) {
      this.speech = this.engine.resourceManager.loadSpeech(this.id, this.engine.mipmap);
      this.speech.runWhenLoaded(this.onTilesetOrTextureLoaded);
      this.speechTexBuf = this.engine.renderManager.createBuffer(
        this.getSpeechBubbleTexture(),
        this.engine.gl.DYNAMIC_DRAW,
        2
      );
    }

    // load Portrait
    if (this.portraitSrc) {
      this.portrait = this.engine.resourceManager.loadTexture(this.portraitSrc);
      this.portrait.runWhenLoaded(this.onTilesetOrTextureLoaded);
    }

    // lighting
    if (this.isLit) {
      this.lightIndex = this.engine.renderManager.lightManager.addLight(
        this.id,
        this.pos.toArray(),
        this.lightColor,
        [0.01, 0.01, 0.01]
      );
    }

    this.zone.tileset.runWhenDefinitionLoaded(this.onTilesetDefinitionLoaded);
  };

  /**
   * Load Object and Materials
   * @param {*} instanceData
   * @param {*} zip
   * @returns
   */
  onLoadFromZip = async (instanceData, zip) => {
    console.log(`Loading object ${instanceData.id} from zip`);
    if (this.loaded) return;

    // Zone Information
    this.zone = instanceData.zone;
    if (instanceData.id) this.id = instanceData.id;
    if (instanceData.pos) {
      this.pos = instanceData.pos;
      if (this.pos && (this.pos.z === null || this.pos.z === undefined)) {
        try {
          const hx = this.pos.x + (this.hotspotOffset?.x ?? 0);
          const hy = this.pos.y + (this.hotspotOffset?.y ?? 0);
          const z = this.zone.getHeight(hx, hy);
          this.pos.z = typeof z === 'number' ? z : 0;
        } catch (err) {
          console.warn('Error computing object height from zone', err);
          this.pos.z = 0;
        }
      }
    }
    if (instanceData.isLit) this.isLit = instanceData.isLit;
    if (instanceData.lightColor) this.lightColor = instanceData.lightColor;
    if (instanceData.attenuation) this.attenuation = instanceData.attenuation;
    if (instanceData.density) this.density = instanceData.density;
    if (instanceData.scatteringCoefficients)
      this.scatteringCoefficients = instanceData.scatteringCoefficients;
    if (instanceData.direction) this.direction = instanceData.direction;
    if (instanceData.rotation) this.rotation = instanceData.rotation;
    if (instanceData.facing && instanceData.facing !== 0) this.facing = instanceData.facing;
    if (instanceData.zones && instanceData.zones !== null) this.zones = instanceData.zones;
    let mesh = instanceData.mesh;

    // Validate mesh exists before processing
    if (!mesh || !mesh.vertices) {
      console.warn(`ModelObject.onLoadFromZip: No valid mesh data for object ${this.id}`);
      return;
    }

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
    this.scale = new Vector(
      1 / Math.max(size.x, size.z),
      1 / Math.max(size.x, size.z),
      1 / Math.max(size.x, size.z)
    );
    if (instanceData.useScale) this.scale = instanceData.useScale;
    this.drawOffset = new Vector(0.5, 0.5, 0);

    // mesh buffers - using modern ObjHelper
    this.mesh = mesh;
    this.engine.resourceManager.objHelper.initLegacyBuffers(this.mesh);

    // Speech bubble
    if (this.enableSpeech) {
      this.speech = this.engine.resourceManager.loadSpeech(this.id, this.engine.mipmap);
      this.speech.runWhenLoaded(this.onTilesetOrTextureLoaded);
      this.speechTexBuf = this.engine.renderManager.createBuffer(
        this.getSpeechBubbleTexture(),
        this.engine.gl.DYNAMIC_DRAW,
        2
      );
    }

    // load Portrait
    if (this.portraitSrc) {
      this.portrait = await this.engine.resourceManager.loadTextureFromZip(this.portraitSrc, zip);
      this.portrait.runWhenLoaded(this.onTilesetOrTextureLoaded);
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
    this.zone.tileset.runWhenDefinitionLoaded(this.onTilesetDefinitionLoaded);
  };

  /**
   * Definition Loaded
   */
  onTilesetDefinitionLoaded = () => {
    this.zone.tileset.runWhenLoaded(this.onTilesetOrTextureLoaded);
  };

  /**
   * After Tileset / Texture Loaded
   * @returns
   */
  onTilesetOrTextureLoaded = () => {
    if (
      !this ||
      this.loaded ||
      (this.enableSpeech && this.speech && !this.speech.loaded) ||
      (this.portrait && !this.portrait.loaded)
    )
      return;

    console.log(`Object ${this.id} loaded successfully, adding to physics manager`);
    this.init(); // Hook for sprite implementations
    if (this.enableSpeech && this.speech) {
      if (this.speech.clearHud) {
        this.speech.clearHud();
        this.speech.writeText(this.id);
        this.speech.loadImage();
      }
    }
    this.loaded = true;
    this.engine.physicsManager.addStaticBody(this); // Objects are usually static
    this.onLoadActions.run();
  };

  /**
   * Speech Area texture
   * @returns
   */
  getSpeechBubbleTexture = () => {
    return [
      [1.0, 1.0],
      [0.0, 1.0],
      [0.0, 0.0],
      [1.0, 1.0],
      [0.0, 0.0],
      [1.0, 0.0],
    ].flat(3);
  };

  /**
   * speech bubble position
   * @returns
   */
  getSpeechBubbleVertices = () => {
    return [
      new Vector(...[2, 0, 4]).toArray(),
      new Vector(...[0, 0, 4]).toArray(),
      new Vector(...[0, 0, 2]).toArray(),
      new Vector(...[2, 0, 4]).toArray(),
      new Vector(...[0, 0, 2]).toArray(),
      new Vector(...[2, 0, 2]).toArray(),
    ].flat(3);
  };

  /**
   * bind texture
   * @param {*} texture
   */
  attach = texture => {
    let { gl } = this.engine;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(this.engine.renderManager.shaderProgram.diffuseMapUniform, 0);
  };

  /**
   * draw obj model with materials and textures (needs work)
   */
  drawTexturedObj = () => {
    let { engine, mesh } = this;
    const rm = engine.renderManager;
    const isPickerPass = rm.isPickerPass;

    // draw each piece of the object (per material)
    if (
      mesh &&
      mesh.indicesPerMaterial &&
      mesh.indicesPerMaterial.length >= 1 &&
      mesh.materialsByIndex &&
      Object.keys(mesh.materialsByIndex).length > 0
    ) {
      mesh.indicesPerMaterial.forEach((x, i) => {
        // vertices
        rm.bindBuffer(mesh.vertexBuffer, rm.shaderProgram.aVertexPosition);
        // texture
        rm.bindBuffer(mesh.textureBuffer, rm.shaderProgram.aTextureCoord);
        // normal
        rm.bindBuffer(mesh.normalBuffer, rm.shaderProgram.aVertexNormal);

        if (!isPickerPass) {
          // Only set material properties during normal render
          // Diffuse material properties
          const mat = mesh.materialsByIndex[i];
          engine.gl.uniform3fv(rm.shaderProgram.uDiffuse, mat.Kd || [0.7, 0.7, 0.7]);
          engine.gl.uniform1f(rm.shaderProgram.uSpecularExponent, mat.Ns || 2);

          // Bind texture if available
          const hasTexture = mat.map_Kd && mat.glTexture;
          if (hasTexture) {
            this.attach(mat.glTexture);
            engine.gl.uniform1f(rm.shaderProgram.useDiffuse, 1.0);
          } else {
            engine.gl.uniform1f(rm.shaderProgram.useDiffuse, 0.0);
          }

          // Specular
          engine.gl.uniform3fv(rm.shaderProgram.uSpecular, mat.Ks || [0.1, 0.1, 0.2]);
          engine.gl.uniform1f(rm.shaderProgram.uSpecularExponent, mat.Ns || 2);
        }

        // Create and bind element buffer for indices
        const buffer = engine.gl.createBuffer();
        engine.gl.bindBuffer(engine.gl.ELEMENT_ARRAY_BUFFER, buffer);
        engine.gl.bufferData(
          engine.gl.ELEMENT_ARRAY_BUFFER,
          new Uint16Array(x),
          engine.gl.STATIC_DRAW
        );
        const numItems = x.length;

        if (isPickerPass) {
          // During picker pass, only set picker shader uniforms
          rm.effectPrograms['picker'].setMatrixUniforms({
            scale: this.scale,
            id: this.getPickingId(),
            sampler: 0.0,
          });
        } else {
          // During normal render, set main shader uniforms
          rm.shaderProgram.setMatrixUniforms({
            isSelected: this.isSelected,
            colorMultiplier: this.engine.frameCount & 0x8 ? [1, 0, 0, 1] : [1, 1, 0, 1],
            scale: this.scale,
            sampler: 0.0,
          });
        }
        engine.gl.drawElements(engine.gl.TRIANGLES, numItems, engine.gl.UNSIGNED_SHORT, 0);
      });
    } else {
      // no materials
      // vertices
      rm.bindBuffer(mesh.vertexBuffer, rm.shaderProgram.aVertexPosition);
      rm.bindBuffer(mesh.normalBuffer, rm.shaderProgram.aVertexNormal);
      rm.bindBuffer(mesh.textureBuffer, rm.shaderProgram.aTextureCoord);
      engine.gl.bindBuffer(engine.gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);

      if (!isPickerPass) {
        // Only set material properties during normal render
        // Diffuse
        engine.gl.uniform3fv(rm.shaderProgram.uDiffuse, [0.7, 0.7, 0.7]);
        // Specular
        engine.gl.uniform3fv(rm.shaderProgram.uSpecular, [0.1, 0.1, 0.2]);
        engine.gl.uniform1f(rm.shaderProgram.uSpecularExponent, 2);
      }

      if (isPickerPass) {
        // During picker pass, only set picker shader uniforms
        rm.effectPrograms['picker'].setMatrixUniforms({
          scale: this.scale,
          id: this.getPickingId(),
          sampler: 0.0,
        });
      } else {
        // During normal render, set main shader uniforms
        rm.shaderProgram.setMatrixUniforms({
          isSelected: this.isSelected,
          colorMultiplier: this.engine.frameCount & 0x8 ? [1, 0, 0, 1] : [1, 1, 0, 1],
          scale: this.scale,
          sampler: 0.0,
        });
      }
      engine.gl.drawElements(
        engine.gl.TRIANGLES,
        mesh.indexBuffer.numItems,
        engine.gl.UNSIGNED_SHORT,
        0
      );
    }
  };

  /**
   * Return id for picking (based on colour pixel translation)
   * @returns
   */
  getPickingId = () => {
    const id = [
      ((this.objId >> 0) & 0xff) / 0xff,
      ((this.objId >> 8) & 0xff) / 0xff,
      ((this.objId >> 16) & 0xff) / 0xff,
      255,
    ];
    return id;
  };

  /**
   * Returns the AABB for this object.
   * @returns {AABB}
   */
  getAABB = () => {
    const halfSize = this.size.mul3(this.scale).mul(0.5);
    const min = this.pos.sub(halfSize);
    const max = this.pos.add(halfSize);
    return new AABB(min, max);
  };

  /**
   * draw object with textures / materials
   */
  drawObj = () => {
    let { engine, mesh } = this;
    const rm = engine.renderManager;
    const isPickerPass = rm.isPickerPass;

    engine.gl.disableVertexAttribArray(rm.shaderProgram.aTextureCoord);
    rm.bindBuffer(mesh.vertexBuffer, rm.shaderProgram.aVertexPosition);
    rm.bindBuffer(mesh.normalBuffer, rm.shaderProgram.aVertexNormal);
    engine.gl.bindBuffer(engine.gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);

    if (!isPickerPass) {
      // Set material properties for non-textured objects
      engine.gl.uniform3fv(rm.shaderProgram.uDiffuse, [0.7, 0.7, 0.7]);
      engine.gl.uniform3fv(rm.shaderProgram.uSpecular, [0.1, 0.1, 0.2]);
      engine.gl.uniform1f(rm.shaderProgram.uSpecularExponent, 2);
    }

    if (isPickerPass) {
      // During picker pass, only set picker shader uniforms
      rm.effectPrograms['picker'].setMatrixUniforms({
        scale: this.scale,
        id: this.getPickingId(),
        sampler: 1.0,
      });
    } else {
      // During normal render, set main shader uniforms
      rm.shaderProgram.setMatrixUniforms({ scale: this.scale, sampler: 1.0 });
    }
    engine.gl.drawElements(
      engine.gl.TRIANGLES,
      mesh.indexBuffer.numItems,
      engine.gl.UNSIGNED_SHORT,
      0
    );
  };

  /**
   * Draw Object
   * @returns
   */
  draw = () => {
    if (!this.loaded) return;
    // Increment object draw counter for debug metrics. Only increment if the
    // render manager's debug object is available. This helps track how
    // many 3D objects are drawn each frame in the debug overlay.
    if (this.engine && this.engine.renderManager && this.engine.renderManager.debug) {
      this.engine.renderManager.debug.objectsDrawn++;
    }
    // Debug logging for invisible objects
    console.log(
      `Drawing object ${this.id}, scale: ${this.scale.toArray()}, pos: ${this.pos.toArray()}, size: ${this.size.toArray()}`
    );
    console.log(`Model matrix before: ${this.engine.renderManager.uModelMat}`);
    let { engine, mesh } = this;
    // setup obj attributes
    engine.gl.enableVertexAttribArray(engine.renderManager.shaderProgram.aVertexNormal);
    engine.gl.enableVertexAttribArray(engine.renderManager.shaderProgram.aTextureCoord);
    // initialize buffers
    engine.renderManager.mvPushMatrix();
    // position object
    translate(
      this.engine.renderManager.uModelMat,
      this.engine.renderManager.uModelMat,
      this.drawOffset.toArray()
    );
    translate(
      this.engine.renderManager.uModelMat,
      this.engine.renderManager.uModelMat,
      this.pos.toArray()
    );
    rotate(
      this.engine.renderManager.uModelMat,
      this.engine.renderManager.uModelMat,
      degToRad(90),
      [1, 0, 0]
    );
    // rotate object
    if (this.rotation && this.rotation.toArray) {
      let rotation = Math.max(...this.rotation.toArray());
      if (rotation > 0)
        rotate(
          this.engine.renderManager.uModelMat,
          this.engine.renderManager.uModelMat,
          degToRad(rotation),
          [this.rotation.x / rotation, this.rotation.y / rotation, this.rotation.z / rotation]
        );
    }
    console.log(`Model matrix after transforms: ${this.engine.renderManager.uModelMat}`);
    // Draw Object
    if (!mesh || !mesh.textures) {
      console.warn(`ModelObject.draw: No valid mesh data`);
      return;
    }
    if (!mesh.textures.length) {
      this.drawObj();
    } else {
      this.drawTexturedObj();
    }
    engine.renderManager.mvPopMatrix();
    // clear obj rendering attributes
    engine.gl.enableVertexAttribArray(engine.renderManager.shaderProgram.aTextureCoord);
    engine.gl.disableVertexAttribArray(engine.renderManager.shaderProgram.aVertexNormal);
  };

  /**
   * Set Facing
   * @param {*} facing
   */
  setFacing = facing => {
    if (facing) this.facing = facing;
    this.rotation = Direction.objectSequence(facing);
  };

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
  removeAction = id => {
    this.actionList = this.actionList.filter(action => action.id !== id);
    delete this.actionDict[id];
  };

  /**
   * Remove Action
   */
  removeAllActions = () => {
    this.actionList = [];
    this.actionDict = {};
  };

  /**
   * Outer Tick Handler
   * @param {number} time
   * @returns
   */
  tickOuter = time => {
    if (!this.loaded) return;
    // Sort activities by increasing startTime, then by id
    this.actionList.sort((a, b) => {
      let dt = a.startTime - b.startTime;
      if (!dt) return dt;
      return a.id > b.id ? 1 : -1;
    });
    // Run & Queue for Removal when complete
    let toRemove = [];
    this.actionList.forEach(action => {
      if (!action.loaded || action.startTime > time) return;
      if (action.tick(time)) {
        toRemove.push(action); // remove from backlog
        action.onComplete(); // call completion handler
      }
    });
    // clear completed activities
    toRemove.forEach(action => this.removeAction(action.id));
    // tick
    if (this.tick) this.tick(time);
  };

  /**
   * Hook for sprite implementations
   */
  init = () => {
    console.log('- object hook', this.id, this.pos, this.objId);
  };

  /**
   * speak
   * @param {*} text
   * @param {*} showBubble
   */
  speak = (text, showBubble = false) => {
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
  };

  /**
   * handles interaction -- default (should be overridden in definition)
   * @param {*} sprite
   * @param {*} finish
   * @returns
   */
  interact = async (sprite, finish) => {
    let ret = null;
    // React based on internal state
    switch (this.state) {
      default:
        break;
    }
    // If completion handler passed through - call it when done
    if (finish) finish(true);
    return ret;
  };

  /**
   * Set Facing
   * @param {*} facing
   */
  setFacing = facing => {
    if (facing) this.facing = facing;
    this.rotation = Direction.objectSequence(facing);
  };

  /**
   * Change direction
   * @param {*} facing
   * @returns
   */
  faceDir = facing => {
    if (this.facing == facing || facing === Direction.None) return null;
    return new ActionLoader(this.engine, 'face', [facing], this);
  };

  /**
   * set message (for chat bubbles)
   */
  setGreeting = greeting => {
    if (this.speech.clearHud) {
      this.speech.clearHud();
    }
    this.speech.writeText(greeting);
    this.speech.loadImage();
    return new ActionLoader(this.engine, 'greeting', [greeting, { autoclose: true }], this);
  };
}
