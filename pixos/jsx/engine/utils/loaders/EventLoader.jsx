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

import Event from '@Engine/core/event.jsx';

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
  load(type) {
    let afterLoad = arguments[1];
    let runConfigure = arguments[2];
    if (!this.instances[type]) {
      this.instances[type] = [];
    }
    // New Instance (assigns properties loaded by type)
    let instance = new Event(this.type, this.world, this.callback);
    Object.assign(instance, require('@Engine/events/' + type + '.jsx')['default']);
    instance.templateLoaded = true;
    // Notify existing
    this.instances[type].forEach(function (instance) {
      if (instance.afterLoad) instance.afterLoad(instance.instance);
    });
    // construct
    if (runConfigure) runConfigure(instance);
    // load
    if (afterLoad) {
      if (instance.templateLoaded) afterLoad(instance);
      else this.instances[type].push({ instance, afterLoad });
    }

    return instance;
  }
}
