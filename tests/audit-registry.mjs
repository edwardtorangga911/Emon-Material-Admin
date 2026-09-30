// Verifies the Tailwind registry is defined exactly once.
//
// The theme tokens used to be an inline <script id="tailwind-config"> block
// duplicated into each page. The copies had drifted into eleven different
// token sets, and eight pages referenced utilities their own registry never
// declared — Tailwind does not generate those, so the styling disappeared with
// no error. This suite fails if the shared file is removed, if any page goes
// back to an inline registry, or if the shared registry loses a token that the
// markup actually uses.
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = process.env.EMON_ROOT || resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SHARED = `${ROOT}/assets/js/emon-tailwind-config.js`;
const read = f => readFileSync(`${ROOT}/${f}`, 'utf8');
const pages = readdirSync(ROOT).filter(f => f.endsWith('.html'));

let failures = 0;
const ok = (c, l) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${l}`); if (!c) failures++; };

const shared = readFileSync(SHARED, 'utf8');
const runtime = pages.filter(f => read(f).includes('tailwind.js'));
const prebuilt = pages.filter(f => read(f).includes('emon-material.min.css'));

// 1. One registry, loaded by every page that needs it.
ok(shared.length > 0, 'shared registry file exists');
const inline = pages.filter(f => /id="tailwind-config"/.test(read(f)));
ok(inline.length === 0,
   'no page carries an inline registry' + (inline.length ? ` (${inline.join(', ')})` : ''));

const notLoading = runtime.filter(f => !read(f).includes('emon-tailwind-config.js'));
ok(notLoading.length === 0,
   `all ${runtime.length} runtime pages load the shared registry` +
   (notLoading.length ? ` (missing: ${notLoading.join(', ')})` : ''));

// 2. The shared file is precached, or offline loses all theme tokens.
const sw = read('sw.js');
ok(/'\.\/assets\/js\/emon-tailwind-config\.js'/.test(sw),
   'shared registry is precached by the service worker');

// 3. Every token the markup references must exist in the registry.
const declared = new Set();
for (const m of shared.matchAll(/(?:^|[\s{])'?([a-zA-Z][\w-]*)'?\s*:\s*['"]var\(--/g)) {
  declared.add(m[1]);
}
ok(declared.size >= 35, `registry declares ${declared.size} colour tokens`);

// Tokens referenced by classes in the markup, mapped back to registry names.
// A colour utility is `<prefix>-<token>` where token is one of our declared
// names. Everything else (text-4xl, border-b, from-blue-500, bg-gradient-to-r)
// is a stock Tailwind utility and out of scope. Match whole class tokens and
// only report names that look like theme tokens.
const THEME_LIKE = /^[a-z]+(-[a-z]+)+$/;
const NOT_TOKEN = /^(red|blue|green|amber|emerald|purple|indigo|rose|slate|cyan|teal|lime|orange|pink|fuchsia|violet|sky|gray|zinc|neutral|stone|white|black)$/;

const missing = new Map();
for (const f of [...runtime, ...prebuilt]) {
  const s = read(f);
  for (const m of s.matchAll(/(?:^|[\s"'])([a-z-]+)[\s"']/g)) {
    const cls = m[1];
    if (!/^(text|bg|border|ring|from|to|via|fill|stroke|shadow|accent|decoration|caret|divide|outline)-/.test(cls)) continue;
    const name = cls.replace(/^(text|bg|border|ring|from|to|via|fill|stroke|shadow|accent|decoration|caret|divide|outline)-/, '');
    if (!THEME_LIKE.test(name)) continue;              // text-4xl, border-b
    const parts = name.split('-');
    if (NOT_TOKEN.test(parts[0])) continue;            // from-blue-500, bg-white
    if (name.startsWith('gradient-to-')) continue;    // bg-gradient-to-r modifier
    if (/^\d/.test(parts[parts.length - 1])) continue; // border-l-4
    if (declared.has(name)) continue;
    if (!missing.has(name)) missing.set(name, []);
    missing.get(name).push(f);
  }
}
ok(missing.size === 0,
   `every theme-colour utility used in markup exists in the registry` +
   (missing.size ? ` (missing: ${[...missing.keys()].slice(0, 5).join(', ')})` : ''));

// 4. The prebuilt stylesheet must carry the same tokens, or those 8 pages
//    still diverge from the other 19.
const min = read('assets/css/emon-material.min.css');
const minMissing = [...declared].filter(tok => {
  const name = tok.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  return !new RegExp(`\\.${name}[,{]`).test(min) &&
         !new RegExp(`\\.${tok.replace(/-/g, '\\-')}[,{]`).test(min);
});
// A handful of tokens are intentionally runtime-only (state accents); report
// the count but only fail on ones the prebuilt pages demonstrably use.
const prebuiltUsed = prebuilt.flatMap(f => {
  const s = read(f);
  return [...s.matchAll(/(?:^|[\s"'])(?:text|bg|border)-([a-z-]+)[\s"']/g)].map(m => m[1]);
});
// Class names in the compiled CSS are the kebab-case token with a `bg-`/
// `text-`/`border-` prefix, not the camelCase JS key.
const prebuiltMissing = [...new Set(prebuiltUsed)].filter(name => {
  if (NOT_TOKEN.test(name.split('-')[0])) return false;
  if (/^\d/.test(name.split('-').pop())) return false;
  if (!THEME_LIKE.test(name)) return false;
  if (!declared.has(name)) return false;         // runtime-only token
  return !new RegExp(`\\.(?:text|bg|border)-${name.replace(/-/g, '\\-')}[,{]`).test(min);
});
ok(prebuiltMissing.length === 0,
   `theme utilities used by prebuilt pages exist in the compiled css` +
   (prebuiltMissing.length ? ` (missing: ${[...prebuiltMissing].slice(0, 5).join(', ')})` : ''));

// 5. Values stay var() references so the live theme still drives colour.
const hardcoded = [...shared.matchAll(/:\s*'(#[0-9a-fA-F]{3,8})'/g)].map(m => m[1]);
ok(hardcoded.length === 0,
   'registry uses var() references, not hardcoded colours');

console.log(failures ? `\n${failures} check(s) failed.` : '\nAll registry checks passed.');
process.exit(failures ? 1 : 0);
