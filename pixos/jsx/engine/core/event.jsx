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
export default class Event {
  constructor(type, world, callback) {
    this.type = type;
    this.world = world;
    this.callback = callback;
    this.time = new Date().getTime();
    this.id = world.id + '-' + type + '-' + this.time;
  }
  // configure action
  configure(type, world, id, time, args) {
    this.world = world;
    this.id = id;
    this.type = type;
    this.startTime = time;
    this.creationArgs = args;
  }
  // initialize on load
  async onLoad(args) {
    await this.init.apply(this, args);
    this.loaded = true;
  }
  // serialize
  serialize() {
    return {
      id: this.id,
      time: this.startTime,
      world: this.world.id,
      type: this.type,
      args: this.creationArgs,
    };
  }
  // callback on completion
  onComplete() {
    return this.callback ? this.callback() : null;
  }
}
