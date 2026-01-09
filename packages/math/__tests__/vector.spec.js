import { test, describe } from 'node:test';
import assert from 'node:assert';
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
  rectRectCollide
} from '../src/vector.js';

describe('Coord', () => {
  test('constructor sets x, y, z, w', () => {
    const coord = new Coord(1, 2, 3, 4);
    assert.strictEqual(coord.x, 1);
    assert.strictEqual(coord.y, 2);
    assert.strictEqual(coord.z, 3);
    assert.strictEqual(coord.w, 4);
  });

  test('add returns new Coord with summed values', () => {
    const c1 = new Coord(1, 2);
    const c2 = new Coord(3, 4);
    const result = c1.add(c2);
    assert.strictEqual(result.x, 4);
    assert.strictEqual(result.y, 6);
    assert(result !== c1);
  });

  test('sub returns new Coord with subtracted values', () => {
    const c1 = new Coord(5, 7);
    const c2 = new Coord(2, 3);
    const result = c1.sub(c2);
    assert.strictEqual(result.x, 3);
    assert.strictEqual(result.y, 4);
  });

  test('mul scales by a number', () => {
    const c = new Coord(2, 3);
    const result = c.mul(3);
    assert.strictEqual(result.x, 6);
    assert.strictEqual(result.y, 9);
  });

  test('length calculates correct distance', () => {
    const c = new Coord(3, 4);
    assert.strictEqual(c.length(), 5);
  });

  test('distance calculates distance between coords', () => {
    const c1 = new Coord(0, 0);
    const c2 = new Coord(3, 4);
    assert.strictEqual(c1.distance(c2), 5);
  });

  test('normal returns unit vector', () => {
    const c = new Coord(3, 4);
    const n = c.normal();
    assert.strictEqual(n.x, 0.6);
    assert.strictEqual(n.y, 0.8);
  });

  test('normal handles zero vector', () => {
    const c = new Coord(0, 0);
    const n = c.normal();
    assert.strictEqual(n.x, 0);
    assert.strictEqual(n.y, 0);
  });

  test('dot calculates dot product', () => {
    const c1 = new Coord(2, 3);
    const c2 = new Coord(4, 5);
    assert.strictEqual(c1.dot(c2), 23);
  });

  test('toArray returns [x, y]', () => {
    const c = new Coord(1, 2);
    assert.deepStrictEqual(c.toArray(), [1, 2]);
  });

  test('toString returns formatted string', () => {
    const c = new Coord(1, 2);
    assert.strictEqual(c.toString(), '( 1, 2 )');
  });

  test('negate returns negated coord', () => {
    const c = new Coord(3, -4);
    const n = c.negate();
    assert.strictEqual(n.x, -3);
    assert.strictEqual(n.y, 4);
  });
});

describe('Vector', () => {
  test('constructor sets x, y, z', () => {
    const v = new Vector(1, 2, 3);
    assert.strictEqual(v.x, 1);
    assert.strictEqual(v.y, 2);
    assert.strictEqual(v.z, 3);
  });

  test('add returns new Vector with summed values', () => {
    const v1 = new Vector(1, 2, 3);
    const v2 = new Vector(4, 5, 6);
    const result = v1.add(v2);
    assert.strictEqual(result.x, 5);
    assert.strictEqual(result.y, 7);
    assert.strictEqual(result.z, 9);
  });

  test('sub returns new Vector with subtracted values', () => {
    const v1 = new Vector(5, 7, 9);
    const v2 = new Vector(1, 2, 3);
    const result = v1.sub(v2);
    assert.strictEqual(result.x, 4);
    assert.strictEqual(result.y, 5);
    assert.strictEqual(result.z, 6);
  });

  test('mul scales by a number', () => {
    const v = new Vector(1, 2, 3);
    const result = v.mul(2);
    assert.strictEqual(result.x, 2);
    assert.strictEqual(result.y, 4);
    assert.strictEqual(result.z, 6);
  });

  test('mul3 multiplies component-wise', () => {
    const v1 = new Vector(2, 3, 4);
    const v2 = new Vector(3, 4, 5);
    const result = v1.mul3(v2);
    assert.strictEqual(result.x, 6);
    assert.strictEqual(result.y, 12);
    assert.strictEqual(result.z, 20);
  });

  test('cross calculates cross product', () => {
    const v1 = new Vector(1, 0, 0);
    const v2 = new Vector(0, 1, 0);
    const result = v1.cross(v2);
    assert.strictEqual(result.x, 0);
    assert.strictEqual(result.y, 0);
    assert.strictEqual(result.z, 1);
  });

  test('length calculates correct magnitude', () => {
    const v = new Vector(1, 2, 2);
    assert.strictEqual(v.length(), 3);
  });

  test('distance calculates distance between vectors', () => {
    const v1 = new Vector(0, 0, 0);
    const v2 = new Vector(1, 2, 2);
    assert.strictEqual(v1.distance(v2), 3);
  });

  test('normal returns unit vector', () => {
    const v = new Vector(0, 0, 5);
    const n = v.normal();
    assert.strictEqual(n.x, 0);
    assert.strictEqual(n.y, 0);
    assert.strictEqual(n.z, 1);
  });

  test('normal handles zero vector', () => {
    const v = new Vector(0, 0, 0);
    const n = v.normal();
    assert.strictEqual(n.x, 0);
    assert.strictEqual(n.y, 0);
    assert.strictEqual(n.z, 0);
  });

  test('dot calculates dot product', () => {
    const v1 = new Vector(1, 2, 3);
    const v2 = new Vector(4, 5, 6);
    assert.strictEqual(v1.dot(v2), 32);
  });

  test('toArray returns [x, y, z]', () => {
    const v = new Vector(1, 2, 3);
    assert.deepStrictEqual(v.toArray(), [1, 2, 3]);
  });

  test('negate returns negated vector', () => {
    const v = new Vector(1, -2, 3);
    const n = v.negate();
    assert.strictEqual(n.x, -1);
    assert.strictEqual(n.y, 2);
    assert.strictEqual(n.z, -3);
  });
});

describe('Vector4', () => {
  test('constructor sets x, y, z, w', () => {
    const v = new Vector4(1, 2, 3, 4);
    assert.strictEqual(v.x, 1);
    assert.strictEqual(v.y, 2);
    assert.strictEqual(v.z, 3);
    assert.strictEqual(v.w, 4);
  });

  test('add returns new Vector4 with summed values', () => {
    const v1 = new Vector4(1, 2, 3, 4);
    const v2 = new Vector4(5, 6, 7, 8);
    const result = v1.add(v2);
    assert.strictEqual(result.x, 6);
    assert.strictEqual(result.y, 8);
    assert.strictEqual(result.z, 10);
    assert.strictEqual(result.w, 12);
  });

  test('length calculates correct magnitude', () => {
    const v = new Vector4(2, 0, 0, 0);
    assert.strictEqual(v.length(), 2);
  });

  test('dot calculates dot product', () => {
    const v1 = new Vector4(1, 2, 3, 4);
    const v2 = new Vector4(2, 3, 4, 5);
    assert.strictEqual(v1.dot(v2), 40); // 2+6+12+20
  });
});

describe('V3 utility object', () => {
  test('add adds two arrays', () => {
    const result = V3.add([1, 2, 3], [4, 5, 6]);
    assert.deepStrictEqual(result, [5, 7, 9]);
  });

  test('sub subtracts two arrays', () => {
    const result = V3.sub([5, 7, 9], [1, 2, 3]);
    assert.deepStrictEqual(result, [4, 5, 6]);
  });

  test('mul scales array', () => {
    const result = V3.mul([1, 2, 3], 2);
    assert.deepStrictEqual(result, [2, 4, 6]);
  });

  test('dot calculates dot product', () => {
    const result = V3.dot([1, 2, 3], [4, 5, 6]);
    assert.strictEqual(result, 32);
  });

  test('cross calculates cross product', () => {
    const result = V3.cross([1, 0, 0], [0, 1, 0]);
    assert.deepStrictEqual(result, [0, 0, 1]);
  });

  test('len calculates length', () => {
    assert.strictEqual(V3.len([3, 4, 0]), 5);
  });

  test('norm normalizes vector', () => {
    const result = V3.norm([0, 0, 5]);
    assert.deepStrictEqual(result, [0, 0, 1]);
  });
});

describe('vec3 utility object', () => {
  test('sub with output array', () => {
    const out = [0, 0, 0];
    vec3.sub([5, 7, 9], [1, 2, 3], out);
    assert.deepStrictEqual(out, [4, 5, 6]);
  });

  test('add with output array', () => {
    const out = [0, 0, 0];
    vec3.add([1, 2, 3], [4, 5, 6], out);
    assert.deepStrictEqual(out, [5, 7, 9]);
  });

  test('cross with output array', () => {
    const out = [0, 0, 0];
    vec3.cross([1, 0, 0], [0, 1, 0], out);
    assert.deepStrictEqual(out, [0, 0, 1]);
  });

  test('scale scales vector', () => {
    const out = [0, 0, 0];
    vec3.scale([1, 2, 3], 3, out);
    assert.deepStrictEqual(out, [3, 6, 9]);
  });

  test('copy copies vector', () => {
    const out = [0, 0, 0];
    vec3.copy([1, 2, 3], out);
    assert.deepStrictEqual(out, [1, 2, 3]);
  });

  test('normalize normalizes vector', () => {
    const out = [0, 0, 0];
    vec3.normalize([0, 0, 5], out);
    assert.deepStrictEqual(out, [0, 0, 1]);
  });

  test('normalize handles zero vector', () => {
    const out = [0, 0, 0];
    vec3.normalize([0, 0, 0], out);
    assert.deepStrictEqual(out, [0, 0, 0]);
  });
});

describe('Utility functions', () => {
  test('degToRad converts degrees to radians', () => {
    assert.strictEqual(degToRad(180), Math.PI);
    assert.strictEqual(degToRad(90), Math.PI / 2);
    assert.strictEqual(degToRad(0), 0);
    assert.strictEqual(degToRad(360), 2 * Math.PI);
  });

  test('radToDeg converts radians to degrees', () => {
    assert.strictEqual(radToDeg(Math.PI), 180);
    assert.strictEqual(radToDeg(Math.PI / 2), 90);
    assert.strictEqual(radToDeg(0), 0);
  });

  test('negate negates a vector', () => {
    const v = new Vector(1, -2, 3);
    const result = negate(v);
    assert.strictEqual(result.x, -1);
    assert.strictEqual(result.y, 2);
    assert.strictEqual(result.z, -3);
  });

  test('lerp interpolates between vectors', () => {
    const v1 = new Vector(0, 0, 0);
    const v2 = new Vector(10, 20, 30);
    const result = lerp(v1, v2, 0.5);
    assert.strictEqual(result.x, 5);
    assert.strictEqual(result.y, 10);
    assert.strictEqual(result.z, 15);
  });

  test('lerp at t=0 returns first vector', () => {
    const v1 = new Vector(1, 2, 3);
    const v2 = new Vector(10, 20, 30);
    const result = lerp(v1, v2, 0);
    assert.strictEqual(result.x, 1);
    assert.strictEqual(result.y, 2);
    assert.strictEqual(result.z, 3);
  });

  test('lerp at t=1 returns second vector', () => {
    const v1 = new Vector(0, 0, 0);
    const v2 = new Vector(10, 20, 30);
    const result = lerp(v1, v2, 1);
    assert.strictEqual(result.x, 10);
    assert.strictEqual(result.y, 20);
    assert.strictEqual(result.z, 30);
  });
});

describe('Collision utilities', () => {
  test('lineRectCollide detects collision', () => {
    const line = { x1: 0, x2: 10, y: 5 };
    const rect = { x: 5, y: 5, size: 2 };
    assert.strictEqual(lineRectCollide(line, rect), true);
  });

  test('lineRectCollide detects no collision outside y', () => {
    const line = { x1: 0, x2: 10, y: 5 };
    const rect = { x: 5, y: 20, size: 2 };
    assert.strictEqual(lineRectCollide(line, rect), false);
  });

  test('rectRectCollide detects overlap', () => {
    const r1 = { x1: 0, x2: 10, y1: 0, y2: 10 };
    const r2 = { x1: 5, x2: 15, y1: 5, y2: 15 };
    assert.strictEqual(rectRectCollide(r1, r2), true);
  });

  test('rectRectCollide detects no overlap', () => {
    const r1 = { x1: 0, x2: 5, y1: 0, y2: 5 };
    const r2 = { x1: 10, x2: 15, y1: 10, y2: 15 };
    assert.strictEqual(rectRectCollide(r1, r2), false);
  });
});