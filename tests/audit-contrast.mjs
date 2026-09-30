// WCAG 2.1 AA contrast audit over the tokens that text actually resolves to,
// post-fix. Accent text (text-primary/error/warning) is measured against the
// -on-surface variants introduced in this change, because the component layer
// now re-points those utilities away from the fill colours.
import { readFileSync } from 'node:fs';

import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = process.env.EMON_ROOT || resolve(dirname(fileURLToPath(import.meta.url)), '..');

const css = readFileSync(`${ROOT}/assets/css/emon-theme.css`, 'utf8');

const lum = hex => {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const [r, g, b] = [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16));
  const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a, b) => {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};
const block = (a, b) => {
  const o = {};
  for (const m of css.slice(a, b).matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{3,8})/g)) o[m[1]] = m[2];
  return o;
};
const rootIdx = css.indexOf(':root');
const light = block(rootIdx, css.indexOf('}', rootIdx));
const darkBlock = block(css.indexOf('html.dark'), css.indexOf('html{font-family'));
const dark = { ...light, ...darkBlock };

// The utility -> token mapping the component layer now enforces.
const RESOLVES = {
  'text-primary': 'primary-on-surface',
  'text-error': 'error-on-surface',
  'text-warning': 'warning-on-surface',
  'text-outline': 'outline',
  'text-on-surface': 'on-surface',
  'text-on-surface-variant': 'on-surface-variant',
};
const SURFACES = [
  'background', 'surface', 'surface-container-lowest', 'surface-container-low',
  'surface-container', 'surface-container-high', 'surface-container-highest',
];

let failures = 0, checks = 0;
const rows = [];
for (const mode of ['light', 'dark']) {
  const v = mode === 'dark' ? dark : light;
  for (const [util, token] of Object.entries(RESOLVES)) {
    if (!v[token]) { console.log(`  ?  ${mode} ${util}: token --${token} undefined`); failures++; continue; }
    let worst = Infinity, worstBg = '';
    for (const bg of SURFACES) {
      if (!v[bg]) continue;
      const r = ratio(v[token], v[bg]);
      checks++;
      if (r < worst) { worst = r; worstBg = bg; }
      if (r < 4.5) { failures++; rows.push(`  FAIL ${mode} ${util} (--${token} ${v[token]}) on --${bg} ${v[bg]} = ${r.toFixed(2)}:1`); }
    }
    const okFlag = worst >= 4.5 ? 'PASS' : 'FAIL';
    console.log(`  ${okFlag}  ${mode.padEnd(5)} ${util.padEnd(24)} --${token.padEnd(21)} worst ${worst.toFixed(2)}:1 on ${worstBg}`);
  }
}

if (rows.length) { console.log('\n--- failures ---'); rows.forEach(r => console.log(r)); }

// Fill colours must NOT have moved: filled buttons still rely on them.
console.log('\n=== fill colours unchanged (regression guard) ===');
for (const [k, expected] of Object.entries({
  'primary': '#005bbf', 'on-primary': '#ffffff',
  'error': '#ba1a1a', 'on-error': '#ffffff',
})) {
  const same = light[k] === expected;
  if (!same) failures++;
  console.log(`  ${same ? 'PASS' : 'FAIL'}  light --${k} = ${light[k]} (expected ${expected})`);
}

console.log(`\n${checks} pair(s) checked, ${failures} failure(s).`);
process.exit(failures ? 1 : 0);
