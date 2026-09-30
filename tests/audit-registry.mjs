// Guards the single delivery path.
//
// The theme previously shipped utilities two ways: 19 pages built them at
// runtime with tailwind.js and eleven drifting inline registries, while 8 pages
// used the compiled emon-material.min.css. That let eight pages reference
// utilities no registry declared, and let the registries drift apart.
//
// Now every page loads the compiled stylesheet. These checks fail if a page
// reintroduces a runtime build, or if the markup references a utility the
// compiled CSS does not contain — the failure mode of a static pipeline is a
// forgotten rebuild, so it has to be caught mechanically.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = process.env.EMON_ROOT || resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = f => readFileSync(`${ROOT}/${f}`, 'utf8');
const pages = readdirSync(ROOT).filter(f => f.endsWith('.html'));
const CSS_PATH = `${ROOT}/assets/css/emon-material.min.css`;
const css = readFileSync(CSS_PATH, 'utf8');

let failures = 0;
const ok = (c, l) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${l}`); if (!c) failures++; };

// Tailwind escapes special characters when writing selectors: `lg:pl-64`
// becomes `.lg\:pl-64` and `gap-1.5` becomes `.gap-1\.5`.
const esc = n => Array.from(String(n), c => (/[A-Za-z0-9_-]/.test(c) ? c : '\\' + c)).join('');
function has(cls) {
  const needle = '.' + esc(cls);
  // Scan every occurrence: the first `.border` in the file is likely
  // `.border-collapse`, which is not the class we are asking about.
  let i = css.indexOf(needle);
  while (i !== -1) {
    const next = css[i + needle.length];
    if (next === undefined || ',{ :[>+~'.includes(next)) return true;
    i = css.indexOf(needle, i + 1);
  }
  return false;
}

// 1. One path: nothing loads the runtime JIT any more.
const runtime = pages.filter(f => /tailwind\.js|emon-tailwind-config/.test(read(f)));
ok(runtime.length === 0,
   'no page loads the runtime Tailwind bundle' + (runtime.length ? ` (${runtime.join(', ')})` : ''));
ok(!existsSync(`${ROOT}/assets/js/tailwind.js`), 'runtime bundle removed from the tree');
ok(!existsSync(`${ROOT}/assets/js/emon-tailwind-config.js`), 'inline registry file removed from the tree');

// 2. Every page loads the compiled stylesheet.
const noCss = pages.filter(f => !read(f).includes('emon-material.min.css'));
ok(noCss.length === 0,
   `all ${pages.length} pages load the compiled stylesheet` + (noCss.length ? ` (${noCss.join(', ')})` : ''));

// 3. The compiled stylesheet is precached, and the removed files are not.
const sw = read('sw.js');
ok(/'\.\/assets\/css\/emon-material\.min\.css'/.test(sw), 'compiled stylesheet is precached');
ok(!/tailwind\.js|emon-tailwind-config/.test(sw), 'service worker does not reference the removed files');

// 4. No precached path points at something that no longer exists.
const urls = [...sw.matchAll(/'\.\/([^']*)'/g)].map(m => m[1]).filter(Boolean);
const stale = urls.filter(u => !existsSync(`${ROOT}/${u}`));
ok(stale.length === 0,
   'every precached path exists' + (stale.length ? ` (stale: ${stale.slice(0, 4).join(', ')})` : ''));

// 5. Class coverage — the whole point of a static pipeline. Custom classes the
//    page styles itself, and Tailwind marker classes, are out of scope.
// `light`/`dark` on <html> are mode markers read by JS, not Tailwind utilities.
const MARKERS = new Set(['group', 'peer', 'light', 'dark']);

// Classes that exist purely as JS hooks: targeted by querySelector / event
// delegation and never styled. They are out of scope for a CSS coverage check.
const hooks = new Set();
for (const f of [...pages, 'assets/js/emon-app.js', 'assets/js/emon-shell.js']) {
  const src = read(f);
  for (const m of src.matchAll(/['"]([a-z][a-z0-9-]{3,})['"]/g)) {
    // only treat it as a hook if it is used as a selector, not as a class name
    if (/querySelector|closest|classList|\.matches/.test(src)) hooks.add(m[1]);
  }
}
for (const f of pages) {
  const src = read(f);
  for (const m of src.matchAll(/(?:querySelectorAll|querySelector|closest|matches)\(\s*['"]\.([a-z][a-z0-9-]{3,})/g)) {
    hooks.add(m[1]);
  }
}
const pageStyled = src => {
  const out = new Set();
  for (const m of src.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
    for (const c of m[1].matchAll(/\.([A-Za-z_][\w-]*)/g)) out.add(c[1]);
  }
  return out;
};
const missing = new Map();
let total = 0;
for (const f of pages) {
  const src = read(f);
  const own = pageStyled(src);
  const classes = new Set();
  for (const m of src.matchAll(/class="([^"]+)"/g)) {
    for (const c of m[1].split(/\s+/)) if (c) classes.add(c);
  }
  total += classes.size;
  for (const c of classes) {
    if (has(c) || MARKERS.has(c) || own.has(c) || hooks.has(c)) continue;
    if (!missing.has(c)) missing.set(c, []);
    missing.get(c).push(f);
  }
}

// Ignore tokens that are fragments of inline JavaScript, not class attributes.
const realMissing = [...missing.keys()].filter(c => !/^[$'{?:?]/.test(c) && !/'/.test(c));
ok(realMissing.length === 0,
   `all ${total} class attributes resolve in the compiled CSS` +
   (realMissing.length ? ` (missing: ${realMissing.slice(0, 6).join(', ')})` : ''));

// 6. Utilities the earlier parity work added live in the component layer and
//    must survive a rebuild.
const comp = read('assets/css/emon-components.css');
for (const c of ['p-space-md', 'p-space-lg', 'px-space-lg', 'gap-space-md']) {
  ok(new RegExp(`\\.${c}\\s*\\{`).test(comp) || new RegExp(`\\.${c}\\{`).test(css),
     `custom spacing utility .${c} is defined`);
}

console.log(failures ? `\n${failures} check(s) failed.` : '\nAll delivery-path checks passed.');
process.exit(failures ? 1 : 0);
