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

    // todo -- add lua interpreter

    // try{
    //   let luaScript = await this.zip.file(`actions/${state.name}.lua`).async('string');
    //   console.log({msg:'lua script', luaScript});
    //   let interpreter = new PixosLuaInterpreter(this.engine);
    //   interpreter.setScope({ _this: this, sprite: sprite });
    //   interpreter.initLibrary();
    //   interpreter.run('print("hello world lua - sprite")');

    //   // todo - need to implement action execution
    //   switch (action.type) {
    //     case 'dialogue':
    //     case 'animate':
    //     default:
    //       return '';
    //   }
    // }catch(e){
    //   console.log({msg:'error loading action dynamically', e});
    // }

    console.log('TODO :: Add Lua Interpreter');

    // JS scripting
    // build state machine
    let evalStatement = ['((_this, sprite, finish)=>{switch (_this.state) {\n '];
    await Promise.all(
      states.map(async (state) => {
        let actionString = await this.loadActionDynamically(state, sprite); // load actions dynamically
        console.log({ msg: 'loading actionString', actionString });

        let statement =
          "case '" +
          state.name +
          "':\n\tconsole.log('switching state: " +
          state.name +
          "');\n\t_this.state = '" +
          state.next +
          "';" +
          actionString +
          '\nbreak;';
        evalStatement.push(statement);
      })
    );
    evalStatement.push('default:\n\tbreak;\n}});');
    console.log({ msg: 'loading evalStatement', evalstatment: evalStatement.join('') });

    ret = eval.call(this, evalStatement.join('')).call(this, this, sprite, finish);
    // if (ret) this.addAction(ret); // not needed?

    // If completion handler passed through - call it when done
    if (finish) finish(false);

    return ret;
  }

  // load string to eval based on type of action (todo - needs to be converted to lua + regular js)
  async loadActionDynamically(state, sprite) {
    console.log({ sprite, state });
    return (
      await Promise.all(
        state.actions.map(async (action) => {
          let callback =
            action.callback && action.callback !== ''
              ? (await this.zip.file('callbacks/' + action.callback + '.js').async('string')).replace(/[\r\n]+/g, '').replace(/;$/, '')
              : '';

          switch (action.type) {
            case 'dialogue':
              return (
                "\n\tconsole.log({_this, finish}); \n\t_this.addAction(new _this.ActionLoader(_this.engine, 'dialogue', [" +
                JSON.stringify(action.dialogue) +
                ', false, { autoclose: true, onClose: () => finish(true) }], _this,' +
                callback +
                '));\n'
              );
            case 'animate':
              return (
                "\n\tconsole.log({_this, finish}); \n\t_this.addAction(new _this.ActionLoader(_this.engine, 'animate', [" +
                action.animate.join(',') +
                ', () => finish(true) ], _this,' +
                callback +
                '));\n'
              );
            default:
              return '';
          }
        })
      )
    ).join('\n');
  }

  // todo -- add step handler dynamically (onStep)
  // Interaction
  async onStep(_this, sprite) {
    if (!this.stepTrigger) {
      return;
    }
    console.log({ trigger: this.stepTrigger });

    try {
      let file = this.zip.file(`triggers/${this.stepTrigger}.lua`);
      console.log({ msg: 'trigger eval file', file });
      if (!file) throw new Error('No Lua Script Found');
      let luaScript = await file.async('string');
      console.log({ msg: 'trigger eval statement', luaScript });
      console.log('TODO :: Add Lua Interpreter');

      // todo -- add lua interpreter
      let interpreter = new PixosLuaInterpreter(this.engine);
      interpreter.setScope({ _this: this, subject: sprite });
      interpreter.initLibrary();
      interpreter.run('print("hello world lua")');
      let ret = await interpreter.run(luaScript);
      console.log({ msg: 'trigger eval response', ret });
      return null;
    } catch (e) {
      console.log({ msg: 'no lua script found', e });
      let file = await this.zip.file(`triggers/${this.stepTrigger}.js`);
      if (!file) throw new Error('No JS Script Found');
      let evalStatement = file.async('string');
      console.log({ msg: 'trigger eval statement', evalStatement });
      let ret = eval.call(this, evalStatement).call(this, this, sprite);
      console.log({ msg: 'trigger eval statement', ret });
      return ret;
    }
  }
}
