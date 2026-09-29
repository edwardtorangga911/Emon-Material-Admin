/**
 * Emon Material Admin - Global Application Logic
 * Offline interactive components: Command Palette, Mobile Drawer,
 * Notifications, Quick Actions Modal, Table filtering.
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    initSidebarMobile();
    initCommandPalette();
    initNotifications();
    initQuickActions();
    initTableFilters();
    initDropdowns();
  });

  // Mobile Sidebar Toggle
  function initSidebarMobile() {
    const mobileBtn = document.getElementById('emon-sidebar-toggle');
    const sidebar = document.getElementById('emon-sidebar');
    if (!mobileBtn || !sidebar) return;

    mobileBtn.addEventListener('click', () => {
      sidebar.classList.toggle('-translate-x-full');
    });

    // Close when clicking outside on mobile
    document.addEventListener('click', (e) => {
      if (window.innerWidth < 1024) {
        if (!sidebar.contains(e.target) && !mobileBtn.contains(e.target) && !sidebar.classList.contains('-translate-x-full')) {
          sidebar.classList.add('-translate-x-full');
        }
      }
    });
  }

  // Ctrl+K Command Palette
  function initCommandPalette() {
    const searchInputs = document.querySelectorAll('.search-trigger');
    const modal = document.getElementById('command-palette-modal');
    if (!modal) return;

    const modalInput = modal.querySelector('input');
    const modalClose = modal.querySelector('.palette-close');

    function openPalette() {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      if (modalInput) {
        setTimeout(() => modalInput.focus(), 50);
      }
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

  // Notifications Dropdown
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

  // Quick Action Modal
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

  // Table Search and Filters
  function initTableFilters() {
    const tableSearch = document.getElementById('table-search-input');
    if (!tableSearch) return;

    tableSearch.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const rows = document.querySelectorAll('tbody tr');
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(q)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  }

  // Generic Dropdown handling
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
