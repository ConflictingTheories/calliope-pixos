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

export default class ActionQueue {
  /**
   * Action/Event Queue
   */
  constructor() {
    this.actions = [];
  }

  /**
   * Add to Queue
   * @param {*} action 
   */
  add(action) {
    this.actions.push(action);
  }

  /**
   * Run Action
   */
  run() {
    let args = arguments;
    this.actions = this.actions.filter((action) => {
      return action(args);
    });
  }
}
