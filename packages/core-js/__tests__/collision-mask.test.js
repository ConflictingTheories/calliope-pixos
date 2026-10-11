/**
 * Collision mask tests — P4-02.
 * Table-driven symmetric cases over every layer pair, plus nullish-default
 * behavior in PhysicsManager._detectCollisions.
 */
import { describe, it, expect } from 'vitest';
import CollisionMask from '../src/engine/core/physics/CollisionMask.js';
import PhysicsManager from '../src/engine/core/physics/PhysicsManager.js';
import { Vector } from '../src/engine/utils/math/vector.js';
import { AABB } from '../src/engine/utils/math/collision.js';

const { Layers } = CollisionMask;
const LAYER_NAMES = Object.keys(Layers).filter(n => n !== 'ALL');

describe('CollisionMask.shouldCollide', () => {
  it('is symmetric across the full layer matrix', () => {
    for (const a of LAYER_NAMES) {
      for (const b of LAYER_NAMES) {
        // both-willing, both-unwilling, and one-sided cases
        const cases = [
          [Layers[a], Layers.ALL, Layers[b], Layers.ALL],
          [Layers[a], 0, Layers[b], Layers.ALL],
          [Layers[a], Layers.ALL, Layers[b], 0],
          [Layers[a], Layers[b], Layers[b], Layers[a]],
        ];
        for (const [la, ma, lb, mb] of cases) {
          const ab = CollisionMask.shouldCollide(la, ma, lb, mb);
          const ba = CollisionMask.shouldCollide(lb, mb, la, ma);
          expect(ba, `${a}/${b} maskA=${ma} maskB=${mb}`).toBe(ab);
        }
      }
    }
  });

  it('table-driven expectations', () => {
    const T = [
      // [layerA, maskA, layerB, maskB, expected]
      [Layers.PLAYER, Layers.ENEMY | Layers.WALL, Layers.ENEMY, Layers.ALL, true],
      [Layers.PLAYER, Layers.WALL, Layers.ENEMY, Layers.ALL, false], // A not interested
      [Layers.PLAYER, Layers.ALL, Layers.ENEMY, Layers.WALL, false], // B not interested
      [Layers.ITEM, Layers.ALL, Layers.PLAYER, Layers.ITEM, true],
      [Layers.TRIGGER, Layers.ALL, Layers.TRIGGER, Layers.ALL, true],
      [Layers.DEFAULT, 0, Layers.DEFAULT, 0, false], // explicit 0 mask: collides with nothing
    ];
    for (const [la, ma, lb, mb, expected] of T) {
      expect(CollisionMask.shouldCollide(la, ma, lb, mb)).toBe(expected);
    }
  });

  it('BitTable matches Layers', () => {
    for (const { name, bit } of CollisionMask.BitTable) {
      expect(Layers[name]).toBe(bit);
    }
  });

  it('createMask / getLayerNames round-trip', () => {
    const mask = CollisionMask.createMask(['PLAYER', 'ENEMY']);
    expect(mask).toBe(Layers.PLAYER | Layers.ENEMY);
    expect(CollisionMask.getLayerNames(mask).sort()).toEqual(['ENEMY', 'PLAYER']);
    expect(CollisionMask.createMask(['NOPE'])).toBe(0);
  });
});

describe('PhysicsManager nullish defaults (P4-02)', () => {
  function bodyAt(x, layer, mask) {
    const position = new Vector(x, 0, 0);
    return {
      position,
      velocity: new Vector(0, 0, 0),
      getAABB: () => new AABB(new Vector(x - 5, -5, 0), new Vector(x + 5, 5, 0)),
      collisionLayer: layer,
      collisionMask: mask,
    };
  }

  it('explicit 0 mask is preserved (not replaced by ALL)', () => {
    const pm = new PhysicsManager(null);
    const a = bodyAt(0, Layers.PLAYER, 0); // wants no collisions
    const b = bodyAt(0, Layers.ENEMY, Layers.ALL);
    pm.addBody(a, 10, 10, Layers.PLAYER, 0);
    // addBody writes the given mask through; _detectCollisions must not
    // coerce the explicit 0 back to ALL via ||.
    expect(a.collisionMask).toBe(0);
    pm.spatialHash.insert(b); // b is a collision candidate
    const hits = pm._detectCollisions(a);
    expect(hits.has(b)).toBe(false);
  });

  it('undefined layer/mask fall back to DEFAULT/ALL', () => {
    const pm = new PhysicsManager(null);
    const a = bodyAt(0, undefined, undefined);
    const b = bodyAt(0, undefined, undefined);
    pm.addBody(a);
    pm.addBody(b);
    const hits = pm._detectCollisions(a);
    expect(hits.has(b)).toBe(true);
  });
});
