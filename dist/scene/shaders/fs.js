"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = fs;

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
function fs() {
  return "\n  precision mediump float;\n  varying vec2 vTextureCoord;\n  uniform sampler2D uSampler;\n  \n  void main(void) {\n    gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));\n    if(gl_FragColor.a < 0.1)\n        discard;\n  }\n";
}