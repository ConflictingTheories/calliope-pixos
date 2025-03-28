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

import { Vector } from '@Engine/utils/math/vector.jsx';
import Avatar from '@Engine/core/scene/avatar.jsx';
import PixosLuaInterpreter from '@Engine/scripting/PixosLuaInterpreter.jsx';

export default class DynamicAvatar extends Avatar {
  constructor(engine, json, zip) {
    // Initialize Sprite
    super(engine);
    this.json = json;
    this.zip = zip;
  }

  // load in json properties to object
  async loadJson() {
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

    // todo -- add select handler dynamically (onSelect)
  // Interaction
  async onSelect(_this, sprite) {
    if (!this.selectTrigger) {
      return;
    }

    // pass-through interaction 
    if(this.selectTrigger === 'interact'){
      return await this.interact(this);
    }

    // lua scripting
    try {
      console.log({ trigger: this.selectTrigger });
      let file = this.zip.file(`triggers/${this.selectTrigger}.lua`);
      if (!file) throw new Error('No Lua Script Found');

      let luaScript = await file.async('string');
      console.log({ msg: 'trigger lua statement', luaScript });

      let interpreter = new PixosLuaInterpreter(this.engine);
      interpreter.setScope({ _this: _this, zone: sprite.zone, subject: sprite });
      interpreter.initLibrary();
      interpreter.run('print("hello world lua")');

      return await interpreter.run(luaScript);
    } catch (e) {
      console.log({ msg: 'no lua script found', e });
    }
  }
}
