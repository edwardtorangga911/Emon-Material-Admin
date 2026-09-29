/**
 * Emon Material Admin - Animation & Motion Engine (emon-anim.js)
 * 100% Offline, Zero-Dependency Micro-Interactions:
 * - Dynamic Coordinate Material 3 Ripple
 * - Number Count-Up Animation (easeOutCubic)
 * - 3D Interactive Live Tile Tilt
 * - Staggered Cascade Entrances
 * - Responsive Gauge Fill Animations
 */

(function () {
  'use strict';

  class EmonMotion {
    constructor() {
      this.init();
    }

    init() {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.boot());
      } else {
        this.boot();
      }
    }

    boot() {
      this.initMaterialRipples();
      this.initStaggerEntrance();
      this.initCountUp();
      this.initTileTilt();
      this.initProgressFill();
    }

    /**
     * 1. Dynamic Coordinate Material 3 Ripple Effect
     */
    initMaterialRipples() {
      document.addEventListener('pointerdown', (e) => {
        const target = e.target.closest('button, .sidebar-nav-item, .ripple, [role="button"], .palette-swatch');
        if (!target) return;

        // Ensure position relative/hidden overflow
        const computed = window.getComputedStyle(target);
        if (computed.position === 'static') {
          target.style.position = 'relative';
        }
        target.style.overflow = 'hidden';

        const rect = target.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        const ripple = document.createElement('span');
        ripple.className = 'material-ripple-circle';
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        // Contrast adaptation
        const isDark = document.documentElement.classList.contains('dark');
        const isPrimaryBtn = target.classList.contains('bg-primary') || target.classList.contains('bg-secondary');
        if (!isPrimaryBtn && !isDark) {
          ripple.style.background = 'rgba(0, 91, 191, 0.18)';
        }

        target.appendChild(ripple);

        setTimeout(() => {
          ripple.remove();
        }, 600);
      });
    }

    /**
     * 2. Number Count-Up Animation
     */
    initCountUp() {
      const counters = document.querySelectorAll('.tabular-nums, [data-counter]');
      counters.forEach((el) => {
        // Prevent double animation
        if (el.dataset.animCounted) return;

        const rawText = el.innerText.trim();
        // Extract prefix ($), numeric part, and suffix (%)
        const match = rawText.match(/^([^0-9.-]*)([0-9.,]+)(.*)$/);
        if (!match) return;

        const prefix = match[1] || '';
        const numStr = match[2].replace(/,/g, '');
        const suffix = match[3] || '';
        const targetVal = parseFloat(numStr);

        if (isNaN(targetVal)) return;

        const hasDecimal = numStr.includes('.');
        const decimalPlaces = hasDecimal ? numStr.split('.')[1].length : 0;
        const isThousands = match[2].includes(',');

        el.dataset.animCounted = 'true';
        const duration = 900; // ms
        const startTime = performance.now();

        function updateCounter(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // easeOutCubic curve
          const ease = 1 - Math.pow(1 - progress, 3);
          const currentVal = targetVal * ease;

          let formattedNum;
          if (hasDecimal) {
            formattedNum = currentVal.toFixed(decimalPlaces);
          } else {
            formattedNum = Math.floor(currentVal).toString();
          }

          if (isThousands) {
            const parts = formattedNum.split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            formattedNum = parts.join('.');
          }

          el.innerText = `${prefix}${formattedNum}${suffix}`;

          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          } else {
            el.innerText = rawText; // Exact restore
          }
        }

        requestAnimationFrame(updateCounter);
      });
    }

    /**
     * 3. 3D Interactive Live Tile Tilt
     */
    initTileTilt() {
      // Apply to top modular tiles and cards
      const tiles = document.querySelectorAll('.grid > div.relative, .tile-tilt');
      tiles.forEach((tile) => {
        tile.classList.add('tile-tilt', 'metro-live-glow');
        const parent = tile.parentElement;
        if (parent) parent.classList.add('tile-tilt-container');

        tile.addEventListener('mousemove', (e) => {
          const rect = tile.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;

          // Limit tilt angle (-4 to 4 degrees for subtle professional enterprise feel)
          const rotateX = ((centerY - y) / centerY) * 4;
          const rotateY = ((x - centerX) / centerX) * 4;

          tile.style.transform = `perspective(800px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`;
        });

        tile.addEventListener('mouseleave', () => {
          tile.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        });
      });
    }

    /**
     * 4. Smooth Page Entrance Animation (Anti-glitch)
     */
    initStaggerEntrance() {
      const main = document.querySelector('main') || document.getElementById('emon-main-content');
      if (main && !main.classList.contains('emon-page-enter')) {
        main.classList.add('emon-page-enter');
      }
    }

    /**
     * 5. Smooth Progress Bar & Ring Fill on View
     */
    initProgressFill() {
      const progressBars = document.querySelectorAll('[style*="width:"]');
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const bar = entry.target;
              const targetWidth = bar.style.width;
              bar.style.width = '0%';
              bar.style.transition = 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
              setTimeout(() => {
                bar.style.width = targetWidth;
              }, 50);
              observer.unobserve(bar);
            }
          });
        }, { threshold: 0.2 });

        progressBars.forEach((b) => {
          if (b.classList.contains('rounded-full')) {
            observer.observe(b);
          }
        });
      }
    }
  }

  // Instantiate globally
  window.EmonMotion = new EmonMotion();
})();
