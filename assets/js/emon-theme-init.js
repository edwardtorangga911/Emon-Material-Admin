/**
 * Emon Material Admin - Anti-FOUC & Anti-Glitch Theme Initializer
 * Executes synchronously in <head> before page paint to prevent theme flash,
 * transition flicker, and layout shifts.
 */
(function () {
  'use strict';
  try {
    var root = document.documentElement;

    // 1. Temporarily suppress all transitions during initial parse & render
    root.classList.add('no-transitions');

    // 2. Read saved theme preferences from localStorage
    var raw = localStorage.getItem('emon_material_admin_theme');
    if (raw) {
      var cfg = JSON.parse(raw);

      // Mode detection (dark / light / system)
      var isDark = cfg.mode === 'dark' || (cfg.mode === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (isDark) {
        root.classList.add('dark');
        root.setAttribute('data-mode', 'dark');
      } else {
        root.classList.remove('dark');
        root.setAttribute('data-mode', 'light');
      }

      // Color preset
      if (cfg.preset) {
        root.setAttribute('data-theme', cfg.preset);
      }

      // Custom primary color
      if (cfg.primary) {
        root.style.setProperty('--primary', cfg.primary);
        if (cfg.primaryContainer) {
          root.style.setProperty('--primary-container', cfg.primaryContainer);
        }
        // Calculate contrast luminance for on-primary
        var hex = cfg.primary.replace('#', '');
        var num = parseInt(hex, 16);
        var r = (num >> 16) & 255;
        var g = (num >> 8) & 255;
        var b = num & 255;
        var lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        root.style.setProperty('--on-primary', lum > 0.65 ? '#181c20' : '#ffffff');
      }

      // Secondary & Tertiary
      if (cfg.secondary) root.style.setProperty('--secondary', cfg.secondary);
      if (cfg.tertiary) root.style.setProperty('--tertiary', cfg.tertiary);

      // Border radius scale
      if (cfg.radius) {
        var radiusScales = {
          sharp: '0px',
          default: '0.5rem',
          smooth: '0.875rem',
          pill: '1.25rem'
        };
        if (radiusScales[cfg.radius]) {
          root.style.setProperty('--radius-md', radiusScales[cfg.radius]);
        }
      }

      // Mini sidebar initial state
      if (cfg.sidebarMini && window.innerWidth >= 1024) {
        root.classList.add('sidebar-mini-init');
      }
    }
  } catch (e) {
    // Fail gracefully in restricted environments
  }
})();
