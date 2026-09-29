/**
 * Emon Material Admin - Theme Engine & Offline Customizer
 * Zero-dependency, offline-first Material 3 + Metro theme customizer
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'emon_material_admin_theme';

  const PRESETS = {
    classic: {
      name: 'Emon Classic Blue',
      primary: '#005bbf',
      primaryContainer: '#1a73e8',
      secondary: '#006b5f',
      tertiary: '#6833ea',
      swatch: '#005bbf'
    },
    indigo: {
      name: 'Modern Indigo',
      primary: '#4f46e5',
      primaryContainer: '#6366f1',
      secondary: '#06b6d4',
      tertiary: '#8b5cf6',
      swatch: '#4f46e5'
    },
    emerald: {
      name: 'Emerald Teal',
      primary: '#00897b',
      primaryContainer: '#00a896',
      secondary: '#2e7d32',
      tertiary: '#0284c7',
      swatch: '#00897b'
    },
    purple: {
      name: 'Royal Purple',
      primary: '#6833ea',
      primaryContainer: '#8155ff',
      secondary: '#00897b',
      tertiary: '#d97706',
      swatch: '#6833ea'
    },
    amber: {
      name: 'Metro Amber',
      primary: '#d97706',
      primaryContainer: '#f59e0b',
      secondary: '#00897b',
      tertiary: '#7c3aed',
      swatch: '#d97706'
    },
    rose: {
      name: 'Crimson Rose',
      primary: '#dc2626',
      primaryContainer: '#ef4444',
      secondary: '#006b5f',
      tertiary: '#9333ea',
      swatch: '#dc2626'
    },
    slate: {
      name: 'Cyber Slate',
      primary: '#2563eb',
      primaryContainer: '#3b82f6',
      secondary: '#059669',
      tertiary: '#8b5cf6',
      swatch: '#1e293b'
    }
  };

  const DEFAULT_CONFIG = {
    mode: 'light', // 'light' | 'dark' | 'system'
    preset: 'classic',
    primary: '#005bbf',
    primaryContainer: '#1a73e8',
    secondary: '#006b5f',
    tertiary: '#6833ea',
    radius: 'default', // 'sharp' (0px) | 'default' (8px) | 'smooth' (14px) | 'pill' (20px)
    density: 'normal',  // 'compact' | 'normal' | 'spacious'
    sidebarMini: false
  };

  // Helper: Hex color manipulation & contrast
  function getLuminance(hex) {
    if (!hex || hex.length < 6) return 0;
    const num = parseInt(hex.replace('#', ''), 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }

  function adjustHex(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, Math.max(0, (num >> 16) + amt));
    const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
    const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
  }

  function hexToRgba(hex, alpha) {
    const num = parseInt(hex.replace('#', ''), 16);
    const R = (num >> 16) & 255;
    const G = (num >> 8) & 255;
    const B = num & 255;
    return `rgba(${R}, ${G}, ${B}, ${alpha})`;
  }

  class ThemeManager {
    constructor() {
      this.config = this.loadConfig();
      this.init();
    }

    loadConfig() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? Object.assign({}, DEFAULT_CONFIG, JSON.parse(stored)) : Object.assign({}, DEFAULT_CONFIG);
      } catch (e) {
        console.warn('LocalStorage inaccessible, using default theme config', e);
        return Object.assign({}, DEFAULT_CONFIG);
      }
    }

    saveConfig() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
      } catch (e) {
        console.warn('Failed to save theme config', e);
      }
    }

    init() {
      // 1. Initial CSS Apply
      this.applyTheme(this.config, false);

      // 2. System mode listener
      if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
          if (this.config.mode === 'system') {
            this.applyTheme(this.config, false);
          }
        });
      }

      // 3. Render Customizer & Event Delegation on DOM Ready
      const onReady = () => {
        this.injectCustomizer();
        this.bindGlobalTriggers();
      };
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onReady);
      } else {
        onReady();
      }
    }

    bindGlobalTriggers() {
      document.addEventListener('click', (e) => {
        const customizerTrigger = e.target.closest('[data-action="toggle-customizer"], #emon-theme-toggle, .theme-customizer-trigger');
        if (customizerTrigger) {
          e.preventDefault();
          this.toggleCustomizerDrawer(true);
          return;
        }
        const modeTrigger = e.target.closest('[data-action="toggle-mode"], .mode-toggle-btn');
        if (modeTrigger) {
          e.preventDefault();
          this.toggleMode();
        }
      });
    }

    applyTheme(cfg, shouldSave = true) {
      this.config = Object.assign({}, this.config, cfg);
      const root = document.documentElement;
      const body = document.body;

      // Handle Dark Mode
      let isDark = false;
      if (this.config.mode === 'dark') {
        isDark = true;
      } else if (this.config.mode === 'system') {
        isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      root.classList.toggle('dark', isDark);
      root.setAttribute('data-mode', isDark ? 'dark' : 'light');
      root.setAttribute('data-theme', this.config.preset || 'classic');

      // Handle Colors
      root.style.setProperty('--primary', this.config.primary);
      root.style.setProperty('--primary-hover', adjustHex(this.config.primary, -15));
      root.style.setProperty('--primary-container', this.config.primaryContainer || this.config.primary);
      root.style.setProperty('--primary-fixed', hexToRgba(this.config.primary, 0.15));
      
      const onPrimary = getLuminance(this.config.primary) > 0.65 ? '#181c20' : '#ffffff';
      root.style.setProperty('--on-primary', onPrimary);

      root.style.setProperty('--secondary', this.config.secondary);
      root.style.setProperty('--secondary-fixed', hexToRgba(this.config.secondary, 0.15));
      root.style.setProperty('--tertiary', this.config.tertiary);
      root.style.setProperty('--tertiary-fixed', hexToRgba(this.config.tertiary, 0.15));

      // Handle Full Radii Scales
      const radiusScales = {
        sharp: { xs: '0px', sm: '0px', md: '0px', lg: '0px', xl: '0px' },
        default: { xs: '0.25rem', sm: '0.375rem', md: '0.5rem', lg: '0.75rem', xl: '1rem' },
        smooth: { xs: '0.375rem', sm: '0.5rem', md: '0.875rem', lg: '1.125rem', xl: '1.5rem' },
        pill: { xs: '0.5rem', sm: '0.75rem', md: '1.25rem', lg: '1.75rem', xl: '2rem' }
      };
      const rads = radiusScales[this.config.radius] || radiusScales.default;
      root.style.setProperty('--radius-xs', rads.xs);
      root.style.setProperty('--radius-sm', rads.sm);
      root.style.setProperty('--radius-md', rads.md);
      root.style.setProperty('--radius-lg', rads.lg);
      root.style.setProperty('--radius-xl', rads.xl);

      // Handle Sidebar Mini
      if (body) {
        if (this.config.sidebarMini) {
          body.classList.add('sidebar-mini');
        } else {
          body.classList.remove('sidebar-mini');
        }
      }

      // Handle Density
      const densityMap = {
        compact: { padding: '1rem', py: '0.5rem' },
        normal: { padding: '1.5rem', py: '0.875rem' },
        spacious: { padding: '2rem', py: '1.125rem' }
      };
      const den = densityMap[this.config.density] || densityMap.normal;
      root.style.setProperty('--density-padding', den.padding);
      root.style.setProperty('--density-table-py', den.py);

      // Synchronize UI inputs if customizer exists
      this.syncCustomizerUI();

      if (shouldSave) {
        this.saveConfig();
      }

      // Trigger custom event for reactive charts
      window.dispatchEvent(new CustomEvent('emon-theme-changed', { detail: this.config }));
    }

    toggleMode() {
      const isDark = document.documentElement.classList.contains('dark');
      this.setMode(isDark ? 'light' : 'dark');
    }

    setPreset(name) {
      if (!PRESETS[name]) return;
      const p = PRESETS[name];
      this.applyTheme({
        preset: name,
        primary: p.primary,
        primaryContainer: p.primaryContainer,
        secondary: p.secondary,
        tertiary: p.tertiary
      });
      this.showToast(`Preset "${p.name}" diterapkan.`);
    }

    setMode(mode) {
      this.applyTheme({ mode });
      this.showToast(`Mode tema diubah ke: ${mode.toUpperCase()}`);
    }

    setCustomColor(prop, hex) {
      const update = { preset: 'custom' };
      update[prop] = hex;
      if (prop === 'primary') {
        update.primaryContainer = adjustHex(hex, 10);
      }
      this.applyTheme(update);
    }

    setRadius(r) {
      this.applyTheme({ radius: r });
      this.showToast(`Border Radius: ${r}`);
    }

    setDensity(d) {
      this.applyTheme({ density: d });
      this.showToast(`Kerapatan Layout: ${d}`);
    }

    toggleSidebar() {
      this.applyTheme({ sidebarMini: !this.config.sidebarMini });
    }

    resetDefaults() {
      this.config = Object.assign({}, DEFAULT_CONFIG);
      this.applyTheme(this.config, true);
      this.showToast('Tema berhasil direset ke setelan awal.');
    }

    getCSSVariablesString() {
      return `:root {
  /* Emon Material Admin - Generated Theme Variables */
  --primary: ${this.config.primary};
  --primary-hover: ${adjustHex(this.config.primary, -15)};
  --primary-container: ${this.config.primaryContainer};
  --secondary: ${this.config.secondary};
  --tertiary: ${this.config.tertiary};
  --radius-md: ${this.config.radius === 'sharp' ? '0px' : this.config.radius === 'smooth' ? '0.875rem' : this.config.radius === 'pill' ? '1.25rem' : '0.5rem'};
}`;
    }

    copyCSS() {
      const css = this.getCSSVariablesString();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(css).then(() => {
          this.showToast('CSS Variables disalin ke clipboard!');
        }).catch(() => {
          this.fallbackCopy(css);
        });
      } else {
        this.fallbackCopy(css);
      }
    }

    fallbackCopy(text) {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      this.showToast('CSS Variables disalin ke clipboard!');
    }

    downloadJSON() {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.config, null, 2));
      const a = document.createElement('a');
      a.setAttribute('href', dataStr);
      a.setAttribute('download', 'emon-material-theme.json');
      document.body.appendChild(a);
      a.click();
      a.remove();
      this.showToast('File emon-material-theme.json berhasil diunduh.');
    }

    showToast(message, type = 'info') {
      let container = document.getElementById('toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
      }

      const toast = document.createElement('div');
      toast.className = 'toast-item flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-container-highest text-on-surface shadow-lg border border-outline/20 font-label-md text-sm';
      toast.innerHTML = `
        <span class="material-symbols-outlined text-[20px] text-primary">info</span>
        <span class="flex-1">${message}</span>
        <button class="text-outline hover:text-on-surface ml-2" onclick="this.parentElement.remove()">
          <span class="material-symbols-outlined text-[16px]">close</span>
        </button>
      `;
      container.appendChild(toast);

      setTimeout(() => {
        if (toast.parentElement) {
          toast.style.opacity = '0';
          toast.style.transform = 'translateY(10px)';
          toast.style.transition = 'all 0.2s ease';
          setTimeout(() => toast.remove(), 200);
        }
      }, 3500);
    }

    injectCustomizer() {
      if (document.getElementById('emon-customizer-drawer')) return;

      // 1. Floating Toggle Button
      const toggleBtn = document.createElement('button');
      toggleBtn.id = 'emon-customizer-toggle';
      toggleBtn.className = 'customizer-toggle-btn w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center';
      toggleBtn.title = 'Buka Theme Customizer Offline';
      toggleBtn.setAttribute('aria-label', 'Open Theme Customizer');
      toggleBtn.innerHTML = '<span class="material-symbols-outlined text-[24px]">palette</span>';
      toggleBtn.onclick = () => this.toggleCustomizerDrawer(true);
      document.body.appendChild(toggleBtn);

      // 2. Backdrop
      const backdrop = document.createElement('div');
      backdrop.id = 'emon-customizer-backdrop';
      backdrop.className = 'customizer-backdrop';
      backdrop.onclick = () => this.toggleCustomizerDrawer(false);
      document.body.appendChild(backdrop);

      // 3. Customizer Drawer Markup
      const drawer = document.createElement('aside');
      drawer.id = 'emon-customizer-drawer';
      drawer.className = 'customizer-drawer';
      drawer.innerHTML = `
        <div class="p-5 border-b border-outline/10 flex items-center justify-between bg-surface-container-low">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-[24px]">tune</span>
            <div>
              <h2 class="font-headline-md text-base font-bold text-on-surface">Emon Theme Customizer</h2>
              <p class="text-xs text-outline">Kustomisasi Dashboard 100% Offline</p>
            </div>
          </div>
          <button id="emon-customizer-close" class="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
          <!-- 1. Color Palette Presets -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-outline mb-2.5">Preset Warna Tema</label>
            <div class="grid grid-cols-6 gap-2" id="preset-swatches">
              ${Object.entries(PRESETS).map(([key, val]) => `
                <button type="button" class="palette-swatch ${this.config.preset === key ? 'active' : ''}" 
                  style="background-color: ${val.swatch};" 
                  title="${val.name}" 
                  data-preset="${key}">
                </button>
              `).join('')}
            </div>
          </div>

          <!-- 2. Custom Hex Pickers -->
          <div class="p-3.5 rounded-xl bg-surface-container-low flex flex-col gap-3">
            <span class="text-xs font-semibold text-on-surface">Warna Kustom (Hex)</span>
            <div class="flex items-center justify-between">
              <span class="text-xs text-outline">Primary Accent</span>
              <div class="flex items-center gap-2">
                <input type="color" id="picker-primary" class="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0" value="${this.config.primary}">
                <span id="label-primary" class="text-xs font-mono font-semibold text-on-surface uppercase">${this.config.primary}</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-outline">Secondary Accent</span>
              <div class="flex items-center gap-2">
                <input type="color" id="picker-secondary" class="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0" value="${this.config.secondary}">
                <span id="label-secondary" class="text-xs font-mono font-semibold text-on-surface uppercase">${this.config.secondary}</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-outline">Tertiary Accent</span>
              <div class="flex items-center gap-2">
                <input type="color" id="picker-tertiary" class="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0" value="${this.config.tertiary}">
                <span id="label-tertiary" class="text-xs font-mono font-semibold text-on-surface uppercase">${this.config.tertiary}</span>
              </div>
            </div>
          </div>

          <!-- 3. Dark / Light Mode -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-outline mb-2">Mode Tampilan</label>
            <div class="grid grid-cols-3 gap-1.5 p-1 bg-surface-container rounded-xl text-center">
              <button type="button" class="mode-btn py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${this.config.mode === 'light' ? 'bg-surface-container-lowest text-primary shadow-xs' : 'text-outline hover:text-on-surface'}" data-mode="light">
                Light
              </button>
              <button type="button" class="mode-btn py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${this.config.mode === 'dark' ? 'bg-surface-container-lowest text-primary shadow-xs' : 'text-outline hover:text-on-surface'}" data-mode="dark">
                Dark
              </button>
              <button type="button" class="mode-btn py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${this.config.mode === 'system' ? 'bg-surface-container-lowest text-primary shadow-xs' : 'text-outline hover:text-on-surface'}" data-mode="system">
                Auto
              </button>
            </div>
          </div>

          <!-- 4. Corner Radius -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-outline mb-2">Border Radius (Kelengkungan)</label>
            <div class="grid grid-cols-4 gap-1.5 p-1 bg-surface-container rounded-xl text-center">
              <button type="button" class="radius-btn py-1.5 rounded-lg text-xs font-semibold transition-all ${this.config.radius === 'sharp' ? 'bg-surface-container-lowest text-primary shadow-xs' : 'text-outline hover:text-on-surface'}" data-radius="sharp">
                Sharp (0)
              </button>
              <button type="button" class="radius-btn py-1.5 rounded-lg text-xs font-semibold transition-all ${this.config.radius === 'default' ? 'bg-surface-container-lowest text-primary shadow-xs' : 'text-outline hover:text-on-surface'}" data-radius="default">
                Normal (8)
              </button>
              <button type="button" class="radius-btn py-1.5 rounded-lg text-xs font-semibold transition-all ${this.config.radius === 'smooth' ? 'bg-surface-container-lowest text-primary shadow-xs' : 'text-outline hover:text-on-surface'}" data-radius="smooth">
                Soft (14)
              </button>
              <button type="button" class="radius-btn py-1.5 rounded-lg text-xs font-semibold transition-all ${this.config.radius === 'pill' ? 'bg-surface-container-lowest text-primary shadow-xs' : 'text-outline hover:text-on-surface'}" data-radius="pill">
                Pill (20)
              </button>
            </div>
          </div>

          <!-- 5. Density & Sidebar Controls -->
          <div class="flex flex-col gap-3">
            <div class="flex items-center justify-between p-3 rounded-xl bg-surface-container-low">
              <div>
                <span class="text-xs font-semibold text-on-surface block">Sidebar Mini / Icon Mode</span>
                <span class="text-[11px] text-outline">Kompensasi ruang layar lebar</span>
              </div>
              <input type="checkbox" id="check-sidebar-mini" class="w-5 h-5 rounded cursor-pointer accent-primary" ${this.config.sidebarMini ? 'checked' : ''}>
            </div>
          </div>
        </div>

        <!-- Customizer Footer Actions -->
        <div class="p-4 border-t border-outline/10 bg-surface-container-low flex flex-col gap-2">
          <div class="grid grid-cols-3 gap-1.5">
            <button type="button" id="btn-copy-css" class="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-md text-xs font-semibold shadow-xs transition-colors">
              <span class="material-symbols-outlined text-[15px] text-primary">content_copy</span>
              <span>CSS</span>
            </button>
            <button type="button" id="btn-export-json" class="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-md text-xs font-semibold shadow-xs transition-colors">
              <span class="material-symbols-outlined text-[15px] text-secondary">download</span>
              <span>JSON</span>
            </button>
            <button type="button" id="btn-share-url" class="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-md text-xs font-semibold shadow-xs transition-colors">
              <span class="material-symbols-outlined text-[15px] text-tertiary">share</span>
              <span>Bagikan</span>
            </button>
          </div>
          <button type="button" id="btn-reset-theme" class="w-full py-2 px-3 rounded-xl text-outline hover:text-error text-xs font-medium transition-colors flex items-center justify-center gap-1">
            <span class="material-symbols-outlined text-[16px]">restart_alt</span>
            <span>Reset ke Default</span>
          </button>
        </div>
      `;

      document.body.appendChild(drawer);
      this.attachCustomizerEvents();
    }

    attachCustomizerEvents() {
      // Close button
      const closeBtn = document.getElementById('emon-customizer-close');
      if (closeBtn) closeBtn.onclick = () => this.toggleCustomizerDrawer(false);

      // Preset buttons
      const presetBtns = document.querySelectorAll('#preset-swatches button');
      presetBtns.forEach(btn => {
        btn.onclick = () => this.setPreset(btn.dataset.preset);
      });

      // Custom color pickers
      const primaryInput = document.getElementById('picker-primary');
      if (primaryInput) {
        primaryInput.oninput = (e) => {
          this.setCustomColor('primary', e.target.value);
          const lbl = document.getElementById('label-primary');
          if (lbl) lbl.textContent = e.target.value.toUpperCase();
        };
      }

      const secondaryInput = document.getElementById('picker-secondary');
      if (secondaryInput) {
        secondaryInput.oninput = (e) => {
          this.setCustomColor('secondary', e.target.value);
          const lbl = document.getElementById('label-secondary');
          if (lbl) lbl.textContent = e.target.value.toUpperCase();
        };
      }

      const tertiaryInput = document.getElementById('picker-tertiary');
      if (tertiaryInput) {
        tertiaryInput.oninput = (e) => {
          this.setCustomColor('tertiary', e.target.value);
          const lbl = document.getElementById('label-tertiary');
          if (lbl) lbl.textContent = e.target.value.toUpperCase();
        };
      }

      // Mode buttons
      const modeBtns = document.querySelectorAll('.mode-btn');
      modeBtns.forEach(btn => {
        btn.onclick = () => this.setMode(btn.dataset.mode);
      });

      // Radius buttons
      const radBtns = document.querySelectorAll('.radius-btn');
      radBtns.forEach(btn => {
        btn.onclick = () => this.setRadius(btn.dataset.radius);
      });

      // Sidebar Mini toggle
      const sidebarMiniCheck = document.getElementById('check-sidebar-mini');
      if (sidebarMiniCheck) {
        sidebarMiniCheck.onchange = (e) => {
          this.applyTheme({ sidebarMini: e.target.checked });
        };
      }

      // Export / Copy / Reset
      const copyBtn = document.getElementById('btn-copy-css');
      if (copyBtn) copyBtn.onclick = () => this.copyCSS();

      const exportBtn = document.getElementById('btn-export-json');
      if (exportBtn) exportBtn.onclick = () => this.downloadJSON();

      const shareBtn = document.getElementById('btn-share-url');
      if (shareBtn) shareBtn.onclick = () => window.EmonShareTheme && window.EmonShareTheme();

      const resetBtn = document.getElementById('btn-reset-theme');
      if (resetBtn) resetBtn.onclick = () => this.resetDefaults();
    }

    syncCustomizerUI() {
      // Swatches active class
      const swatches = document.querySelectorAll('#preset-swatches button');
      swatches.forEach(s => {
        if (s.dataset.preset === this.config.preset) {
          s.classList.add('active');
        } else {
          s.classList.remove('active');
        }
      });

      // Color inputs
      const pIn = document.getElementById('picker-primary');
      if (pIn) pIn.value = this.config.primary;
      const pLbl = document.getElementById('label-primary');
      if (pLbl) pLbl.textContent = this.config.primary.toUpperCase();

      const sIn = document.getElementById('picker-secondary');
      if (sIn) sIn.value = this.config.secondary;
      const sLbl = document.getElementById('label-secondary');
      if (sLbl) sLbl.textContent = this.config.secondary.toUpperCase();

      const tIn = document.getElementById('picker-tertiary');
      if (tIn) tIn.value = this.config.tertiary;
      const tLbl = document.getElementById('label-tertiary');
      if (tLbl) tLbl.textContent = this.config.tertiary.toUpperCase();

      // Mode buttons
      const modeBtns = document.querySelectorAll('.mode-btn');
      modeBtns.forEach(b => {
        if (b.dataset.mode === this.config.mode) {
          b.className = 'mode-btn py-1.5 px-2 rounded-lg text-xs font-semibold transition-all bg-surface-container-lowest text-primary shadow-xs';
        } else {
          b.className = 'mode-btn py-1.5 px-2 rounded-lg text-xs font-semibold transition-all text-outline hover:text-on-surface';
        }
      });

      // Radius buttons
      const radBtns = document.querySelectorAll('.radius-btn');
      radBtns.forEach(b => {
        if (b.dataset.radius === this.config.radius) {
          b.className = 'radius-btn py-1.5 rounded-lg text-xs font-semibold transition-all bg-surface-container-lowest text-primary shadow-xs';
        } else {
          b.className = 'radius-btn py-1.5 rounded-lg text-xs font-semibold transition-all text-outline hover:text-on-surface';
        }
      });

      // Sidebar checkbox
      const miniCheck = document.getElementById('check-sidebar-mini');
      if (miniCheck) miniCheck.checked = !!this.config.sidebarMini;
    }

    toggleCustomizerDrawer(open) {
      const drawer = document.getElementById('emon-customizer-drawer');
      const backdrop = document.getElementById('emon-customizer-backdrop');
      if (!drawer || !backdrop) return;

      if (open) {
        drawer.classList.add('active');
        backdrop.classList.add('active');
      } else {
        drawer.classList.remove('active');
        backdrop.classList.remove('active');
      }
    }
  }

  // Instantiate globally
  window.EmonTheme = new ThemeManager();
})();
