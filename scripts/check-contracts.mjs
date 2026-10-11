#!/usr/bin/env node
/**
 * P0-03 — Package contract check (CI "package-contract" job).
 *
 * Verifies every workspace honours its declared package contract:
 *  - package.json has name + version
 *  - every `exports` target and `main`/`module` entry points at an existing file
 *    (or a build output with a corresponding build script)
 *  - every workspace: `*` dependency resolves to a workspace in packages/*
 *  - no dependency on packages removed by P6-01 (printj, babel-*, redis, …)
 *
 * Usage: node scripts/check-contracts.mjs
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const REMOVED = new Set([
  'printj', '@babel/cli', '@babel/core', '@babel/node', '@babel/register',
  '@babel/preset-env', '@babel/preset-react', 'babel-loader', 'babel-plugin-macros',
  'cross-env', 'redis', 'jest', 'ts-jest',
]);

const pkgDirs = readdirSync(join(root, 'packages'), { withFileTypes: true })
  .filter((e) => e.isDirectory() || e.isSymbolicLink())
  .map((e) => e.name)
  // arm-linux is a gitlink (submodule), not an npm workspace package
  .filter((n) => n !== 'arm-linux');

const errors = [];
const pkgNames = new Map();

for (const dir of pkgDirs) {
  const mf = join(root, 'packages', dir, 'package.json');
  if (!existsSync(mf)) {
    errors.push(`${dir}: missing package.json`);
    continue;
  }
  const m = JSON.parse(readFileSync(mf, 'utf8'));
  if (!m.name) errors.push(`${dir}: package.json has no "name"`);
  if (!m.version) errors.push(`${dir}: package.json has no "version"`);
  if (m.name) pkgNames.set(m.name, dir);

  const checkTarget = (target, kind) => {
    if (typeof target !== 'string' || !target.startsWith('./')) return;
    const abs = join(root, 'packages', dir, target);
    if (existsSync(abs)) return;
    // Allow build outputs when the package has a build script producing them.
    const isBuildOutput = /(^|\/)dist\//.test(target) || /(^|\/)build\//.test(target);
    if (isBuildOutput && m.scripts && m.scripts.build) return;
    errors.push(`${dir}: ${kind} target missing: ${target}`);
  };

  if (m.exports) {
    for (const [k, v] of Object.entries(m.exports)) {
      if (typeof v === 'string') checkTarget(v, `exports["${k}"]`);
      else if (v && typeof v === 'object') {
        for (const [kk, vv] of Object.entries(v)) checkTarget(vv, `exports["${k}"]["${kk}"]`);
      }
    }
  }
  for (const f of ['main', 'module']) if (m[f]) checkTarget(m[f], `"${f}"`);

  for (const section of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
    for (const dep of Object.keys(m[section] || {})) {
      if (REMOVED.has(dep)) errors.push(`${dir}: depends on removed package "${dep}" (${section})`);
    }
  }
}

// workspace:* links must resolve to a real workspace
for (const dir of pkgDirs) {
  const mf = join(root, 'packages', dir, 'package.json');
  if (!existsSync(mf)) continue;
  const m = JSON.parse(readFileSync(mf, 'utf8'));
  const all = { ...m.dependencies, ...m.devDependencies, ...m.peerDependencies };
  for (const [dep, ver] of Object.entries(all)) {
    if (ver === '*' && !pkgNames.has(dep)) {
      errors.push(`${dir}: workspace link "${dep}" matches no workspace package`);
    }
  }
}

if (errors.length) {
  console.error('[contracts] FAILED:');
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}
console.log(`[contracts] OK — ${pkgDirs.length} workspaces honour their contracts`);
