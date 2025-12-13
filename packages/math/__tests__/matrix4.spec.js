import { test, describe } from 'node:test';
import assert from 'node:assert';
import { create, isPowerOf2 } from '../src/matrix4.js';

describe('Matrix4', () => {
  test('create returns identity matrix', () => {
    const matrix = create();
    assert.strictEqual(matrix[0], 1);
    assert.strictEqual(matrix[5], 1);
    assert.strictEqual(matrix[10], 1);
    assert.strictEqual(matrix[15], 1);
    assert.strictEqual(matrix[1], 0);
    assert.strictEqual(matrix[2], 0);
  });
});

describe('Utility functions', () => {
  test('isPowerOf2 checks power of 2', () => {
    assert.strictEqual(isPowerOf2(1), true);
    assert.strictEqual(isPowerOf2(2), true);
    assert.strictEqual(isPowerOf2(4), true);
    assert.strictEqual(isPowerOf2(8), true);
    assert.strictEqual(isPowerOf2(3), false);
    assert.strictEqual(isPowerOf2(6), false);
  });
});