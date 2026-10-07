#!/usr/bin/env node
/**
 * pixozine CLI — P1-10.
 *
 * Commands:
 *   inspect <package.pxz>              Validate + migrate + list assets (never executes scripts)
 *   validate <manifest.json> [--semantic] [--archive <dir>]
 *   migrate <manifest.json> [--to <version>]
 *   pack <dir> -o <out.pxz>
 *   unpack <package.pxz> -d <dir>
 *   hash <package.pxz|dir>             Deterministic asset-graph fingerprint
 *
 * Exit codes: 0 ok, 1 validation/semantic failure, 2 usage error, 3 IO error.
 * Issues print as JSON to stdout; human summary goes to stderr.
 */

const fs = require('node:fs');
const path = require('node:path');

async function loadLibs() {
  const validator = await import('../src/validator.js');
  const migrations = await import('../src/migrations/index.js');
  const semantic = await import('../src/semantic.js');
  const graph = await import('../src/asset-graph.js');
  return { validator, migrations, semantic, graph };
}

function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    fail(3, `Cannot read JSON ${p}: ${e.message}`);
  }
}

function fail(code, message) {
  process.stderr.write(`pixozine: error: ${message}\n`);
  process.exit(code);
}

function emitIssues(result) {
  process.stdout.write(JSON.stringify({ valid: result.valid, issues: result.issues }, null, 2) + '\n');
  const errors = result.issues.filter(i => i.severity === 'error').length;
  const warnings = result.issues.filter(i => i.severity === 'warning').length;
  process.stderr.write(
    `pixozine: ${result.valid ? 'VALID' : 'INVALID'} — ${errors} error(s), ${warnings} warning(s)\n`
  );
  process.exit(result.valid ? 0 : 1);
}

async function lazyJszip() {
  try {
    return require('jszip');
  } catch {
    fail(3, 'jszip is required for pack/unpack. Run: yarn workspace pixospritz-specs add jszip');
  }
}

function listDirRecursive(dir, base = dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) listDirRecursive(full, base, out);
    else out.push(path.relative(base, full).split(path.sep).join('/'));
  }
  return out.sort();
}

async function cmdValidate(args, libs) {
  const file = args[0];
  if (!file) fail(2, 'validate <manifest.json> [--semantic] [--archive <dir>]');
  const manifest = readJson(file);
  const structural = libs.validator.validateManifest(manifest);
  if (!structural.valid) return emitIssues(structural);

  if (args.includes('--semantic')) {
    let archiveFiles = null;
    const ai = args.indexOf('--archive');
    if (ai !== -1 && args[ai + 1]) {
      archiveFiles = listDirRecursive(path.resolve(args[ai + 1]));
    }
    const sem = libs.semantic.validateSemantics(manifest, { archiveFiles });
    const combined = {
      valid: sem.valid,
      issues: [...structural.issues, ...sem.issues],
    };
    return emitIssues(combined);
  }
  return emitIssues(structural);
}

async function cmdMigrate(args, libs) {
  const file = args[0];
  if (!file) fail(2, 'migrate <manifest.json> [--to <version>]');
  const manifest = readJson(file);
  const ti = args.indexOf('--to');
  const targetVersion = ti !== -1 ? args[ti + 1] : undefined;
  let result;
  try {
    result = libs.migrations.migrateManifest(manifest, { targetVersion });
  } catch (e) {
    fail(1, e.message);
  }
  process.stderr.write(
    `pixozine: migrated ${result.from} -> ${result.to} (${result.applied.join(', ') || 'no-op'})\n`
  );
  process.stdout.write(JSON.stringify(result.manifest, null, 2) + '\n');
}

async function cmdPack(args) {
  const dir = args[0];
  const oi = args.indexOf('-o');
  const out = oi !== -1 ? args[oi + 1] : null;
  if (!dir || !out) fail(2, 'pack <dir> -o <out.pxz>');
  const JSZip = await lazyJszip();
  const zip = new JSZip();
  const root = path.resolve(dir);
  for (const rel of listDirRecursive(root)) {
    zip.file(rel, fs.readFileSync(path.join(root, rel)));
  }
  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(out, buf);
  process.stderr.write(`pixozine: packed ${root} -> ${out}\n`);
}

async function cmdUnpack(args) {
  const pxz = args[0];
  const di = args.indexOf('-d');
  const dest = di !== -1 ? args[di + 1] : null;
  if (!pxz || !dest) fail(2, 'unpack <package.pxz> -d <dir>');
  const JSZip = await lazyJszip();
  const zip = await JSZip.loadAsync(fs.readFileSync(pxz));
  const names = Object.keys(zip.files).sort();
  for (const name of names) {
    const entry = zip.files[name];
    const target = path.join(dest, name);
    // Path traversal guard — never write outside dest.
    if (path.relative(path.resolve(dest), path.resolve(target)).startsWith('..')) {
      fail(1, `unsafe entry in archive: ${name}`);
    }
    if (entry.dir) {
      fs.mkdirSync(target, { recursive: true });
    } else {
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, await entry.async('nodebuffer'));
    }
  }
  process.stderr.write(`pixozine: unpacked ${pxz} -> ${dest} (${names.length} entries)\n`);
}

async function cmdHash(args, libs) {
  const target = args[0];
  if (!target) fail(2, 'hash <package.pxz|dir>');
  let manifest;
  let files;
  if (fs.statSync(target).isDirectory()) {
    const mpath = path.join(target, 'manifest.json');
    if (!fs.existsSync(mpath)) fail(3, `no manifest.json in ${target}`);
    manifest = readJson(mpath);
    files = listDirRecursive(target).filter(f => f !== 'manifest.json');
  } else {
    const JSZip = await lazyJszip();
    const zip = await JSZip.loadAsync(fs.readFileSync(target));
    const entry = zip.file('manifest.json');
    if (!entry) fail(1, 'archive has no manifest.json');
    manifest = JSON.parse(await entry.async('string'));
    files = Object.keys(zip.files).filter(n => !zip.files[n].dir && n !== 'manifest.json').sort();
  }
  const g = libs.graph.buildAssetGraph(manifest, files);
  process.stdout.write(g.hash + '\n');
}

async function cmdInspect(args, libs) {
  // Inspect a .pxz without executing scripts: validate + migrate + asset list.
  const pxz = args[0];
  if (!pxz) fail(2, 'inspect <package.pxz>');
  const JSZip = await lazyJszip();
  const zip = await JSZip.loadAsync(fs.readFileSync(pxz));
  const manifestEntry = zip.file('manifest.json');
  if (!manifestEntry) fail(1, 'archive has no manifest.json');
  const manifest = JSON.parse(await manifestEntry.async('string'));

  const structural = libs.validator.validateManifest(manifest);
  let migrated = manifest;
  let migrationNote = 'no-op';
  try {
    const r = libs.migrations.migrateManifest(manifest);
    migrated = r.manifest;
    migrationNote = r.applied.join(', ') || 'no-op';
  } catch (e) {
    fail(1, `migration failed: ${e.message}`);
  }
  const files = Object.keys(zip.files).filter(n => !zip.files[n].dir).sort();
  const sem = libs.semantic.validateSemantics(migrated, { archiveFiles: files });
  const graph = libs.graph.buildAssetGraph(migrated, files);

  const report = {
    file: pxz,
    format: migrated.format,
    formatVersion: migrated.formatVersion,
    title: migrated.title,
    migration: migrationNote,
    graphHash: graph.hash,
    assetCount: graph.nodes.length,
    assets: graph.nodes.map(n => ({ id: n.id, kind: n.kind, hash: n.hash })),
    validation: {
      valid: structural.valid && sem.valid,
      issues: [...structural.issues, ...sem.issues],
    },
    scriptsNotExecuted: true,
  };
  process.stdout.write(JSON.stringify(report, null, 2) + '\n');
  process.exit(report.validation.valid ? 0 : 1);
}

async function main() {
  const [, , cmd, ...args] = process.argv;
  const libs = await loadLibs();
  switch (cmd) {
    case 'validate':
      return cmdValidate(args, libs);
    case 'migrate':
      return cmdMigrate(args, libs);
    case 'pack':
      return cmdPack(args);
    case 'unpack':
      return cmdUnpack(args);
    case 'hash':
      return cmdHash(args, libs);
    case 'inspect':
      return cmdInspect(args, libs);
    default:
      process.stderr.write(
        'Usage: pixozine <inspect|validate|migrate|pack|unpack|hash> [args]\n'
      );
      process.exit(cmd ? 2 : 2);
  }
}

main().catch(e => fail(3, e.message));
