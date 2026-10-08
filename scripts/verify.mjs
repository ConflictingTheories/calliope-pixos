#!/usr/bin/env node
/**
 * P0-10 — Release-readiness gate: the single local/CI command.
 *
 * Composes, in order (fail fast, named steps):
 *   1. format:check   (prettier)
 *   2. lint budget    (ratcheted warnings, zero errors)
 *   3. unit tests     (vitest)
 *   4. ordered build  (scripts/build.mjs)
 *   5. contracts      (package manifest checks)
 *   6. secret scan    (hardcoded-secret patterns in tracked source)
 *
 * Usage: node scripts/verify.mjs
 * (Also wired as `npm run verify`.)
 */
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function sh(label, cmd, args) {
  console.log(`[verify] STEP ${label}: ${cmd} ${args.join(' ')}`);
  const r = spawnSync(cmd, args, { cwd: root, stdio: 'inherit', shell: true });
  if (r.status !== 0) {
    console.error(`[verify] FAILED at step "${label}" — aborting.`);
    process.exit(r.status ?? 1);
  }
  console.log(`[verify] OK ${label}`);
}

// Static secret scan over tracked text files. pixopress/** is excluded:
// quarantined pending deletion (same exclusion as the lint baseline).
function secretScan() {
  console.log('[verify] STEP secret-scan');
  const patterns = [
    /SECRET_KEY\s*=\s*['"][^'"]+['"]/,
    /void_press_secret_key/,
    /-----BEGIN (RSA )?PRIVATE KEY-----/,
    /AKIA[0-9A-Z]{16}/,
    /sk_live_[0-9a-zA-Z]{16,}/,
    /ghp_[0-9a-zA-Z]{36}/,
    /xox[bap]-[0-9a-zA-Z-]+/,
  ];
  const files = execSync('git ls-files', { cwd: root, encoding: 'utf8' })
    .split('\n')
    .filter((f) => f && !f.startsWith('packages/server/src/pixopress/'))
    .filter((f) => !/node_modules|\/dist\/|\/build\/|\.min\.(js|css)|\.png$|\.jpg$|\.mp3$|\.zip$|\.gz$/.test(f));
  const hits = [];
  for (const f of files) {
    let text;
    try {
      text = readFileSync(join(root, f), 'utf8');
    } catch {
      continue; // binary/unreadable — skip
    }
    for (const re of patterns) {
      if (re.test(text)) hits.push(`${f}: ${re}`);
    }
  }
  if (hits.length) {
    console.error('[verify] FAILED secret-scan — possible hardcoded secrets:');
    for (const h of hits) console.error('  - ' + h);
    process.exit(1);
  }
  console.log(`[verify] OK secret-scan (${files.length} files)`);
}

sh('format', 'npm', ['run', 'format:check']);
sh('lint', 'npm', ['run', 'lint']);
sh('unit', 'npm', ['test']);
sh('build', 'npm', ['run', 'build']);
sh('contracts', 'npm', ['run', 'contracts']);
secretScan();
console.log('[verify] ALL GATES PASSED');
