#!/usr/bin/env node
/**
 * P0-02 — Ordered workspace build.
 *
 * Build dependency graph (fail fast, named steps):
 *   1. pixoscript        (tsc -> dist; core-js imports it)
 *   2. pixospritz-specs  (generate; C-header codegen for core-c)
 *   3. pixospritz-math   (no build script; --if-present skips)
 *   4. pixospritz-core   (vite build; needs script dist)
 *   5. pixospritz-editor (vite build; needs core)
 *   6. pixospritz-console(vite build; needs core)
 *   7. pixospritz-website(static; no-op build)
 *
 * Usage: node scripts/build.mjs [--only <pkg>] [--skip <pkg>]
 */
import { spawnSync } from 'node:child_process';

const STEPS = [
  { pkg: 'pixoscript', script: 'build', label: 'script language (tsc)' },
  { pkg: 'pixospritz-specs', script: 'generate', label: 'specs codegen' },
  { pkg: 'pixospritz-math', script: 'build', label: 'math (no-op if absent)' },
  { pkg: 'pixospritz-core', script: 'build', label: 'engine core (vite)' },
  { pkg: 'pixospritz-editor', script: 'build', label: 'editor (vite)' },
  { pkg: 'pixospritz-console', script: 'build', label: 'console player (vite)' },
  { pkg: 'pixospritz-website', script: 'build', label: 'website (static)' },
];

const args = process.argv.slice(2);
const onlyIdx = args.indexOf('--only');
const skipIdx = args.indexOf('--skip');
const only = onlyIdx >= 0 ? args[onlyIdx + 1] : null;
const skip = new Set(skipIdx >= 0 ? args.slice(skipIdx + 1) : []);

let failed = 0;
for (const step of STEPS) {
  if (only && step.pkg !== only) continue;
  if (skip.has(step.pkg)) {
    console.log(`[build] SKIP ${step.pkg} (${step.label})`);
    continue;
  }
  console.log(`[build] STEP ${step.pkg}: ${step.label}`);
  const r = spawnSync(
    'npm',
    ['run', step.script, '-w', step.pkg, '--if-present'],
    { stdio: 'inherit', shell: true }
  );
  if (r.status !== 0) {
    console.error(`[build] FAILED at step "${step.pkg}" (${step.label}) — aborting.`);
    process.exit(r.status ?? 1);
  }
  console.log(`[build] OK ${step.pkg}`);
}
if (failed === 0) console.log('[build] all steps succeeded');
