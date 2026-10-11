/**
 * Fixed-step physics harness tests — P4-03.
 * Same inputs -> same state hash across runs (determinism).
 */
import { describe, it, expect } from 'vitest';
import FixedStepper, { hashState, mulberry32 } from '../src/engine/core/physics/FixedStep.js';
import PhysicsManager from '../src/engine/core/physics/PhysicsManager.js';
import { Vector } from '../src/engine/utils/math/vector.js';
import { AABB } from '../src/engine/utils/math/collision.js';

function makeBodies(seed, n = 6) {
  const rand = mulberry32(seed);
  return Array.from({ length: n }, (_, i) => ({
    id: `body-${i}`,
    position: new Vector(rand() * 200, rand() * 200, 0),
    velocity: new Vector((rand() - 0.5) * 40, (rand() - 0.5) * 40, 0),
    useGravity: i % 2 === 0,
    getAABB() {
      const p = this.position;
      return new AABB(new Vector(p.x - 5, p.y - 5, 0), new Vector(p.x + 5, p.y + 5, 0));
    },
  }));
}

function runSimulation(seed) {
  const pm = new PhysicsManager(null);
  const bodies = makeBodies(seed);
  for (const b of bodies) pm.addBody(b, 10, 10);
  const stepper = new FixedStepper({ stepHz: 60 });
  // Variable frame times (16-33ms jitter) — fixed steps must absorb this.
  const rand = mulberry32(1234);
  for (let f = 0; f < 120; f++) {
    stepper.update(0.016 + rand() * 0.017, dt => pm.update(dt));
  }
  return { hash: hashState(bodies), tick: stepper.tick };
}

describe('FixedStepper', () => {
  it('runs a whole number of fixed steps and reports alpha in [0,1)', () => {
    const stepper = new FixedStepper({ stepHz: 60 });
    let calls = 0;
    const r1 = stepper.update(1 / 60, dt => {
      calls++;
      expect(dt).toBeCloseTo(1 / 60, 10);
    });
    expect(calls).toBe(1);
    expect(r1.alpha).toBeGreaterThanOrEqual(0);
    expect(r1.alpha).toBeLessThan(1);

    // Half a step accumulates; alpha reflects the remainder.
    calls = 0;
    stepper.update(1 / 120, () => calls++);
    expect(calls).toBe(0);
    expect(stepper.alpha).toBeCloseTo(0.5, 5);
  });

  it('clamps the spiral of death (maxSteps)', () => {
    const stepper = new FixedStepper({ stepHz: 60, maxSteps: 5 });
    let calls = 0;
    stepper.update(10, () => calls++); // 10s frame: absurd
    expect(calls).toBe(5);
  });

  it('same inputs yield same state hash across runs (determinism)', () => {
    const a = runSimulation(42);
    const b = runSimulation(42);
    expect(a.hash).toBe(b.hash);
    expect(a.tick).toBe(b.tick);
  });

  it('different seeds yield different hashes', () => {
    expect(runSimulation(42).hash).not.toBe(runSimulation(43).hash);
  });

  it('mulberry32 is deterministic', () => {
    const r1 = mulberry32(7);
    const r2 = mulberry32(7);
    expect([r1(), r1(), r1()]).toEqual([r2(), r2(), r2()]);
  });

  it('hashState is order-independent and float-noise tolerant', () => {
    const bodies = makeBodies(9);
    const h1 = hashState(bodies);
    const h2 = hashState([...bodies].reverse());
    expect(h1).toBe(h2);
  });
});
