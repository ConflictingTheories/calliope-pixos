/**
 * Canonical vector contract — P4-01.
 *
 * PixoSpritz historically shipped two vector systems: class-based
 * (`Coord`/`Vector`/`Vector4` in `packages/core-js/src/engine/utils/math/`)
 * and the consolidated `packages/math` module (plain-array `V3`, out-param
 * `vec3`, plus the same classes). This file is the single contract both must
 * satisfy. It does NOT delete either implementation (that choice is Kyle's,
 * F.26) — it removes the ambiguity about what each API promises.
 *
 * ## Methods (all implementations)
 * - add, sub, mul(scalar), dot, cross, length, normalize/norm, distance, negate
 * - toArray() -> plain array; toString() for debugging
 * - lerp(a, b, t) functional helper; mul3 component-wise multiply (Vector only)
 *
 * ## Mutability
 * - Class methods (`Vector.add`, `Coord.mul`, …) are IMMUTABLE: they return
 *   new instances and never modify operands.
 * - `V3.*` functions are IMMUTABLE: they take and return plain arrays.
 * - `vec3.*` functions take an optional `out` parameter: when provided they
 *   write into `out` and return it (zero-allocation hot path); when omitted
 *   they allocate a fresh `[0,0,0]`.
 *
 * ## Units
 * - Positions/distances are in world units (pixels for 2D screen-space math).
 * - Angles are in radians (`degToRad`/`radToDeg` convert explicitly).
 * - No implicit unit conversion anywhere: callers convert at boundaries.
 *
 * ## Conversion (interchange format = plain arrays)
 * - Class -> array: `v.toArray()`
 * - Array -> class: `new Vector(a[0], a[1], a[2])` (etc.)
 * - `V3` and `vec3` operate directly on arrays — no conversion needed.
 *
 * ## Canonical guidance
 * - Per-frame hot-path code: `vec3` with explicit `out` (zero allocation).
 * - Gameplay / one-off code: `Vector` class (readable, immutable).
 * - `packages/math` is the canonical source; the `core-js/utils/math` copies
 *   are legacy duplicates kept for import stability until F.26 is decided.
 */

export const VECTOR_CONTRACT = {
  version: '1.0.0',
  methods: ['add', 'sub', 'mul', 'dot', 'cross', 'length', 'normalize', 'distance', 'negate', 'toArray', 'toString'],
  mutability: {
    classMethods: 'immutable — return new instances',
    V3: 'immutable — take and return plain arrays',
    vec3: 'out-param — writes into `out` when provided, allocates otherwise',
  },
  units: {
    distance: 'world units (pixels in 2D screen space)',
    angle: 'radians',
  },
  interchange: 'plain arrays via toArray()',
  canonicalSource: 'packages/math',
};

export default VECTOR_CONTRACT;
