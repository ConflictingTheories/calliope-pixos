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

import { ActionLoader } from '@Engine/utils/loaders/index.jsx';
import Darkness from '@Sprites/npc/darkness.jsx';
export default class MyDarkness extends Darkness {
  constructor(engine) {
    // Initialize Sprite
    super(engine);
  }
  // Interaction
  async interact(sprite, finish) {
    let ret = null;
    // React based on internal state
    switch (this.state) {
      case 'intro':
        this.state = 'loop';
        ret = new ActionLoader(this.engine, 'dialogue', ['Join me....!', false, { autoclose: true, onClose: () => finish(true) }], this);
        break;
      case 'loop':
        this.state = 'loop2';
        ret = new ActionLoader(
          this.engine,
          'dialogue',
          ['I need a partner for squash.', false, { autoclose: true, onClose: () => finish(true) }],
          this
        );
        break;
      case 'loop2':
        this.state = 'loop';
        ret = new ActionLoader(this.engine, 'dialogue', ['Seriously - you swing?', false, { autoclose: true, onClose: () => finish(true) }], this);
        break;
      default:
        break;
    }
    if (ret) this.addAction(ret);
    // If completion handler passed through - call it when done
    if (finish) finish(false);
    return ret;
  }
}
