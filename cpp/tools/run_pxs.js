#!/usr/bin/env node
// Small runner that loads the pixoscript dist bundle and executes a .pxs file
// Usage: node run_pxs.js <gamePath> <pxsRelativePath>
const path = require('path');
const fs = require('fs');

if (process.argv.length < 4) {
  console.error('Usage: run_pxs.js <gamePath> <pxsPath>');
  process.exit(2);
}
const gamePath = process.argv[2];
const pxsPath = process.argv[3];

// Load pixoscript runtime
const pix = require(path.resolve(__dirname, '../../pixoscript/dist/index.js'));

// Create env with file access hooked into gamePath
const env = pix.createEnv({
  fileExists: (f) => {
    const full = path.resolve(gamePath, f);
    return fs.existsSync(full);
  },
  loadFile: (f) => {
    const full = path.resolve(gamePath, f);
    return fs.readFileSync(full, 'utf8');
  }
});

// Load script content
const scriptRel = pxsPath;
let scriptContent = null;
try {
  scriptContent = env.parseFile(scriptRel);
} catch (e) {
  console.error('Error parsing script:', e && e.message ? e.message : e);
  process.exit(3);
}

// Prepare a collector for engine API calls
const calls = [];

// Provide engine API via loadLib so scripts can call set_flag/move_sprite/etc.
const api = {
  get_caller: () => 'avatar',
  set_flag: (k,v) => calls.push({cmd:'set_flag', key:k, value:v}),
  move_sprite: (id,x,y,z,duration) => calls.push({cmd:'move_sprite', id:id, x:x, y:y, z:z, duration:duration}),
  // stub others as no-ops
  log: (...args) => calls.push({cmd:'log', args: args})
};

// Inject api into global env
env.loadLib('engine', api);

// Execute
try {
  const r = scriptContent.exec();
  // After execution, print JSON of calls
  console.log(JSON.stringify(calls));
} catch (e) {
  console.error('Error executing script:', e && e.message ? e.message : e);
  process.exit(4);
}
