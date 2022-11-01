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

import { Vector } from '@Engine/utils/math/vector.jsx';
import { ActionLoader } from '@Engine/utils/loaders/index.jsx';
import Sprite from '@Engine/core/sprite.jsx';

export default class DynamicSprite extends Sprite {
  constructor(engine, json) {
    // Initialize Sprite
    super(engine);
    // load in json
    this.loadJson(json);
    // store json config
    this.ActionLoader = ActionLoader;
  }

  // load in json properties to object
  loadJson(json) {
    this.update(json);
    this.json = json;
    this.src = json.src;
    this.portraitSrc = json.portraitSrc;
    this.sheetSize = json.sheetSize;
    this.tileSize = json.tileSize;
    this.state = json.state ?? 'intro';
    // Frames
    this.frames = json.frames;
    // Offsets
    this.drawOffset = new Vector(...json.drawOffset);
    this.hotspotOffset = new Vector(...json.hotspotOffset);
    // Should the camera follow the avatar?
    this.bindCamera = json.bindCamera;
    this.enableSpeech = json.enableSpeech; // speech bubble
  }

  // Interaction
  interact(sprite, finish) {
    let ret = null;
    let states = this.json.states ?? [];
    console.log({ msg: 'interaction with xsprite', xsprite: this, sprite });
    // build state machine
    let evalStatement = ['((_this, finish)=>{switch (_this.state) {\n '];
    states.forEach((state) => {
      console.log({ state });
      let actionString = this.loadActionDynamically(state, sprite); // load actions dynamically
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
      console.log({ statement });
      evalStatement.push(statement);
    });
    evalStatement.push('default:\n\tbreak;\n}});');
    console.log({ stat: evalStatement.join('') });

    ret = eval.call(this, evalStatement.join('')).call(this, this, finish);

    console.log({ msg: 'ret', ret });
    if (ret) this.addAction(ret);
    console.log({ msg: 'fin', finish });

    // If completion handler passed through - call it when done
    if (finish) finish(false);

    return ret;
  }

  // todo -- add step handler dynamically

  // load string to eval based on type of action
  loadActionDynamically(state, sprite) {
    switch (state.type) {
      case 'dialogue':
        return (
          "\n\tconsole.log({_this, finish}); \n\treturn new _this.ActionLoader(_this.engine, 'dialogue', [" +
          JSON.stringify(state.dialogue) +
          ', false, { autoclose: true, onClose: () => finish(true) }], _this,' +
          (state.callback && state.callback !== '' ? state.callback : '') +
          ');\n'
        );
      case 'animate':
        return (
          "\n\tconsole.log({_this, finish}); \n\treturn new _this.ActionLoader(_this.engine, 'animate', [" +
          state.animate.join(',') +
          ', () => finish(true) ], _this,' +
          (state.callback && state.callback !== '' ? state.callback : '') +
          ');\n'
        );
      default:
        return '';
    }
  }
}
