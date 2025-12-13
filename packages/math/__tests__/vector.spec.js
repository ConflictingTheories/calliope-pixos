import { test, describe } from 'node:test';
import assert from 'node:assert';
import { Coord, Vector, degToRad, radToDeg } from '../src/vector.js';

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

  test('length calculates correct distance', () => {
    const c = new Coord(3, 4);
    assert.strictEqual(c.length(), 5);
  });
});

describe('Vector', () => {
  test('constructor sets x, y, z', () => {
    const v = new Vector(1, 2, 3);
    assert.strictEqual(v.x, 1);
    assert.strictEqual(v.y, 2);
    assert.strictEqual(v.z, 3);
  });

  test('length calculates correct magnitude', () => {
    const v = new Vector(1, 2, 2);
    assert.strictEqual(v.length(), 3);
  });
});

describe('Utility functions', () => {
  test('degToRad converts degrees to radians', () => {
    assert.strictEqual(degToRad(180), Math.PI);
    assert.strictEqual(degToRad(90), Math.PI / 2);
  });

  test('radToDeg converts radians to degrees', () => {
    assert.strictEqual(radToDeg(Math.PI), 180);
    assert.strictEqual(radToDeg(Math.PI / 2), 90);
  });
});