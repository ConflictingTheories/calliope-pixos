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
import Action from '@Engine/core/queue/action.js';

// Helps Loads New Action Instance
export class ActionLoader {
  constructor(engine, type, args, sprite, callback) {
    this.engine = engine;
    this.type = type;
    this.args = args;
    this.sprite = sprite;
    this.callback = callback;
    this.instances = {};
    this.definitions = [];
    this.assets = {};

    let time = new Date().getTime();
    let id = sprite.id + '-' + type + '-' + time;
    return this.load(
      type,
      async function (action) {
        await action.onLoad(args);
      },
      function (action) {
        action.configure(type, sprite, id, time, args);
      }
    );
  }
  // Load Internal Action
  async load(type) {
    debug('Loader', 'Loading Action: ' + type);

    let afterLoad = arguments[1];
    let runConfigure = arguments[2];
    if (!this.instances[type]) {
      this.instances[type] = [];
    }
    debug('Loader', { afterLoad, runConfigure });
    // New Instance (assigns properties loaded by type)
    let instance = new Action(this.type, this.sprite, this.callback);
    const actionModule = await import('../../actions/' + type + '.js');
    Object.assign(instance, actionModule.default);
    instance.templateLoaded = true;
    debug('Loader', 'Notifying in Action: ' + type);

    // Notify existing
    await Promise.all(
      this.instances[type].map(async function (instance) {
        debug('Loader', { instance });
        if (instance.afterLoad) await instance.afterLoad(instance.instance);
      })
    );
    // construct
    if (runConfigure) runConfigure(instance);
    // load
    if (afterLoad) {
      if (instance.templateLoaded) afterLoad(instance);
      else this.instances[type].push({ instance, afterLoad });
    }

    debug('Loader', 'Ending load Action: ' + type);

    return instance;
  }
}
