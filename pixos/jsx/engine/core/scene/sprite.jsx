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
import Loadable from '@Engine/core/queue/loadable.jsx';
import { degToRad } from '../../utils/math/vector.jsx';

export default class Sprite extends Loadable {
  /**
   * Sprites are 2D objects
   * @param {*} engine
   */
  constructor(engine) {
    super();
    this.engine = engine;
    this.templateLoaded = false;
    this.drawOffset = new Vector(0, 0, 0);
    this.hotspotOffset = new Vector(0, 0, 0);
    this.animFrame = 0;
    this.fixed = false;
    this.pos = new Vector(0, 0, 0);
    this.scale = new Vector(1, 1, 1);
    this.facing = Direction.Right;
    this.actionDict = {};
    this.actionList = [];
    this.gender = null;
    this.speech = {};
    this.portrait = null;
    this.onLoadActions = new ActionQueue();
    this.getTexCoords = this.getTexCoords.bind(this);
    this.inventory = [];
    this.onTilesetOrTextureLoaded = this.onTilesetOrTextureLoaded.bind(this);
    this.blocking = true; // default - cannot passthrough
    this.override = false;
    this.isLit = true;
    this.lightIndex = null;
    this.lightColor = [0.1,1.0,0.1];
    this.density = 1;
    this.voice = new SpeechSynthesisUtterance();
  }

  /**
   * Load Sprite data and configure
   * @param {*} instanceData
   * @returns
   */
  onLoad(instanceData) {
    if (this.loaded) return;
    if (!this.src || !this.sheetSize || !this.tileSize || !this.frames) {
      console.error('Invalid sprite definition');
      return;
    }
    console.log({msg: 'sprite load', instanceData});
    // Zone Information
    this.zone = instanceData.zone;
    if (instanceData.id) this.id = instanceData.id;
    if (instanceData.id) this.id = instanceData.id;
    if (instanceData.pos) this.pos = instanceData.pos;
    if (instanceData.isLit) this.isLit = instanceData.isLit;
    if (instanceData.attenuation) this.attenuation = instanceData.attenuation;
    if (instanceData.direction) this.direction = instanceData.direction;
    if (instanceData.lightColor) this.lightColor = instanceData.lightColor;
    if (instanceData.density) this.density = instanceData.density;
    if (instanceData.scatteringCoefficients) this.scatteringCoefficients = instanceData.scatteringCoefficients;
    if (instanceData.rotation) this.rotation = instanceData.rotation;
    if (instanceData.facing && instanceData.facing !== 0) this.facing = instanceData.facing;
    if (instanceData.zones && instanceData.zones !== null) this.zones = instanceData.zones;
    if (instanceData.onStep && typeof instanceData.onStep == 'function') {
      let stepParent = this.onStep.bind(this);
      this.onStep = async () => {
        await instanceData.onStep(this, this);
        console.log('made it to here');
        await stepParent(this, this);
      };
    }
    // Texture Buffer
    this.texture = this.engine.resourceManager.loadTexture(this.src);
    this.texture.runWhenLoaded(this.onTilesetOrTextureLoaded.bind(this));
    this.vertexTexBuf = this.engine.renderManager.createBuffer(this.getTexCoords(), this.engine.gl.DYNAMIC_DRAW, 2);

    // // Speech bubble
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
    if(this.isLit){
      console.log({msg:"Adding Light Loaded", id:this.id, pos:this.pos.toArray()});
      this.lightIndex = this.engine.renderManager.lightManager.addLight(this.id, this.pos.toArray(), this.lightColor, this.attenuation ?? [0.01,0.01,0.01], this.direction, this.density, this.scatteringCoefficients, true);
    }
    //
    this.zone.tileset.runWhenDefinitionLoaded(this.onTilesetDefinitionLoaded.bind(this));
  }

  /**
   * Load Texture / Location
   * @param {*} instanceData
   * @param {Zip} zip
   * @returns
   */
  async onLoadFromZip(instanceData, zip) {
    if (this.loaded) return;
    if (!this.src || !this.sheetSize || !this.tileSize || !this.frames) {
      console.error('Invalid sprite definition');
      return;
    }

    console.log({msg: 'sprite load from zip', instanceData});

    // Zone Information
    this.update(instanceData);
    this.zone = instanceData.zone;
    if (instanceData.id) this.id = instanceData.id;
    if (instanceData.isLit) this.isLit = instanceData.isLit;
    if (instanceData.lightColor) this.lightColor = instanceData.lightColor;
    if (instanceData.density) this.density = instanceData.density;
    if (instanceData.attenuation) this.attenuation = instanceData.attenuation;
    if (instanceData.direction) this.direction = instanceData.direction;
    if (instanceData.scatteringCoefficients) this.scatteringCoefficients = instanceData.scatteringCoefficients;
    if (instanceData.fixed) this.fixed = instanceData.fixed;
    if (instanceData.pos) this.pos = instanceData.pos;
    if (instanceData.facing && instanceData.facing !== 0) this.facing = instanceData.facing;
    if (instanceData.zones && instanceData.zones !== null) this.zones = instanceData.zones;
    if (instanceData.onStep && typeof instanceData.onStep == 'function') {
      let stepParent = this.onStep.bind(this);
      this.onStep = async () => {
        await instanceData.onStep(this, this);
        await stepParent(this, this);
      };
    }

    // Step Handler - todo
    // if (instanceData.onStep) {
    //   let stepParent = this.onStep.bind(this);
    //   this.onStep = async () => {
    //     eval.call(this, await this.zip.file(`triggers/${instanceData.onStep}.js`).async('string')).call(this, this);
    //     await stepParent(this, this);
    //   };
    // }

    // Texture Buffer
    this.texture = await this.engine.resourceManager.loadTextureFromZip(this.src, zip);
    this.texture.runWhenLoaded(this.onTilesetOrTextureLoaded.bind(this));
    this.vertexTexBuf = this.engine.renderManager.createBuffer(this.getTexCoords(), this.engine.gl.DYNAMIC_DRAW, 2);

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

    // lighting
    if(this.isLit){
      console.log({msg:"Adding Light", id:this.id, pos:this.pos.toArray()});
      this.lightIndex = this.engine.renderManager.lightManager.addLight(this.id, this.pos.toArray(), this.lightColor, this.attenuation ?? [0.01,0.01,0.01], this.direction, this.density, this.scatteringCoefficients, true);
    }

    this.zone.tileset.runWhenDefinitionLoaded(this.onTilesetDefinitionLoaded.bind(this));
  }

  /**
   * Definition Loaded
   */
  onTilesetDefinitionLoaded() {
    // size of tiles (1x1 squares are assumed)
    let tileSize = this.zone.tileset.tileSize;

    // normalize - ie scale the provided tile by the tile size
    let normTile = [this.tileSize[0] / tileSize, this.tileSize[1] / tileSize];

    // vertices
    let verts = [
      [0, 0, 0],
      [normTile[0], 0, 0],
      [normTile[0], 0, normTile[1]],
      [0, 0, normTile[1]],
    ];

    // polys
    let poly = [
      [verts[2], verts[3], verts[0]],
      [verts[2], verts[0], verts[1]],
    ].flat(3);

    // sprite data
    this.vertexPosBuf = this.engine.renderManager.createBuffer(poly, this.engine.gl.STATIC_DRAW, 3);

    // speech bubble data - to account for proper height
    if (this.enableSpeech) {
      this.speechVerBuf = this.engine.renderManager.createBuffer(this.getSpeechBubbleVertices(), this.engine.gl.STATIC_DRAW, 3);
    }

    this.zone.tileset.runWhenLoaded(this.onTilesetOrTextureLoaded.bind(this));
  }

  /**
   * After Tileset / Texture Loaded
   * @returns
   */
  onTilesetOrTextureLoaded() {
    if (
      !this ||
      this.loaded ||
      !this.zone.tileset.loaded ||
      !this.texture.loaded ||
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

  /**
   * Get Texture Coordinates
   * @returns
   */
  getTexCoords() {
    let sequence = Direction.spriteSequence(this.facing, this.engine.renderManager.camera.cameraDir);
    let frames = this.frames[sequence] ?? this.frames['N']; //default up
    let length = frames.length;
    let t = frames[this.animFrame % length];
    let ss = this.sheetSize;
    let ts = this.tileSize;
    let bl = [(t[0] + ts[0]) / ss[0], t[1] / ss[1]];
    let tr = [t[0] / ss[0], (t[1] + ts[1]) / ss[1]];
    let v = [bl, [tr[0], bl[1]], tr, [bl[0], tr[1]]];
    let poly = [
      [v[0], v[1], v[2]],
      [v[0], v[2], v[3]],
    ];
    return poly.flat(3);
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
   * Draw Sprite Sprite
   * @returns
   */
  draw() {
    if (!this.loaded) return;

    //update light position
    if(this.isLit){
     let pos =  this.pos.toArray()
      this.engine.renderManager.lightManager.updateLight(this.lightIndex, pos);
    }
    
    this.engine.renderManager.mvPushMatrix();
    // position
    translate(
      this.engine.renderManager.uModelMat,
      this.engine.renderManager.uModelMat,
      (this.drawOffset[this.engine.renderManager.camera.cameraDir] ?? this.drawOffset['N']).toArray()
    );
    translate(this.engine.renderManager.uModelMat, this.engine.renderManager.uModelMat, this.pos.toArray());

    // scale & rotate sprite to handle walls
    if (!this.fixed) {
      this.engine.renderManager.shaderProgram.setMatrixUniforms(new Vector(1, Math.cos(this.engine.renderManager.camera.cameraAngle / 180), 1));
      translate(this.engine.renderManager.uModelMat, this.engine.renderManager.uModelMat, [
        0.5 * this.engine.renderManager.camera.cameraVector.x,
        0.5 * this.engine.renderManager.camera.cameraVector.y,
        0,
      ]);
      rotate(
        this.engine.renderManager.uModelMat,
        this.engine.renderManager.uModelMat,
        degToRad(this.engine.renderManager.camera.cameraAngle * this.engine.renderManager.camera.cameraVector.z),
        [0, 0, -1]
      );
      translate(this.engine.renderManager.uModelMat, this.engine.renderManager.uModelMat, [
        -0.5 * this.engine.renderManager.camera.cameraVector.x,
        -0.5 * this.engine.renderManager.camera.cameraVector.y,
        0,
      ]);
    }

    // Bind texture
    this.engine.renderManager.bindBuffer(this.vertexPosBuf, this.engine.renderManager.shaderProgram.aVertexPosition);
    this.engine.renderManager.bindBuffer(this.vertexTexBuf, this.engine.renderManager.shaderProgram.aTextureCoord);
    this.texture.attach();

    // Draw
    this.engine.renderManager.shaderProgram.setMatrixUniforms();
    this.engine.gl.depthFunc(this.engine.gl.ALWAYS);
    this.engine.gl.drawArrays(this.engine.gl.TRIANGLES, 0, this.vertexPosBuf.numItems);
    this.engine.gl.depthFunc(this.engine.gl.LESS);

    this.engine.renderManager.mvPopMatrix();

    // Draw Speech
    if (this.enableSpeech) {
      this.engine.renderManager.mvPushMatrix();

      // Undo rotation so that character plane is normal to LOS
      translate(
        this.engine.renderManager.uModelMat,
        this.engine.renderManager.uModelMat,
        (this.drawOffset[this.engine.renderManager.camera.cameraDir] ?? this.drawOffset['N']).toArray()
      );
      translate(this.engine.renderManager.uModelMat, this.engine.renderManager.uModelMat, this.pos.toArray());
      rotate(
        this.engine.renderManager.uModelMat,
        this.engine.renderManager.uModelMat,
        degToRad(this.engine.renderManager.camera.cameraAngle * this.engine.renderManager.camera.cameraVector.z),
        [0, 0, -1]
      );

      // Bind texture for speech bubble
      this.engine.renderManager.bindBuffer(this.speechVerBuf, this.engine.renderManager.shaderProgram.aVertexPosition);
      this.engine.renderManager.bindBuffer(this.speechTexBuf, this.engine.renderManager.shaderProgram.aTextureCoord);
      this.speech.attach();

      // Draw Speech bubble
      this.engine.renderManager.shaderProgram.setMatrixUniforms();
      this.engine.gl.depthFunc(this.engine.gl.ALWAYS);
      this.engine.gl.drawArrays(this.engine.gl.TRIANGLES, 0, this.speechVerBuf.numItems);
      this.engine.gl.depthFunc(this.engine.gl.LESS);

      this.engine.renderManager.mvPopMatrix();
    }
  }

  /**
   * Set Frame
   * @param {number} frame
   */
  setFrame(frame) {
    this.animFrame = frame;
    this.engine.renderManager.updateBuffer(this.vertexTexBuf, this.getTexCoords());
  }

  /**
   * Set Facing
   * @param {string} facing
   */
  setFacing(facing) {
    if (facing) this.facing = facing;
    this.setFrame(this.animFrame);
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
   * @param {string} id
   */
  removeAction(id) {
    this.actionList = this.actionList.filter((action) => action.id !== id);
    delete this.actionDict[id];
  }

  /**
   * Remove all actions
   */
  removeAllActions() {
    this.actionList = [];
    this.actionDict = {};
  }

  /**
   * Tick Outer Wrapper - represents a logical cycle / step - runs the action queue & sprite actions
   * @param {int} time
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
      try {
        if (action.tick(time)) {
          toRemove.push(action); // remove from backlog
          action.onComplete(); // call completion handler
        }
      } catch (e) {
        console.error(e);
        toRemove.push(action);
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
  init() {}

  /**
   * load from json specification
   * @param {string} url
   */
  async loadRemote(url) {
    let response = await fetch(url);
    if (!response.ok) {
      throw new Error();
    }
    this.processJson(response.json());
  }

  /**
   * process json object
   * @param {*} json
   */
  processJson(json) {
    // TODO -- process json details
    this.update(json);
  }

  /**
   * Output Dialogue to the HUD
   * @param {string} text
   * @param {boolean} showBubble
   * @param {*} dialogue
   */
  speak(text, showBubble = false, dialogue = {}) {
    if (!text && this.speech.clearHud) this.speech.clearHud();
    else {
      // speech tts output
      if (dialogue.speechOutput) {
        this.speechSynthesis(text);
        dialogue.speechOutput = false;
      }

      // dialogue box
      this.textbox = this.engine.hud.scrollText(this.id + ':> ' + text, true, {
        portrait: this.portrait ?? false,
      });

      // speech bubble?
      if (showBubble && this.speech) {
        this.speech.scrollText(text, false, {
          portrait: this.portrait ?? false,
        });
        this.speech.loadImage();
      }
    }
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
    speech.voice = this.gender ? (this.gender == 'male' ? voices[7] : voices[28]) : voices[0];
    if (rate) speech.rate = rate;
    if (volume) speech.volume = volume;
    if (pitch) speech.pitch = pitch;
    speech.text = text;
    speech.lang = lang;

    // speak
    window.speechSynthesis.speak(speech);
  }

  /**
   * handles interaction -- default (should be overridden in definition)
   * @param {*} sprite sprite which triggered interaction
   * @param {*} finish callback to call on completion
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
   * @param {string} facing
   * @param {boolean} override
   * @returns
   */
  faceDir(facing, override = false) {
    if ((!override && this.facing == facing) || facing === Direction.None) return null;
    return new ActionLoader(this.engine, 'face', [facing], this);
  }

  /**
   * set message (for chat bubble above objects/sprites)
   * @param {string} greeting
   * @returns
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
