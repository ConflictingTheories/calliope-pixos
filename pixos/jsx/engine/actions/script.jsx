/*                                                 *\
** ----------------------------------------------- **
**             Calliope - Site Generator   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2021 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */

export default {
  init: function (triggerId, zone, onComplete) {
    console.log("loading - script", arguments);
    this.zone = zone;
    this.world = zone.world;
    this.lastKey = new Date().getTime();
    this.completed = false;
    this.onComplete = onComplete;
    // Determine Tile
    this.triggerId = triggerId;
    // Trigger
    this.triggerScript();
  },
  // Trigger interactions in sprites
  triggerScript: function () {
    if (!this.triggerId) this.completed = true;
    Promise.all(this.zone.scripts.filter((x) => x.id === this.triggerId).map(async (x) => await x.trigger.call(this.zone)));
    this.completed = true;
  },
  // check input and completion
  tick: function (time) {
    if (!this.loaded) return;
    if (this.completed) this.onComplete();
    return this.completed; // loop
  },
};
