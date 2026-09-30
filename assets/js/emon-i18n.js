/**
 * Emon Material Admin — Language state (emon-i18n.js)
 *
 * Owns the active language and broadcasts changes. Zero dependencies.
 *
 * The application's strings live with the components that render them: the
 * shell keeps its own { id, en } table (EmonShell.NAV) and resolves labels
 * through tr(). This module deliberately does NOT carry a second, parallel
 * translation table — an earlier revision shipped 184 unused keys here while
 * every real label came from the shell, which meant two sources of truth that
 * silently drifted and could not be reasoned about together.
 *
 * To translate a new string, put { id, en } on the owning component and render
 * it through tr(). To translate authored page content, add data-i18n="key" and
 * register the string in DICTIONARY below — that path exists for markup, and
 * is currently unused.
 *
 * Usage:
 *   EmonI18n.setLang('en')
 *   EmonI18n.t('some.key')
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'emon_lang';
  const DEFAULT_LANG = 'id';
  const SUPPORTED = ['id', 'en'];

  // Strings for authored page content, keyed by data-i18n name.
  // Empty by design: all current UI strings are owned by the shell.
  const DICTIONARY = {
    id: {},
    en: {}
  };

  function stored() {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      return SUPPORTED.includes(v) ? v : DEFAULT_LANG;
    } catch (e) {
      return DEFAULT_LANG;
    }
  }

  const EmonI18n = {
    lang: stored(),
    available() { return SUPPORTED.slice(); },
    locales: DICTIONARY,

    /**
     * Resolve a dotted key from DICTIONARY for the active language.
     * Falls back to the key itself so missing strings are visible, not blank.
     */
    t(key, fallback) {
      const table = DICTIONARY[this.lang] || {};
      let val = table;
      for (const part of String(key).split('.')) {
        if (!val || typeof val !== 'object') return fallback || key;
        val = val[part];
      }
      return (val && typeof val === 'string') ? val : (fallback || key);
    },

    /** Switch language; the shell listens for emon-lang-changed to re-render. */
    setLang(lang) {
      if (!SUPPORTED.includes(lang)) return;
      this.lang = lang;
      try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* private mode */ }
      this.render();
      window.dispatchEvent(new CustomEvent('emon-lang-changed', { detail: { lang } }));
      if (window.EmonToast) EmonToast.info(`Bahasa diubah ke ${lang.toUpperCase()}`);
    },

    /** Apply DICTIONARY strings to authored [data-i18n] markup, if present. */
    render() {
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        const translated = this.t(key);
        if (translated && translated !== key) el.textContent = translated;
      });
    }
  };

  window.EmonI18n = EmonI18n;
})();
