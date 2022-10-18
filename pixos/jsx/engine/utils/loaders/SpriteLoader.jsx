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

import Resources from '@Engine/utils/resources.jsx';
import Sprite from '@Engine/core/sprite.jsx';
import ModelObject from '@Engine/core/object.jsx';
import Tileset from '@Engine/core/tileset.jsx';
import Action from '@Engine/core/action.jsx';
import Event from '@Engine/core/event.jsx';

// Helps Loads New Sprite Instance
export class SpriteLoader {
  constructor(engine) {
    this.engine = engine;
    this.definitions = [];
    this.instances = {};
  }
  // Load Sprite
  async load(type, sceneName) {
    let afterLoad = arguments[2];
    let runConfigure = arguments[3];
    if (!this.instances[type]) {
      this.instances[type] = [];
    }
    // New Instance
    console.log('loading sprite - ', type, sceneName, '../../' + sceneName + '/sprites/' + type + '.jsx');

    let Type = require('@Scenes/' + sceneName + '/sprites/' + type + '.jsx')['default'];

    let instance = new Type(this.engine);
    instance.templateLoaded = true;
    // Update Existing
    this.instances[type].forEach(function (instance) {
      if (instance.afterLoad) instance.afterLoad(instance.instance);
    });
    // Configure if needed
    if (runConfigure) runConfigure(instance);
    // once loaded
    if (afterLoad) {
      if (instance.templateLoaded) afterLoad(instance);
      else this.instances[type].push({ instance, afterLoad });
    }

    return instance;
  }
  // todo - load remote sprite
  async loadRemotely(type, sceneName) {
    let afterLoad = arguments[2];
    let runConfigure = arguments[3];
    if (!this.instances[type]) {
      this.instances[type] = [];
    }
    // New Instance of a dynamic sprite -- todo
    console.log('loading sprite - ', type, sceneName, '../../' + sceneName + '/sprites/' + type + '.jsx');

    let Type = require('@Scenes/' + sceneName + '/sprites/' + type + '.jsx')['default'];

    let instance = new Type(this.engine);
    instance.templateLoaded = true;
    // Update Existing
    this.instances[type].forEach(function (instance) {
      if (instance.afterLoad) instance.afterLoad(instance.instance);
    });
    // Configure if needed
    if (runConfigure) runConfigure(instance);
    // once loaded
    if (afterLoad) {
      if (instance.templateLoaded) afterLoad(instance);
      else this.instances[type].push({ instance, afterLoad });
    }

    return instance;
  }
}
