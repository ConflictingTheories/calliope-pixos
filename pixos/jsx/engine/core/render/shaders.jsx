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

export function fetchTransitionShaderFiles(type) {
    let vsSource = null;
    let fsSource = null;

    const t = (type || '').toLowerCase();

    if (t === 'cross') {
      vsSource = require('../../shaders/transition/cross/vs.jsx').default();
      fsSource = require('../../shaders/transition/cross/fs.jsx').default();
    } else if (t === 'crossblur' || t === 'cross-blur') {
      vsSource = require('../../shaders/transition/crossBlur/vs.jsx').default();
      fsSource = require('../../shaders/transition/crossBlur/fs.jsx').default();
    } else if (t === 'swirl') {
      vsSource = require('../../shaders/transition/swirl/vs.jsx').default();
      fsSource = require('../../shaders/transition/swirl/fs.jsx').default();
    } else if (t === 'blur' || t === 'blur-in' || t === 'blur-out') {
      // Single blur shader pair supports both in and out by uDirection.
      vsSource = require('../../shaders/transition/blur/vs.jsx').default();
      fsSource = require('../../shaders/transition/blur/fs.jsx').default();
    } else {
      // Default to fade transition; also handles 'fade', 'fade-in', 'fade-out'.
      vsSource = require('../../shaders/transition/fade/vs.jsx').default();
      fsSource = require('../../shaders/transition/fade/fs.jsx').default();
    }

    return [vsSource, fsSource];
}
