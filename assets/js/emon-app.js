/**
 * Emon Material Admin - Global Application Logic & Data Grid Engine
 * Offline interactive components: Command Palette, Mobile Drawer,
 * Notifications, Quick Actions Modal, Table sorting, filtering & CSV/JSON export.
 */

(function () {
  'use strict';

  // See initCommandPalette — guards the one window-level listener that would
  // otherwise be registered again on every shell re-render.
  let paletteKeysBound = false;
  let notifDocBound = false;

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
    initEnterpriseGrids();
    initTooltips();
    initScrollToTop();
    initKeyboardShortcuts();
    initThemeURLSharing();
    initA11y();

    // A language switch rebuilds the shell chrome, discarding the nodes these
    // handlers were attached to. Re-attach to the new ones.
    window.addEventListener('emon-shell-rerendered', () => {
      initCommandPalette();
      initNotifications();
      initQuickActions();
    });
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

    const CLOSED = '-translate-x-full';
    const isOpen = () => !sidebar.classList.contains(CLOSED);

    // The drawer covered the page with no scrim, so there was no visual cue
    // that the page behind it was inert, and no target to tap to dismiss.
    let scrim = document.getElementById('sidebar-scrim');
    if (!scrim) {
      scrim = document.createElement('div');
      scrim.id = 'sidebar-scrim';
      scrim.className = 'sidebar-scrim';
      document.body.appendChild(scrim);
    }

    function setOpen(open) {
      if (open) {
        sidebar.classList.remove(CLOSED);
        sidebar.removeAttribute('inert');
        // Stop the page behind the drawer from scrolling away underneath it.
        document.body.classList.add('overflow-hidden');
      } else {
        sidebar.classList.add(CLOSED);
        document.body.classList.remove('overflow-hidden');
      }
      mobileBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      scrim.classList.toggle('sidebar-scrim-visible', open);
    }

    mobileBtn.setAttribute('aria-expanded', 'false');
    mobileBtn.setAttribute('aria-controls', 'emon-sidebar');

    mobileBtn.addEventListener('click', () => setOpen(!isOpen()));
    scrim.addEventListener('click', () => { setOpen(false); mobileBtn.focus(); });

    document.addEventListener('click', (e) => {
      if (window.innerWidth < 1024) {
        if (!sidebar.contains(e.target) && !mobileBtn.contains(e.target) && isOpen()) {
          setOpen(false);
        }
      }
    });

    // Escape closes the drawer and returns focus to the control that opened it.
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) {
        setOpen(false);
        mobileBtn.focus();
      }
    });

    // Crossing into desktop must not leave the page scroll-locked.
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 1024) document.body.classList.remove('overflow-hidden');
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
      if (window.EmonShell) window.EmonShell.resetPaletteFilter();
    }

    searchInputs.forEach(el => el.addEventListener('click', openPalette));
    if (modalClose) modalClose.addEventListener('click', closePalette);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closePalette();
    });

    // Bound to window, so it outlives the chrome nodes this function attaches
    // to. A language switch re-runs this init; without the guard the duplicate
    // listener would toggle the palette twice per Ctrl+K and cancel itself out.
    if (paletteKeysBound) return;
    paletteKeysBound = true;

    window.addEventListener('keydown', (e) => {
      const m = document.getElementById('command-palette-modal');
      if (!m) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (m.classList.contains('hidden')) {
          m.classList.remove('hidden');
          m.classList.add('flex');
          const mi = m.querySelector('input');
          if (mi) setTimeout(() => mi.focus(), 50);
        } else {
          m.classList.add('hidden');
          m.classList.remove('flex');
          const mi = m.querySelector('input');
          if (mi) mi.value = '';
          if (window.EmonShell) window.EmonShell.resetPaletteFilter();
        }
      }
      if (e.key === 'Escape' && !m.classList.contains('hidden')) {
        m.classList.add('hidden');
        m.classList.remove('flex');
        const mi = m.querySelector('input');
        if (mi) mi.value = '';
        if (window.EmonShell) window.EmonShell.resetPaletteFilter();
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

    // Document-level, so it must not be re-registered on shell re-render; it
    // resolves the dropdown by id each time so it keeps working on new nodes.
    if (notifDocBound) return;
    notifDocBound = true;

    document.addEventListener('click', (e) => {
      const d = document.getElementById('dropdown-notifications');
      const b = document.getElementById('btn-notifications');
      if (!d || !b) return;
      if (!d.contains(e.target) && !b.contains(e.target)) {
        d.classList.add('hidden');
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
    downloadBlob(blob, filename) {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },

    exportToCSV(tableSelector = 'table', filename = 'data-export.csv') {
      const table = typeof tableSelector === 'string' ? document.querySelector(tableSelector) : tableSelector;
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
      this.downloadBlob(blob, filename);

      if (window.EmonTheme) {
        window.EmonTheme.showToast(`File ${filename} berhasil diekspor (CSV).`);
      }
    },

    exportToJSON(tableSelector = 'table', filename = 'data-export.json') {
      const table = typeof tableSelector === 'string' ? document.querySelector(tableSelector) : tableSelector;
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
      this.downloadBlob(blob, filename);

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

  // 12. Enterprise Data Grid Engine (opt-in via data-grid attribute)
  function initEnterpriseGrids() {
    const grids = document.querySelectorAll('table[data-grid]');
    if (!grids.length) return;

    grids.forEach((table, gIdx) => {
      const card = table.closest('.overflow-x-auto') || table.closest('.emon-datagrid') || table.parentElement;
      const container = document.createElement('div');
      container.className = 'emon-datagrid';
      container.dataset.density = 'normal';
      container.dataset.grid = '';
      card.parentNode.insertBefore(container, card);
      const scrollBox = card.parentElement;
      card.remove();
      container.appendChild(card);

      injectGridCheckboxColumn(table, gIdx);
      injectBulkBar(container, table);
      injectGridUtils(container, table);
      bindGridSearch(container, table);
    });
  }

  function injectGridCheckboxColumn(table) {
    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');
    if (!thead || !tbody) return;
    if (thead.querySelector('th input[type="checkbox"]')) return;

    const selectAll = document.createElement('input');
    selectAll.type = 'checkbox';
    selectAll.className = 'grid-check';
    selectAll.setAttribute('aria-label', 'Pilih semua baris');

    const th = document.createElement('th');
    th.className = 'py-3 px-4 w-10';
    th.appendChild(selectAll);

    const firstTh = thead.querySelector('th');
    if (firstTh) firstTh.parentNode.insertBefore(th, firstTh);

    tbody.querySelectorAll('tr').forEach(() => {});
    tbody.querySelectorAll('tr').forEach((row) => {
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.className = 'grid-check';
      cb.setAttribute('aria-label', 'Pilih baris');

      const td = document.createElement('td');
      td.className = 'py-3.5 px-4';
      td.appendChild(cb);
      row.classList.add('emon-grid-row');
      const firstTd = row.querySelector('td');
      if (firstTd) firstTd.parentNode.insertBefore(td, firstTd);
      else row.appendChild(td);

      cb.addEventListener('change', () => {
        row.classList.toggle('row-selected', cb.checked);
        sync();
        syncSelectAll();
      });
    });

    function visibleRows() {
      return Array.from(tbody.querySelectorAll('tr')).filter(r => r.style.display !== 'none');
    }

    function syncSelectAll() {
      const cbs = Array.from(tbody.querySelectorAll('input.grid-check'));
      const checked = cbs.filter(cb => cb.checked).length;
      const visible = visibleRows().length;
      selectAll.checked = checked > 0 && checked === visible;
      selectAll.indeterminate = checked > 0 && checked < visible;
    }

    const grid = table.closest('.emon-datagrid');
    function sync() {
      if (grid && grid.__syncBulkBar) grid.__syncBulkBar();
    }

    selectAll.addEventListener('change', () => {
      tbody.querySelectorAll('input.grid-check').forEach(cb => {
        const row = cb.closest('tr');
        const visible = row && row.style.display !== 'none';
        cb.checked = selectAll.checked && visible;
        if (row) row.classList.toggle('row-selected', cb.checked);
      });
      sync();
    });
  }

  function injectBulkBar(container, table) {
    const bar = document.createElement('div');
    bar.className = 'bulk-bar flex items-center justify-between gap-2 px-space-md py-2 bg-primary-fixed border-b border-outline-variant/20 no-print';
    bar.innerHTML = `
      <span class="text-xs font-semibold text-primary flex items-center gap-2">
        <span class="material-symbols-outlined text-[16px]">check_circle</span>
        <span><b class="js-bulk-count">0</b>&nbsp;baris terpilih</span>
      </span>
      <div class="flex items-center gap-1.5 flex-wrap">
        <button type="button" class="js-bulk-csv emon-btn emon-btn-secondary emon-btn-sm">Export CSV</button>
        <button type="button" class="js-bulk-json emon-btn emon-btn-secondary emon-btn-sm">Export JSON</button>
        <button type="button" class="js-bulk-clear px-3 py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container text-xs font-medium transition-colors">Bersihkan</button>
      </div>
    `;
    const scrollBox = container.querySelector('.overflow-x-auto') || container;
    scrollBox.parentNode.insertBefore(bar, scrollBox);

    const countEl = bar.querySelector('.js-bulk-count');

    function selectedRows() {
      return Array.from(table.querySelectorAll('tbody tr')).filter(r => {
        const cb = r.querySelector('input.grid-check');
        return cb && cb.checked;
      });
    }

    function syncBulkBar() {
      const n = selectedRows().length;
      countEl.textContent = n;
      bar.classList.toggle('active', n > 0);
    }

    bar.querySelector('.js-bulk-clear').addEventListener('click', () => {
      table.querySelectorAll('tbody input.grid-check').forEach(cb => {
        cb.checked = false;
        cb.closest('tr').classList.remove('row-selected');
      });
      syncBulkBar();
    });
    bar.querySelector('.js-bulk-csv').addEventListener('click', () => {
      const rows = selectedRows();
      exportSelected(table, rows, 'csv');
    });
    bar.querySelector('.js-bulk-json').addEventListener('click', () => {
      const rows = selectedRows();
      exportSelected(table, rows, 'json');
    });

    container.__syncBulkBar = syncBulkBar;
  }

  function exportSelected(table, rows, type) {
    if (!rows.length) return;
    const headers = Array.from(table.querySelectorAll('thead th'))
      .filter(c => !c.querySelector('input') && !c.classList.contains('text-center') && c.textContent.trim() !== 'Aksi')
      .map(h => h.innerText.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase().trim());

    const records = rows.map(row => {
      const cells = Array.from(row.querySelectorAll('td'))
        .filter(c => !c.querySelector('input') && !c.classList.contains('text-center'));
      const obj = {};
      headers.forEach((h, idx) => { if (cells[idx]) obj[h] = cells[idx].innerText.replace(/\n/g, ' ').trim(); });
      return obj;
    });

    if (type === 'json') {
      const blob = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' });
      EmonDataGrid.downloadBlob(blob, 'selected-rows.json');
    } else {
      const headerLine = headers.map(h => `"${h}"`).join(',');
      const lines = records.map(r => headers.map(h => `"${(r[h] || '').replace(/"/g, '""')}"`).join(','));
      const csv = [headerLine].concat(lines).join('\r\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      EmonDataGrid.downloadBlob(blob, 'selected-rows.csv');
    }
    if (window.EmonToast) EmonToast.success(`Berhasil mengekspor ${rows.length} baris terpilih (${type.toUpperCase()}).`);
  }

  function injectGridUtils(container, table) {
    const scrollBox = container.querySelector('.overflow-x-auto') || container;

    const utils = document.createElement('div');
    utils.className = 'grid-utils flex items-center justify-end gap-1.5 px-space-md py-2 border-b border-outline-variant/15 bg-surface-container-low/40 no-print';
    utils.innerHTML = `
      <div class="relative">
        <button type="button" class="js-cols-btn flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-colors">
          <span class="material-symbols-outlined text-[16px]">view_column</span>
          <span class="hidden sm:inline">Kolom</span>
          <span class="material-symbols-outlined text-[14px]">expand_more</span>
        </button>
        <div class="js-col-menu emon-colmenu hidden absolute right-0 mt-1.5 bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant/30 p-2 z-40"></div>
      </div>
      <div class="relative">
        <button type="button" class="js-density-btn flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-colors">
          <span class="material-symbols-outlined text-[16px]">density_small</span>
          <span class="hidden sm:inline">Kepadatan</span>
          <span class="material-symbols-outlined text-[14px]">expand_more</span>
        </button>
        <div class="js-density-menu hidden absolute right-0 mt-1.5 min-w-[9rem] bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant/30 p-1.5 z-40 grid grid-cols-3 gap-1 text-center"></div>
      </div>
    `;

    scrollBox.parentNode.insertBefore(utils, scrollBox);

    // --- Column visibility ---
    const colBtn = utils.querySelector('.js-cols-btn');
    const colMenu = utils.querySelector('.js-col-menu');
    const headers = Array.from(table.querySelectorAll('thead th'));

    headers.forEach((th, idx) => {
      const label = th.textContent.trim();
      if (th.querySelector('input') || !label || label === 'Aksi') return;
      const item = document.createElement('label');
      item.innerHTML = `<input type="checkbox" checked data-col="${idx}"/> <span>${label}</span>`;
      item.querySelector('input').addEventListener('change', (e) => toggleColumn(table, idx, !e.target.checked));
      colMenu.appendChild(item);
    });

    colBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      colMenu.classList.toggle('hidden');
    });

    // --- Density toggle ---
    const denBtn = utils.querySelector('.js-density-btn');
    const denMenu = utils.querySelector('.js-density-menu');
    const densityLabels = { compact: 'Padat', normal: 'Normal', spacious: 'Luas' };
    ['compact', 'normal', 'spacious'].forEach(d => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ' + (d === 'normal' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container');
      b.textContent = densityLabels[d];
      b.addEventListener('click', () => {
        container.dataset.density = d;
        denMenu.querySelectorAll('button').forEach(x => x.className = 'px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-colors text-on-surface-variant hover:bg-surface-container');
        b.className = 'px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-colors bg-primary text-on-primary';
        denMenu.classList.add('hidden');
        if (window.EmonToast) EmonToast.info(`Kepadatan tabel: ${densityLabels[d]}`);
      });
      denMenu.appendChild(b);
    });
    denBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      denMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
      if (!utils.contains(e.target)) {
        colMenu.classList.add('hidden');
        denMenu.classList.add('hidden');
      }
    });
  }

  function toggleColumn(table, colIdx, hidden) {
    table.querySelectorAll('thead th, tbody td, tbody th').forEach(cell => {
      if (cell.cellIndex === colIdx) cell.classList.toggle('emon-col-hidden', hidden);
    });
  }

  function bindGridSearch(container, table) {
    const search = document.getElementById('table-search-input') || container.querySelector('input[type="search"]') || null;
    const scrollBox = container.querySelector('.overflow-x-auto') || container;

    let emptyState = scrollBox.querySelector('.empty-state');
    if (!emptyState) {
      emptyState = document.createElement('div');
      emptyState.className = 'empty-state hidden';
      emptyState.innerHTML = `
        <div class="empty-state-icon"><span class="material-symbols-outlined text-[32px]">inbox</span></div>
        <div>
          <p class="font-semibold text-on-surface text-sm">Tidak ada data ditemukan</p>
          <p class="text-xs text-outline mt-0.5">Coba ubah kata kunci pencarian atau filter status.</p>
        </div>
      `;
      scrollBox.appendChild(emptyState);
    }

    const refresh = () => {
      const rows = Array.from(table.querySelectorAll('tbody tr'));
      const visible = rows.filter(r => r.style.display !== 'none').length;
      const tableEl = scrollBox.querySelector('table');
      emptyState.classList.toggle('hidden', visible > 0);
      if (tableEl) tableEl.style.display = visible > 0 ? '' : 'none';
      if (container.__syncBulkBar) container.__syncBulkBar();
    };

    if (search) search.addEventListener('input', () => setTimeout(refresh, 10));
  }

  // 13. Unified Tooltip System (data-tooltip)
  function initTooltips() {
    let tip = null;

    document.addEventListener('mouseover', (e) => {
      const t = e.target.closest('[data-tooltip]');
      if (!t) { hideTip(); return; }
      if (tip && tip._owner === t) return;
      if (!tip) {
        tip = document.createElement('div');
        tip.className = 'emon-tooltip';
        document.body.appendChild(tip);
      }
      tip._owner = t;
      tip.textContent = t.dataset.tooltip;
      positionTip(t, tip);
      tip.classList.add('show');
    });

    document.addEventListener('mouseout', (e) => {
      const t = e.target.closest('[data-tooltip]');
      if (t && tip && tip._owner === t) hideTip();
    });

    document.addEventListener('scroll', () => { if (tip && tip._owner) positionTip(tip._owner, tip); }, true);
    window.addEventListener('resize', () => { if (tip && tip._owner) positionTip(tip._owner, tip); });

    function positionTip(owner, el) {
      const r = owner.getBoundingClientRect();
      const gap = 8;
      el.classList.remove('show');
      requestAnimationFrame(() => {
        const tw = el.offsetWidth;
        const th = el.offsetHeight;
        let left = r.left + r.width / 2 - tw / 2;
        left = Math.max(4, Math.min(window.innerWidth - tw - 4, left));
        const top = r.top - th - gap;
        el.style.left = left + 'px';
        el.style.top = (top >= 4 ? top : r.bottom + gap) + 'px';
        el.classList.add('show');
      });
    }

    function hideTip() {
      if (tip) { tip.classList.remove('show'); tip._owner = null; }
    }
  }

  // 14. EmonUI — shared enterprise UI primitives
  const EmonUI = {
    confirm({ title = 'Konfirmasi', message = 'Yakin ingin melanjutkan?', confirmText = 'Ya, Lanjutkan', cancelText = 'Batal', danger = false, onConfirm = null, onCancel = null } = {}) {
      const overlay = document.createElement('div');
      overlay.className = 'confirm-overlay';
      overlay.innerHTML = `
        <div class="confirm-dialog p-5" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
          <div class="flex items-center justify-between mb-3">
            <h3 id="confirm-title" class="font-display font-bold text-base text-on-surface">${title}</h3>
            <button class="confirm-close p-1 rounded-lg text-outline hover:bg-surface-container transition-colors" aria-label="Tutup">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          <p class="text-sm text-on-surface-variant leading-relaxed mb-5">${message}</p>
          <div class="flex items-center justify-end gap-2">
            <button type="button" class="confirm-cancel emon-btn emon-btn-ghost">${cancelText}</button>
            <button type="button" class="confirm-ok emon-btn ${danger ? 'emon-btn-danger' : 'emon-btn-primary'}">${confirmText}</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);

      const close = (result) => {
        overlay.remove();
        if (result && typeof onConfirm === 'function') onConfirm();
        if (!result && typeof onCancel === 'function') onCancel();
      };

      overlay.querySelector('.confirm-ok').addEventListener('click', () => close(true));
      overlay.querySelector('.confirm-close').addEventListener('click', () => close(false));
      overlay.querySelector('.confirm-cancel').addEventListener('click', () => close(false));
      overlay.addEventListener('click', (e) => { if (e.target === overlay) close(false); });
      document.addEventListener('keydown', function esc(e) {
        if (e.key === 'Escape') { close(false); document.removeEventListener('keydown', esc); }
      });

      const ok = overlay.querySelector('.confirm-ok');
      if (ok) ok.focus();
    },

    toggleTooltip(owner, active) { /* handled by initTooltips */ }
  };

  window.EmonUI = EmonUI;

  // 15. Scroll-to-Top FAB
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
        if (window.EmonTheme) window.EmonTheme.toggleMode();
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
