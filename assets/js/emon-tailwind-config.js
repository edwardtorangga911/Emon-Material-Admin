/**
 * Emon Material Admin — Shared Tailwind registry (emon-tailwind-config.js)
 *
 * Loaded by every runtime-built page immediately after tailwind.js, so all of
 * them resolve the same set of theme tokens.
 *
 * This used to be an inline <script id="tailwind-config"> block duplicated into
 * each page, and the copies had drifted into eleven different variants — not
 * eleven formattings, eleven different token sets. Eight pages were therefore
 * referencing utilities their own registry never declared: Tailwind never
 * generated them, so the styling silently vanished with no error anywhere. One
 * page used on-secondary-fixed-variant six times without that token existing.
 *
 * The token list is the union of every variant that previously shipped, so no
 * page loses a utility it relied on. Values are all var() references, so the
 * live theme keeps driving the palette.
 */
(function () {
  'use strict';

  if (!window.tailwind) {
    console.warn('[emon] tailwind.js not loaded before emon-tailwind-config.js');
    return;
  }

  window.tailwind.config = {
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          primary: 'var(--primary)',
          'primary-hover': 'var(--primary-hover)',
          'primary-container': 'var(--primary-container)',
          'on-primary': 'var(--on-primary)',
          'primary-fixed': 'var(--primary-fixed)',
          'on-primary-fixed': 'var(--on-primary-fixed)',
          'primary-on-surface': 'var(--primary-on-surface)',
          secondary: 'var(--secondary)',
          'secondary-container': 'var(--secondary-container)',
          'on-secondary': 'var(--on-secondary)',
          'secondary-fixed': 'var(--secondary-fixed)',
          'on-secondary-fixed-variant': 'var(--on-secondary-container)',
          tertiary: 'var(--tertiary)',
          'tertiary-container': 'var(--tertiary-container)',
          'on-tertiary': 'var(--on-tertiary)',
          'tertiary-fixed': 'var(--tertiary-fixed)',
          surface: 'var(--surface)',
          'surface-dim': 'var(--surface-dim)',
          'surface-bright': 'var(--surface-bright)',
          'surface-variant': 'var(--surface-variant)',
          'surface-container-lowest': 'var(--surface-container-lowest)',
          'surface-container-low': 'var(--surface-container-low)',
          'surface-container': 'var(--surface-container)',
          'surface-container-high': 'var(--surface-container-high)',
          'surface-container-highest': 'var(--surface-container-highest)',
          'on-surface': 'var(--on-surface)',
          'on-surface-variant': 'var(--on-surface-variant)',
          background: 'var(--background)',
          'on-background': 'var(--on-background)',
          outline: 'var(--outline)',
          'outline-variant': 'var(--outline-variant)',
          error: 'var(--error)',
          'error-container': 'var(--error-container)',
          'on-error': 'var(--on-error)',
          'on-error-container': 'var(--on-error-container)',
          'error-on-surface': 'var(--error-on-surface)',
          warning: 'var(--warning)',
          'warning-container': 'var(--warning-container)',
          'on-warning': 'var(--on-warning)',
          'on-warning-container': 'var(--on-warning-container)',
          'warning-on-surface': 'var(--warning-on-surface)',
          success: 'var(--success)',
          'on-success': 'var(--on-success)'
        },
        borderRadius: {
          DEFAULT: 'var(--radius-md)',
          sm: 'var(--radius-xs)',
          md: 'var(--radius-sm)',
          lg: 'var(--radius-md)',
          xl: 'var(--radius-lg)',
          '2xl': 'var(--radius-xl)',
          full: 'var(--radius-full)'
        },
        spacing: {
          'space-xs': 'var(--space-xs)',
          'space-sm': 'var(--space-sm)',
          'space-md': 'var(--space-md)',
          'space-lg': 'var(--space-lg)',
          'space-xl': '2rem',
          margin: '1.5rem'
        },
        fontFamily: {
          display: ['var(--font-display)'],
          body: ['var(--font-body)'],
          sans: ['var(--font-sans)']
        }
      }
    }
  };
})();
