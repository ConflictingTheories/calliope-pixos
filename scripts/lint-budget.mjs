#!/usr/bin/env node
/**
 * P0-05 — Ratcheted lint baseline.
 *
 * Runs eslint with the JSON formatter, then enforces:
 *  - zero errors (including parse errors) — always fails the gate
 *  - warning counts per rule (and total) may only stay flat or decrease
 *    relative to scripts/lint-budget.json
 *
 * Usage:
 *   node scripts/lint-budget.mjs            # enforce against snapshot
 *   node scripts/lint-budget.mjs --snapshot # (re)capture the baseline; commit it
 *
 * Notes:
 *  - packages/server/src/pixopress/** is excluded from lint via eslint.config.js:
 *    the prototype has a known parse error and is quarantined pending deletion
 *    (calliope-pixos#14). It must not set the baseline.
 *  - First run on a new checkout with no snapshot captures the baseline and
 *    exits 0; CI always enforces.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SNAPSHOT = join(root, 'scripts', 'lint-budget.json');
const wantSnapshot = process.argv.includes('--snapshot');

function runEslint() {
  const r = spawnSync('npx', ['eslint', '.', '--format', 'json'], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    shell: true,
  });
  if (!r.stdout) {
    console.error('[lint-budget] eslint produced no output.');
    if (r.stderr) console.error(r.stderr);
    process.exit(2);
  }
  return JSON.parse(r.stdout);
}

function summarize(results) {
  const byRule = {};
  let warnings = 0, errors = 0;
  for (const file of results) {
    for (const msg of file.messages || []) {
      if (msg.severity === 2) {
        errors++;
      } else if (msg.severity === 1) {
        warnings++;
        const rule = msg.ruleId || 'unknown';
        byRule[rule] = (byRule[rule] || 0) + 1;
      } else if (msg.fatal) {
        errors++; // parse errors
      }
    }
  }
  return { warnings, errors, byRule };
}

const summary = summarize(runEslint());

if (summary.errors > 0) {
  console.error(`[lint-budget] FAILED: ${summary.errors} eslint error(s) — fix them, do not budget them.`);
  process.exit(1);
}

if (wantSnapshot || !existsSync(SNAPSHOT)) {
  writeFileSync(SNAPSHOT, JSON.stringify(summary, null, 2) + '\n');
  console.log(`[lint-budget] baseline captured: ${summary.warnings} warnings, 0 errors -> ${SNAPSHOT}`);
  console.log('[lint-budget] commit the snapshot; future runs enforce it.');
  process.exit(0);
}

const base = JSON.parse(readFileSync(SNAPSHOT, 'utf8'));
const problems = [];
if (summary.warnings > base.warnings) {
  problems.push(`total warnings rose ${base.warnings} -> ${summary.warnings}`);
}
const rules = new Set([...Object.keys(base.byRule || {}), ...Object.keys(summary.byRule)]);
for (const rule of [...rules].sort()) {
  const before = (base.byRule || {})[rule] || 0;
  const after = summary.byRule[rule] || 0;
  if (after > before) problems.push(`rule "${rule}" rose ${before} -> ${after}`);
}

if (problems.length) {
  console.error('[lint-budget] FAILED — warning budget increased:');
  for (const p of problems) console.error('  - ' + p);
  console.error(`Run with --snapshot only after deliberately fixing or accepting the change.`);
  process.exit(1);
}
console.log(`[lint-budget] OK — ${summary.warnings} warnings (baseline ${base.warnings}), 0 errors; budget did not increase.`);
