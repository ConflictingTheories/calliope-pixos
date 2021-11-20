"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

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
var _default = {
  // Initialize Dialogue Object
  init: function init(greeting) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    console.log("loading - greeting");
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