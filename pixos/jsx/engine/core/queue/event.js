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
/**
 * Event - Represents high-level events analogous to actions, managed at the world level.
 */
export default class Event {
  /**
   * Creates an instance of Event.
   * @param {string} type - The type of event.
   * @param {World} world - The world instance.
   * @param {Function} [callback] - Optional callback on completion.
   */
  constructor(type, world, callback) {
    /** @type {string} */
    this.type = type;
    /** @type {World} */
    this.world = world;
    /** @type {Function} */
    this.callback = callback;
    /** @type {number} */
    this.time = new Date().getTime();
    /** @type {string} */
    this.id = world.id + '-' + type + '-' + this.time;
  }

  /**
   * Configures the event with provided parameters.
   * @param {string} type - The type of event.
   * @param {World} world - The world instance.
   * @param {string} id - The event ID.
   * @param {number} time - The start time.
   * @param {*} args - Creation arguments.
   */
  configure(type, world, id, time, args) {
    this.world = world;
    this.id = id;
    this.type = type;
    this.startTime = time;
    this.creationArgs = args;
  }

  /**
   * Initializes the event on load.
   * @param {*} args - Initialization arguments.
   */
  async onLoad(args) {
    await this.init.apply(this, args);
    this.loaded = true;
  }

  /**
   * Serializes the event for storage or transmission.
   * @returns {object} Serialized event data.
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
   * Calls the completion callback if provided.
   * @returns {*} Result of the callback or null.
   */
  onComplete() {
    return this.callback ? this.callback() : null;
  }
}
