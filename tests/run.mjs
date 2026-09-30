// Test runner. Resolves the project root relative to this file so the suite
// works from any checkout, then runs each audit in sequence.
//
// Zero dependencies: plain node, no framework. Run with `npm test`.
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');

// Each audit reads project files through this env var instead of a hardcoded
// absolute path, so nothing depends on where the repo lives.
const env = { ...process.env, EMON_ROOT: ROOT };

const all = readdirSync(HERE)
  .filter(f => /^audit-.*\.mjs$/.test(f))
  .sort();

// audit-pages.mjs is the per-page structural audit; it is part of the suite like
// the rest, so nothing is excluded here.
const only = process.argv[2];
const suites = only ? all.filter(s => s.includes(only)) : all;

let failed = 0;
const results = [];

for (const suite of suites) {
  const proc = spawnSync(process.execPath, [join(HERE, suite)], { env, encoding: 'utf8' });
  const out = (proc.stdout || '') + (proc.stderr || '');
  const pass = proc.status === 0;
  const fails = (out.match(/FAIL/g) || []).length;
  if (!pass) failed++;
  results.push({ suite, pass, fails, out });
}

const BOLD = '\x1b[1m', DIM = '\x1b[2m', RED = '\x1b[31m', GREEN = '\x1b[32m', RESET = '\x1b[0m';
for (const r of results) {
  const tag = r.pass ? `${GREEN}pass${RESET}` : `${RED}FAIL${RESET}`;
  const detail = r.pass ? '' : `  ${r.fails} failing assertion(s)`;
  console.log(`  ${tag}  ${r.suite}${detail}`);
  if (!r.pass) {
    for (const line of r.out.split('\n').filter(l => /FAIL|Error/.test(l))) {
      console.log(`        ${DIM}${line.trim().slice(0, 110)}${RESET}`);
    }
  }
}

console.log(`\n${BOLD}${results.length - failed}/${results.length} suites passed${RESET}`);
if (failed) {
  console.log(`${RED}${failed} suite(s) failing${RESET}`);
  process.exit(1);
}
