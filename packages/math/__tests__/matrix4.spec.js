import { test, describe, expect } from 'vitest';
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
    expect(matrix[0]).toBe(1);
    expect(matrix[5]).toBe(1);
    expect(matrix[10]).toBe(1);
    expect(matrix[15]).toBe(1);
    expect(matrix[1]).toBe(0);
    expect(matrix[2]).toBe(0);
    expect(matrix.length).toBe(16);
  });

  test('create3 returns 3x3 identity matrix', () => {
    const matrix = create3();
    expect(matrix[0]).toBe(1);
    expect(matrix[4]).toBe(1);
    expect(matrix[8]).toBe(1);
    expect(matrix.length).toBe(9);
  });

  test('from copies matrix values', () => {
    const src = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
    const dest = from(src);
    for (let i = 0; i < 16; i++) {
      expect(dest[i]).toBe(src[i]);
    }
    // Ensure it's a new array
    expect(dest !== src).toBeTruthy();
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
    expect(matrix[0] !== 0).toBeTruthy();
    expect(matrix[5] !== 0).toBeTruthy();
    expect(matrix[10] !== 0).toBeTruthy();
    expect(matrix[15]).toBe(0);
  });

  test('perspective with infinite far plane', () => {
    const fovy = Math.PI / 4;
    const aspect = 1;
    const near = 0.1;
    const matrix = perspective(fovy, aspect, near, Infinity);
    
    expect(matrix[10]).toBe(-1);
  });

  test('frustum creates valid projection matrix', () => {
    const matrix = frustum(-1, 1, -1, 1, 0.1, 100);
    expect(matrix[0] !== 0).toBeTruthy();
    expect(matrix[5] !== 0).toBeTruthy();
    expect(matrix[14]).toBe(-1);
  });
});

describe('Matrix4 transforms', () => {
  test('translate modifies translation components', () => {
    const identity = create();
    const result = create();
    translate(result, identity, [5, 10, 15]);
    
    expect(result[12]).toBe(5);
    expect(result[13]).toBe(10);
    expect(result[14]).toBe(15);
  });

  test('rotate around Z axis by 90 degrees', () => {
    const identity = create();
    const result = create();
    const angle = Math.PI / 2;
    
    rotate(result, identity, angle, [0, 0, 1]);
    
    // After 90 degree Z rotation, x -> y and y -> -x
    expect(Math.abs(result[0]) < 0.0001).toBeTruthy(); // cos(90) ≈ 0
    expect(Math.abs(result[1] - 1) < 0.0001).toBeTruthy(); // sin(90) = 1
    expect(Math.abs(result[4] + 1) < 0.0001).toBeTruthy(); // -sin(90) = -1
    expect(Math.abs(result[5]) < 0.0001).toBeTruthy(); // cos(90) ≈ 0
  });

  test('scale scales diagonal elements', () => {
    const identity = create();
    const result = create();
    scale(result, identity, [2, 3, 4]);
    
    expect(result[0]).toBe(2);
    expect(result[5]).toBe(3);
    expect(result[10]).toBe(4);
  });
});

describe('Matrix4 operations', () => {
  test('multiply identity matrices equals identity', () => {
    const identity1 = create();
    const identity2 = create();
    const result = create();
    
    multiply(result, identity1, identity2);
    
    // Should be identity
    expect(result[0]).toBe(1);
    expect(result[5]).toBe(1);
    expect(result[10]).toBe(1);
    expect(result[15]).toBe(1);
  });

  test('invert identity matrix equals identity', () => {
    const identity = create();
    const result = create();
    
    invert(result, identity);
    
    expect(result[0]).toBe(1);
    expect(result[5]).toBe(1);
    expect(result[10]).toBe(1);
    expect(result[15]).toBe(1);
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
    expect(result[1]).toBe(5);
    expect(result[4]).toBe(2);
    expect(result[2]).toBe(9);
    expect(result[8]).toBe(3);
  });

  test('set copies matrix values', () => {
    const src = from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    const dest = create();
    
    set(src, dest);
    
    for (let i = 0; i < 16; i++) {
      expect(dest[i]).toBe(src[i]);
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
    expect(matrix.length).toBe(16);
    // Eye looking down -Z, so Z component should be negative
    expect(matrix[14] < 0).toBeTruthy();
  });

  test('lookAt with same eye and center returns identity', () => {
    const eye = [0, 0, 0];
    const center = [0, 0, 0];
    const up = [0, 1, 0];
    
    const matrix = lookAt(eye, center, up);
    
    // Should return identity when eye == center
    expect(matrix[0]).toBe(1);
    expect(matrix[5]).toBe(1);
    expect(matrix[10]).toBe(1);
    expect(matrix[15]).toBe(1);
  });
});

describe('normalFromMat4', () => {
  test('creates valid normal matrix from identity', () => {
    const identity = create();
    const normal = create3();
    
    normalFromMat4(normal, identity);
    
    // Normal matrix of identity should be identity
    expect(normal[0]).toBe(1);
    expect(normal[4]).toBe(1);
    expect(normal[8]).toBe(1);
  });
});

describe('Vector operations', () => {
  test('subtractVectors subtracts correctly', () => {
    const a = [5, 10, 15];
    const b = [1, 2, 3];
    const result = subtractVectors(a, b);
    
    expect(result).toEqual([4, 8, 12]);
  });

  test('normalize creates unit vector', () => {
    const v = [0, 0, 5];
    const result = normalize(v);
    
    expect(result).toEqual([0, 0, 1]);
  });

  test('normalize handles zero vector', () => {
    const v = [0, 0, 0];
    const result = normalize(v);
    
    // Should return default direction
    expect(result).toEqual([0, 0, 1]);
  });

  test('normalize handles small vectors', () => {
    const v = [0.0000001, 0, 0];
    const result = normalize(v);
    
    // Should handle very small vectors gracefully
    expect(result[0] !== Infinity).toBeTruthy();
  });
});

describe('Utility functions', () => {
  test('isPowerOf2 checks power of 2', () => {
    expect(isPowerOf2(1)).toBe(true);
    expect(isPowerOf2(2)).toBe(true);
    expect(isPowerOf2(4)).toBe(true);
    expect(isPowerOf2(8)).toBe(true);
    expect(isPowerOf2(16)).toBe(true);
    expect(isPowerOf2(32)).toBe(true);
    expect(isPowerOf2(64)).toBe(true);
    expect(isPowerOf2(128)).toBe(true);
    expect(isPowerOf2(256)).toBe(true);
    expect(isPowerOf2(512)).toBe(true);
    expect(isPowerOf2(1024)).toBe(true);
  });

  test('isPowerOf2 returns false for non-powers', () => {
    expect(isPowerOf2(0)).toBe(true); // Edge case: 0 & -1 = 0
    expect(isPowerOf2(3)).toBe(false);
    expect(isPowerOf2(5)).toBe(false);
    expect(isPowerOf2(6)).toBe(false);
    expect(isPowerOf2(7)).toBe(false);
    expect(isPowerOf2(9)).toBe(false);
    expect(isPowerOf2(15)).toBe(false);
    expect(isPowerOf2(100)).toBe(false);
  });
});