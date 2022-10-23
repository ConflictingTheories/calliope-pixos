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

import DynamicAvatar from '@Engine/dynamic/avatar.jsx';
import DynamicSprite from '@Engine/dynamic/sprite.jsx';
import DynamicNpc from '@Engine/dynamic/npc.jsx';
import DynamicAnimatedTile from '@Engine/dynamic/animatedSprite.jsx';
import DynamicAnimatedSprite from '@Engine/dynamic/animatedTile.jsx';

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

  // Load Sprite
  async loadFromZip(type, sceneName, zip) {
    let afterLoad = arguments[3];
    let runConfigure = arguments[4];
    if (!this.instances[type]) {
      this.instances[type] = [];
    }
    // New Instance
    console.log('loading sprite from zip - ', type, sceneName, 'sprites/' + type + '.json');

    let json = JSON.parse(await zip.file(`sprites/${type}.json`).async('string'));
    let instance = {};
    switch (json.type) {
      case 'animated-sprite':
        instance = new DynamicAnimatedSprite(this.engine, json);
        break;
      case 'animated-tile':
        instance = new DynamicAnimatedTile(this.engine, json);
        break;
      case 'avatar':
        instance = new DynamicAvatar(this.engine, json);
        break;
      case 'npc':
        instance = new DynamicNpc(this.engine, json);
        break;
      default:
        instance = new DynamicSprite(this.engine, json);
        break;
    }
    console.log({ msg: 'loading', instance });
    instance.templateLoaded = true;
    // Update Existing
    this.instances[type].forEach(async function (instance) {
      if (instance.afterLoad) await instance.afterLoad(instance.instance);
    });
    // Configure if needed
    if (runConfigure) await runConfigure(instance);
    // once loaded
    if (afterLoad) {
      if (instance.templateLoaded) await afterLoad(instance);
      else this.instances[type].push({ instance, afterLoad });
    }

    return instance;
  }
}
