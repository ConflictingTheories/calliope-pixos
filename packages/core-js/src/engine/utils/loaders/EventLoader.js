/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis  **
**                                                 **
** PixoSpritz Dual License - see LICENSE.          **
** Free for education, non-commercial use, and     **
** individual non-profit artists (CC-BY-NC-SA-4.0) **
** Commercial use requires a purchased license.    **
** ----------------------------------------------- **
\*                                                 */

import Event from '@Engine/core/queue/event.js';

// Helps Loads New Event Instance
export class EventLoader {
  constructor(engine, type, args, world, callback) {
    this.engine = engine;
    this.type = type;
    this.args = args;
    this.world = world;
    this.callback = callback;
    this.instances = {};
    this.definitions = [];
    this.assets = {};

    let time = new Date().getTime();
    let id = world.id + '-' + type + '-' + time;
    return this.load(
      type,
      function (event) {
        event.onLoad(args);
      },
      function (event) {
        event.configure(type, world, id, time, args);
      }
    );
  }
  // Load Internal Action
  async load(type) {
    let afterLoad = arguments[1];
    let runConfigure = arguments[2];
    if (!this.instances[type]) {
      this.instances[type] = [];
    }
    // New Instance (assigns properties loaded by type)
    let instance = new Event(this.type, this.world, this.callback);
    const eventModule = await import('../../events/' + type + '.js');
    Object.assign(instance, eventModule.default);
    instance.templateLoaded = true;
    // Notify existing
    this.instances[type].forEach(function (instance) {
      if (instance.afterLoad) instance.afterLoad(instance.instance);
    });
    // construct
    if (runConfigure) runConfigure(instance);
    // load
    if (afterLoad) {
      if (instance.templateLoaded) await afterLoad(instance);
      else this.instances[type].push({ instance, afterLoad });
    }

    return instance;
  }
}
