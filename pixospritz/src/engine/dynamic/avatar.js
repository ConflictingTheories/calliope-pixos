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

import { Vector } from '@Engine/utils/math/vector.js';
import Avatar from '@Engine/core/scene/avatar.js';
import PixoScriptInterpreter from '@Engine/scripting/PixoScriptInterpreter.js';

/**
 * DynamicAvatar - A dynamic avatar with JSON loading and Lua scripting support.
 */
export default class DynamicAvatar extends Avatar {
  /**
   * Creates an instance of DynamicAvatar.
   * @param {GLEngine} engine - The game engine instance.
   * @param {Object} json - The JSON configuration.
   * @param {Object} zip - The zip file data.
   */
  constructor(engine, json, zip) {
    // Initialize Sprite
    super(engine);
    /** @type {Object} */
    this.json = json;
    /** @type {Object} */
    this.zip = zip;
  }

  /**
   * Loads JSON properties into the object.
   * @returns {Promise<void>}
   */
  loadJson = async () => {
    // extended properties
    if (this.json.extends) {
      await Promise.all(
        this.json.extends.map(async (file) => {
          let stringD = JSON.parse(await this.zip.file('sprites/' + file + '.json').async('string'));
          Object.assign(this.json, stringD);
        })
      );
      // unset
      this.json.extends = null;
    }
    // core properties
    this.update(this.json);
    this.src = this.json.src;
    this.portraitSrc = this.json.portraitSrc;
    this.sheetSize = this.json.sheetSize;
    this.tileSize = this.json.tileSize;
    this.state = this.json.state ?? 'intro';
    // Frames
    this.frames = this.json.frames;
    // Offsets
    this.hotspotOffset = new Vector(...this.json.hotspotOffset);
    this.drawOffset = {};
    Object.keys(this.json.drawOffset).forEach((offset) => {
      this.drawOffset[offset] = new Vector(...this.json.drawOffset[offset]);
    });
    // Should the camera follow the avatar?
    this.bindCamera = this.json.bindCamera;
    this.enableSpeech = this.json.enableSpeech; // speech bubble
  }

  /**
   * Handles selection interaction, with Lua scripting support.
   * @param {Object} _this - The context.
   * @param {Sprite} sprite - The sprite being selected.
   * @returns {Promise<any>}
   */
  onSelect = async (_this, sprite) => {
    if (!this.selectTrigger) {
      return;
    }

    // pass-through interaction
    if (this.selectTrigger === 'interact') {
      return await this.interact(this);
    }

    // lua scripting
    try {
      console.log({ trigger: this.selectTrigger });
      let file = this.zip.file(`triggers/${this.selectTrigger}.lua`);
      if (!file) file = this.zip.file(`triggers/${this.selectTrigger}.pxs`);
      if (!file) throw new Error('No Lua Script Found');

      let luaScript = await file.async('string');
      console.log({ msg: 'trigger lua statement', luaScript });

      let interpreter = new PixoScriptInterpreter(this.engine);
      interpreter.setScope({ _this: _this, zone: sprite.zone, subject: sprite });
      interpreter.initLibrary();
      interpreter.run('print("hello world lua")');

      return await interpreter.run(luaScript);
    } catch (e) {
      console.log({ msg: 'no lua script found', e });
    }
  }
}
