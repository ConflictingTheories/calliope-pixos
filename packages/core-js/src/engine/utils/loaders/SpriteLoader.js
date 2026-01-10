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

import { debug } from '../debug-logger.js';
import DynamicAvatar from '@Engine/dynamic/avatar.js';
import DynamicSprite from '@Engine/dynamic/sprite.js';
import DynamicAnimatedSprite from '@Engine/dynamic/animatedSprite.js';
import DynamicAnimatedTile from '@Engine/dynamic/animatedTile.js';

// Helps Loads New Sprite Instance
export class SpriteLoader {
  constructor(engine) {
    this.engine = engine;
    this.definitions = [];
    this.instances = {};
  }

  // Load Sprite
  async loadFromZip(zip, type, spritzName) {
    debug('Loader', 'loading sprite from zip: ' + type + ' for ' + spritzName);
    let afterLoad = arguments[3];
    let runConfigure = arguments[4];
    if (!this.instances[type]) {
      this.instances[type] = [];
    }
    // New Instance
    let json = '';
    try {
      json = JSON.parse(await zip.file(`sprites/${type}.json`).async('string'));
    } catch (e) {
      console.error(e);
    }
    let instance = {};
    switch (json.type) {
      case 'animated-sprite':
        instance = new DynamicAnimatedSprite(this.engine, json, zip);
        await instance.loadJson();
        break;
      case 'animated-tile':
        instance = new DynamicAnimatedTile(this.engine, json, zip);
        await instance.loadJson();
        break;
      case 'avatar':
        instance = new DynamicAvatar(this.engine, json, zip);
        await instance.loadJson();
        break;
      default:
        instance = new DynamicSprite(this.engine, json, zip);
        await instance.loadJson();
        break;
    }
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
