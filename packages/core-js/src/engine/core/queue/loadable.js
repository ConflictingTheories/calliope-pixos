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
