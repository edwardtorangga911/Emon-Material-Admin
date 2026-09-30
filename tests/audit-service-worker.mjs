// Verifies sw.js: every precached URL must exist on disk, and the cache name
// must have moved off the value that was live when the sidebar/i18n fixes
// shipped (returning visitors were pinned to that build).
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = process.env.EMON_ROOT || resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sw = readFileSync(`${ROOT}/sw.js`, 'utf8');

let failures = 0;
const ok = (c, l) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${l}`); if (!c) failures++; };

// 1. Cache name must be bumped past the stale one.
const name = (sw.match(/CACHE_NAME\s*=\s*'([^']+)'/) || [])[1];
ok(!!name, `CACHE_NAME is defined (${name})`);
ok(name !== 'emon-material-admin-v3.5', 'CACHE_NAME bumped off the stale v3.5');

// 2. Every precached path must exist.
const urls = [...sw.matchAll(/'(\.\/[^']*)'/g)].map(m => m[1]);
const missing = urls.filter(u => u !== './' && !existsSync(`${ROOT}/${u.replace('./', '')}`));
ok(missing.length === 0,
   `all ${urls.length - 1} precached paths exist on disk` +
   (missing.length ? ` (missing: ${missing.join(', ')})` : ''));

// 3. The three omissions that broke the offline build must be back.
for (const p of [
  './assets/js/emon-shell.js',
  './assets/js/emon-theme-init.js',
  './assets/css/emon-components.css',
  './forgot-password.html',
]) {
  ok(urls.includes(p), `precache includes ${p}`);
}

// 4. Assets that drive the app shell must not have been dropped.
const shell = readFileSync(`${ROOT}/assets/js/emon-shell.js`, 'utf8');
const pages = readdirSync(ROOT).filter(f => f.endsWith('.html'));
const withShell = pages.filter(f =>
  readFileSync(`${ROOT}/${f}`, 'utf8').includes('emon-shell.js'));
ok(withShell.length > 0, `${withShell.length} pages depend on emon-shell.js`);
ok(urls.includes('./assets/js/emon-shell.js'),
   '...and that dependency is precached (it was not before this fix)');

// 5. Every page in the repo is reachable from the cache, so offline navigation
//    does not dead-end on a page that was never precached.
const uncached = pages.filter(f => !urls.includes(`./${f}`));
ok(uncached.length === 0,
   `all ${pages.length} pages precached` +
   (uncached.length ? ` (missing: ${uncached.join(', ')})` : ''));

// 6. Old caches are still evicted on activate, otherwise bumping the name
//    would leave the stale build sitting on disk.
ok(/caches\.delete\(name\)/.test(sw), 'activate evicts non-current caches');
ok(/self\.skipWaiting\(\)/.test(sw), 'install calls skipWaiting');
ok(/self\.clients\.claim\(\)/.test(sw), 'activate claims clients');

// 7. The offline claim depends on the font binaries, not just the CSS that
//    references them. fonts.css and the compiled stylesheet both point at the
//    woff2 files; if those are not cached, an offline visitor gets the correct
//    layout rendered in the browser's fallback typeface.
const fontDir = `${ROOT}/assets/fonts`;
const fontFiles = readdirSync(fontDir).filter(f => f.endsWith('.woff2'));
ok(fontFiles.length > 0, `${fontFiles.length} woff2 font files present`);
const uncachedFonts = fontFiles.filter(f => !urls.includes(`./assets/fonts/${f}`));
ok(uncachedFonts.length === 0,
   'every woff2 file is precached' +
   (uncachedFonts.length ? ` (missing: ${uncachedFonts.slice(0, 3).join(', ')}…)` : ''));

// The precache must reference the fonts that actually exist, too.
const staleRefs = urls.filter(u => u.startsWith('./assets/fonts/') && !existsSync(`${ROOT}/${u.replace('./', '')}`));
ok(staleRefs.length === 0,
   'no precached font path is stale' + (staleRefs.length ? ` (${staleRefs.join(', ')})` : ''));

// A font declared in fonts.css but absent from disk would silently 404.
// Quotes around the url() are optional in CSS, so match both forms.
const fontsCss = readFileSync(`${ROOT}/assets/fonts/fonts.css`, 'utf8');
const declared = [...fontsCss.matchAll(/url\(\s*['"]?\.?\/?([^'")\s]+\.woff2)['"]?\s*\)/g)].map(m => m[1]);
const declaredNames = declared.map(f => f.split('/').pop());
const undeclared = fontFiles.filter(f => !declaredNames.includes(f));
ok(undeclared.length === 0,
   `every woff2 on disk is declared in fonts.css` +
   (undeclared.length ? ` (undeclared: ${undeclared.slice(0, 3).join(', ')})` : ''));

console.log(failures ? `\n${failures} check(s) failed.` : '\nAll service worker checks passed.');
process.exit(failures ? 1 : 0);
