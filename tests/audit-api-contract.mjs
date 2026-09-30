// Verifies every `window.EmonX.Y` / `EmonX.Y` call site resolves to a member
// that actually exists on the exported object. Catches phantom-API bugs like
// the `EmonTheme.toggleDarkMode` that ThemeManager never defined.
import { readFileSync, readdirSync } from 'node:fs';

const ROOT = process.env.EMON_ROOT || resolve(dirname(fileURLToPath(import.meta.url)), '..');
const JS_DIR = `${ROOT}/assets/js`;
const files = readdirSync(JS_DIR).filter(f => f.endsWith('.js'));
const read = p => readFileSync(p, 'utf8');

// Brace-matched body of `class Name {` or `const Name = {`, starting at `from`.
function bodyFrom(src, from) {
  const start = src.indexOf('{', from);
  if (start === -1) return '';
  let depth = 0;
  for (let i = start; i < src.length; i++) {
    const c = src[i];
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) return src.slice(start, i + 1); }
  }
  return '';
}

const members = new Map();   // ns -> Set(member)
const addMember = (ns, name) => {
  if (!members.has(ns)) members.set(ns, new Set());
  members.get(ns).add(name);
};

for (const f of files) {
  const src = read(`${JS_DIR}/${f}`);

  // (a) class-based namespaces:  window.EmonX = new ClassName(...)
  for (const m of src.matchAll(/window\.(Emon[A-Za-z]+)\s*=\s*new\s+([A-Za-z_$][\w$]*)/g)) {
    const [, ns, cls] = m;
    const ci = src.indexOf(`class ${cls}`);
    if (ci === -1) continue;
    const body = bodyFrom(src, ci);
    for (const mm of body.matchAll(/^\s+(?:async\s+|static\s+|get\s+|set\s+)?([A-Za-z_$][\w$]*)\s*\(/gm)) {
      if (!['if', 'for', 'while', 'switch', 'catch', 'return', 'function'].includes(mm[1])) addMember(ns, mm[1]);
    }
    // constructor-assigned public fields
    for (const mm of body.matchAll(/this\.([A-Za-z_$][\w$]*)\s*=/g)) addMember(ns, mm[1]);
  }

  // (b) object-literal namespaces:  const EmonX = { ... }   or  window.EmonX = { ... }
  for (const m of src.matchAll(/(?:const|window)\s*\.?\s*(Emon[A-Za-z]+)\s*=\s*\{/g)) {
    const ns = m[1];
    const body = bodyFrom(src, m.index + m[0].length - 1);
    for (const mm of body.matchAll(/^\s*(?:async\s+)?([A-Za-z_$][\w$]*)\s*[:(]/gm)) addMember(ns, mm[1]);
    for (const mm of body.matchAll(/^\s*(?:async\s+)?([A-Za-z_$][\w$]*)\s*\(/gm)) addMember(ns, mm[1]);
  }

  // (c) function-object namespaces:  window.EmonX = function (...) / class expression
  for (const m of src.matchAll(/window\.(Emon[A-Za-z]+)\s*=\s*function/g)) {
    const [, ns] = m;
    if (!members.has(ns)) members.set(ns, new Set());
  }
}

// Hand-rolled exports assigned outside a literal/class (e.g. EmonShareTheme).
for (const [ns, names] of Object.entries({
  EmonDataGrid: ['exportToCSV', 'exportToJSON'],
  EmonToast: ['success', 'info', 'error', 'warning'],
  EmonShell: ['NAV', 'QUICK_ACTIONS', 'activeKey', 'resetPaletteFilter', 'version'],
})) for (const n of names) addMember(ns, n);

const SOURCES = [
  ...files.map(f => ({ name: f, src: read(`${JS_DIR}/${f}`) })),
  ...readdirSync(ROOT).filter(f => f.endsWith('.html')).map(f => ({ name: f, src: read(`${ROOT}/${f}`) })),
];

const callRe = /(?:window\.)?(Emon[A-Za-z]+)\.([A-Za-z_$][\w$]*)/g;
const bad = [];
for (const { name, src } of SOURCES) {
  for (const m of src.matchAll(callRe)) {
    const [, ns, mem] = m;
    if (!members.has(ns)) continue;
    if (!members.get(ns).has(mem)) bad.push(`${name}: ${ns}.${mem}`);
  }
}

const uniq = [...new Set(bad)];
console.log(`namespaces: ${members.size}, members: ${[...members.values()].reduce((n, s) => n + s.size, 0)}`);
console.log(uniq.length ? `\nFAIL — ${uniq.length} unresolved:\n  ${uniq.join('\n  ')}` : '\nPASS — every Emon* member reference resolves.');
process.exit(uniq.length ? 1 : 0);
