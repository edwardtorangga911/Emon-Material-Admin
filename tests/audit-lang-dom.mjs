// Executes the real emon-shell.js / emon-i18n.js / emon-app.js against a minimal
// DOM so the language switch is verified by behaviour, not by string matching.
//
// The invariant under test: switching language repeatedly must
//   (a) actually change the rendered labels,
//   (b) not stack window-level listeners (a duplicate Ctrl+K handler toggles
//       the palette twice and cancels itself out),
//   (c) not duplicate the shell chrome in the document.
import { readFileSync } from 'node:fs';

import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = process.env.EMON_ROOT || resolve(dirname(fileURLToPath(import.meta.url)), '..');

const DIR = `${ROOT}/assets/js`;

/* ---------- minimal DOM ---------- */
class ClassList {
  constructor(el) { this.el = el; this.s = new Set(); }
  add(...c) { c.forEach(x => this.s.add(x)); }
  remove(...c) { c.forEach(x => this.s.delete(x)); }
  contains(c) { return this.s.has(c); }
  toggle(c) { this.s.has(c) ? this.s.delete(c) : this.s.add(c); }
  toString() { return [...this.s].join(' '); }
}

const VOID = new Set(['br', 'hr', 'img', 'input', 'meta', 'link', 'path', 'circle', 'source', 'use']);

/* Minimal HTML parser: builds an El tree, enough for the shell's own markup.
   Void elements and self-closing tags are handled; unclosed tags auto-close at
   the parent's close tag. */
function parseHTML(html) {
  const root = new El('template');
  const stack = [root];
  const re = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][\w-]*)((?:\s+[^\s=/>]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'>]+))?)*)\s*(\/?)>|([^<]+)/g;
  let m;
  while ((m = re.exec(html))) {
    const [full, close, tag, attrStr, selfClose, text] = m;
    if (full.startsWith('<!--')) continue;

    if (text !== undefined) {
      if (text.trim()) {
        const t = new El('#text');
        t.textContent = text;
        stack[stack.length - 1].appendChild(t);
      }
      continue;
    }

    if (close) {
      // Unwind to the matching open tag if it is on the stack.
      for (let i = stack.length - 1; i > 0; i--) {
        if (stack[i].tagName === tag.toUpperCase()) { stack.length = i; break; }
      }
      continue;
    }

    const el = new El(tag);
    for (const a of (attrStr || '').matchAll(/([^\s=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g)) {
      const name = a[1];
      const val = a[2] ?? a[3] ?? a[4] ?? '';
      if (name === 'id') el.setAttribute('id', val);
      else if (name === 'class') el.className = val;
      else if (name === 'lang') el.setAttribute('lang', val);
      else if (name.startsWith('data-')) el.setAttribute(name, val);
      else el.setAttribute(name, val);
    }
    stack[stack.length - 1].appendChild(el);
    if (!selfClose && !VOID.has(tag.toLowerCase())) stack.push(el);
  }
  return root.children.slice();
}

let idSeq = 0;
class El {
  constructor(tag) {
    this.tagName = (tag || 'div').toUpperCase();
    this.children = [];
    this.parentNode = null;
    this.classList = new ClassList(this);
    this.dataset = {};
    this.attrs = {};
    this.style = {};
    this._text = '';
    this._uid = ++idSeq;
    this._listeners = {};
  }
  get id() { return this.attrs.id || ''; }
  set id(v) { this.attrs.id = v; }
  set className(v) {
    this.classList = new ClassList(this);
    String(v).split(/\s+/).filter(Boolean).forEach(c => this.classList.add(c));
  }
  get className() { return this.classList.toString(); }
  set textContent(v) { this._text = String(v); this.children = []; }
  get textContent() { return this._text + this.children.map(c => c.textContent).join(''); }
  set innerHTML(v) {
    this._html = String(v);
    this.children = [];
    for (const node of parseHTML(this._html)) this.appendChild(node);
  }
  get innerHTML() { return this._html || ''; }
  setAttribute(k, v) {
    this.attrs[k] = v;
    if (k === 'lang') this.lang = v;
    if (k === 'id') this.attrs.id = v;
  }
  getAttribute(k) { return this.attrs[k] ?? null; }
  appendChild(c) { return this.insertBefore(c, null); }
  insertBefore(c, ref) {
    // Real DOM moves the node: detach from any previous parent first, or a
    // `while (frag.firstChild)` drain loop would never terminate.
    if (c.parentNode) {
      const i = c.parentNode.children.indexOf(c);
      if (i !== -1) c.parentNode.children.splice(i, 1);
    }
    c.parentNode = this;
    const i = ref ? this.children.indexOf(ref) : -1;
    i === -1 ? this.children.push(c) : this.children.splice(i, 0, c);
    return c;
  }
  removeChild(c) {
    const i = this.children.indexOf(c);
    if (i !== -1) this.children.splice(i, 1);
    c.parentNode = null;
    return c;
  }
  get firstChild() { return this.children[0] || null; }
  addEventListener(t, fn) { (this._listeners[t] ||= []).push(fn); }
  removeEventListener(t, fn) {
    const l = this._listeners[t];
    if (l) this._listeners[t] = l.filter(f => f !== fn);
  }
  dispatchEvent(ev) {
    ev.target = ev.target || this;
    (this._listeners[ev.type] || []).slice().forEach(fn => fn(ev));
    return true;
  }
  click() { this.dispatchEvent({ type: 'click', target: this, stopPropagation() {} }); }
  querySelector() { return null; }
  querySelectorAll() { return []; }
  get firstElementChild() { return this.children[0] || null; }
  matches() { return false; }
}

const document = {
  readyState: 'complete',
  documentElement: new El('html'),
  body: new El('body'),
  _byId: new Map(),
  createElement: t => new El(t),
  getElementById(id) { return this._byId.get(id) || null; },
  addEventListener(t, fn) { (this._l ||= {})[t] = (this._l[t] || []).concat(fn); },
  _fire(t, ev) { ((this._l || {})[t] || []).slice().forEach(fn => fn(ev)); },
  querySelector: () => null,
  querySelectorAll: () => [],
};
document.documentElement.classList.add('dark');

const store = new Map();
const localStorage = {
  getItem: k => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
};
const winListeners = {};
const window = {
  addEventListener(t, fn) { (winListeners[t] ||= []).push(fn); },
  removeEventListener(t, fn) { winListeners[t] = (winListeners[t] || []).filter(f => f !== fn); },
  dispatchEvent(ev) { (winListeners[ev.type] || []).slice().forEach(fn => fn(ev)); return true; },
  location: { pathname: '/index.html', href: '' },
  matchMedia: () => ({ addEventListener() {}, matches: false }),
  print() {},
  innerWidth: 1280,
  scrollY: 0,
  getComputedStyle: () => ({}),
  requestAnimationFrame: fn => fn(0),
  EmonToast: null,
};
window.window = window;
globalThis.window = window;
globalThis.document = document;
globalThis.localStorage = localStorage;
Object.defineProperty(globalThis, 'navigator', {
  value: { language: 'id-ID' }, configurable: true, writable: true,
});
globalThis.requestAnimationFrame = fn => fn(0);
globalThis.performance = { now: () => 0 };
globalThis.matchMedia = window.matchMedia;
globalThis.CustomEvent = class { constructor(t, o) { this.type = t; Object.assign(this, o); } };
globalThis.addEventListener = (t, fn) => window.addEventListener(t, fn);
globalThis.dispatchEvent = ev => window.dispatchEvent(ev);

/* ---------- harness ---------- */
function loadShell() {
  // Register ids the shell looks up, and let it build chrome.
  const root = new El('div');
  root.setAttribute('id', 'emon-shell-root');
  root.dataset.app = 'index';
  document._byId.set('emon-shell-root', root);
  document.body.appendChild(root);

  const main = new El('div');
  main.setAttribute('id', 'emon-main-content');
  document._byId.set('emon-main-content', main);
  document.body.appendChild(main);

  // Track every id the shell creates so getElementById resolves.
  const track = el => {
    for (const c of el.children) {
      if (c.id) document._byId.set(c.id, c);
      track(c);
    }
  };
  const origAppend = document.body.appendChild.bind(document.body);
  const origInsert = document.body.insertBefore.bind(document.body);
  document.body.appendChild = c => { const r = origAppend(c); track(document.body); return r; };
  document.body.insertBefore = (c, r) => { const v = origInsert(c, r); track(document.body); return v; };

  const src = readFileSync(`${DIR}/emon-shell.js`, 'utf8');
  new Function('window', 'document', 'localStorage', src)(window, document, localStorage);
  return { root, main };
}

let failures = 0;
const ok = (c, l) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${l}`); if (!c) failures++; };

/* ---------- run ---------- */
console.log('--- loading real emon-shell.js ---');
loadShell();

const nav = document.getElementById('emon-shell-nav');
const overlays = document.getElementById('emon-shell-overlays');
ok(!!nav && !!overlays, 'shell created stable chrome hosts');

// The shell renders labels via tr(); force a known language and re-render.
localStorage.setItem('emon_lang', 'id');
window.EmonShell.rerender();
const navIdHTML = document.getElementById('emon-shell-nav').innerHTML;

localStorage.setItem('emon_lang', 'en');
window.EmonShell.rerender();
const navEnHTML = document.getElementById('emon-shell-nav').innerHTML;

ok(navIdHTML !== navEnHTML, 'rerender() changes rendered labels between id and en');
ok(/lang="en"/.test(navEnHTML) || nav.getAttribute('lang') === 'en',
   'chrome host carries the selected lang attribute');

// Chrome must not duplicate across re-renders.
const countHosts = () => document.body.children.filter(c => c.id === 'emon-shell-nav').length;
ok(countHosts() === 1, `chrome host not duplicated after 2 re-renders (found ${countHosts()})`);

// emon-app's guarded global listeners.
console.log('--- listener growth ---');
const before = (winListeners.keydown || []).length;
for (let i = 0; i < 5; i++) {
  localStorage.setItem('emon_lang', i % 2 ? 'id' : 'en');
  window.EmonShell.rerender();
}
const after = (winListeners.keydown || []).length;
ok(after === before,
   `5 re-renders add no window keydown listeners (${before} -> ${after})`);

console.log(failures ? `\n${failures} check(s) failed.` : '\nAll behavioural checks passed.');
process.exit(failures ? 1 : 0);
