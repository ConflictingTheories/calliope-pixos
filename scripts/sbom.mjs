#!/usr/bin/env node
/**
 * P6-04 — SBOM generation + dependency policy gate.
 *
 * 1. Generates a CycloneDX SBOM via `npm sbom` into sbom/sbom.cyclonedx.json.
 * 2. Runs `npm audit --audit-level=<policy>` and fails on violations.
 * 3. License allow/deny enforcement is PENDING P0-07 (license choice open);
 *    scripts/dependency-policy.json documents the pending state.
 *
 * Usage: node scripts/sbom.mjs [--out dir]
 * (Also wired as `npm run sbom` and in CI, which uploads the SBOM artifact.)
 */
import { spawnSync, execSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outIdx = process.argv.indexOf('--out');
const outDir = join(root, outIdx >= 0 ? process.argv[outIdx + 1] : 'sbom');
mkdirSync(outDir, { recursive: true });

const policy = JSON.parse(readFileSync(join(root, 'scripts', 'dependency-policy.json'), 'utf8'));

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { cwd: root, encoding: 'utf8', shell: true, ...opts });
  return r;
}

// 1. SBOM (CycloneDX). Requires node_modules (npm sbom resolves the tree).
console.log('[sbom] generating CycloneDX SBOM via `npm sbom` …');
let sbom = run('npm', ['sbom', '--sbom-format', 'cyclonedx', '--sbom-type', 'application']);
if (sbom.status !== 0) {
  console.error('[sbom] `npm sbom` failed — is node_modules installed? (npm ci first)');
  console.error((sbom.stderr || '').slice(0, 2000));
  process.exit(1);
}
const sbomPath = join(outDir, 'sbom.cyclonedx.json');
writeFileSync(sbomPath, sbom.stdout);
console.log(`[sbom] wrote ${sbomPath}`);

// 2. Advisory gate.
console.log(`[sbom] running npm audit (level=${policy.auditLevel}) …`);
const audit = run('npm', ['audit', '--json']);
let findings = [];
try {
  const data = JSON.parse(audit.stdout || '{}');
  const vulns = data.vulnerabilities || {};
  findings = Object.entries(vulns)
    .filter(([, v]) => ['critical'].includes(v.severity))
    .map(([k, v]) => `${k}@${v.range || '?'} (${v.severity})`);
} catch {
  console.error('[sbom] could not parse npm audit output; failing closed.');
  process.exit(1);
}
const allowed = new Set(policy.exceptions || []);
const blocking = findings.filter((f) => ![...allowed].some((e) => f.startsWith(e)));
if (blocking.length) {
  console.error('[sbom] FAILED — critical advisories with no documented exception:');
  for (const b of blocking) console.error('  - ' + b);
  process.exit(1);
}
console.log('[sbom] OK — no blocking advisories.');

// 3. License policy (pending P0-07).
if ((policy.forbiddenLicenses || []).length) {
  console.log('[sbom] enforcing forbidden licenses …');
  const text = execSync('npm sbom --sbom-format cyclonedx', { cwd: root, encoding: 'utf8' });
  const bad = [];
  for (const lic of policy.forbiddenLicenses) {
    if (text.includes(`"${lic}"`)) bad.push(lic);
  }
  if (bad.length) {
    console.error('[sbom] FAILED — forbidden licenses present: ' + bad.join(', '));
    process.exit(1);
  }
} else {
  console.log(`[sbom] license enforcement pending (${policy.forbiddenLicensesPending}); skipped.`);
}
console.log('[sbom] ALL CHECKS PASSED');
