import { test, describe, expect } from 'vitest';
import {
  Coord,
  Vector,
  Vector4,
  V3,
  vec3,
  degToRad,
  radToDeg,
  negate,
  lerp,
  lineRectCollide,
  rectRectCollide,
} from '../src/vector.js';

describe('Coord', () => {
  test('constructor sets x, y, z, w', () => {
    const coord = new Coord(1, 2, 3, 4);
    expect(coord.x).toBe(1);
    expect(coord.y).toBe(2);
    expect(coord.z).toBe(3);
    expect(coord.w).toBe(4);
  });

  test('add returns new Coord with summed values', () => {
    const c1 = new Coord(1, 2);
    const c2 = new Coord(3, 4);
    const result = c1.add(c2);
    expect(result.x).toBe(4);
    expect(result.y).toBe(6);
    expect(result !== c1).toBeTruthy();
  });

  test('sub returns new Coord with subtracted values', () => {
    const c1 = new Coord(5, 7);
    const c2 = new Coord(2, 3);
    const result = c1.sub(c2);
    expect(result.x).toBe(3);
    expect(result.y).toBe(4);
  });

  test('mul scales by a number', () => {
    const c = new Coord(2, 3);
    const result = c.mul(3);
    expect(result.x).toBe(6);
    expect(result.y).toBe(9);
  });

  test('length calculates correct distance', () => {
    const c = new Coord(3, 4);
    expect(c.length()).toBe(5);
  });

  test('distance calculates distance between coords', () => {
    const c1 = new Coord(0, 0);
    const c2 = new Coord(3, 4);
    expect(c1.distance(c2)).toBe(5);
  });

  test('normal returns unit vector', () => {
    const c = new Coord(3, 4);
    const n = c.normal();
    expect(n.x).toBe(0.6);
    expect(n.y).toBe(0.8);
  });

  test('normal handles zero vector', () => {
    const c = new Coord(0, 0);
    const n = c.normal();
    expect(n.x).toBe(0);
    expect(n.y).toBe(0);
  });

  test('dot calculates dot product', () => {
    const c1 = new Coord(2, 3);
    const c2 = new Coord(4, 5);
    expect(c1.dot(c2)).toBe(23);
  });

  test('toArray returns [x, y]', () => {
    const c = new Coord(1, 2);
    expect(c.toArray()).toEqual([1, 2]);
  });

  test('toString returns formatted string', () => {
    const c = new Coord(1, 2);
    expect(c.toString()).toBe('( 1, 2 )');
  });

  test('negate returns negated coord', () => {
    const c = new Coord(3, -4);
    const n = c.negate();
    expect(n.x).toBe(-3);
    expect(n.y).toBe(4);
  });
});

describe('Vector', () => {
  test('constructor sets x, y, z', () => {
    const v = new Vector(1, 2, 3);
    expect(v.x).toBe(1);
    expect(v.y).toBe(2);
    expect(v.z).toBe(3);
  });

  test('add returns new Vector with summed values', () => {
    const v1 = new Vector(1, 2, 3);
    const v2 = new Vector(4, 5, 6);
    const result = v1.add(v2);
    expect(result.x).toBe(5);
    expect(result.y).toBe(7);
    expect(result.z).toBe(9);
  });

  test('sub returns new Vector with subtracted values', () => {
    const v1 = new Vector(5, 7, 9);
    const v2 = new Vector(1, 2, 3);
    const result = v1.sub(v2);
    expect(result.x).toBe(4);
    expect(result.y).toBe(5);
    expect(result.z).toBe(6);
  });

  test('mul scales by a number', () => {
    const v = new Vector(1, 2, 3);
    const result = v.mul(2);
    expect(result.x).toBe(2);
    expect(result.y).toBe(4);
    expect(result.z).toBe(6);
  });

  test('mul3 multiplies component-wise', () => {
    const v1 = new Vector(2, 3, 4);
    const v2 = new Vector(3, 4, 5);
    const result = v1.mul3(v2);
    expect(result.x).toBe(6);
    expect(result.y).toBe(12);
    expect(result.z).toBe(20);
  });

  test('cross calculates cross product', () => {
    const v1 = new Vector(1, 0, 0);
    const v2 = new Vector(0, 1, 0);
    const result = v1.cross(v2);
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
    expect(result.z).toBe(1);
  });

  test('length calculates correct magnitude', () => {
    const v = new Vector(1, 2, 2);
    expect(v.length()).toBe(3);
  });

  test('distance calculates distance between vectors', () => {
    const v1 = new Vector(0, 0, 0);
    const v2 = new Vector(1, 2, 2);
    expect(v1.distance(v2)).toBe(3);
  });

  test('normal returns unit vector', () => {
    const v = new Vector(0, 0, 5);
    const n = v.normal();
    expect(n.x).toBe(0);
    expect(n.y).toBe(0);
    expect(n.z).toBe(1);
  });

  test('normal handles zero vector', () => {
    const v = new Vector(0, 0, 0);
    const n = v.normal();
    expect(n.x).toBe(0);
    expect(n.y).toBe(0);
    expect(n.z).toBe(0);
  });

  test('dot calculates dot product', () => {
    const v1 = new Vector(1, 2, 3);
    const v2 = new Vector(4, 5, 6);
    expect(v1.dot(v2)).toBe(32);
  });

  test('toArray returns [x, y, z]', () => {
    const v = new Vector(1, 2, 3);
    expect(v.toArray()).toEqual([1, 2, 3]);
  });

  test('negate returns negated vector', () => {
    const v = new Vector(1, -2, 3);
    const n = v.negate();
    expect(n.x).toBe(-1);
    expect(n.y).toBe(2);
    expect(n.z).toBe(-3);
  });
});

describe('Vector4', () => {
  test('constructor sets x, y, z, w', () => {
    const v = new Vector4(1, 2, 3, 4);
    expect(v.x).toBe(1);
    expect(v.y).toBe(2);
    expect(v.z).toBe(3);
    expect(v.w).toBe(4);
  });

  test('add returns new Vector4 with summed values', () => {
    const v1 = new Vector4(1, 2, 3, 4);
    const v2 = new Vector4(5, 6, 7, 8);
    const result = v1.add(v2);
    expect(result.x).toBe(6);
    expect(result.y).toBe(8);
    expect(result.z).toBe(10);
    expect(result.w).toBe(12);
  });

  test('length calculates correct magnitude', () => {
    const v = new Vector4(2, 0, 0, 0);
    expect(v.length()).toBe(2);
  });

  test('dot calculates dot product', () => {
    const v1 = new Vector4(1, 2, 3, 4);
    const v2 = new Vector4(2, 3, 4, 5);
    expect(v1.dot(v2)).toBe(40); // 2+6+12+20
  });
});

describe('V3 utility object', () => {
  test('add adds two arrays', () => {
    const result = V3.add([1, 2, 3], [4, 5, 6]);
    expect(result).toEqual([5, 7, 9]);
  });

  test('sub subtracts two arrays', () => {
    const result = V3.sub([5, 7, 9], [1, 2, 3]);
    expect(result).toEqual([4, 5, 6]);
  });

  test('mul scales array', () => {
    const result = V3.mul([1, 2, 3], 2);
    expect(result).toEqual([2, 4, 6]);
  });

  test('dot calculates dot product', () => {
    const result = V3.dot([1, 2, 3], [4, 5, 6]);
    expect(result).toBe(32);
  });

  test('cross calculates cross product', () => {
    const result = V3.cross([1, 0, 0], [0, 1, 0]);
    expect(result).toEqual([0, 0, 1]);
  });

  test('len calculates length', () => {
    expect(V3.len([3, 4, 0])).toBe(5);
  });

  test('norm normalizes vector', () => {
    const result = V3.norm([0, 0, 5]);
    expect(result).toEqual([0, 0, 1]);
  });
});

describe('vec3 utility object', () => {
  test('sub with output array', () => {
    const out = [0, 0, 0];
    vec3.sub([5, 7, 9], [1, 2, 3], out);
    expect(out).toEqual([4, 5, 6]);
  });

  test('add with output array', () => {
    const out = [0, 0, 0];
    vec3.add([1, 2, 3], [4, 5, 6], out);
    expect(out).toEqual([5, 7, 9]);
  });

  test('cross with output array', () => {
    const out = [0, 0, 0];
    vec3.cross([1, 0, 0], [0, 1, 0], out);
    expect(out).toEqual([0, 0, 1]);
  });

  test('scale scales vector', () => {
    const out = [0, 0, 0];
    vec3.scale([1, 2, 3], 3, out);
    expect(out).toEqual([3, 6, 9]);
  });

  test('copy copies vector', () => {
    const out = [0, 0, 0];
    vec3.copy([1, 2, 3], out);
    expect(out).toEqual([1, 2, 3]);
  });

  test('normalize normalizes vector', () => {
    const out = [0, 0, 0];
    vec3.normalize([0, 0, 5], out);
    expect(out).toEqual([0, 0, 1]);
  });

  test('normalize handles zero vector', () => {
    const out = [0, 0, 0];
    vec3.normalize([0, 0, 0], out);
    expect(out).toEqual([0, 0, 0]);
  });
});

describe('Utility functions', () => {
  test('degToRad converts degrees to radians', () => {
    expect(degToRad(180)).toBe(Math.PI);
    expect(degToRad(90)).toBe(Math.PI / 2);
    expect(degToRad(0)).toBe(0);
    expect(degToRad(360)).toBe(2 * Math.PI);
  });

  test('radToDeg converts radians to degrees', () => {
    expect(radToDeg(Math.PI)).toBe(180);
    expect(radToDeg(Math.PI / 2)).toBe(90);
    expect(radToDeg(0)).toBe(0);
  });

  test('negate negates a vector', () => {
    const v = new Vector(1, -2, 3);
    const result = negate(v);
    expect(result.x).toBe(-1);
    expect(result.y).toBe(2);
    expect(result.z).toBe(-3);
  });

  test('lerp interpolates between vectors', () => {
    const v1 = new Vector(0, 0, 0);
    const v2 = new Vector(10, 20, 30);
    const result = lerp(v1, v2, 0.5);
    expect(result.x).toBe(5);
    expect(result.y).toBe(10);
    expect(result.z).toBe(15);
  });

  test('lerp at t=0 returns first vector', () => {
    const v1 = new Vector(1, 2, 3);
    const v2 = new Vector(10, 20, 30);
    const result = lerp(v1, v2, 0);
    expect(result.x).toBe(1);
    expect(result.y).toBe(2);
    expect(result.z).toBe(3);
  });

  test('lerp at t=1 returns second vector', () => {
    const v1 = new Vector(0, 0, 0);
    const v2 = new Vector(10, 20, 30);
    const result = lerp(v1, v2, 1);
    expect(result.x).toBe(10);
    expect(result.y).toBe(20);
    expect(result.z).toBe(30);
  });
});

describe('Collision utilities', () => {
  test('lineRectCollide detects collision', () => {
    const line = { x1: 0, x2: 10, y: 5 };
    const rect = { x: 5, y: 5, size: 2 };
    expect(lineRectCollide(line, rect)).toBe(true);
  });

  test('lineRectCollide detects no collision outside y', () => {
    const line = { x1: 0, x2: 10, y: 5 };
    const rect = { x: 5, y: 20, size: 2 };
    expect(lineRectCollide(line, rect)).toBe(false);
  });

  test('rectRectCollide detects overlap', () => {
    const r1 = { x1: 0, x2: 10, y1: 0, y2: 10 };
    const r2 = { x1: 5, x2: 15, y1: 5, y2: 15 };
    expect(rectRectCollide(r1, r2)).toBe(true);
  });

  test('rectRectCollide detects no overlap', () => {
    const r1 = { x1: 0, x2: 5, y1: 0, y2: 5 };
    const r2 = { x1: 10, x2: 15, y1: 10, y2: 15 };
    expect(rectRectCollide(r1, r2)).toBe(false);
  });
});
