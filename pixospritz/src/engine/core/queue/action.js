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
 * Action - Represents an action performed by sprites or objects in the game.
 */
export default class Action {
  /**
   * Creates an instance of Action.
   * @param {string} type - The type of action.
   * @param {*} sprite - The sprite performing the action.
   * @param {Function} [callback] - Optional callback on completion.
   */
  constructor(type, sprite, callback) {
    /** @type {string} */
    this.type = type;
    /** @type {*} */
    this.sprite = sprite;
    /** @type {Function} */
    this.callback = callback;
    /** @type {number} */
    this.time = new Date().getTime();
    /** @type {string} */
    this.id = sprite.id + '-' + type + '-' + this.time;
  }

  /**
   * Configures the action with provided parameters.
   * @param {string} type - The type of action.
   * @param {*} sprite - The sprite performing the action.
   * @param {string} id - The action ID.
   * @param {number} time - The start time.
   * @param {*} args - Creation arguments.
   */
  configure(type, sprite, id, time, args) {
    this.sprite = sprite;
    this.id = id;
    this.type = type;
    this.startTime = time;
    this.creationArgs = args;
  }

  /**
   * Initializes the action on load.
   * @param {*} args - Initialization arguments.
   */
  async onLoad(args) {
    await this.init.apply(this, args);
    this.loaded = true;
  }

  /**
   * Serializes the action for storage or transmission.
   * @returns {object} Serialized action data.
   */
  serialize() {
    return {
      id: this.id,
      time: this.startTime,
      zone: this.sprite.zone.id,
      sprite: this.sprite.id,
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
