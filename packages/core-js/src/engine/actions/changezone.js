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

import { Vector, set, lerp } from '@Engine/utils/math/vector.js';
import { Direction } from '@Engine/utils/enums.js';
import { debug } from '@Engine/utils/debug-logger.js';

export default {
  init: async function (fromZoneId, from, toZoneId, to, length) {
    // When changing zones we fade out of the current zone, load the new zone(s)
    // and then fade back in. This makes the transition smoother and hides
    // asset loading. The duration can be tweaked if needed.
    const engine = this.sprite.zone?.world?.engine;
    if (engine?.renderManager) {
      // fade out
      debug('ChangeZone', 'fading out...');
      await engine.renderManager.startTransition({
        effect: 'cross',
        direction: 'out',
        duration: 500,
      });
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
    // Determine if the transition should preserve height (e.g., portals/doors)
    try {
      const spritesAtDest = this.toZone
        ? this.toZone.spriteList.filter(s => s.pos.x === this.to.x && s.pos.y === this.to.y)
        : [];
      this.preserveHeight = spritesAtDest.some(s => s.preserveHeightOnWalk === true);
      if (this.preserveHeight && this.from && (this.from.z === null || this.from.z === undefined)) {
        const fHx = this.from.x + (this.sprite?.hotspotOffset?.x ?? 0);
        const fHy = this.from.y + (this.sprite?.hotspotOffset?.y ?? 0);
        this.from.z =
          typeof this.fromZone.getHeight === 'function' ? this.fromZone.getHeight(fHx, fHy) : 0;
        this.preserveHeightSourceZ = this.from.z;
      }
    } catch (e) {
      // ignore and continue
    }
    if (this.preserveHeight && this.sprite?.zone?.engine?.debug) {
      debug(
        'ChangeZone',
        'preserveHeight true for transition from',
        this.from.toArray?.() ?? this.from,
        'to',
        this.to.toArray?.() ?? this.to
      );
    }
    // Compute the z height for from/to so we interpolate vertically across zones
    try {
      const fHx = this.from.x + (this.sprite ? this.sprite.hotspotOffset.x : 0);
      const fHy = this.from.y + (this.sprite ? this.sprite.hotspotOffset.y : 0);
      const tHx = this.to.x + (this.sprite ? this.sprite.hotspotOffset.x : 0);
      const tHy = this.to.y + (this.sprite ? this.sprite.hotspotOffset.y : 0);
      if (this.from && (this.from.z === null || this.from.z === undefined))
        this.from.z =
          typeof this.fromZone.getHeight === 'function' ? this.fromZone.getHeight(fHx, fHy) : 0;
      if (this.to && (this.to.z === null || this.to.z === undefined))
        this.to.z =
          typeof this.toZone.getHeight === 'function' ? this.toZone.getHeight(tHx, tHy) : 0;
    } catch (e) {
      if (this.sprite?.zone?.engine?.debug)
        console.warn('changezone.init failed to compute z for from/to', e?.message || e);
    }

    debug('ChangeZone', 'init', { fromZoneId, toZoneId, from, to, length });
    if (engine?.renderManager) {
      debug('ChangeZone', 'fading in...');
      // fade in once the new zones are ready
      await engine.renderManager.startTransition({
        effect: 'cross',
        direction: 'in',
        duration: 500,
      });
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
    } else {
      // Lerp X and Y only, handle Z separately
      this.sprite.pos.x = this.from.x + frac * (this.to.x - this.from.x);
      this.sprite.pos.y = this.from.y + frac * (this.to.y - this.from.y);
      // Calculate height based on current zone and position
      let hx = this.sprite.pos.x + this.sprite.hotspotOffset.x;
      let hy = this.sprite.pos.y + this.sprite.hotspotOffset.y;
      let zLerp =
        typeof this.from.z === 'number' && typeof this.to.z === 'number'
          ? this.from.z + frac * (this.to.z - this.from.z)
          : null;
      if (!this.switchRenderZone && !this.fromZone.isInZone(hx, hy)) {
        this.switchRenderZone = true;
      }
      if (this.preserveHeight) {
        this.sprite.pos.z = this.preserveHeightSourceZ ?? this.sprite.pos.z;
        if (this.sprite.zone.engine?.debug && !this.__preserveLog) {
          this.__preserveLog = true;
          debug(
            'ChangeZone',
            'preserveHeight applied for sprite',
            this.sprite.id,
            'sourceZ=',
            this.preserveHeightSourceZ
          );
        }
      } else {
        const zZone = (this.switchRenderZone ? this.toZone : this.fromZone).getHeight(hx, hy);
        if (zLerp !== null) {
          this.sprite.pos.z = zLerp;
        } else {
          this.sprite.pos.z = zZone;
        }
        if (this.sprite.zone.engine?.debug && this.__tickLogCount < 3) {
          if (!this.__tickLogCount) this.__tickLogCount = 0;
          this.__tickLogCount++;
          debug(
            'ChangeZone',
            'tick sprite',
            this.sprite.id,
            'frac=',
            frac.toFixed(2),
            'hx,hy=',
            hx.toFixed(2),
            hy.toFixed(2),
            'zLerp=',
            zLerp?.toFixed(2),
            'zZone=',
            zZone?.toFixed(2),
            'pos.z=',
            this.sprite.pos.z.toFixed(2)
          );
        }
      }
    }
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

    return time >= endTime;
  },
};
