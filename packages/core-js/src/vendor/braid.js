/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine            **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis   **
**                                                 **
** PixoSpritz Dual License - see LICENSE.          **
** Free for education, non-commercial use, and     **
** individual non-profit artists (CC-BY-NC-SA-4.0) **
** Commercial use requires a purchased license.    **
** ----------------------------------------------- **
\*                                                 */

/**
 * ============================================================
 *  🧶 BRAID — vendored (MIT)
 * ============================================================
 *
 * Vendored from: https://github.com/ConflictingTheories/braid
 * Copyright (c) Kyle Derby MacInnis — MIT License.
 *
 * Converted from the TypeScript source (src/braid.ts) to plain
 * JavaScript; logic is identical, type annotations stripped.
 * Do not edit semantics here — upstream fixes belong in the
 * braid repo; re-vendor after pulling them.
 *
 * A Language-Agnostic Co-routine Framework for weaving
 * independent asynchronous "strands" into synchronized cords.
 *
 * Public surface: Fiber, Braid, Tension, Loom, and the
 * combinators (chain, merge, zip, partition) plus factories
 * (fromArray, counter, interval, just).
 */

// ─────────────────────────────────────────────────────────────
//  § 1  TENSION  (scheduling policy)
// ─────────────────────────────────────────────────────────────

export const Tension = Object.freeze({
  /**
   * TIGHT (default) — Atomic lock-step.
   * The Braid advances only when *all* strands have yielded a
   * new value in the current round.
   */
  Tight: "Tight",

  /**
   * LOOSE — Fluid / non-blocking.
   * Fast strands use the *last known* value of slow strands.
   * The Braid emits every time *any* strand produces a value.
   */
  Loose: "Loose",

  /**
   * FRAYED — Strict fault intolerance.
   * If *any* strand throws or exhausts before the others, the
   * entire Braid immediately throws (or stops, respectively).
   */
  Frayed: "Frayed",
});

// ─────────────────────────────────────────────────────────────
//  § 2  FIBER  (single strand wrapper)
// ─────────────────────────────────────────────────────────────

/**
 * A Fiber wraps any `AsyncGenerator` (or factory thereof)
 * and gives it an identity.  It is the atom of the Braid.
 */
export class Fiber {
  /**
   * @param {Function|AsyncGenerator} gen - generator factory (preferred,
   *   allows restart/replay) or a generator instance.
   * @param {{name?: string}} [options]
   */
  constructor(gen, options = {}) {
    this._factory =
      typeof gen === "function" ? gen : () => gen;
    this.name = options.name ?? `fiber-${Math.random().toString(36).slice(2, 7)}`;
  }

  /** Materialise a fresh generator instance. */
  spawn() {
    return this._factory();
  }

  /** Return a new Fiber whose values are transformed by `fn`. */
  map(fn) {
    const self = this;
    return new Fiber(
      async function* () {
        for await (const value of self.spawn()) {
          yield fn(value);
        }
      },
      { name: `${self.name}:map` }
    );
  }

  /** Return a new Fiber that only forwards values satisfying `pred`. */
  filter(pred) {
    const self = this;
    return new Fiber(
      async function* () {
        for await (const value of self.spawn()) {
          if (pred(value)) yield value;
        }
      },
      { name: `${self.name}:filter` }
    );
  }

  /** Return a new Fiber that stops after `n` values. */
  take(n) {
    const self = this;
    return new Fiber(
      async function* () {
        let count = 0;
        for await (const value of self.spawn()) {
          yield value;
          if (++count >= n) return;
        }
      },
      { name: `${self.name}:take(${n})` }
    );
  }

  /** Emit a seed value before the generator starts. */
  prepend(seed) {
    const self = this;
    return new Fiber(
      async function* () {
        yield seed;
        yield* self.spawn();
      },
      { name: `${self.name}:prepend` }
    );
  }
}

// ─────────────────────────────────────────────────────────────
//  § 3  BRAID  (woven collection of Fibers)
// ─────────────────────────────────────────────────────────────

export class Braid {
  /**
   * @param {Fiber[]} fibers
   * @param {{tension?: string, timeout?: number}} [options]
   */
  constructor(fibers, options = {}) {
    this._options = {
      tension: options.tension ?? Tension.Tight,
      timeout: options.timeout ?? 0,
    };
    this._running = false;
    this._states = [];
    for (const fiber of fibers) {
      this._states.push({
        fiber,
        gen: fiber.spawn(),
        lastValue: undefined,
        done: false,
        pending: null,
      });
    }
  }

  /**
   * Add a new Fiber to a *running* Braid.
   * In TIGHT tension, the next round will wait for this strand too.
   * In LOOSE tension, it participates immediately with `undefined`
   * until its first yield.
   */
  plait(fiber) {
    this._states.push({
      fiber,
      gen: fiber.spawn(),
      lastValue: undefined,
      done: false,
      pending: null,
    });
    return this;
  }

  /** Stop the Braid and return the last-known value of each strand. */
  fray() {
    this._running = false;
    return this._states.map((s) => s.lastValue);
  }

  /**
   * Pipe the synchronized tuple through a transformation function,
   * returning a *new* Fiber whose values are the transformed results.
   */
  bind(fn) {
    const self = this;
    return new Fiber(async function* () {
      for await (const tuple of self) {
        yield fn(tuple);
      }
    });
  }

  async *[Symbol.asyncIterator]() {
    this._running = true;
    switch (this._options.tension) {
      case Tension.Tight:
        yield* this._tightWeave();
        break;
      case Tension.Loose:
        yield* this._looseWeave();
        break;
      case Tension.Frayed:
        yield* this._frayedWeave();
        break;
      default:
        throw new BraidError(`Unknown tension: ${this._options.tension}`);
    }
    this._running = false;
  }

  /** TIGHT: emit only when all strands produced a new value this round. */
  async *_tightWeave() {
    while (this._running) {
      const results = await Promise.all(
        this._states.map((s) => (s.done ? Promise.resolve(null) : s.gen.next()))
      );
      let anyDone = false;
      for (let i = 0; i < this._states.length; i++) {
        const r = results[i];
        if (r === null) continue;
        if (r.done) {
          this._states[i].done = true;
          anyDone = true;
        } else {
          this._states[i].lastValue = r.value;
        }
      }
      if (anyDone) return;
      yield this._states.map((s) => s.lastValue);
    }
  }

  /** LOOSE: emit whenever *any* strand produces; others use last value. */
  async *_looseWeave() {
    const bootstraps = await Promise.all(
      this._states.map((s) => s.gen.next())
    );
    for (let i = 0; i < this._states.length; i++) {
      const r = bootstraps[i];
      if (!r.done) this._states[i].lastValue = r.value;
      else this._states[i].done = true;
    }
    if (this._states.every((s) => s.lastValue !== undefined || s.done)) {
      yield this._states.map((s) => s.lastValue);
    }
    const makeRace = (s, idx) =>
      s.gen.next().then((r) => ({ r, idx }));
    const pending = new Map();
    for (let i = 0; i < this._states.length; i++) {
      if (!this._states[i].done) {
        pending.set(i, makeRace(this._states[i], i));
      }
    }
    while (this._running && pending.size > 0) {
      const { r, idx } = await Promise.race(pending.values());
      pending.delete(idx);
      if (r.done) {
        this._states[idx].done = true;
      } else {
        this._states[idx].lastValue = r.value;
        pending.set(idx, makeRace(this._states[idx], idx));
        yield this._states.map((s) => s.lastValue);
      }
    }
  }

  /** FRAYED: like TIGHT, but any error/early completion stops everything. */
  async *_frayedWeave() {
    while (this._running) {
      const advancing = this._states.map((s, idx) => {
        const base = s.gen.next().then((r) => ({ r, idx }));
        if (this._options.timeout > 0) {
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(
              () => reject(new BraidTimeoutError(`Strand ${s.fiber.name} timed out`)),
              this._options.timeout
            )
          );
          return Promise.race([base, timeoutPromise]);
        }
        return base;
      });
      const results = await Promise.all(advancing);
      for (const { r, idx } of results) {
        if (r.done) return;
        this._states[idx].lastValue = r.value;
      }
      yield this._states.map((s) => s.lastValue);
    }
  }
}

// ─────────────────────────────────────────────────────────────
//  § 4  LOOM  (executor)
// ─────────────────────────────────────────────────────────────

export class Loom {
  /**
   * Run a Braid or any Fiber to completion.
   * @param {AsyncIterable} source
   * @param {(value: any, index: number) => void|Promise<void>} handler
   * @param {{limit?: number, onComplete?: Function, onError?: Function}} [options]
   */
  static async run(source, handler, options = {}) {
    const { limit = Infinity, onComplete, onError } = options;
    let index = 0;
    try {
      for await (const value of source) {
        await handler(value, index);
        if (++index >= limit) break;
      }
      onComplete?.();
    } catch (err) {
      if (onError) {
        onError(err);
      } else {
        throw err;
      }
    }
  }

  /** Collect all emitted values into an array (finite Braids / tests). */
  static async collect(source, options = {}) {
    const results = [];
    await Loom.run(source, (v) => { results.push(v); }, options);
    return results;
  }

  /** Run multiple Braids concurrently, each with its own handler. */
  static async runAll(pairs, options = {}) {
    await Promise.all(pairs.map(([source, handler]) => Loom.run(source, handler, options)));
  }
}

// ─────────────────────────────────────────────────────────────
//  § 5  COMBINATORS
// ─────────────────────────────────────────────────────────────

/** Interleave values from sources sequentially (drain A, then B). */
export async function* chain(...sources) {
  for (const src of sources) {
    yield* src;
  }
}

/** Merge N Fibers into one, emitting values as they arrive (fan-in). */
export function merge(...fibers) {
  return new Fiber(
    async function* () {
      const gens = fibers.map((f) => f.spawn());
      const advance = (gen, idx) =>
        gen.next().then((r) => ({ value: r.value, done: !!r.done, idx }));
      const pending = new Map(gens.map((g, i) => [i, advance(g, i)]));
      while (pending.size > 0) {
        const { value, done, idx } = await Promise.race(pending.values());
        pending.delete(idx);
        if (!done) {
          yield value;
          pending.set(idx, advance(gens[idx], idx));
        }
      }
    },
    { name: "merge" }
  );
}

/** Zip two Fibers into a Fiber of pairs. */
export function zip(a, b) {
  return new Braid([a, b]).bind((t) => t);
}

/**
 * Partition a Fiber into two Fibers using a predicate.
 * Both returned Fibers share the underlying generator; they must be
 * consumed concurrently (e.g., inside a Braid).
 */
export function partition(fiber, pred) {
  const trueQueue = [];
  const falseQueue = [];
  const resolvers = [];
  let sourceDone = false;

  async function pump() {
    for await (const v of fiber.spawn()) {
      if (pred(v)) trueQueue.push(v);
      else falseQueue.push(v);
      resolvers.forEach((r) => r());
      resolvers.length = 0;
    }
    sourceDone = true;
    resolvers.forEach((r) => r());
  }
  pump();

  const makeReader = (queue) =>
    new Fiber(async function* () {
      while (true) {
        if (queue.length > 0) {
          yield queue.shift();
        } else if (sourceDone) {
          return;
        } else {
          await new Promise((res) => resolvers.push(res));
        }
      }
    });

  return [makeReader(trueQueue), makeReader(falseQueue)];
}

// ─────────────────────────────────────────────────────────────
//  § 6  ERRORS
// ─────────────────────────────────────────────────────────────

export class BraidError extends Error {
  constructor(message) {
    super(message);
    this.name = "BraidError";
  }
}

export class BraidTimeoutError extends BraidError {
  constructor(message) {
    super(message);
    this.name = "BraidTimeoutError";
  }
}

// ─────────────────────────────────────────────────────────────
//  § 7  CONVENIENCE FACTORIES
// ─────────────────────────────────────────────────────────────

/** Create a Fiber from a static array (finite). */
export function fromArray(values, name) {
  return new Fiber(
    async function* () {
      for (const v of values) yield v;
    },
    { name: name ?? "fromArray" }
  );
}

/** Create an infinite counting Fiber with optional interval (ms). */
export function counter(start = 0, intervalMs = 0, name) {
  return new Fiber(
    async function* () {
      let n = start;
      while (true) {
        yield n++;
        if (intervalMs > 0)
          await new Promise((r) => setTimeout(r, intervalMs));
      }
    },
    { name: name ?? "counter" }
  );
}

/** Create a Fiber that emits a value every `intervalMs` ms. */
export function interval(value, intervalMs, name) {
  return new Fiber(
    async function* () {
      while (true) {
        await new Promise((r) => setTimeout(r, intervalMs));
        yield typeof value === "function" ? value() : value;
      }
    },
    { name: name ?? "interval" }
  );
}

/** Create a Fiber that emits a single value and completes. */
export function just(value, name) {
  return new Fiber(
    async function* () {
      yield value;
    },
    { name: name ?? "just" }
  );
}
