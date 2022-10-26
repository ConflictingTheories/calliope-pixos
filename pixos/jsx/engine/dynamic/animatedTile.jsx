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
import AnimatedTile from '@Sprites/effects/base/AnimatedTile.jsx';

export default class DynamicAnimatedTile extends AnimatedTile {
  constructor(engine, json) {
    // Initialize Sprite
    super(engine);
    // load in json
    this.loadJson(json);
    // store json config
    this.json = json;
    this.ActionLoader = ActionLoader;
  }

  // setup framerate
  init() {
    if (this.json.randomJitter) {
      this.triggerTime = this.json.triggerTime + Math.floor(Math.random() * this.json.randomJitter);
    } else {
      this.triggerTime = this.json.triggerTime;
    }
  }

  // load in json properties to object
  loadJson(json) {
    this.src = json.src;
    this.portraitSrc = json.portraitSrc;
    this.sheetSize = json.sheetSize;
    this.tileSize = json.tileSize;
    this.state = json.state ?? 'intro';
    this.blocking = json.blocking;
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
      console.log({ msg: 'interaction with animated-tile', animatedTile: this, sprite });
      // build state machine
      let evalStatement = ['((_this, finish)=>{switch (_this.state) {\n '];
      states.forEach((state) => {
        console.log({ state });
        let actionString = this.loadActionDynamically(state, sprite); // load actions dynamically
        let statement =
          "case '" +
          state.name +
          "':console.log('switching state: " +
          state.name +
          "'); \t\n_this.state = '" +
          state.next +
          "';" +
          actionString +
          '\nbreak;';
        console.log({ statement });
        evalStatement.push(statement);
      });
      evalStatement.push('default:\n\tbreak;\n}});');
      console.log({ stat: evalStatement.join('') });
  
      let xeval = eval;
      ret = xeval(evalStatement.join('')).call(this, this, finish);
  
      if (ret) this.addAction(ret);
  
      // If completion handler passed through - call it when done
      if (finish) finish(false);
      return ret;
    }
  
    // load string to eval based on type of action
    loadActionDynamically(state, sprite) {
      switch (state.type) {
        case 'dialogue':
          return (
            "\n\tconsole.log(_this); \n\treturn new _this.ActionLoader(_this.engine, 'dialogue', [" +
            JSON.stringify(state.dialogue) +
            ', false, { autoclose: true, onClose: () => finish(true) }], _this,' +
            (state.callback && state.callback !== '' ? JSON.parse(state.callback) : '') +
            ');\n'
          );
        case 'animate':
        default:
          return '';
      }
    }
}
