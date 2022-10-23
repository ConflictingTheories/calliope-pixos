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
    this.json = json;
    this.src = json.src;
    this.portraitSrc = json.portraitSrc;
    this.sheetSize = json.sheetSize;
    this.tileSize = json.tileSize;
    this.state = 'intro';
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

    // build state machine
    let evalStatement = ['((_this)=> {switch (_this.state) {\n '];
    states.forEach((state) => {
      $actionString = this.loadActionDynamically(state); // load actions dynamically
      evalStatement.push("case '" + state.name + "':\n\t_this.state = '" + config.next + "';" + $actionString + '\nbreak;');
      return config;
    });
    evalStatement.push('default:\n\tbreak;\n}\nconsole.log("hahahha"); if (ret) _this.addAction(ret);)');

    // evaluate state machine for npc
    xeval = eval;
    xeval(evalStatement.join(''))(this);

    // If completion handler passed through - call it when done
    if (finish) finish(false);
    return ret;
  }

  // load string to eval based on type of action
  loadActionDynamically(state) {
    switch (state.type) {
      case 'dialogue':
        return (
          "\n\tret = new _this.ActionLoader(_this.engine, 'dialogue', ['" +
          state.dialogue +
          "', false, { autoclose: true, onClose: () => finish(true) }, _this," +
          JSON.parse(state.callback) +
          ');\n'
        );
      case 'animate':
      default:
        return '';
    }
  }
}
