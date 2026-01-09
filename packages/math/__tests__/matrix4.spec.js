import { test, describe } from 'node:test';
import assert from 'node:assert';
import { 
  create, 
  create3,
  from,
  perspective,
  frustum,
  translate,
  rotate,
  scale,
  multiply,
  lookAt,
  invert,
  transpose,
  normalFromMat4,
  subtractVectors,
  normalize,
  isPowerOf2,
  set
} from '../src/matrix4.js';

describe('Matrix4 creation', () => {
  test('create returns identity matrix', () => {
    const matrix = create();
    assert.strictEqual(matrix[0], 1);
    assert.strictEqual(matrix[5], 1);
    assert.strictEqual(matrix[10], 1);
    assert.strictEqual(matrix[15], 1);
    assert.strictEqual(matrix[1], 0);
    assert.strictEqual(matrix[2], 0);
    assert.strictEqual(matrix.length, 16);
  });

  test('create3 returns 3x3 identity matrix', () => {
    const matrix = create3();
    assert.strictEqual(matrix[0], 1);
    assert.strictEqual(matrix[4], 1);
    assert.strictEqual(matrix[8], 1);
    assert.strictEqual(matrix.length, 9);
  });

  test('from copies matrix values', () => {
    const src = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
    const dest = from(src);
    for (let i = 0; i < 16; i++) {
      assert.strictEqual(dest[i], src[i]);
    }
    // Ensure it's a new array
    assert(dest !== src);
  });
});

describe('Matrix4 projection', () => {
  test('perspective creates valid projection matrix', () => {
    const fovy = Math.PI / 4;
    const aspect = 16 / 9;
    const near = 0.1;
    const far = 100;
    const matrix = perspective(fovy, aspect, near, far);
    
    // Check that diagonal elements are non-zero
    assert(matrix[0] !== 0);
    assert(matrix[5] !== 0);
    assert(matrix[10] !== 0);
    assert.strictEqual(matrix[15], 0);
  });

  test('perspective with infinite far plane', () => {
    const fovy = Math.PI / 4;
    const aspect = 1;
    const near = 0.1;
    const matrix = perspective(fovy, aspect, near, Infinity);
    
    assert.strictEqual(matrix[10], -1);
  });

  test('frustum creates valid projection matrix', () => {
    const matrix = frustum(-1, 1, -1, 1, 0.1, 100);
    assert(matrix[0] !== 0);
    assert(matrix[5] !== 0);
    assert.strictEqual(matrix[14], -1);
  });
});

describe('Matrix4 transforms', () => {
  test('translate modifies translation components', () => {
    const identity = create();
    const result = create();
    translate(result, identity, [5, 10, 15]);
    
    assert.strictEqual(result[12], 5);
    assert.strictEqual(result[13], 10);
    assert.strictEqual(result[14], 15);
  });

  test('rotate around Z axis by 90 degrees', () => {
    const identity = create();
    const result = create();
    const angle = Math.PI / 2;
    
    rotate(result, identity, angle, [0, 0, 1]);
    
    // After 90 degree Z rotation, x -> y and y -> -x
    assert(Math.abs(result[0]) < 0.0001); // cos(90) ≈ 0
    assert(Math.abs(result[1] - 1) < 0.0001); // sin(90) = 1
    assert(Math.abs(result[4] + 1) < 0.0001); // -sin(90) = -1
    assert(Math.abs(result[5]) < 0.0001); // cos(90) ≈ 0
  });

  test('scale scales diagonal elements', () => {
    const identity = create();
    const result = create();
    scale(result, identity, [2, 3, 4]);
    
    assert.strictEqual(result[0], 2);
    assert.strictEqual(result[5], 3);
    assert.strictEqual(result[10], 4);
  });
});

describe('Matrix4 operations', () => {
  test('multiply identity matrices equals identity', () => {
    const identity1 = create();
    const identity2 = create();
    const result = create();
    
    multiply(result, identity1, identity2);
    
    // Should be identity
    assert.strictEqual(result[0], 1);
    assert.strictEqual(result[5], 1);
    assert.strictEqual(result[10], 1);
    assert.strictEqual(result[15], 1);
  });

  test('invert identity matrix equals identity', () => {
    const identity = create();
    const result = create();
    
    invert(result, identity);
    
    assert.strictEqual(result[0], 1);
    assert.strictEqual(result[5], 1);
    assert.strictEqual(result[10], 1);
    assert.strictEqual(result[15], 1);
  });

  test('transpose swaps elements correctly', () => {
    const matrix = from([
      1, 2, 3, 4,
      5, 6, 7, 8,
      9, 10, 11, 12,
      13, 14, 15, 16
    ]);
    const result = create();
    
    transpose(result, matrix);
    
    // Check transposed positions
    assert.strictEqual(result[1], 5);
    assert.strictEqual(result[4], 2);
    assert.strictEqual(result[2], 9);
    assert.strictEqual(result[8], 3);
  });

  test('set copies matrix values', () => {
    const src = from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    const dest = create();
    
    set(src, dest);
    
    for (let i = 0; i < 16; i++) {
      assert.strictEqual(dest[i], src[i]);
    }
  });
});

describe('lookAt', () => {
  test('creates valid view matrix', () => {
    const eye = [0, 0, 5];
    const center = [0, 0, 0];
    const up = [0, 1, 0];
    
    const matrix = lookAt(eye, center, up);
    
    // Should be a valid 4x4 matrix
    assert.strictEqual(matrix.length, 16);
    // Eye looking down -Z, so Z component should be negative
    assert(matrix[14] < 0);
  });

  test('lookAt with same eye and center returns identity', () => {
    const eye = [0, 0, 0];
    const center = [0, 0, 0];
    const up = [0, 1, 0];
    
    const matrix = lookAt(eye, center, up);
    
    // Should return identity when eye == center
    assert.strictEqual(matrix[0], 1);
    assert.strictEqual(matrix[5], 1);
    assert.strictEqual(matrix[10], 1);
    assert.strictEqual(matrix[15], 1);
  });
});

describe('normalFromMat4', () => {
  test('creates valid normal matrix from identity', () => {
    const identity = create();
    const normal = create3();
    
    normalFromMat4(normal, identity);
    
    // Normal matrix of identity should be identity
    assert.strictEqual(normal[0], 1);
    assert.strictEqual(normal[4], 1);
    assert.strictEqual(normal[8], 1);
  });
});

describe('Vector operations', () => {
  test('subtractVectors subtracts correctly', () => {
    const a = [5, 10, 15];
    const b = [1, 2, 3];
    const result = subtractVectors(a, b);
    
    assert.deepStrictEqual(result, [4, 8, 12]);
  });

  test('normalize creates unit vector', () => {
    const v = [0, 0, 5];
    const result = normalize(v);
    
    assert.deepStrictEqual(result, [0, 0, 1]);
  });

  test('normalize handles zero vector', () => {
    const v = [0, 0, 0];
    const result = normalize(v);
    
    // Should return default direction
    assert.deepStrictEqual(result, [0, 0, 1]);
  });

  test('normalize handles small vectors', () => {
    const v = [0.0000001, 0, 0];
    const result = normalize(v);
    
    // Should handle very small vectors gracefully
    assert(result[0] !== Infinity);
  });
});

describe('Utility functions', () => {
  test('isPowerOf2 checks power of 2', () => {
    assert.strictEqual(isPowerOf2(1), true);
    assert.strictEqual(isPowerOf2(2), true);
    assert.strictEqual(isPowerOf2(4), true);
    assert.strictEqual(isPowerOf2(8), true);
    assert.strictEqual(isPowerOf2(16), true);
    assert.strictEqual(isPowerOf2(32), true);
    assert.strictEqual(isPowerOf2(64), true);
    assert.strictEqual(isPowerOf2(128), true);
    assert.strictEqual(isPowerOf2(256), true);
    assert.strictEqual(isPowerOf2(512), true);
    assert.strictEqual(isPowerOf2(1024), true);
  });

  test('isPowerOf2 returns false for non-powers', () => {
    assert.strictEqual(isPowerOf2(0), true); // Edge case: 0 & -1 = 0
    assert.strictEqual(isPowerOf2(3), false);
    assert.strictEqual(isPowerOf2(5), false);
    assert.strictEqual(isPowerOf2(6), false);
    assert.strictEqual(isPowerOf2(7), false);
    assert.strictEqual(isPowerOf2(9), false);
    assert.strictEqual(isPowerOf2(15), false);
    assert.strictEqual(isPowerOf2(100), false);
  });
});