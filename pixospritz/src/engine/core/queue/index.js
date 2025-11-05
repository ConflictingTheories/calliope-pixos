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
 * ActionQueue - Manages a queue of actions or events for sequential execution.
 */
export default class ActionQueue {
  /**
   * Creates an instance of ActionQueue.
   */
  constructor() {
    /** @type {Array<Function>} */
    this.actions = [];
  }

  /**
   * Adds an action to the queue.
   * @param {Function} action - The action function to add.
   */
  add(action) {
    this.actions.push(action);
  }

  /**
   * Runs all actions in the queue, filtering out completed ones.
   * @param {...any} args - Arguments to pass to each action.
   */
  run() {
    let args = arguments;
    this.actions = this.actions.filter((action) => {
      return action(args);
    });
  }
}
