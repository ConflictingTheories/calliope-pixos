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
import { ActionLoader } from '@Engine/utils/loaders/index.jsx';
import { mergeDeep } from '@Engine/utils/enums.jsx';
import Sprite from '@Engine/core/scene/sprite.jsx';
import PixosLuaInterpreter from '@Engine/scripting/PixosLuaInterpreter.jsx';

export default class DynamicSprite extends Sprite {
  constructor(engine, json, zip) {
    // Initialize Sprite
    super(engine);
    this.engine = engine;
    this.json = json;
    this.zip = zip;
    // store json config
    this.ActionLoader = ActionLoader;
  }

  // load in json properties to object
  async loadJson() {
    // extended properties
    if (this.json.extends) {
      await Promise.all(
        this.json.extends.map(async (file) => {
          let stringD = JSON.parse(await this.zip.file('sprites/' + file + '.json').async('string'));
          console.log({ old: this.json, new: stringD });
          this.json = mergeDeep(this.json, stringD);
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
    this.isLit = this.json.isLit;
    this.direction = this.json.direction;
    this.attenuation = this.json.attenuation;
    this.density = this.json.density;
    this.lightColor = this.json.lightColor;
    this.state = this.json.state ?? 'intro';
    // Frames
    this.frames = this.json.frames;
    // Offsets
    this.drawOffset = {};
    Object.keys(this.json.drawOffset).forEach((offset) => {
      this.drawOffset[offset] = new Vector(...this.json.drawOffset[offset]);
    });
    this.hotspotOffset = new Vector(...this.json.hotspotOffset);
    // Should the camera follow the avatar?
    this.bindCamera = this.json.bindCamera;
    this.enableSpeech = this.json.enableSpeech; // speech bubble
  }

  // Interaction
  async interact(sprite, finish) {
    let ret = null;
    let states = this.json.states ?? [];
    // Lua scripting
    // build state machine
    let stateMachine = {};
    await Promise.all(
      states.map(async (state) => {
        let actions = await this.loadActionDynamically(state, sprite, finish); // load actions dynamically

        for (const action of actions) {
          console.log({ msg: 'loading action', action });
        }
        console.log({ msg: 'switching state', state: state.name });
        stateMachine[state.name] = actions;
        this.state = state.next;
      })
    );
    console.log({ msg: 'loading stateMachine', stateMachine });

    ret = [];
    for(const action of stateMachine[this.state]){
      ret.push(action(this, sprite, finish));
    }

    // If completion handler passed through - call it when done
    if (finish) finish(false);

    return ret;
  }

  // load string to eval based on type of action (todo - needs to be converted to lua + regular js)
  async loadActionDynamically(state, sprite, finish) {
    console.log({ sprite, state });
    return await Promise.all(
      // load actions based on state
      state.actions.map(async (action) => {
        console.log({ action });
        let luaCallback =
          action.callback && action.callback !== ''
            ? await this.zip.file('callbacks/' + action.callback + '.lua').async('string')
            : 'print("no callback")';

        // lua script callback is injected via function wrapper
        let callback = () => {
          console.log('calling callback');
          let interpreter = new PixosLuaInterpreter(this.engine);
          interpreter.setScope({ _this: this, sprite: sprite, finish: finish });
          interpreter.initLibrary();
          interpreter.run('print("hello world lua - sprite callback")');
          return interpreter.run(luaCallback);
        };

        // support action types
        switch (action.type) {
          case 'dialogue':
            console.log({ _this: this, finish });
            return (_this, sprite, finish) => {
              console.log({ msg: 'dialogue' });
              let actionToLoad = new _this.ActionLoader(
                _this.engine,
                'dialogue',
                [JSON.stringify(action.dialogue), false, { autoclose: true, onClose: () => finish(true) }],
                _this,
                callback
              );
              console.log({ msg: 'action to load', actionToLoad });
              _this.addAction(actionToLoad);
            };
          case 'animate':
            console.log({ _this: this, finish });
            return (_this, sprite, finish) => {
              console.log({ msg: 'animate', _this, sprite, finish });
              let actionToLoad = new _this.ActionLoader(_this.engine, 'animate', [...action.animate, () => finish(true)], _this, callback);
              console.log({ msg: 'action to load', actionToLoad });
              _this.addAction(actionToLoad);
            };
          default:
            return (_this, sprite, _finish) => {
              console.log({ msg: 'no action found', _this, sprite, _finish });
            };
        }
      })
    );
  }

  // todo -- add step handler dynamically (onStep)
  // Interaction
  async onStep(_this, sprite) {
    if (!this.stepTrigger) {
      return;
    }

    // lua scripting
    try {
      console.log({ trigger: this.stepTrigger });
      let file = this.zip.file(`triggers/${this.stepTrigger}.lua`);
      if (!file) throw new Error('No Lua Script Found');

      let luaScript = await file.async('string');
      console.log({ msg: 'trigger lua statement', luaScript });

      let interpreter = new PixosLuaInterpreter(this.engine);
      interpreter.setScope({ _this: this, subject: sprite });
      interpreter.initLibrary();
      interpreter.run('print("hello world lua")');

      return await interpreter.run(luaScript);
    } catch (e) {
      console.log({ msg: 'no lua script found', e });
    }
  }
}
