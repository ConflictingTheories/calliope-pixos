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

import { Vector, set, lerp } from '@Engine/utils/math/vector.jsx';
import { Direction } from '@Engine/utils/enums.jsx';

export default {
  init: async function (fromZoneId, from, toZoneId, to, length) {
    // When changing zones we fade out of the current zone, load the new zone(s)
    // and then fade back in. This makes the transition smoother and hides
    // asset loading. The duration can be tweaked if needed.
    const engine = this.sprite.zone?.world?.engine;
    if (engine?.renderManager) {
      // fade out
      console.log('fading out...')
      await engine.renderManager.startTransition({ effect: 'cross', direction: 'out', duration: 500 });
    }

    // When changing zones we load both zones without triggering the default
    // transition defined in World.loadZone. We handle the fade out/in around
    // these calls ourselves in this action. Passing `null` as the transition
    // parameter disables the automatic transition in loadZone.
    this.fromZone = await this.sprite.zone.world.loadZone(fromZoneId, false, false, null);
    this.toZone = await this.sprite.zone.world.loadZone(toZoneId, false, false, null);
    this.from = new Vector(...from);
    this.to = new Vector(...to);
    this.facing = Direction.fromOffset([Math.round(to.x - from.x), Math.round(to.y - from.y)]);
    this.length = length;

    console.log({renderManager: engine?.renderManager, fromZoneId, toZoneId, from, to, length});
    if (engine?.renderManager) {
      console.log('fading in...')
      // fade in once the new zones are ready
      await engine.renderManager.startTransition({ effect: 'cross', direction: 'in', duration: 500 });
    }
  },
  tick: function (time) {
    if (!this.toZone.loaded || !this.fromZone.loaded) return;
    // Set facing
    if (this.facing && this.facing != this.sprite.facing) {
      this.sprite.facing = this.facing;
      this.sprite.setFrame(0);
    }
    // Time Animation
    let endTime = this.startTime + this.length;
    let frac = (time - this.startTime) / this.length;
    if (time >= endTime) {
      set(this.to, this.sprite.pos);
      frac = 1;
    } else lerp(this.from, this.to, frac, this.sprite.pos);
    // New Frame
    let newFrame = Math.floor(frac * 4);
    if (newFrame != this.sprite.animFrame) this.sprite.setFrame(newFrame);
    // Move into the new zone
    if (!this.sprite.zone.isInZone(this.sprite.pos.x, this.sprite.pos.y)) {
      this.fromZone.removeSprite(this.sprite.id);
      // Defer until aftertick to stop the sprite being ticked twice
      this.sprite.zone.world.runAfterTick(
        function () {
          this.toZone.addSprite(this.sprite);
        }.bind(this)
      );
    }
    // Calculate new height
    let hx = this.sprite.pos.x + this.sprite.hotspotOffset.x;
    let hy = this.sprite.pos.y + this.sprite.hotspotOffset.y;
    if (!this.switchRenderZone && !this.fromZone.isInZone(hx, hy)) {
      this.switchRenderZone = true;
    }
    this.sprite.pos.z = (this.switchRenderZone ? this.toZone : this.fromZone).getHeight(hx, hy);

    return time >= endTime;
  },
};
