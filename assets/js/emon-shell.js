/**
 * Emon Material Admin — Unified Application Shell (emon-shell.js)
 * Enterprise-grade, single-source-of-truth navigation shell.
 *
 * Replaces the per-page duplicated sidebar/header/footer/modals with one
 * injected, config-driven shell. Active item is derived from the
 * `data-app` attribute on `#emon-shell-root` (fallback: current path).
 *
 * Load AFTER emon-theme.js / emon-i18n.js and BEFORE emon-app.js so that
 * emon-app's DOMContentLoaded bindings (drawer, notifications, quick
 * action, command palette) attach to the injected DOM.
 */

(function () {
  'use strict';

  const DEFAULT_LANG = 'id';
  const SFX = ['href', 'key', 'icon', 'desc'];

  const NAV = [
    {
      section: { id: 'Dashboards', en: 'Dashboards' },
      items: [
        { key: 'index', href: 'index.html', icon: 'grid_view', label: { id: 'Executive Hub', en: 'Executive Hub' }, desc: { id: 'Ringkasan eksekutif, KPI & telemetri', en: 'Executive KPIs & telemetry' } },
        { key: 'ecommerce', href: 'ecommerce.html', icon: 'storefront', label: { id: 'E-Commerce', en: 'E-Commerce' }, desc: { id: 'Analisis penjualan & toko', en: 'Sales & store analytics' } },
        { key: 'analytics', href: 'analytics.html', icon: 'insights', label: { id: 'Analytics & Data', en: 'Analytics & Data' }, desc: { id: 'Laporan metrik dan analisis', en: 'Metric and analysis reports' } },
        { key: 'reports', href: 'reports.html', icon: 'summarize', label: { id: 'Laporan', en: 'Reports' }, desc: { id: 'Laporan operasional dan cetak', en: 'Operational & printable reports' } }
      ]
    },
    {
      section: { id: 'Applications', en: 'Applications' },
      items: [
        { key: 'chat', href: 'chat.html', icon: 'chat', label: { id: 'Chat & Pesan', en: 'Chat & Messages' }, desc: { id: 'Percakapan dan pesan tim', en: 'Team conversations' } },
        { key: 'calendar', href: 'calendar.html', icon: 'calendar_month', label: { id: 'Kalender', en: 'Calendar' }, desc: { id: 'Jadwal dan agenda', en: 'Schedule and agenda' } },
        { key: 'taskboard', href: 'taskboard.html', icon: 'view_kanban', label: { id: 'Taskboard', en: 'Taskboard' }, desc: { id: 'Kanban manajemen tugas', en: 'Kanban task management' } },
        { key: 'pos', href: 'pos.html', icon: 'point_of_sale', label: { id: 'Kasir / POS', en: 'Point of Sale' }, desc: { id: 'Transaksi kasir cepat', en: 'Fast cashier transactions' } }
      ]
    },
    {
      section: { id: 'E-Commerce', en: 'E-Commerce' },
      items: [
        { key: 'products', href: 'products.html', icon: 'inventory_2', label: { id: 'Katalog Produk', en: 'Product Catalog' }, desc: { id: 'Kelola stok dan produk', en: 'Manage inventory & products' } },
        { key: 'orders', href: 'orders.html', icon: 'receipt_long', label: { id: 'Pesanan & Sales', en: 'Orders & Sales' }, desc: { id: 'Daftar transaksi dan settlement', en: 'Transactions & settlements' } },
        { key: 'customers', href: 'customers.html', icon: 'group', label: { id: 'Pelanggan', en: 'Customers' }, desc: { id: 'Direktori dan segmen pelanggan', en: 'Customer directory & segments' } },
        { key: 'pricing', href: 'pricing.html', icon: 'sell', label: { id: 'Paket Harga', en: 'Pricing Plans' }, desc: { id: 'Paket layanan dan tarif', en: 'Service plans & pricing' } }
      ]
    },
    {
      section: { id: 'Halaman & Akun', en: 'Pages & Account' },
      items: [
        { key: 'profile', href: 'profile.html', icon: 'badge', label: { id: 'Profil User', en: 'User Profile' }, desc: { id: 'Profil dan preferensi akun', en: 'Profile & account preferences' } },
        { key: 'timeline', href: 'timeline.html', icon: 'timeline', label: { id: 'Timeline Aktivitas', en: 'Activity Timeline' }, desc: { id: 'Riwayat aktivitas sistem', en: 'System activity history' } },
        { key: 'notifications', href: 'notifications.html', icon: 'notifications', label: { id: 'Notifikasi', en: 'Notifications' }, desc: { id: 'Pusat notifikasi dan alarm', en: 'Notification & alert center' } },
        { key: 'data-import', href: 'data-import.html', icon: 'upload_file', label: { id: 'Import Data', en: 'Import Data' }, desc: { id: 'Impor dan migrasi data', en: 'Data import & migration' } },
        { key: 'blank', href: 'blank.html', icon: 'draft', label: { id: 'Blank Page', en: 'Blank Page' }, desc: { id: 'Halaman kosong sebagai template', en: 'Empty canvas template' } },
        { key: 'lockscreen', href: 'lockscreen.html', icon: 'lock', label: { id: 'Lockscreen', en: 'Lockscreen' }, desc: { id: 'Kunci sesi kerja', en: 'Session lock screen' } },
        { key: 'settings', href: 'settings.html', icon: 'settings', label: { id: 'Settings', en: 'Settings' }, desc: { id: 'Konfigurasi sistem dan tema', en: 'System & theme config' } }
      ]
    },
    {
      section: { id: 'UI & Widgets', en: 'UI & Widgets' },
      items: [
        { key: 'widgets', href: 'widgets.html', icon: 'widgets', label: { id: 'Live Tiles & Widgets', en: 'Live Tiles & Widgets' }, desc: { id: 'Komponen tile dan widget live', en: 'Live tile & widget gallery' } },
        { key: 'components', href: 'components.html', icon: 'category', label: { id: 'Komponen UI', en: 'UI Components' }, desc: { id: 'Katalog tombol, form, badge', en: 'Buttons, forms, badges catalog' } }
      ]
    }
  ];

  // Palette-only quick actions (not part of sidebar)
  const QUICK_ACTIONS = [
    { label: { id: 'Buka Theme Customizer', en: 'Open Theme Customizer' }, desc: { id: 'Sesuaikan warna, radius & mode', en: 'Tune color, radius & mode' }, icon: 'palette', run: 'customizer' },
    { label: { id: 'Toggle Dark / Light Mode', en: 'Toggle Dark / Light Mode' }, desc: { id: 'Ganti skema warna cepat', en: 'Switch color scheme' }, icon: 'contrast', run: 'mode' },
    { label: { id: 'Ekspor Tabel ke CSV', en: 'Export Table to CSV' }, desc: { id: 'Unduh tabel aktif sebagai CSV', en: 'Download active table as CSV' }, icon: 'file_download', run: 'csv' },
    { label: { id: 'Ekspor Tabel ke JSON', en: 'Export Table to JSON' }, desc: { id: 'Unduh tabel aktif sebagai JSON', en: 'Download active table as JSON' }, icon: 'data_object', run: 'json' },
    { label: { id: 'Buat Entri Baru', en: 'Create New Entry' }, desc: { id: 'Buka formulir entri cepat', en: 'Open quick entry form' }, icon: 'add_circle', run: 'quick' },
    { label: { id: 'Cetak Halaman', en: 'Print Page' }, desc: { id: 'Cetak halaman saat ini', en: 'Print the current page' }, icon: 'print', run: 'print' }
  ];

  const NOTIFICATIONS = [
    { icon: 'check_circle', tone: 'secondary', text: { id: 'Sinkronisasi Database Sukses', en: 'Database Sync Successful' }, sub: { id: 'Database lokal offline berhasil disinkronkan.', en: 'Local offline database synced.' } },
    { icon: 'warning', tone: 'warning', text: { id: 'Peringatan Utilisasi NVMe', en: 'NVMe Utilization Warning' }, sub: { id: 'Kapasitas cluster penyimpanan mencapai 64%.', en: 'Storage cluster reached 64% capacity.' } },
    { icon: 'error', tone: 'error', text: { id: 'Sertifikat Segera Kedaluwarsa', en: 'Certificate Expiring Soon' }, sub: { id: 'TLS wildcard valid hingga 12 hari lagi.', en: 'Wildcard TLS valid for 12 more days.' } }
  ];

  const STORAGE_LANG_KEY = 'emon_lang';

  // Single source of truth for the version string, so the sidebar badge, the
  // exported API and package.json cannot drift apart.
  const VERSION = '3.5';

  // Assigned by initPalette(); no-op until the palette exists.
  let resetPaletteFilter = () => {};

  function detectLang() {
    try { return localStorage.getItem(STORAGE_LANG_KEY) || DEFAULT_LANG; } catch (e) { return DEFAULT_LANG; }
  }

  function tr(obj) {
    if (!obj || typeof obj !== 'object') return '';
    const lang = detectLang();
    return obj[lang] || obj[DEFAULT_LANG] || '';
  }

  function activeKey() {
    const root = document.getElementById('emon-shell-root');
    if (root && root.dataset.app) return root.dataset.app;
    const file = (window.location.pathname.split('/').pop() || 'index.html').replace(/\.html$/, '');
    return file || 'index';
  }

  function renderSidebar(active) {
    const sections = NAV.map(sec => `
      <div>
        <p class="sidebar-section-title px-space-sm py-1 text-[11px] font-bold uppercase tracking-wider text-outline">${tr(sec.section)}</p>
        <nav class="flex flex-col gap-1 mt-1" aria-label="${tr(sec.section)}">
          ${sec.items.map(item => {
            const isActive = item.key === active;
            return `
            <a href="${item.href}" class="sidebar-nav-item flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${isActive ? 'bg-primary text-on-primary font-semibold text-xs shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-medium text-xs'}" data-label="${tr(item.label)}" ${isActive ? 'aria-current="page"' : ''}>
              <span class="material-symbols-outlined text-[18px] shrink-0" aria-hidden="true">${item.icon}</span>
              <span class="sidebar-label truncate">${tr(item.label)}</span>
            </a>`;
          }).join('')}
        </nav>
      </div>
    `).join('');

    return `
      <aside id="emon-sidebar" class="fixed left-0 top-0 h-full w-64 bg-surface-container-low z-[45] flex flex-col justify-between shadow-sm border-r border-outline-variant/30 transform -translate-x-full lg:translate-x-0" aria-label="Sidebar navigation">
        <div class="flex flex-col">
          <div class="h-16 flex items-center px-space-lg bg-surface-container-low border-b border-outline-variant/20 sidebar-brand-row">
            <a href="index.html" class="flex items-center gap-2 overflow-hidden shrink-0" aria-label="Emon Material Admin Home">
              <img src="./assets/images/emon-logo.svg" alt="Emon Material Admin" class="h-8 w-auto"/>
            </a>
            <button id="sidebar-collapse-btn" class="hidden lg:flex p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors sidebar-collapse-btn" onclick="window.EmonTheme && window.EmonTheme.toggleSidebar()" title="Toggle Sidebar Mini" aria-label="Collapse sidebar" aria-expanded="true" aria-controls="emon-sidebar">
              <span class="material-symbols-outlined text-[18px]" aria-hidden="true">menu_open</span>
            </button>
          </div>

          <div class="px-space-md py-space-sm overflow-y-auto space-y-3 sidebar-scroll">
            ${sections}
          </div>
        </div>

        <div class="p-space-md bg-surface-container-low border-t border-outline-variant/20">
          <div class="flex items-center justify-between px-space-sm py-2 bg-surface-container rounded-lg">
            <div class="flex items-center gap-2 overflow-hidden">
              <span class="h-2.5 w-2.5 rounded-full bg-secondary shrink-0 animate-pulse"></span>
              <span class="sidebar-label text-xs font-semibold text-on-surface truncate">Emon <span class="sidebar-version">v${VERSION}</span> Offline</span>
            </div>
            <button data-action="toggle-customizer" class="text-outline hover:text-primary transition-colors shrink-0" title="Kustomisasi Tema" aria-label="Customize theme">
              <span class="material-symbols-outlined text-[18px]" aria-hidden="true">palette</span>
            </button>
          </div>
        </div>
      </aside>
    `;
  }

  function renderHeader() {
    return `
      <header id="emon-header" class="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/30 z-50 flex items-center justify-between px-space-md lg:px-margin">
        <div class="emon-scroll-progress" aria-hidden="true"><span id="emon-scroll-progress-bar"></span></div>
        <div class="flex items-center gap-3 max-w-md w-full">
          <button id="emon-sidebar-toggle" class="lg:hidden p-2 rounded-lg text-on-surface hover:bg-surface-container transition-colors" aria-label="Toggle navigation">
            <span class="material-symbols-outlined text-[22px]">menu</span>
          </button>

          <div class="search-trigger relative w-full flex items-center cursor-pointer" role="button" aria-haspopup="dialog" aria-label="Open command palette">
            <span class="material-symbols-outlined absolute left-3 text-outline text-[20px] pointer-events-none">search</span>
            <input class="w-full h-10 pl-10 pr-12 rounded-full bg-surface-container-low text-on-surface placeholder:text-outline text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer" placeholder="Search modules, ledger, commands... (Ctrl+K)" type="text" readonly aria-readonly="true"/>
            <span class="absolute right-3 px-1.5 py-0.5 rounded bg-surface-container text-[11px] font-mono font-semibold text-outline">⌘K</span>
          </div>
        </div>

        <div class="flex items-center gap-2 sm:gap-3">
          <button id="btn-quick-action" class="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-primary-fixed text-primary font-semibold text-xs hover:bg-primary hover:text-on-primary transition-all" type="button">
            <span class="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Quick Action</span>
          </button>

          <button data-action="toggle-mode" class="p-2 rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors" title="Toggle Dark/Light Mode" aria-label="Toggle dark or light mode">
            <span class="material-symbols-outlined text-[20px]">contrast</span>
          </button>

          <div class="relative">
            <button id="btn-notifications" class="relative p-2 rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors" type="button" aria-label="Notifications">
              <span class="material-symbols-outlined text-[20px]">notifications</span>
              <span id="notif-dot" class="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-error ring-hard-edge"></span>
            </button>

            <div id="dropdown-notifications" class="hidden absolute right-0 mt-2 w-80 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/30 py-2 z-50">
              <div class="px-4 py-2 border-b border-outline-variant/20 flex items-center justify-between">
                <span class="font-bold text-sm text-on-surface">Notifikasi</span>
                <button id="notif-mark-read" class="text-xs text-primary font-semibold hover:underline cursor-pointer">Tandai Dibaca</button>
              </div>
              <div class="divide-y divide-outline-variant/10 max-h-64 overflow-y-auto">
                ${NOTIFICATIONS.map(n => `
                <div class="p-3 hover:bg-surface-container-low transition-colors flex items-start gap-2.5 cursor-pointer">
                  <span class="material-symbols-outlined text-${n.tone} text-[20px] shrink-0 mt-0.5">${n.icon}</span>
                  <div>
                    <p class="text-xs font-semibold text-on-surface">${tr(n.text)}</p>
                    <p class="text-[11px] text-outline">${tr(n.sub)}</p>
                  </div>
                </div>`).join('')}
              </div>
              <div class="px-4 py-2 border-t border-outline-variant/20 text-center">
                <a href="notifications.html" class="text-xs font-semibold text-primary hover:underline">Lihat Semua Notifikasi →</a>
              </div>
            </div>
          </div>

          <a href="settings.html" class="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full bg-surface-container-low hover:bg-surface-container transition-colors" aria-label="Account settings">
            <img src="./assets/images/avatars/user-admin.svg" alt="Admin Avatar" class="w-7 h-7 rounded-full object-cover"/>
            <span class="hidden md:inline font-semibold text-xs text-on-surface">Edward T.</span>
          </a>
        </div>
      </header>
    `;
  }

  function renderFooter() {
    return `
      <footer class="mt-auto py-6 px-margin border-t border-outline-variant/20 bg-surface-container-lowest/50 text-xs text-outline flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
        <div class="flex items-center gap-2">
          <span class="font-semibold text-on-surface">Emon Material Admin</span>
          <span>&bull;</span>
          <span>Offline-First Enterprise Dashboard Theme</span>
        </div>
        <div>
          <span>Desain sintetis Microsoft Metro &amp; Google Material 3</span>
        </div>
      </footer>
    `;
  }

  function renderCommandPalette(active) {
    const uniq = [];
    NAV.forEach(sec => sec.items.forEach(item => {
      if (item.key === active) return;
      uniq.push({ href: item.href, icon: item.icon, label: tr(item.label), desc: tr(item.desc), tone: 'on-surface-variant' });
    }));

    return `
      <div id="command-palette-modal" class="hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 items-start justify-center pt-20 px-4" role="dialog" aria-modal="true" aria-label="Command palette">
        <div class="w-full max-w-xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 overflow-hidden">
          <div class="p-4 border-b border-outline-variant/20 flex items-center gap-3">
            <span class="material-symbols-outlined text-outline text-[22px]">search</span>
            <input id="palette-input" class="w-full bg-transparent text-on-surface text-base outline-none placeholder:text-outline" placeholder="Ketik perintah atau cari menu..." type="text" autocomplete="off"/>
            <button class="palette-close p-1 rounded-lg text-outline hover:text-on-surface" aria-label="Close palette">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          <div id="palette-results" class="p-3 max-h-80 overflow-y-auto flex flex-col gap-1">
            ${uniq.map((r, i) => `
              <a href="${r.href}" class="emon-palette-result flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-container-low transition-colors text-sm text-on-surface" data-index="${i}">
                <span class="material-symbols-outlined text-primary text-[20px]">${r.icon}</span>
                <div class="flex flex-col min-w-0">
                  <span class="font-semibold truncate">${r.label}</span>
                  <span class="text-xs text-outline truncate">${r.desc || ''}</span>
                </div>
              </a>`).join('')}
            <div id="palette-quick" class="mt-1 border-t border-outline-variant/15 pt-1 flex flex-col gap-1">
              ${QUICK_ACTIONS.map((a, i) => `
                <button type="button" class="emon-palette-result emon-palette-action flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-container-low transition-colors text-sm text-on-surface text-left" data-index="${uniq.length + i}" data-run="${a.run}">
                  <span class="material-symbols-outlined text-secondary text-[20px]">${a.icon}</span>
                  <div class="flex flex-col min-w-0">
                    <span class="font-semibold truncate">${tr(a.label)}</span>
                    <span class="text-xs text-outline truncate">${tr(a.desc) || ''}</span>
                  </div>
                </button>`).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderQuickActionModal() {
    return `
      <div id="modal-quick-action" class="hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Quick action">
        <div class="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 overflow-hidden">
          <div class="p-5 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low">
            <h3 class="font-display font-bold text-base text-on-surface">Entri Cepat Baru</h3>
            <button class="modal-close text-outline hover:text-on-surface p-1 rounded-lg" aria-label="Close">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          <form class="p-5 flex flex-col gap-4" onsubmit="event.preventDefault(); var d=document.getElementById('modal-quick-action'); d.classList.add('hidden'); d.classList.remove('flex'); window.EmonTheme&&window.EmonTheme.showToast('Entri baru berhasil disimpan secara lokal!');">
            <div>
              <label class="block text-xs font-semibold text-outline uppercase tracking-wider mb-1.5">Nama Klien / Proyek</label>
              <input required class="emon-input w-full" placeholder="contoh: PT Global Indo"/>
            </div>
            <div>
              <label class="block text-xs font-semibold text-outline uppercase tracking-wider mb-1.5">Tipe Lisensi / Paket</label>
              <select class="emon-input w-full">
                <option>Enterprise Dedicated (Z-12)</option>
                <option>API Pipeline Scale Tier 3</option>
                <option>Storage Cluster Pro</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-outline uppercase tracking-wider mb-1.5">Nominal Nilai ($)</label>
              <input required type="number" class="emon-input w-full" placeholder="15000"/>
            </div>
            <div class="flex items-center justify-end gap-2 pt-2">
              <button type="button" class="modal-close emon-btn emon-btn-ghost">Batal</button>
              <button type="submit" class="emon-btn emon-btn-primary">Simpan Entri</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  let scrollProgressBound = false;

  function initScrollProgress() {
    const bar = document.getElementById('emon-scroll-progress-bar');
    if (!bar) return;
    // The bar element is replaced on re-render, but the scroll listeners are
    // bound to the scroll target, which is not — so bind them only once and
    // have the handler look the bar up each time.
    if (scrollProgressBound) return;
    scrollProgressBound = true;
    const target = document.getElementById('emon-main-content') || document.documentElement;
    const onScroll = () => {
      // Look the bar up per call — a language switch replaces the node.
      const el0 = document.getElementById('emon-scroll-progress-bar');
      if (!el0) return;
      const scrollTop = (target.scrollTop != null && target.scrollTop > 0) ? target.scrollTop : (window.scrollY || 0);
      const el = target.scrollHeight ? target : document.documentElement;
      const max = el.scrollHeight - window.innerHeight || 1;
      const pct = Math.min(100, Math.max(0, (scrollTop / max) * 100));
      el0.style.width = pct + '%';
    };
    target.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  }

  function initPalette() {
    const modal = document.getElementById('command-palette-modal');
    if (!modal) return;
    const input = document.getElementById('palette-input');
    const results = document.getElementById('palette-results');
    const resultEls = Array.from(modal.querySelectorAll('.emon-palette-result'));
    let activeIdx = 0;

    function setActive(idx) {
      activeIdx = (idx + resultEls.length) % resultEls.length;
      resultEls.forEach(el => el.setAttribute('data-active', 'false'));
      const el = resultEls[activeIdx];
      if (el) {
        el.setAttribute('data-active', 'true');
        el.scrollIntoView({ block: 'nearest' });
      }
    }

    function goActive() {
      const el = resultEls[activeIdx];
      if (!el) return;
      if (el.dataset.run) {
        runAction(el.dataset.run);
        return;
      }
      if (el.tagName === 'A') { window.location.href = el.href; }
    }

    function filterResults() {
      const q = (input.value || '').toLowerCase().trim();
      resultEls.forEach(el => {
        const text = el.textContent.toLowerCase();
        el.style.display = (!q || text.includes(q)) ? '' : 'none';
      });
      const visible = resultEls.filter(el => el.style.display !== 'none');
      if (visible.length) setActive(resultEls.indexOf(visible[0]));
    }

    input.addEventListener('input', filterResults);
    input.addEventListener('keydown', (e) => {
      const visible = resultEls.filter(el => el.style.display !== 'none');
      if (!visible.length) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive(activeIdx + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(activeIdx - 1); }
      else if (e.key === 'Enter') { e.preventDefault(); goActive(); }
    });

    // emon-app's closePalette() clears the input programmatically, which fires
    // no `input` event — so the hidden rows would survive the next open. The
    // shell owns the filter state, so it exposes the reset for app to call.
    resetPaletteFilter = () => {
      if (input.value) input.value = '';
      filterResults();
    };

    // Initial active state
    setActive(0);
  }

  function runAction(run) {
    const modal = document.getElementById('command-palette-modal');
    const close = () => { if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); } };
    switch (run) {
      case 'mode':
        if (window.EmonTheme) window.EmonTheme.toggleMode();
        break;
      case 'customizer':
        if (window.EmonTheme) window.EmonTheme.toggleCustomizerDrawer(true);
        break;
      case 'csv':
        close();
        if (window.EmonDataGrid) window.EmonDataGrid.exportToCSV('table', 'export.csv');
        break;
      case 'json':
        close();
        if (window.EmonDataGrid) window.EmonDataGrid.exportToJSON('table', 'export.json');
        break;
      case 'quick':
        close();
        const qm = document.getElementById('modal-quick-action');
        if (qm) { qm.classList.remove('hidden'); qm.classList.add('flex'); }
        break;
      case 'print':
        close();
        window.print();
        break;
    }
    if (run !== 'csv' && run !== 'json' && run !== 'quick') close();
  }

  // Stable hosts for the shell chrome. Their innerHTML is re-rendered on a
  // language switch, so the host elements themselves must keep their identity
  // across renders.
  function inject() {
    const active = activeKey();
    const root = document.getElementById('emon-shell-root');
    if (!root) return;

    const frag = document.createElement('div');
    frag.innerHTML = `
      <a href="#emon-main-content" class="skip-link">Skip to main content</a>
      <div id="emon-shell-nav"></div>
      <div id="emon-shell-top"></div>
      <div id="emon-shell-overlays"></div>
    `;
    while (frag.firstChild) document.body.insertBefore(frag.firstChild, document.body.firstChild);

    renderChrome(active);

    // Footer goes at the end of the app main column (if present)
    const main = document.getElementById('emon-main-content');
    if (main && !main.querySelector('footer')) {
      const f = document.createElement('div');
      f.innerHTML = renderFooter();
      main.appendChild(f.firstChild);
    }

    bindShellBehaviour();
  }

  // Re-renders only the translated chrome, leaving the host nodes in place.
  function renderChrome(active) {
    const nav = document.getElementById('emon-shell-nav');
    const top = document.getElementById('emon-shell-top');
    const overlays = document.getElementById('emon-shell-overlays');

    // The chrome carries the selected language, but <html lang> must keep
    // describing the page body, which stays in its authored language.
    const lang = detectLang();
    [nav, top, overlays].forEach(el => { if (el) el.setAttribute('lang', lang); });

    if (nav) nav.innerHTML = renderSidebar(active);
    if (top) top.innerHTML = renderHeader();
    if (overlays) {
      overlays.innerHTML = renderCommandPalette(active) + renderQuickActionModal();
    }
  }

  // Attaches handlers to chrome that currently exists. Split from renderChrome
  // because a language switch replaces those nodes and the handlers must be
  // re-bound to the new ones.
  function bindShellBehaviour() {
    const markBtn = document.getElementById('notif-mark-read');
    if (markBtn) {
      markBtn.addEventListener('click', () => {
        const dot = document.getElementById('notif-dot');
        if (dot) dot.classList.add('hidden');
        if (window.EmonTheme) window.EmonTheme.showToast(tr({ id: 'Semua notifikasi ditandai dibaca.', en: 'All notifications marked as read.' }));
      });
    }

    initScrollProgress();
    if (modalExists('command-palette-modal')) initPalette();
  }

  // Re-render the chrome in the current language. Consumers that bound to the
  // previous nodes (emon-app's palette/notifications/quick-action handlers)
  // listen for `emon-shell-rerendered` to re-attach.
  function rerender() {
    if (!document.getElementById('emon-shell-root')) return;
    renderChrome(activeKey());
    bindShellBehaviour();
    window.dispatchEvent(new CustomEvent('emon-shell-rerendered'));
  }

  function modalExists(id) {
    return !!document.getElementById(id);
  }

  // Inject synchronously — runs during script parse (bottom of <body>)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }

  // Re-render the chrome when the language changes. emon-i18n's setLang()
  // fires this; without it the sidebar, header, palette and notification
  // labels stayed in the language chosen at page load.
  window.addEventListener('emon-lang-changed', rerender);

  window.EmonShell = {
    NAV,
    QUICK_ACTIONS,
    activeKey,
    resetPaletteFilter,
    rerender,
    version: VERSION
  };
})();