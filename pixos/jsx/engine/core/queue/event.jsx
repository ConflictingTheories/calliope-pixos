/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2023 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */
export default class Event {
  /**
   * Events are High-Level Analogues to actions
   * @param {string} type
   * @param {World} world
   * @param {*} callback
   */
  constructor(type, world, callback) {
    this.type = type;
    this.world = world;
    this.callback = callback;
    this.time = new Date().getTime();
    this.id = world.id + '-' + type + '-' + this.time;
  }

  /**
   * configure event
   * @param {string} type
   * @param {World} world
   * @param {string} id
   * @param {number} time
   * @param {*} args
   */
  configure(type, world, id, time, args) {
    this.world = world;
    this.id = id;
    this.type = type;
    this.startTime = time;
    this.creationArgs = args;
  }

  /**
   * initialize on load
   * @param {*} args
   */
  async onLoad(args) {
    await this.init.apply(this, args);
    this.loaded = true;
  }

  /**
   * serialize
   * @returns
   */
  serialize() {
    return {
      id: this.id,
      time: this.startTime,
      world: this.world.id,
      type: this.type,
      args: this.creationArgs,
    };
  }

  /**
   * callback on completion
   * @returns
   */
  onComplete() {
    return this.callback ? this.callback() : null;
  }
}
