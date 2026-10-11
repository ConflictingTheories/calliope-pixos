/**
 * Vector contract conformance suite — P4-01.
 *
 * The same behavioral assertions run against EVERY exported vector
 * implementation: packages/math (V3, vec3, Vector, Vector4, Coord) and the
 * legacy core-js copies (Coord, Vector). Any implementation that drifts from
 * the contract in packages/math/src/contract.js fails here.
 */
import { describe, it, expect } from 'vitest';
import { V3, vec3, Vector, Vector4, Coord } from '../src/vector.js';
import {
  Coord as CoreCoord,
  Vector as CoreVector,
} from '../../core-js/src/engine/utils/math/vector.js';
import { VECTOR_CONTRACT } from '../src/contract.js';

const approx = (a, b, eps = 1e-9) => Math.abs(a - b) < eps;

describe('contract document', () => {
  it('declares version, methods, mutability, units', () => {
    expect(VECTOR_CONTRACT.version).toBe('1.0.0');
    expect(VECTOR_CONTRACT.methods).toContain('add');
    expect(VECTOR_CONTRACT.mutability).toBeTruthy();
    expect(VECTOR_CONTRACT.units.angle).toBe('radians');
  });
});

describe('V3 (plain arrays, immutable)', () => {
  it('add/sub/mul/dot/cross/len/norm', () => {
    const a = [1, 2, 3];
    const b = [4, 5, 6];
    expect(V3.add(a, b)).toEqual([5, 7, 9]);
    expect(V3.sub(a, b)).toEqual([-3, -3, -3]);
    expect(V3.mul(a, 2)).toEqual([2, 4, 6]);
    expect(V3.dot(a, b)).toBe(32);
    expect(V3.cross([1, 0, 0], [0, 1, 0])).toEqual([0, 0, 1]);
    expect(approx(V3.len([3, 4, 0]), 5)).toBe(true);
    expect(V3.norm([3, 4, 0]).map(v => +v.toFixed(6))).toEqual([0.6, 0.8, 0]);
    // immutability: inputs untouched
    expect(a).toEqual([1, 2, 3]);
    expect(b).toEqual([4, 5, 6]);
  });
});

describe('vec3 (out-param, zero-alloc hot path)', () => {
  it('writes into out and returns it', () => {
    const out = [0, 0, 0];
    const r = vec3.add([1, 2, 3], [4, 5, 6], out);
    expect(r).toBe(out); // same reference: no allocation
    expect(out).toEqual([5, 7, 9]);
  });
  it('allocates when out is omitted', () => {
    expect(vec3.sub([1, 2, 3], [4, 5, 6])).toEqual([-3, -3, -3]);
  });
  it('dot/scale/normalize/copy behave', () => {
    expect(vec3.dot([1, 2, 3], [4, 5, 6])).toBe(32);
    expect(vec3.scale([1, 2, 3], 2)).toEqual([2, 4, 6]);
    const n = vec3.normalize([3, 4, 0]);
    expect(approx(n[0], 0.6) && approx(n[1], 0.8)).toBe(true);
    expect(vec3.copy([7, 8, 9])).toEqual([7, 8, 9]);
  });
});

function vectorClassSuite(name, VectorClass) {
  describe(`${name} (class, immutable)`, () => {
    it('add/sub/mul are immutable and correct', () => {
      const a = new VectorClass(1, 2, 3);
      const b = new VectorClass(4, 5, 6);
      expect(a.add(b).toArray()).toEqual([5, 7, 9]);
      expect(a.sub(b).toArray()).toEqual([-3, -3, -3]);
      expect(a.mul(2).toArray()).toEqual([2, 4, 6]);
      expect(a.toArray()).toEqual([1, 2, 3]); // untouched
    });
    it('dot/cross/length/distance/negate', () => {
      const a = new VectorClass(1, 2, 3);
      const b = new VectorClass(4, 5, 6);
      expect(a.dot(b)).toBe(32);
      expect(a.cross(new VectorClass(1, 0, 0)).toArray()).toEqual([0, 3, -2]);
      expect(approx(a.length(), Math.sqrt(14))).toBe(true);
      expect(approx(a.distance(b), Math.sqrt(27))).toBe(true);
      expect(a.negate().toArray()).toEqual([-1, -2, -3]);
    });
    it('normal() handles zero vector', () => {
      const z = new VectorClass(0, 0, 0).normal();
      expect(z.toArray()).toEqual([0, 0, 0]);
    });
  });
}

vectorClassSuite('packages/math Vector', Vector);
vectorClassSuite('core-js Vector (legacy copy)', CoreVector);

describe('Vector4', () => {
  it('4D ops behave', () => {
    const a = new Vector4(1, 2, 3, 4);
    const b = new Vector4(4, 3, 2, 1);
    expect(a.add(b).toArray()).toEqual([5, 5, 5, 5]);
    expect(a.dot(b)).toBe(20);
    expect(approx(a.length(), Math.sqrt(30))).toBe(true);
  });
});

function coordSuite(name, CoordClass, dims) {
  describe(`${name} (2D coord, immutable)`, () => {
    it('add/sub/mul/length/distance/normal/dot/negate/toArray', () => {
      const a = new CoordClass(3, 4);
      const b = new CoordClass(1, 1);
      const arr = v => v.toArray().slice(0, dims);
      expect(arr(a.add(b))).toEqual([4, 5]);
      expect(arr(a.sub(b))).toEqual([2, 3]);
      expect(arr(a.mul(2))).toEqual([6, 8]);
      expect(a.length()).toBe(5);
      expect(approx(a.distance(b), Math.sqrt(13))).toBe(true);
      expect(arr(a.normal()).map(v => +v.toFixed(6))).toEqual([0.6, 0.8]);
      expect(a.dot(b)).toBe(7);
      expect(arr(a.negate())).toEqual([-3, -4]);
      expect(arr(a)).toEqual([3, 4]); // untouched
    });
  });
}

coordSuite('packages/math Coord', Coord, 2);
coordSuite('core-js Coord (legacy copy)', CoreCoord, 2);

describe('conversion (interchange = plain arrays)', () => {
  it('class -> array -> class round-trips', () => {
    const v = new Vector(1, 2, 3);
    const arr = v.toArray();
    const v2 = new Vector(arr[0], arr[1], arr[2]);
    expect(v2.toArray()).toEqual(arr);
    // V3 interoperates directly on the array form
    expect(V3.add(arr, [1, 1, 1])).toEqual([2, 3, 4]);
  });
});
