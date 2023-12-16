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
import ActionQueue from '@Engine/core/queue.jsx';
export default class Loadable {
  /**
   * Run action if loaded or add to queue
   * @param {*} action
   */
  runWhenLoaded(action) {
    if (this.loaded) action();
    else this.onLoadActions.add(action);
  }

  /**
   * update and override properties
   * @param {*} data
   */
  update(data) {
    Object.assign(this, data);
  }
}
