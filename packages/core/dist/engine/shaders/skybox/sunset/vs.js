"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = vs;
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

function vs() {
  return "\n  attribute vec4 aPosition;\n  varying vec4 vPosition;\n  void main() {\n    vPosition = aPosition;\n    gl_Position = aPosition;\n  }\n";
}