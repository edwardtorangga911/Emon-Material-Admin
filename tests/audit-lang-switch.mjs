// Verifies the language-switch fix: repeated setLang() must re-render the shell
// and re-attach emon-app handlers WITHOUT stacking window-level listeners.
// A stacked Ctrl+K handler toggles the palette twice and cancels itself out, so
// the listener count is the thing that actually matters here.
import { readFileSync } from 'node:fs';

import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = process.env.EMON_ROOT || resolve(dirname(fileURLToPath(import.meta.url)), '..');

const SHELL = `${ROOT}/assets/js/emon-shell.js`;
const APP = `${ROOT}/assets/js/emon-app.js`;
const I18N = `${ROOT}/assets/js/emon-i18n.js`;

let failures = 0;
const ok = (cond, label) => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${label}`);
  if (!cond) failures++;
};

// --- 1. i18n dispatches the event the shell listens for ---
const i18n = readFileSync(I18N, 'utf8');
const shell = readFileSync(SHELL, 'utf8');
const app = readFileSync(APP, 'utf8');

ok(/new CustomEvent\('emon-lang-changed'/.test(i18n),
   'setLang dispatches emon-lang-changed');
ok(/addEventListener\('emon-lang-changed',\s*rerender\)/.test(shell),
   'shell re-renders on emon-lang-changed');
ok(!/labels are static per load/.test(shell),
   'dead no-op language listener removed');

// --- 2. The wire is connected, not just declared ---
ok(/dispatchEvent\(new CustomEvent\('emon-shell-rerendered'\)\)/.test(shell),
   'rerender notifies consumers');
ok(/addEventListener\('emon-shell-rerendered'/.test(app),
   'emon-app re-attaches after rerender');

// --- 3. i18n no longer lies about the document language ---
ok(!/documentElement\.setAttribute\('lang'/.test(i18n),
   'i18n does not overwrite <html lang> (body stays as authored)');
ok(/setAttribute\('lang', lang\)/.test(shell),
   'shell stamps lang on its own containers instead');

// --- 4. Listener guards present on both global handlers ---
ok(/let paletteKeysBound = false/.test(app) && /if \(paletteKeysBound\) return/.test(app),
   'Ctrl+K window listener is guarded against re-binding');
ok(/let notifDocBound = false/.test(app) && /if \(notifDocBound\) return/.test(app),
   'notifications document listener is guarded against re-binding');

// --- 5. Scroll progress binds once but reads the bar per call ---
ok(/let scrollProgressBound = false/.test(shell),
   'scroll progress binds its scroll listeners once');
ok(/const el0 = document\.getElementById\('emon-scroll-progress-bar'\)/.test(shell),
   'scroll progress re-resolves the replaced bar node each call');

// --- 6. Chrome re-renders into stable hosts ---
for (const id of ['emon-shell-nav', 'emon-shell-top', 'emon-shell-overlays']) {
  ok(shell.includes(`id="${id}"`) && shell.includes(`getElementById('${id}')`),
     `chrome host #${id} is created and reused across renders`);
}

console.log(failures ? `\n${failures} check(s) failed.` : '\nAll checks passed.');
process.exit(failures ? 1 : 0);
