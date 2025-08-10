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

    if (type === 'cross') {
      vsSource = require('../../shaders/transition/cross/vs.jsx').default();
      fsSource = require('../../shaders/transition/cross/fs.jsx').default();
    } else if (type === 'swirl') {
      vsSource = require('../../shaders/transition/swirl/vs.jsx').default();
      fsSource = require('../../shaders/transition/swirl/fs.jsx').default();
    } else {
      // Default to fade transition. This also handles 'fadeOut' and 'fadeIn'.
      vsSource = require('../../shaders/transition/fade/vs.jsx').default();
      fsSource = require('../../shaders/transition/fade/fs.jsx').default();
    }

    return [vsSource, fsSource];
}