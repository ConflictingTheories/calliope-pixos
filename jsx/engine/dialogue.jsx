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
import ActionQueue from "./queue.jsx";

export default class Dialogue {
  constructor(engine, type) {
    this.engine = engine;
    this.active = false;
    this.actionDict = {};
    this.actionList = [];
    this.onLoadActions = new ActionQueue();
    this.templateLoaded = true;
    // apply properties
    Object.assign(this, require("../scene/dialogue/" + type + ".jsx")["default"]);
    // load
    this.loadSpeech(this);
  }

  runWhenLoaded(action) {
    if (this.loaded) action();
    else this.onLoadActions.add(action);
  }

  // Load Text
  loadSpeech(instanceData) {
    if (this.loaded) return;
    if (!this.src) {
      console.error("Invalid dialogue definition");
      return;
    }
    // Zone Information
    this.zone = instanceData.zone;
    if (instanceData.id) this.id = instanceData.id;
    // Texture Buffer
    if (this.options.autoplay) {
      this.active = true;
    }

    this.init(); // Hook for sprite implementations
    this.loaded = true;
    this.onLoadActions.run();

    console.log("Initialized dialogue '" + this.id + "' in zone '" + this.zone.id + "'");
  }

  // Draw Sprite Sprite
  draw() {
    if (!this.loaded) return;
    // Draw Dialogue to HUD
  }

  // Add Action to Queue
  addAction(action) {
    console.log("adding action");
    if (this.actionDict[action.id]) this.removeAction(action.id);
    this.actionDict[action.id] = action;
    this.actionList.push(action);
  }

  // Remove Action
  removeAction(id) {
    console.log("removing action");
    this.actionList = this.actionList.filter((action) => action.id !== id);
    delete this.actionDict[id];
  }

  // Tick
  tickOuter(time) {
    if (!this.loaded || !this.active) return; // only if active
    // Sort activities by increasing startTime, then by id
    this.actionList.sort((a, b) => {
      let dt = a.startTime - b.startTime;
      if (!dt) return dt;
      return a.id > b.id ? 1 : -1;
    });
    // Run & Queue for Removal when complete
    let toRemove = [];
    this.actionList.forEach((action) => {
      if (!action.loaded || action.startTime > time) return;
      if (action.tick(time)) toRemove.push(action);
    });
    // clear completed activities
    toRemove.forEach((action) => this.removeAction(action.id));
    // tick
    if (this.tick) this.tick(time);
  }

  // Hook for sprite implementations
  init() {
    console.log("- dialogue hook", this.id);
  }
}
