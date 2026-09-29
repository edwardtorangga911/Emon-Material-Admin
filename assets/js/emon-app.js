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
})();
