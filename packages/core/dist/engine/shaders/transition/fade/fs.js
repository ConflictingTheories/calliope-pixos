"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = fs;
/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine           **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
*                                                 */

// Fragment shader for a simple fade transition. The entire screen is
// covered by a black overlay whose alpha is controlled by `uProgress`
// and `uDirection`. When `uDirection` is 0.0 (out), the alpha increases
// from 0 to 1 as progress goes from 0 to 1. When `uDirection` is 1.0 (in),
// the alpha decreases from 1 to 0.

function fs() {
  return "\n  precision mediump float;\n  varying vec2 vUV;\n  uniform float uProgress;\n  uniform float uDirection;\n  void main() {\n      float alpha = uDirection > 0.5 ? (1.0 - uProgress) : uProgress;\n      gl_FragColor = vec4(0.0, 0.0, 0.0, alpha);\n  }\n  ";
}