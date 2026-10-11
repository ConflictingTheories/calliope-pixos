/**
 * Fixed-step physics harness — P4-03.
 *
 * Separates the three phases the old `PhysicsManager.update(deltaTime)` fused:
 *
 *   accumulate(frameDt) -> step(fixedDt) x N -> interpolate(alpha)
 *
 * - `stepFn` is the deterministic simulation step (e.g. a bound
 *   `PhysicsManager.update`); it always receives the SAME fixed dt.
 * - `alpha` (0..1) is the interpolation factor for rendering between the
 *   previous and current physics states.
 * - `hashState` produces a deterministic fingerprint of a body list so two
 *   runs of the same inputs can be proven identical.
 * - `mulberry32` is the seeded RNG for deterministic scene construction.
 */

export const DEFAULT_STEP_HZ = 60;

/** Deterministic seeded PRNG (mulberry32). */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return ('0000000' + (h >>> 0).toString(16)).slice(-8);
}

/**
 * Deterministic state hash over physics bodies.
 * Rounds to 1e-6 to absorb float noise; sorts by stable body id when present.
 */
export function hashState(bodies) {
  const parts = bodies.map(b => {
    const p = b.position || b.pos || { x: 0, y: 0, z: 0 };
    const v = b.velocity || { x: 0, y: 0, z: 0 };
    const r = n => (typeof n === 'number' ? n.toFixed(6) : '0.000000');
    return `${b.id ?? ''}:${r(p.x)},${r(p.y)},${r(p.z)}|${r(v.x)},${r(v.y)},${r(v.z)}`;
  });
  parts.sort();
  return fnv1a(parts.join(';'));
}

export default class FixedStepper {
  /**
   * @param {object} [opts]
   * @param {number} [opts.stepHz=60] - fixed simulation frequency
   * @param {number} [opts.maxSteps=5] - spiral-of-death guard per frame
   */
  constructor(opts = {}) {
    this.stepHz = opts.stepHz ?? DEFAULT_STEP_HZ;
    this.stepDt = 1 / this.stepHz;
    this.maxSteps = opts.maxSteps ?? 5;
    this.accumulator = 0;
    this.stepsThisFrame = 0;
    /** Interpolation factor for renderers (0..1). */
    this.alpha = 0;
    /** Total fixed steps executed (deterministic clock). */
    this.tick = 0;
  }

  reset() {
    this.accumulator = 0;
    this.stepsThisFrame = 0;
    this.alpha = 0;
    this.tick = 0;
  }

  /**
   * Advance the simulation by a variable frame delta.
   * @param {number} frameDt - real frame time in seconds (clamped >= 0)
   * @param {(fixedDt: number) => void} stepFn - deterministic step
   * @returns {{ steps: number, alpha: number, tick: number }}
   */
  update(frameDt, stepFn) {
    const dt = Math.max(0, frameDt);
    this.accumulator += dt;
    // Clamp the accumulator: never simulate more than maxSteps per frame.
    const maxAccum = this.stepDt * this.maxSteps;
    if (this.accumulator > maxAccum) this.accumulator = maxAccum;

    let steps = 0;
    while (this.accumulator >= this.stepDt && steps < this.maxSteps) {
      stepFn(this.stepDt);
      this.accumulator -= this.stepDt;
      this.tick++;
      steps++;
    }
    this.stepsThisFrame = steps;
    this.alpha = this.accumulator / this.stepDt;
    return { steps, alpha: this.alpha, tick: this.tick };
  }
}
