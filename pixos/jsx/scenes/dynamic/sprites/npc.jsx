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
import NPC from '@Sprites/npc/base/NPC.jsx';

export default class DynamicNpc extends NPC {
  constructor(engine, json) {
    // Initialize Sprite
    super(engine);
    // load in json
    this.loadJson(json);
    // store json config
    this.json = json;
    this.ActionLoader = ActionLoader;
  }

  // load in json properties to object
  loadJson(json) {
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
    let evalStatement = ['switch (this.state) {\n '];
    states.forEach((state) => {
      $actionString = this.loadActionDynamically(state); // load actions dynamically
      evalStatement.push("case '" + state.name + "':\n\tthis.state = '" + config.next + "';" + $actionString + '\nbreak;');
      return config;
    });
    evalStatement.push('default:\n\tbreak;\n}');

    // evaluate state machine for npc
    eval.apply(this, evalStatement.join(''));

    // assuming there is an action present - this will add it to the queue
    if (ret) this.addAction(ret);

    // If completion handler passed through - call it when done
    if (finish) finish(false);
    return ret;
  }

  // load string to eval based on type of action
  loadActionDynamically(state) {
    switch (state.type) {
      case 'dialogue':
        return (
          "\n\tret = new this.ActionLoader(this.engine, 'dialogue', ['" +
          state.dialogue +
          "', false, { autoclose: true, onClose: () => finish(true) }, this," +
          JSON.parse(state.callback) +
          ');\n'
        );
      case 'animate':
      default:
        return '';
    }
  }
}
