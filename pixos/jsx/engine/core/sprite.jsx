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
import { Vector, set } from '@Engine/utils/math/vector.jsx';
import { Direction } from '@Engine/utils/enums.jsx';
import ActionQueue from './queue.jsx';
import { ActionLoader } from '@Engine/utils/loaders/index.jsx';
import { rotate, translate } from '@Engine/utils/math/matrix4.jsx';

export default class Sprite {
  constructor(engine) {
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
    this.voice = new SpeechSynthesisUtterance();
  }

  update(data) {
    Object.assign(this, data);
  }

  runWhenLoaded(action) {
    if (this.loaded) action();
    else this.onLoadActions.add(action);
  }

  // Load Texture / Location
  onLoad(instanceData) {
    if (this.loaded) return;
    if (!this.src || !this.sheetSize || !this.tileSize || !this.frames) {
      console.error('Invalid sprite definition');
      return;
    }
    // Zone Information
    this.zone = instanceData.zone;
    if (instanceData.id) this.id = instanceData.id;
    if (instanceData.pos) set(instanceData.pos, this.pos);
    if (instanceData.facing && instanceData.facing !== 0) this.facing = instanceData.facing;
    if (instanceData.zones && instanceData.zones !== null) this.zones = instanceData.zones;
    if (instanceData.onStep && typeof instanceData.onStep == 'function') {
      let stepParent = this.onStep.bind(this);
      this.onStep = () => {
        instanceData.onStep();
        stepParent();
      };
    }
    // Texture Buffer
    this.texture = this.engine.loadTexture(this.src);
    this.texture.runWhenLoaded(this.onTilesetOrTextureLoaded.bind(this));
    this.vertexTexBuf = this.engine.createBuffer(this.getTexCoords(), this.engine.gl.DYNAMIC_DRAW, 2);

    // // Speech bubble
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
    let s = this.zone.tileset.tileSize;
    let ts = [this.tileSize[0] / s, this.tileSize[1] / s];
    let v = [
      [0, 0, 0],
      [ts[0], 0, 0],
      [ts[0], 0, ts[1]],
      [0, 0, ts[1]],
    ];
    let poly = [
      [v[2], v[3], v[0]],
      [v[2], v[0], v[1]],
    ].flat(3);
    this.vertexPosBuf = this.engine.createBuffer(poly, this.engine.gl.STATIC_DRAW, 3);
    if (this.enableSpeech) {
      this.speechVerBuf = this.engine.createBuffer(this.getSpeechBubbleVertices(), this.engine.gl.STATIC_DRAW, 3);
    }
    this.zone.tileset.runWhenLoaded(this.onTilesetOrTextureLoaded.bind(this));
  }

  // After Tileset / Texture Loaded
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

  // Get Texture Coordinates
  getTexCoords() {
    let frames = this.frames[Direction.spriteSequence(this.facing)] ?? this.frames['up']; //default up
    let length = this.frames[Direction.spriteSequence(this.facing)].length;
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

  // Draw Sprite Sprite
  draw() {
    if (!this.loaded) return;
    // this.engine.disableObjAttributes();
    this.engine.mvPushMatrix();
    // Undo rotation so that character plane is normal to LOS
    translate(this.engine.uViewMat, this.engine.uViewMat, this.drawOffset.toArray());
    translate(this.engine.uViewMat, this.engine.uViewMat, this.pos.toArray());
    // scale & rotate sprite to handle walls
    // if (!this.fixed) this.engine.shaderProgram.setMatrixUniforms(new Vector(1, Math.cos(this.engine.cameraAngle / 180), 1));
    rotate(this.engine.uViewMat, this.engine.uViewMat, this.engine.degToRad(this.engine.cameraAngle), [1, 0, 0]);
    // Bind texture
    this.engine.bindBuffer(this.vertexPosBuf, this.engine.shaderProgram.aVertexPosition);
    this.engine.bindBuffer(this.vertexTexBuf, this.engine.shaderProgram.aTextureCoord);
    this.texture.attach();
    // Draw
    // if (this.fixed)
    this.engine.shaderProgram.setMatrixUniforms();
    this.engine.gl.depthFunc(this.engine.gl.ALWAYS);
    this.engine.gl.drawArrays(this.engine.gl.TRIANGLES, 0, this.vertexPosBuf.numItems);
    this.engine.gl.depthFunc(this.engine.gl.LESS);
    this.engine.mvPopMatrix();
    // Draw Speech
    if (this.enableSpeech) {
      this.engine.mvPushMatrix();
      // Undo rotation so that character plane is normal to LOS
      translate(this.engine.uViewMat, this.engine.uViewMat, this.drawOffset.toArray());
      translate(this.engine.uViewMat, this.engine.uViewMat, this.pos.toArray());
      rotate(this.engine.uViewMat, this.engine.uViewMat, this.engine.degToRad(this.engine.cameraAngle), [1, 0, 0]);
      // Bind texture for speech bubble
      this.engine.bindBuffer(this.speechVerBuf, this.engine.shaderProgram.aVertexPosition);
      this.engine.bindBuffer(this.speechTexBuf, this.engine.shaderProgram.aTextureCoord);
      this.speech.attach();
      // // Draw Speech
      this.engine.shaderProgram.setMatrixUniforms();
      this.engine.gl.depthFunc(this.engine.gl.ALWAYS);
      this.engine.gl.drawArrays(this.engine.gl.TRIANGLES, 0, this.speechVerBuf.numItems);
      this.engine.gl.depthFunc(this.engine.gl.LESS);
      this.engine.mvPopMatrix();
    }
  }

  // Set Frame
  setFrame(frame) {
    this.animFrame = frame;
    this.engine.updateBuffer(this.vertexTexBuf, this.getTexCoords());
  }

  // Set Facing
  setFacing(facing) {
    if (facing) this.facing = facing;
    this.setFrame(this.animFrame);
  }

  // Add Action to Queue
  addAction(action) {
    if (this.actionDict[action.id]) this.removeAction(action.id);
    this.actionDict[action.id] = action;
    this.actionList.push(action);
  }

  // Remove Action
  removeAction(id) {
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

  // Hook for sprite implementations
  init() {}

  // load from json specification
  async loadRemote(url) {
    let response = await fetch(url);
    if (!response.ok) {
      throw new Error();
    }
    this.processJson(response.json());
  }

  // process json object
  processJson(json) {
    // TODO -- process json details
    //

    this.update(json);
  }

  // speak
  speak(text, showBubble = false, dialogue = false) {
    if (!text && this.speech.clearHud) this.speech.clearHud();
    else {
      if (dialogue.speechOutput) {
        this.speechSynthesis(text);
        dialogue.speechOutput = false;
      }
      this.textbox = this.engine.scrollText(this.id + ':> ' + text, true, {
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

  // Text to Speech output
  speechSynthesis(text, voice = null, lang = 'en', rate = null, volume = null, pitch = null) {
    let speech = this.voice;
    let voices = window.speechSynthesis.getVoices() ?? [];
    console.log(this, this.gender, voices);
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
    return new ActionLoader(this.engine, 'face', [facing], this);
  }

  // set message (for chat bubbles)
  setGreeting(greeting) {
    if (this.speech.clearHud) {
      this.speech.clearHud();
    }
    this.speech.writeText(greeting);
    this.speech.loadImage();
    return new ActionLoader(this.engine, 'greeting', [greeting, { autoclose: true }], this);
  }
}
