/**
 * Emon Material Admin - Global Application Logic & Data Grid Engine
 * Offline interactive components: Command Palette, Mobile Drawer,
 * Notifications, Quick Actions Modal, Table sorting, filtering & CSV/JSON export.
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    initServiceWorker();
    initSidebarMobile();
    initCommandPalette();
    initNotifications();
    initQuickActions();
    initTableFilters();
    initTableSorting();
    initDropdowns();
    initPagination();
    initScrollToTop();
    initKeyboardShortcuts();
    initThemeURLSharing();
    initA11y();
  });

  // 1. Service Worker Registration (PWA)
  function initServiceWorker() {
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then((reg) => {
            console.log('Emon SW registered:', reg.scope);
          })
          .catch((err) => {
            console.log('Emon SW registration skipped:', err.message);
          });
      });
    }
  }

  // 2. Mobile Sidebar Toggle
  function initSidebarMobile() {
    const mobileBtn = document.getElementById('emon-sidebar-toggle');
    const sidebar = document.getElementById('emon-sidebar');
    if (!mobileBtn || !sidebar) return;

    mobileBtn.addEventListener('click', () => {
      sidebar.classList.toggle('-translate-x-full');
    });

    document.addEventListener('click', (e) => {
      if (window.innerWidth < 1024) {
        if (!sidebar.contains(e.target) && !mobileBtn.contains(e.target) && !sidebar.classList.contains('-translate-x-full')) {
          sidebar.classList.add('-translate-x-full');
        }
      }
    });
  }

  // 3. Ctrl+K Command Palette
  function initCommandPalette() {
    const searchInputs = document.querySelectorAll('.search-trigger');
    const modal = document.getElementById('command-palette-modal');
    if (!modal) return;

    const modalInput = modal.querySelector('input');
    const modalClose = modal.querySelector('.palette-close');

    function openPalette() {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      if (modalInput) setTimeout(() => modalInput.focus(), 50);
    }

    function closePalette() {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      if (modalInput) modalInput.value = '';
    }

    searchInputs.forEach(el => el.addEventListener('click', openPalette));
    if (modalClose) modalClose.addEventListener('click', closePalette);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closePalette();
    });

    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (modal.classList.contains('hidden')) {
          openPalette();
        } else {
          closePalette();
        }
      }
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        closePalette();
      }
    });
  }

  // 4. Notifications Dropdown
  function initNotifications() {
    const btn = document.getElementById('btn-notifications');
    const dropdown = document.getElementById('dropdown-notifications');
    if (!btn || !dropdown) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target) && !btn.contains(e.target)) {
        dropdown.classList.add('hidden');
      }
    });
  }

  // 5. Quick Action Modal
  function initQuickActions() {
    const trigger = document.getElementById('btn-quick-action');
    const modal = document.getElementById('modal-quick-action');
    if (!trigger || !modal) return;

    const closeBtns = modal.querySelectorAll('.modal-close');

    trigger.addEventListener('click', () => {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    });

    closeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      });
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
    });
  }

  // 6. Table Search & Live Status Filters
  function initTableFilters() {
    const tableSearch = document.getElementById('table-search-input');
    if (tableSearch) {
      tableSearch.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase().trim();
        const rows = document.querySelectorAll('tbody tr');
        rows.forEach(row => {
          const text = row.textContent.toLowerCase();
          row.style.display = text.includes(q) ? '' : 'none';
        });
      });
    }

    // Status filter buttons
    const filterTabs = document.querySelectorAll('#status-filter-tabs button');
    filterTabs.forEach(btn => {
      btn.addEventListener('click', () => {
        filterTabs.forEach(b => {
          b.className = 'px-3 py-1.5 rounded-lg text-xs font-medium text-on-surface-variant hover:text-on-surface';
        });
        btn.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-on-primary';

        const filter = btn.textContent.trim().toLowerCase();
        const rows = document.querySelectorAll('tbody tr');
        rows.forEach(row => {
          if (filter === 'semua' || filter === 'all') {
            row.style.display = '';
          } else {
            const rowText = row.textContent.toLowerCase();
            row.style.display = rowText.includes(filter) ? '' : 'none';
          }
        });
      });
    });
  }

  // 7. Client-Side Data Grid Engine: Sortable Columns
  function initTableSorting() {
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
      const headers = table.querySelectorAll('thead th');
      headers.forEach((th, colIdx) => {
        // Skip checkbox or action columns
        if (th.querySelector('input') || th.classList.contains('text-center') || th.textContent.trim() === 'Aksi') return;

        th.style.cursor = 'pointer';
        th.title = 'Klik untuk mengurutkan (Sort)';
        
        // Add sorting indicator icon if not present
        if (!th.querySelector('.sort-indicator')) {
          const icon = document.createElement('span');
          icon.className = 'sort-indicator material-symbols-outlined text-[14px] align-middle ml-1 text-outline opacity-60';
          icon.textContent = 'unfold_more';
          th.appendChild(icon);
        }

        th.addEventListener('click', () => {
          sortTable(table, colIdx, th);
        });
      });
    });
  }

  function sortTable(table, colIdx, th) {
    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    const rows = Array.from(tbody.querySelectorAll('tr'));
    const isAsc = th.getAttribute('data-sort-order') !== 'asc';

    // Reset all headers icons
    table.querySelectorAll('thead th').forEach(h => {
      h.removeAttribute('data-sort-order');
      const icon = h.querySelector('.sort-indicator');
      if (icon) {
        icon.textContent = 'unfold_more';
        icon.classList.remove('text-primary');
        icon.classList.add('text-outline');
      }
    });

    th.setAttribute('data-sort-order', isAsc ? 'asc' : 'desc');
    const activeIcon = th.querySelector('.sort-indicator');
    if (activeIcon) {
      activeIcon.textContent = isAsc ? 'arrow_upward' : 'arrow_downward';
      activeIcon.classList.remove('text-outline');
      activeIcon.classList.add('text-primary');
    }

    rows.sort((rowA, rowB) => {
      const cellA = (rowA.children[colIdx]?.innerText || '').trim();
      const cellB = (rowB.children[colIdx]?.innerText || '').trim();

      // Clean numeric values for currency ($18,450.00 -> 18450)
      const numA = parseFloat(cellA.replace(/[^0-9.-]+/g, ''));
      const numB = parseFloat(cellB.replace(/[^0-9.-]+/g, ''));

      if (!isNaN(numA) && !isNaN(numB) && cellA.match(/[0-9]/) && cellB.match(/[0-9]/)) {
        return isAsc ? numA - numB : numB - numA;
      }

      return isAsc ? cellA.localeCompare(cellB) : cellB.localeCompare(cellA);
    });

    rows.forEach(r => tbody.appendChild(r));
    if (window.EmonTheme) {
      window.EmonTheme.showToast(`Kolom diurutkan secara ${isAsc ? 'Menaik (ASC)' : 'Menurun (DESC)'}`);
    }
  }

  // 8. Client-Side Data Export Engine (CSV / JSON via Blob)
  const EmonDataGrid = {
    exportToCSV(tableSelector = 'table', filename = 'data-export.csv') {
      const table = document.querySelector(tableSelector);
      if (!table) return;

      const rows = Array.from(table.querySelectorAll('tr'));
      const csv = rows.map(row => {
        const cells = Array.from(row.querySelectorAll('th, td'));
        // Ignore checkbox and action columns
        return cells
          .filter(c => !c.querySelector('input') && !c.classList.contains('text-center') && c.textContent.trim() !== 'Aksi')
          .map(c => `"${c.innerText.replace(/"/g, '""').replace(/\n/g, ' ').trim()}"`)
          .join(',');
      }).join('\r\n');

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (window.EmonTheme) {
        window.EmonTheme.showToast(`File ${filename} berhasil diekspor (CSV).`);
      }
    },

    exportToJSON(tableSelector = 'table', filename = 'data-export.json') {
      const table = document.querySelector(tableSelector);
      if (!table) return;

      const headers = Array.from(table.querySelectorAll('thead th'))
        .filter(c => !c.querySelector('input') && !c.classList.contains('text-center') && c.textContent.trim() !== 'Aksi')
        .map(h => h.innerText.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase().trim());

      const dataRows = Array.from(table.querySelectorAll('tbody tr'));
      const records = dataRows.map(row => {
        const cells = Array.from(row.querySelectorAll('td'))
          .filter(c => !c.querySelector('input') && !c.classList.contains('text-center'));
        const obj = {};
        headers.forEach((h, idx) => {
          if (cells[idx]) obj[h] = cells[idx].innerText.replace(/\n/g, ' ').trim();
        });
        return obj;
      });

      const blob = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (window.EmonTheme) {
        window.EmonTheme.showToast(`File ${filename} berhasil diekspor (JSON).`);
      }
    }
  };

  window.EmonDataGrid = EmonDataGrid;

  // 9. Generic Dropdowns
  function initDropdowns() {
    const triggers = document.querySelectorAll('[data-dropdown-toggle]');
    triggers.forEach(trig => {
      const targetId = trig.getAttribute('data-dropdown-toggle');
      const target = document.getElementById(targetId);
      if (!target) return;

      trig.addEventListener('click', (e) => {
        e.stopPropagation();
        target.classList.toggle('hidden');
      });

      document.addEventListener('click', (e) => {
        if (!target.contains(e.target) && !trig.contains(e.target)) {
          target.classList.add('hidden');
        }
      });
    });
  }

  // 10. Client-Side Table Pagination
  function initPagination() {
    const containers = document.querySelectorAll('[data-paginate]');
    containers.forEach(container => {
      const pageSize = parseInt(container.getAttribute('data-paginate')) || 10;
      const table = container.querySelector('table');
      if (!table) return;

      const tbody = table.querySelector('tbody');
      if (!tbody) return;

      let currentPage = 1;
      const allRows = () => Array.from(tbody.querySelectorAll('tr'));

      function render() {
        const rows = allRows();
        const total = rows.length;
        const totalPages = Math.ceil(total / pageSize) || 1;
        currentPage = Math.min(currentPage, totalPages);

        const start = (currentPage - 1) * pageSize;
        rows.forEach((r, i) => {
          r.style.display = (i >= start && i < start + pageSize) ? '' : 'none';
        });

        renderPaginationControls(container, currentPage, totalPages, total, pageSize);
      }

      function renderPaginationControls(container, page, totalPages, total, pageSize) {
        let ctrl = container.querySelector('.emon-pagination-bar');
        if (!ctrl) {
          ctrl = document.createElement('div');
          ctrl.className = 'emon-pagination-bar flex items-center justify-between px-4 py-3 border-t border-outline/10 text-xs text-on-surface-variant';
          container.appendChild(ctrl);
        }

        const from = Math.min((page - 1) * pageSize + 1, total);
        const to = Math.min(page * pageSize, total);

        ctrl.innerHTML = `
          <span>Menampilkan <strong class="text-on-surface">${from}–${to}</strong> dari <strong class="text-on-surface">${total}</strong> data</span>
          <div class="flex items-center gap-1">
            <button class="pg-btn px-2 py-1 rounded-lg hover:bg-surface-container font-medium transition-colors ${page <= 1 ? 'opacity-30 pointer-events-none' : ''}" data-page="prev">
              <span class="material-symbols-outlined text-[16px] leading-none align-middle">chevron_left</span>
            </button>
            ${Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = totalPages <= 5 ? i + 1 : (page <= 3 ? i + 1 : page - 2 + i);
              if (p < 1 || p > totalPages) return '';
              return `<button class="pg-btn w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${p === page ? 'bg-primary text-on-primary' : 'hover:bg-surface-container text-on-surface-variant'}" data-page="${p}">${p}</button>`;
            }).join('')}
            <button class="pg-btn px-2 py-1 rounded-lg hover:bg-surface-container font-medium transition-colors ${page >= totalPages ? 'opacity-30 pointer-events-none' : ''}" data-page="next">
              <span class="material-symbols-outlined text-[16px] leading-none align-middle">chevron_right</span>
            </button>
          </div>
        `;

        ctrl.querySelectorAll('.pg-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const p = btn.dataset.page;
            if (p === 'prev') currentPage = Math.max(1, currentPage - 1);
            else if (p === 'next') currentPage = Math.min(totalPages, currentPage + 1);
            else currentPage = parseInt(p);
            render();
          });
        });
      }

      render();

      // Re-render when table search filters rows
      const searchInput = document.getElementById('table-search-input');
      if (searchInput) {
        searchInput.addEventListener('input', () => {
          currentPage = 1;
          setTimeout(() => render(), 10);
        });
      }
    });
  }

  // 11. Standalone Toast Notification System
  const EmonToast = {
    show(message, type = 'info', duration = 3500) {
      let container = document.getElementById('toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
      }

      const icons = { info: 'info', success: 'check_circle', warning: 'warning', error: 'error' };
      const colors = {
        info: 'bg-surface-container-highest text-on-surface',
        success: 'bg-surface-container-highest text-on-surface',
        warning: 'bg-surface-container-highest text-on-surface',
        error: 'bg-surface-container-highest text-on-surface'
      };
      const iconColors = { info: 'text-primary', success: 'text-success', warning: 'text-warning', error: 'text-error' };

      const toast = document.createElement('div');
      toast.className = `toast-item flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg ${colors[type] || colors.info}`;
      toast.innerHTML = `
        <span class="material-symbols-outlined text-[18px] ${iconColors[type] || iconColors.info}">${icons[type] || icons.info}</span>
        <span class="text-sm font-medium flex-1">${message}</span>
        <button class="ml-1 text-outline hover:text-on-surface transition-colors" onclick="this.closest('.toast-item').remove()">
          <span class="material-symbols-outlined text-[16px]">close</span>
        </button>
      `;

      container.appendChild(toast);
      if (duration > 0) setTimeout(() => toast.remove(), duration);
      return toast;
    },
    info: (msg, dur) => EmonToast.show(msg, 'info', dur),
    success: (msg, dur) => EmonToast.show(msg, 'success', dur),
    warning: (msg, dur) => EmonToast.show(msg, 'warning', dur),
    error: (msg, dur) => EmonToast.show(msg, 'error', dur)
  };

  window.EmonToast = EmonToast;

  // 12. Scroll-to-Top FAB
  function initScrollToTop() {
    const btn = document.createElement('button');
    btn.id = 'emon-scroll-top';
    btn.className = 'fixed bottom-20 right-5 z-50 w-10 h-10 rounded-full bg-primary text-on-primary shadow-lg flex items-center justify-center opacity-0 pointer-events-none transition-all duration-300 hover:scale-110 no-print';
    btn.setAttribute('aria-label', 'Kembali ke atas');
    btn.innerHTML = '<span class="material-symbols-outlined text-[18px]">arrow_upward</span>';
    document.body.appendChild(btn);

    const mainEl = document.getElementById('emon-main-content') || window;
    const scrollTarget = document.getElementById('emon-main-content') || document.documentElement;

    function onScroll() {
      const top = scrollTarget.scrollTop || window.scrollY;
      btn.style.opacity = top > 300 ? '1' : '0';
      btn.style.pointerEvents = top > 300 ? 'auto' : 'none';
    }

    (document.getElementById('emon-main-content') || window).addEventListener('scroll', onScroll);
    btn.addEventListener('click', () => {
      (document.getElementById('emon-main-content') || window).scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 13. Keyboard Shortcuts Modal (press ?)
  function initKeyboardShortcuts() {
    const shortcuts = [
      { key: 'Ctrl + K', desc: 'Buka Command Palette' },
      { key: '?', desc: 'Tampilkan shortcut keyboard' },
      { key: 'Ctrl + D', desc: 'Toggle Dark/Light Mode' },
      { key: 'Escape', desc: 'Tutup modal / panel aktif' },
      { key: 'Ctrl + P', desc: 'Cetak halaman' },
      { key: 'Ctrl + E', desc: 'Ekspor tabel ke CSV' },
      { key: 'G → H', desc: 'Pergi ke Dashboard (Go Home)' },
      { key: 'G → O', desc: 'Pergi ke Pesanan' },
      { key: 'G → R', desc: 'Pergi ke Laporan' }
    ];

    // Build modal
    const modal = document.createElement('div');
    modal.id = 'shortcut-modal';
    modal.className = 'fixed inset-0 z-[120] hidden items-center justify-center p-4';
    modal.innerHTML = `
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" id="shortcut-backdrop"></div>
      <div class="relative bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-md p-6 z-10">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base font-bold text-on-surface">Keyboard Shortcuts</h2>
          <button id="shortcut-close" class="p-1.5 rounded-lg text-outline hover:bg-surface-container transition-colors">
            <span class="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
        <div class="space-y-2">
          ${shortcuts.map(s => `
            <div class="flex items-center justify-between py-2 border-b border-outline-variant/10 last:border-0">
              <span class="text-sm text-on-surface-variant">${s.desc}</span>
              <kbd class="px-2 py-1 rounded-lg bg-surface-container text-xs font-mono font-semibold text-on-surface">${s.key}</kbd>
            </div>
          `).join('')}
        </div>
        <p class="text-xs text-outline mt-4 text-center">Tekan <kbd class="px-1.5 py-0.5 bg-surface-container rounded font-mono">Esc</kbd> untuk tutup</p>
      </div>
    `;
    document.body.appendChild(modal);

    function openShortcuts() {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
    function closeShortcuts() {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }

    document.getElementById('shortcut-close')?.addEventListener('click', closeShortcuts);
    document.getElementById('shortcut-backdrop')?.addEventListener('click', closeShortcuts);

    // Sequence tracker for "G → H", "G → O", "G → R"
    let lastKey = null;
    let seqTimer = null;

    document.addEventListener('keydown', (e) => {
      const tag = e.target.tagName;
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) || e.target.isContentEditable;

      // Escape closes any open modal
      if (e.key === 'Escape') { closeShortcuts(); return; }

      // Ctrl+D → toggle dark
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        if (window.EmonTheme) EmonTheme.toggleDarkMode?.() || EmonTheme.setMode?.(document.documentElement.classList.contains('dark') ? 'light' : 'dark');
        return;
      }

      // Ctrl+P → print
      if (e.ctrlKey && e.key === 'p') { /* allow default */ return; }

      // Ctrl+E → export first table
      if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        if (window.EmonDataGrid) EmonDataGrid.exportToCSV('table', 'export.csv');
        return;
      }

      if (isInput) return;

      // ? → show shortcuts
      if (e.key === '?') { openShortcuts(); return; }

      // Sequence navigation
      if (e.key === 'g' || e.key === 'G') {
        lastKey = 'g';
        clearTimeout(seqTimer);
        seqTimer = setTimeout(() => { lastKey = null; }, 1500);
        return;
      }
      if (lastKey === 'g') {
        clearTimeout(seqTimer);
        lastKey = null;
        if (e.key === 'h' || e.key === 'H') { window.location.href = 'index.html'; return; }
        if (e.key === 'o' || e.key === 'O') { window.location.href = 'orders.html'; return; }
        if (e.key === 'r' || e.key === 'R') { window.location.href = 'reports.html'; return; }
      }
    });
  }

  // 14. Theme URL Sharing (encode/decode from query string)
  function initThemeURLSharing() {
    // On load: if URL has ?primary= etc, apply them
    const params = new URLSearchParams(window.location.search);
    const primary = params.get('primary');
    const secondary = params.get('secondary');
    const tertiary = params.get('tertiary');
    const mode = params.get('mode');
    const radius = params.get('radius');

    if ((primary || secondary || mode) && window.EmonTheme) {
      const config = {};
      if (primary) config.primary = decodeURIComponent(primary);
      if (secondary) config.secondary = decodeURIComponent(secondary);
      if (tertiary) config.tertiary = decodeURIComponent(tertiary);
      if (mode) config.mode = mode;
      if (radius) config.radius = radius;
      EmonTheme.applyTheme(config);
    }

    // Expose shareTheme() globally
    window.EmonShareTheme = function () {
      if (!window.EmonTheme) return;
      const cfg = EmonTheme.config;
      const url = new URL(window.location.href);
      url.searchParams.set('primary', cfg.primary);
      url.searchParams.set('secondary', cfg.secondary);
      url.searchParams.set('tertiary', cfg.tertiary || '#6833ea');
      url.searchParams.set('mode', cfg.mode);
      url.searchParams.set('radius', cfg.radius);
      // Strip to just path + search
      const shareURL = url.origin + url.pathname + url.search;
      navigator.clipboard?.writeText(shareURL).then(() => {
        if (window.EmonToast) EmonToast.success('Link tema disalin ke clipboard!');
      }).catch(() => {
        prompt('Salin link tema ini:', shareURL);
      });
      return shareURL;
    };
  }

  // 15. Accessibility quick wins
  function initA11y() {
    // Add aria-label to icon-only buttons that lack it
    document.querySelectorAll('button:not([aria-label])').forEach(btn => {
      if (!btn.textContent.trim() && btn.querySelector('.material-symbols-outlined')) {
        const icon = btn.querySelector('.material-symbols-outlined').textContent.trim();
        btn.setAttribute('aria-label', icon.replace(/_/g, ' '));
      }
    });

    // Add role="status" to toast container for screen readers
    let toastCtr = document.getElementById('toast-container');
    if (!toastCtr) {
      toastCtr = document.createElement('div');
      toastCtr.id = 'toast-container';
      document.body.appendChild(toastCtr);
    }
    toastCtr.setAttribute('role', 'status');
    toastCtr.setAttribute('aria-live', 'polite');
    toastCtr.setAttribute('aria-atomic', 'false');

    // Focus trap helper for modals
    document.querySelectorAll('[role="dialog"]').forEach(modal => {
      modal.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab') return;
        const focusables = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      });
    });
  }

})();
