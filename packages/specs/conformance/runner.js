/**
 * Cross-runtime conformance runner — P4-10.
 *
 * Executes the conformance corpus in `packages/specs/conformance/*.json`
 * against the JavaScript implementations. JS is authoritative; the native
 * (C) runner consumes the same fixture files later.
 *
 * Usage: node conformance/runner.js [--dir <conformance-dir>]
 * Exit 0 when every case matches its golden expectation, 1 otherwise.
 * No console noise on success beyond the summary line.
 */

import { readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

const { validateManifest, validateSave } = await import('../src/validator.js');
const { migrateManifest } = await import('../src/migrations/index.js');
const { scanScriptForForbidden, SCRIPT_API_VERSION } = await import(
  '../../core-js/src/engine/scripting/script-api.js'
);
const FixedStep = await import('../../core-js/src/engine/core/physics/FixedStep.js');
const { default: PhysicsManager } = await import(
  '../../core-js/src/engine/core/physics/PhysicsManager.js'
);
const { Vector } = await import('../../core-js/src/engine/utils/math/vector.js');
const { AABB } = await import('../../core-js/src/engine/utils/math/collision.js');

function loadJson(p) {
  return JSON.parse(readFileSync(p, 'utf8'));
}

function codesOf(result) {
  return [...new Set(result.issues.map(i => i.code))].sort();
}

let pass = 0;
let fail = 0;
const failures = [];

function check(id, cond, detail = '') {
  if (cond) {
    pass++;
  } else {
    fail++;
    failures.push(`${id}: ${detail}`);
  }
}

async function runLoad(dir) {
  const corpus = loadJson(join(dir, 'load.json'));
  for (const c of corpus.cases) {
    const doc = loadJson(resolve(dir, c.manifest));
    const prepared = c.migrate ? migrateManifest(doc).manifest : doc;
    const r = validateManifest(prepared);
    check(`${c.id}:valid`, r.valid === c.expect.valid, `expected valid=${c.expect.valid}`);
    if (c.expect.codes) {
      const codes = codesOf(r);
      for (const code of c.expect.codes) {
        check(`${c.id}:code:${code}`, codes.includes(code), `missing issue code (got ${codes})`);
      }
    }
    if (c.expect.formatVersion) {
      check(
        `${c.id}:formatVersion`,
        prepared.formatVersion === c.expect.formatVersion,
        `got ${prepared.formatVersion}`
      );
    }
  }
}

async function runScript(dir) {
  const corpus = loadJson(join(dir, 'script.json'));
  check('script:apiVersion', corpus.apiVersion === SCRIPT_API_VERSION, `fixture declares ${corpus.apiVersion}`);
  for (const c of corpus.cases) {
    const scan = scanScriptForForbidden(c.source);
    check(
      `${c.id}:forbidden`,
      scan.ok !== c.expect.forbidden,
      `expected forbidden=${c.expect.forbidden}`
    );
  }
}

async function runSave(dir) {
  const corpus = loadJson(join(dir, 'save.json'));
  for (const c of corpus.cases) {
    const doc = c.document ? loadJson(resolve(dir, c.document)) : c.inline;
    const r = validateSave(doc);
    check(`${c.id}:valid`, r.valid === c.expect.valid, `expected valid=${c.expect.valid}`);
    if (c.expect.codes) {
      const codes = codesOf(r);
      for (const code of c.expect.codes) {
        check(`${c.id}:code:${code}`, codes.includes(code), `missing issue code (got ${codes})`);
      }
    }
  }
}

async function runCutscene(dir) {
  const corpus = loadJson(join(dir, 'cutscene.json'));
  for (const c of corpus.cases) {
    const doc = c.inline;
    check(
      `${c.id}:hasSteps`,
      Array.isArray(doc.steps) && doc.steps.length > 0 === c.expect.hasSteps,
      'cutscene must carry a non-empty steps array'
    );
  }
}

async function runPhysics(dir) {
  const corpus = loadJson(join(dir, 'physics.json'));
  const { default: FixedStepper, hashState, mulberry32 } = FixedStep;
  const rand = mulberry32(corpus.bodySeed);
  const bodies = Array.from({ length: corpus.bodyCount }, (_, i) => ({
    id: `body-${i}`,
    position: new Vector(rand() * 200, rand() * 200, 0),
    velocity: new Vector((rand() - 0.5) * 40, (rand() - 0.5) * 40, 0),
    useGravity: i % 2 === 0,
    getAABB() {
      const p = this.position;
      return new AABB(new Vector(p.x - 5, p.y - 5, 0), new Vector(p.x + 5, p.y + 5, 0));
    },
  }));
  const pm = new PhysicsManager(null);
  for (const b of bodies) pm.addBody(b, 10, 10);
  const stepper = new FixedStepper({ stepHz: corpus.stepHz });
  const jitter = mulberry32(corpus.frameJitterSeed);
  for (let f = 0; f < corpus.frames; f++) {
    stepper.update(0.016 + jitter() * 0.017, dt => pm.update(dt));
  }
  const hash = hashState(bodies);
  check('physics:hash', hash === corpus.expect.hash, `expected ${corpus.expect.hash}, got ${hash}`);
  check('physics:tick', stepper.tick === corpus.expect.tick, `expected ${corpus.expect.tick}, got ${stepper.tick}`);
}

const dir = process.argv.includes('--dir')
  ? resolve(process.argv[process.argv.indexOf('--dir') + 1])
  : here;

await runLoad(dir);
await runScript(dir);
await runSave(dir);
await runCutscene(dir);
await runPhysics(dir);

process.stdout.write(`conformance: ${pass} passed, ${fail} failed\n`);
if (failures.length > 0) {
  for (const f of failures) process.stdout.write(`  FAIL ${f}\n`);
  process.exit(1);
}
