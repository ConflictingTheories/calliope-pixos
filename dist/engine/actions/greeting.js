"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine   	       **
** ----------------------------------------------- **
**  Copyright (c) 2020-2022 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */
var _default = {
  // Initialize Dialogue Object
  init: function init(greeting) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    this.engine = this.sprite.engine;
    this.greeting = greeting;
    this.options = options;
    this.completed = false;
  },
  // Update & Scroll
  tick: function tick(time) {
    if (!this.loaded) return;
    this.engine.setGreeting(this.text);
    return true;
  }
};
exports["default"] = _default;