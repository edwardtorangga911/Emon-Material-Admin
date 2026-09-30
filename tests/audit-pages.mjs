// Structural audit of every page in Emon Material Admin.
// Every page is expected to satisfy the same shell contract; this finds the
// ones that drifted (the sidebar-inconsistency class of bug, generalised).
import { readFileSync, readdirSync, existsSync } from 'node:fs';

const ROOT = process.env.EMON_ROOT || resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pages = readdirSync(ROOT).filter(f => f.endsWith('.html'));
const read = f => readFileSync(`${ROOT}/${f}`, 'utf8');

const shellPages = pages.filter(f => read(f).includes('emon-shell.js'));
const authPages = ['login.html', 'register.html', 'forgot-password.html', 'lockscreen.html', '404.html', '500.html', 'invoice-print.html'];

const issues = [];
const note = (page, sev, msg) => issues.push({ page, sev, msg });

/* --- 1. Shell contract: pages that opt into the app shell --- */
for (const p of shellPages) {
  const s = read(p);
  if (!s.includes('id="emon-shell-root"')) note(p, 'ERR', 'loads emon-shell.js but has no #emon-shell-root (shell will not inject)');
  const app = s.match(/id="emon-shell-root"[^>]*data-app="([^"]*)"/);
  if (!app) note(p, 'ERR', 'missing data-app on #emon-shell-root (active nav item cannot resolve)');
  else {
    const key = app[1];
    const shell = read('assets/js/emon-shell.js');
    if (!shell.includes(`key: '${key}'`)) note(p, 'ERR', `data-app="${key}" matches no NAV item in emon-shell.js`);
    if (key !== p.replace('.html', '')) note(p, 'WARN', `data-app="${key}" does not match filename "${p.replace('.html', '')}"`);
  }
  if (!s.includes('emon-app.js')) note(p, 'ERR', 'does not load emon-app.js (no keyboard nav, palette, or grid)');
  if (!s.includes('emon-theme.js')) note(p, 'ERR', 'does not load emon-theme.js');
  if (!s.includes('id="emon-main-content"')) note(p, 'ERR', 'no #emon-main-content (footer + header offset break)');
}

/* --- 2. Document basics --- */
for (const p of pages) {
  const s = read(p);
  const lang = (s.match(/<html[^>]*\slang="([^"]+)"/) || [])[1];
  if (lang !== 'id') note(p, 'ERR', `html lang is "${lang}", expected "id" (mismatched with authored Indonesian content)`);

  // Body typography must be uniform. `font-sans` resolved to an undefined
  // --font-sans token and silently fell back to the browser default, which is
  // what made some pages render in a different typeface from the rest.
  const body = (s.match(/<body class="([^"]*)"/) || [])[1] || '';
  if (/\bfont-sans\b/.test(body)) note(p, 'ERR', 'body uses font-sans (undefined token) instead of font-body');
  if (body && !/\bfont-body\b/.test(body) && !p.includes('print')) note(p, 'WARN', 'body does not set font-body');
  const h1 = (s.match(/<h1\b/gi) || []).length;
  if (shellPages.includes(p) && h1 === 0) note(p, 'WARN', 'no <h1> on a shell page');
  if (h1 > 1) note(p, 'WARN', `${h1} <h1> elements (should be one per page)`);
  if (!/<title>/.test(s)) note(p, 'ERR', 'no <title>');
  if (!s.includes('viewport')) note(p, 'ERR', 'no viewport meta (not responsive)');
}

/* --- 3. Utility parity: the exact class of bug just fixed --- */
const theme = read('assets/css/emon-theme.css');
const comp = read('assets/css/emon-components.css');
const min = read('assets/css/emon-material.min.css');
const runtime = p => read(p).includes('tailwind.js');
for (const p of pages) {
  const s = read(p);
  const custom = [...new Set(s.match(/\b(?:p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|space)-space-[a-z]+/g) || [])];
  const undefinedCustom = custom.filter(c => !new RegExp(`\\.${c}\\s*\\{`).test(comp) && !runtime(p));
  if (undefinedCustom.length) note(p, 'ERR', `uses ${undefinedCustom.join(', ')} but prebuilt path defines neither it nor the tokens`);
  if (runtime(p) && !min.length) note(p, 'WARN', 'runtime page but compiled css missing');
}

/* --- 4. Script ordering (shell must run before app binds to injected DOM) --- */
for (const p of shellPages) {
  const s = read(p);
  const shellAt = s.indexOf('emon-shell.js');
  const appAt = s.indexOf('emon-app.js');
  if (shellAt === -1 || appAt === -1) continue;
  if (shellAt > appAt) note(p, 'ERR', 'emon-app.js loads BEFORE emon-shell.js (app binds to DOM the shell has not injected yet)');
}

/* --- 5. Broken local links --- */
for (const p of pages) {
  const s = read(p);
  for (const m of s.matchAll(/href="(\.\/[^"#?]+|[\w-]+\.html)"/g)) {
    const t = m[1].replace('./', '');
    if (t && !existsSync(`${ROOT}/${t}`)) note(p, 'ERR', `broken local link -> ${t}`);
  }
}

/* --- 6. Service worker --- */
const sw = read('sw.js');
const cached = [...sw.matchAll(/'\.\/([^']*)'/g)].map(m => m[1]).filter(Boolean);
for (const p of pages) {
  if (!cached.includes(p)) note(p, 'WARN', 'page not in service worker precache (unreachable offline)');
}

/* --- report --- */
const errs = issues.filter(i => i.sev === 'ERR');
const warns = issues.filter(i => i.sev === 'WARN');
console.log(`pages: ${pages.length}  (shell: ${shellPages.length}, standalone: ${pages.length - shellPages.length})`);
console.log(`errors: ${errs.length}   warnings: ${warns.length}\n`);
const byPage = new Map();
for (const i of issues) {
  if (!byPage.has(i.page)) byPage.set(i.page, []);
  byPage.get(i.page).push(i);
}
for (const p of [...byPage.keys()].sort()) {
  const list = byPage.get(p);
  const e = list.filter(i => i.sev === 'ERR').length;
  const w = list.filter(i => i.sev === 'WARN').length;
  console.log(`${p}${e ? ` [${e} err]` : ''}${w ? ` [${w} warn]` : ''}`);
  for (const i of list) console.log(`    ${i.sev}  ${i.msg}`);
}
if (!issues.length) console.log('clean');
process.exit(errs.length ? 1 : 0);
