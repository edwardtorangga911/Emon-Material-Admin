// Locks in the single delivery path and the spacing parity that replaced the
// two-path mismatch.
//
// Utilities used to be built two ways — a runtime Tailwind bundle on 19 pages
// and a compiled stylesheet on 8 — and the custom --space-* scale existed only
// in the runtime config. The eight compiled pages therefore resolved
// px-space-lg and friends to nothing, which is why the sidebar rendered at a
// different width and type size depending on the page.
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = process.env.EMON_ROOT || resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = f => readFileSync(`${ROOT}/${f}`, 'utf8');
const pages = readdirSync(ROOT).filter(f => f.endsWith('.html'));
const theme = read('assets/css/emon-theme.css');
const comp = read('assets/css/emon-components.css');
const min = read('assets/css/emon-material.min.css');
const shell = read('assets/js/emon-shell.js');

let failures = 0;
const ok = (c, l) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${l}`); if (!c) failures++; };

// 1. One path for all pages.
const onCompiled = pages.filter(f => read(f).includes('emon-material.min.css'));
ok(onCompiled.length === pages.length,
   `all ${pages.length} pages use the compiled stylesheet` +
   (onCompiled.length !== pages.length ? ` (${pages.length - onCompiled.length} not)` : ''));
ok(!pages.some(f => /tailwind\.js|emon-tailwind-config/.test(read(f))),
   'no page loads a runtime Tailwind bundle');

// 2. The tokens themselves are declared in CSS, not only in a JS config.
for (const [tok, val] of Object.entries({
  'space-xs': '0.25rem', 'space-sm': '0.5rem',
  'space-md': '1rem', 'space-lg': '1.5rem',
})) {
  ok(new RegExp(`--${tok}:\\s*${val.replace('.', '\\.')}`).test(theme),
     `--${tok} declared in emon-theme.css as ${val}`);
}

// 3. Every custom spacing class the shell uses resolves against those tokens.
const used = [...new Set(shell.match(/\b(?:p|px|py|gap|mt|mb|ml|mr|pt|pb|pl|pr)-space-[a-z]+/g) || [])];
ok(used.length > 0, `shell uses ${used.length} custom spacing class(es)`);
const undefined_ = used.filter(c => !new RegExp(`\\.${c}\\s*\\{`).test(comp));
ok(undefined_.length === 0,
   'all custom spacing classes defined in emon-components.css' +
   (undefined_.length ? ` (missing: ${undefined_.join(', ')})` : ''));
ok(used.every(c => {
  const m = comp.match(new RegExp(`\\.${c}\\s*\\{([^}]*)\\}`));
  return m && /var\(--space-/.test(m[1]);
}), 'definitions resolve through the shared tokens rather than hardcoded lengths');

// 4. Those definitions must survive into the compiled output every page loads.
const compiledMissing = used.filter(c => !new RegExp(`\\.${c.replace(/-/g, '\\-')}[,{]`).test(min));
ok(compiledMissing.length === 0,
   'custom spacing classes reach the compiled stylesheet' +
   (compiledMissing.length ? ` (missing: ${compiledMissing.join(', ')})` : ''));

// 5. The component layer is imported, so its rules reach all pages.
ok(/@import "\.\/emon-components\.css"/.test(theme),
   'emon-theme.css imports emon-components.css');
ok(pages.every(f => read(f).includes('emon-theme.css')),
   `all ${pages.length} pages load emon-theme.css`);

// 6. Sidebar geometry is fixed in CSS, not content-dependent.
ok(/#emon-sidebar\s*\{[\s\S]*?width: 5rem/.test(theme), 'collapsed rail width is fixed in CSS');
ok(/w-64/.test(shell), 'expanded sidebar width comes from a utility present in the compiled CSS');

console.log(failures ? `\n${failures} check(s) failed.` : '\nAll spacing-parity checks passed.');
process.exit(failures ? 1 : 0);
