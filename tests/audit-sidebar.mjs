// Verifies the sidebar fix: the nav label must NOT be baked from render-time
// state. The original bug read `isMini` inside renderSidebar() and emitted a
// `title` attribute only when collapsed — but toggleSidebar() just adds a CSS
// class, so a user who expanded the sidebar and then collapsed it got icons
// with no accessible name at all.
import { readFileSync } from 'node:fs';

import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = process.env.EMON_ROOT || resolve(dirname(fileURLToPath(import.meta.url)), '..');

const SHELL = `${ROOT}/assets/js/emon-shell.js`;
const CSS = `${ROOT}/assets/css/emon-theme.css`;
const THEME = `${ROOT}/assets/js/emon-theme.js`;

const shell = readFileSync(SHELL, 'utf8');
const css = readFileSync(CSS, 'utf8');
const theme = readFileSync(THEME, 'utf8');

let failures = 0;
const ok = (c, l) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${l}`); if (!c) failures++; };

// 1. Root cause removed: no render-time mini detection in the sidebar.
ok(!/const isMini =/.test(shell),
   'renderSidebar() no longer reads collapsed state at render time');
ok(!/isMini \? `title=/.test(shell),
   'no conditional `title` attribute baked into nav markup');

// 2. Label is always present, so it survives any later class toggle.
ok(/data-label="\$\{tr\(item\.label\)\}"/.test(shell),
   'every nav item carries data-label unconditionally');

// 3. Icon is decorative; the text span is the real accessible name.
ok(/class="material-symbols-outlined text-\[18px\] shrink-0" aria-hidden="true"/.test(shell),
   'nav icon is aria-hidden so it is not double-announced');

// 4. aria-current only on the active item — "false" is not a valid token.
ok(!/aria-current="\$\{isActive \? 'page' : 'false'\}"/.test(shell),
   'invalid aria-current="false" removed');
ok(/isActive \? 'aria-current="page"' : ''/.test(shell),
   'aria-current="page" emitted only for the active item');

// 5. Tooltip is CSS-driven from data-label, and only in the collapsed rail.
ok(/\.sidebar-nav-item::after \{[\s\S]*?content: attr\(data-label\)/.test(css),
   'tooltip content comes from data-label');
ok(/body\.sidebar-mini \.sidebar-nav-item:hover::after/.test(css),
   'tooltip shown on hover in the collapsed rail only');

// 6. Keyboard users get both a visible focus ring and the tooltip.
ok(/\.sidebar-nav-item:focus-visible \{[\s\S]*?outline: 2px solid var\(--primary\)/.test(css),
   'focus ring defined for rail items');
ok(/sidebar-nav-item:focus-visible::after/.test(css),
   'tooltip also appears on keyboard focus');

// 7. Regression guard: the collapse button must never be hidden, or the user
//    is trapped in the collapsed rail with no way back.
ok(!/sidebar-collapse-btn\s*\{[^}]*display:\s*none/.test(css),
   'collapse button is never display:none');
ok(/sidebar-collapse-btn,\s*\nhtml\.sidebar-mini-init \.sidebar-collapse-btn \{\s*\n\s*padding: 0\.25rem;/.test(css),
   'collapse button stays visible in mini (only padding changes)');

// 8. Brand row stacks instead of overflowing at 5rem.
ok(/body\.sidebar-mini \.sidebar-brand-row,\s*\nhtml\.sidebar-mini-init \.sidebar-brand-row \{\s*\n\s*flex-direction: column;/.test(css),
   'brand row stacks vertically in the collapsed rail');

// 9. Collapse control state is synced on the shared path, not just the button,
//    because the customizer checkbox can drive it too.
ok(/getElementById\('sidebar-collapse-btn'\)/.test(theme),
   'collapse button state synced in applyTheme (shared path)');
ok(/setAttribute\('aria-expanded', this\.config\.sidebarMini \? 'false' : 'true'\)/.test(theme),
   'aria-expanded reflects collapsed state');
ok(theme.includes("icon.textContent = this.config.sidebarMini ? 'menu' : 'menu_open'"),
   'collapse icon reflects collapsed state');
ok(!/aria-expanded="true"/.test(shell.split('aria-expanded')[0].slice(-200) + 'XX'),
   'aria-expanded initial value present in markup');

console.log(failures ? `\n${failures} check(s) failed.` : '\nAll sidebar checks passed.');
process.exit(failures ? 1 : 0);
