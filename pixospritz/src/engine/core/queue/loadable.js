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
 * Loadable - Base class for objects that can be loaded asynchronously, with support for queuing actions until loaded.
 */
export default class Loadable {
  /**
   * Runs an action immediately if loaded, otherwise adds it to the onLoadActions queue.
   * @param {Function} action - The action to run or queue.
   */
  runWhenLoaded(action) {
    if (this.loaded) action();
    else this.onLoadActions.add(action);
  }

  /**
   * Updates the object by assigning new properties.
   * @param {*} data - The data object to merge into this instance.
   */
  update(data) {
    Object.assign(this, data);
  }
}
