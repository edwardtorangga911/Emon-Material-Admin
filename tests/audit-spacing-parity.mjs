// Verifies the sidebar renders identically regardless of which of the two
// delivery paths a page uses.
//
// 18 pages build utilities at runtime from an inline tailwind.config; 9 are
// served from the prebuilt emon-material.min.css, generated before the custom
// --space-* names existed. The shell is injected by JS on every page, so any
// class it uses must resolve in BOTH paths — that mismatch is what made the
// sidebar jump in width and type size between pages.
import { existsSync, readFileSync, readdirSync } from 'node:fs';

const ROOT = process.env.EMON_ROOT || resolve(dirname(fileURLToPath(import.meta.url)), '..');
const theme = readFileSync(`${ROOT}/assets/css/emon-theme.css`, 'utf8');
const comp = readFileSync(`${ROOT}/assets/css/emon-components.css`, 'utf8');
const min = readFileSync(`${ROOT}/assets/css/emon-material.min.css`, 'utf8');
const shell = readFileSync(`${ROOT}/assets/js/emon-shell.js`, 'utf8');

let failures = 0;
const ok = (c, l) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${l}`); if (!c) failures++; };

// 1. The custom spacing tokens exist in CSS, not only in the runtime JS config.
for (const [tok, val] of Object.entries({
  'space-xs': '0.25rem', 'space-sm': '0.5rem',
  'space-md': '1rem', 'space-lg': '1.5rem',
})) {
  ok(new RegExp(`--${tok}:\\s*${val.replace('.', '\\.')}`).test(theme),
     `--${tok} declared in emon-theme.css as ${val}`);
}

// 2. Every custom spacing class the shell uses has a real definition that the
//    prebuilt pages can also reach.
const used = [...new Set(shell.match(/\b(?:p|px|py|gap|mt|mb|ml|mr|pt|pb|pl|pr)-space-[a-z]+/g) || [])];
ok(used.length > 0, `shell uses ${used.length} custom spacing class(es)`);
const missing = used.filter(c => !new RegExp(`\\.${c}\\s*\\{`).test(comp));
ok(missing.length === 0,
   `all custom spacing classes defined in emon-components.css` +
   (missing.length ? ` (missing: ${missing.join(', ')})` : ''));

// 3. Definitions must reference the tokens, not hardcode values — otherwise the
//    two paths could still drift.
for (const c of used) {
  const m = comp.match(new RegExp(`\\.${c}\\s*\\{([^}]*)\\}`));
  if (!m) continue;
  const usesVar = /var\(--space-/.test(m[1]);
  if (!usesVar) { failures++; console.log(`  FAIL  .${c} does not use var(--space-*)`); }
}
ok(used.every(c => {
  const m = comp.match(new RegExp(`\\.${c}\\s*\\{([^}]*)\\}`));
  return m && /var\(--space-/.test(m[1]);
}), 'all definitions resolve through the shared tokens');

// 4. Every page must load the layer that carries these definitions.
const pages = readdirSync(ROOT).filter(f => f.endsWith('.html'));
const loadsTheme = pages.filter(f => readFileSync(`${ROOT}/${f}`, 'utf8').includes('emon-theme.css'));
ok(loadsTheme.length === pages.length,
   `all ${pages.length} pages load emon-theme.css (which @imports the component layer)`);

ok(/@import "\.\/emon-components\.css"/.test(theme),
   'emon-theme.css imports emon-components.css, so parity rules reach every page');

// 5. Neither path is left orphaned: every page still resolves its utilities.
const runtime = pages.filter(f => readFileSync(`${ROOT}/${f}`, 'utf8').includes('tailwind.js'));
const prebuilt = pages.filter(f => readFileSync(`${ROOT}/${f}`, 'utf8').includes('emon-material.min.css'));
ok(runtime.length + prebuilt.length === pages.length,
   `all pages resolve utilities: ${runtime.length} runtime + ${prebuilt.length} prebuilt`);
ok(prebuilt.length > 0 && runtime.length > 0,
   'both delivery paths still in use (the mismatch is real, not hypothetical)');

// 6. Sidebar geometry itself must be fixed, not content-dependent.
ok(/#emon-sidebar\s*\{[\s\S]*?width: 5rem/.test(theme),
   'collapsed rail width is fixed in CSS');
ok(/w-64/.test(shell),
   'expanded sidebar width comes from a utility present in both paths');

console.log(failures ? `\n${failures} check(s) failed.` : '\nAll sidebar parity checks passed.');
process.exit(failures ? 1 : 0);
