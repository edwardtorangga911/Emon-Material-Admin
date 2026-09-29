/**
 * Emon Material Admin - Offline SVG Chart Library
 * 100% Zero-dependency, offline-first reactive SVG charts
 */

(function () {
  'use strict';

  class EmonCharts {
    /**
     * Renders a responsive Smooth Area Chart into an SVG container
     * @param {string|SVGElement} target - Selector or SVG element
     * @param {Object} options - Data series, categories, colors
     */
    static renderAreaChart(target, options = {}) {
      const svg = typeof target === 'string' ? document.querySelector(target) : target;
      if (!svg) return;

      const series = options.series || [
        { name: 'Revenue', data: [35, 55, 45, 80, 65, 95, 110], color: 'var(--primary)' },
        { name: 'Target', data: [40, 50, 60, 65, 75, 85, 95], color: 'var(--secondary)', dashed: true }
      ];
      const categories = options.categories || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

      const width = options.width || 700;
      const height = options.height || 220;
      const padding = { top: 20, right: 30, bottom: 30, left: 30 };

      const chartW = width - padding.left - padding.right;
      const chartH = height - padding.top - padding.bottom;

      // Find max value across all series
      let maxVal = 0;
      series.forEach(s => {
        s.data.forEach(v => {
          if (v > maxVal) maxVal = v;
        });
      });
      maxVal = Math.ceil(maxVal * 1.15) || 100;

      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      svg.setAttribute('preserveAspectRatio', 'none');

      // Clear existing
      svg.innerHTML = '';

      // Defs for gradients
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      series.forEach((s, idx) => {
        const grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        grad.id = `emonGradArea_${idx}`;
        grad.setAttribute('x1', '0');
        grad.setAttribute('y1', '0');
        grad.setAttribute('x2', '0');
        grad.setAttribute('y2', '1');

        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('stop-color', s.color);
        stop1.setAttribute('stop-opacity', '0.35');

        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('stop-color', s.color);
        stop2.setAttribute('stop-opacity', '0.0');

        grad.appendChild(stop1);
        grad.appendChild(stop2);
        defs.appendChild(grad);
      });
      svg.appendChild(defs);

      // Grid lines
      const gridLevels = 4;
      for (let i = 0; i <= gridLevels; i++) {
        const y = padding.top + (chartH / gridLevels) * i;
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', padding.left);
        line.setAttribute('x2', width - padding.right);
        line.setAttribute('y1', y);
        line.setAttribute('y2', y);
        line.setAttribute('stroke', 'var(--outline-variant)');
        line.setAttribute('stroke-dasharray', '4 4');
        line.setAttribute('stroke-width', '1');
        line.setAttribute('opacity', '0.5');
        svg.appendChild(line);
      }

      // Compute coordinate points
      const count = categories.length;
      const stepX = chartW / (count - 1);

      series.forEach((s, sIdx) => {
        const points = s.data.map((val, i) => {
          const x = padding.left + i * stepX;
          const y = padding.top + chartH - (val / maxVal) * chartH;
          return { x, y, val, cat: categories[i] };
        });

        // Polygon area fill
        if (!s.dashed) {
          const polyPoints = [
            `${padding.left},${padding.top + chartH}`,
            ...points.map(p => `${p.x},${p.y}`),
            `${points[points.length - 1].x},${padding.top + chartH}`
          ].join(' ');

          const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
          polygon.setAttribute('fill', `url(#emonGradArea_${sIdx})`);
          polygon.setAttribute('points', polyPoints);
          svg.appendChild(polygon);
        }

        // Line path
        const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        polyline.setAttribute('fill', 'none');
        polyline.setAttribute('stroke', s.color);
        polyline.setAttribute('stroke-width', s.dashed ? '2.5' : '3');
        if (s.dashed) polyline.setAttribute('stroke-dasharray', '6 4');
        polyline.setAttribute('stroke-linecap', 'round');
        polyline.setAttribute('stroke-linejoin', 'round');
        polyline.setAttribute('points', points.map(p => `${p.x},${p.y}`).join(' '));
        svg.appendChild(polyline);

        // Data nodes with hover events
        points.forEach((pt, pIdx) => {
          const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          circle.setAttribute('cx', pt.x);
          circle.setAttribute('cy', pt.y);
          circle.setAttribute('r', pIdx === points.length - 1 ? '6' : '4');
          circle.setAttribute('fill', '#ffffff');
          circle.setAttribute('stroke', s.color);
          circle.setAttribute('stroke-width', '3');
          circle.style.cursor = 'pointer';
          circle.style.transition = 'transform 0.15s ease';

          // Tooltip interactions
          circle.addEventListener('mouseenter', (e) => {
            circle.setAttribute('r', '7');
            EmonCharts.showChartTooltip(e, `${s.name}: ${pt.val}`, pt.cat);
          });
          circle.addEventListener('mouseleave', () => {
            circle.setAttribute('r', pIdx === points.length - 1 ? '6' : '4');
            EmonCharts.hideChartTooltip();
          });

          svg.appendChild(circle);
        });
      });
    }

    /**
     * Renders a responsive Bar Chart into an SVG container
     */
    static renderBarChart(target, options = {}) {
      const svg = typeof target === 'string' ? document.querySelector(target) : target;
      if (!svg) return;

      const data = options.data || [45, 62, 85, 40, 75, 92, 68, 54, 88, 70];
      const categories = options.categories || ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10'];
      const width = options.width || 500;
      const height = options.height || 180;
      const padding = { top: 15, right: 15, bottom: 25, left: 15 };

      const chartW = width - padding.left - padding.right;
      const chartH = height - padding.top - padding.bottom;
      const maxVal = Math.max(...data) * 1.15 || 100;

      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      svg.innerHTML = '';

      const barWidth = (chartW / data.length) * 0.55;
      const slotWidth = chartW / data.length;

      data.forEach((val, i) => {
        const x = padding.left + i * slotWidth + (slotWidth - barWidth) / 2;
        const barH = (val / maxVal) * chartH;
        const y = padding.top + chartH - barH;

        // Background track bar
        const track = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        track.setAttribute('x', x);
        track.setAttribute('y', padding.top);
        track.setAttribute('width', barWidth);
        track.setAttribute('height', chartH);
        track.setAttribute('rx', '4');
        track.setAttribute('fill', 'var(--surface-container)');
        svg.appendChild(track);

        // Active Bar
        const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bar.setAttribute('x', x);
        bar.setAttribute('y', y);
        bar.setAttribute('width', barWidth);
        bar.setAttribute('height', barH);
        bar.setAttribute('rx', '4');
        bar.setAttribute('fill', i === data.length - 1 ? 'var(--primary)' : 'var(--primary-fixed)');
        bar.style.cursor = 'pointer';
        bar.style.transition = 'fill 0.2s ease, transform 0.2s ease';

        bar.addEventListener('mouseenter', (e) => {
          bar.setAttribute('fill', 'var(--primary)');
          EmonCharts.showChartTooltip(e, `Nilai: ${val}`, categories[i]);
        });
        bar.addEventListener('mouseleave', () => {
          if (i !== data.length - 1) bar.setAttribute('fill', 'var(--primary-fixed)');
          EmonCharts.hideChartTooltip();
        });

        svg.appendChild(bar);
      });
    }

    /**
     * Tooltip helper
     */
    static showChartTooltip(e, text, title) {
      let tt = document.getElementById('emon-chart-tooltip');
      if (!tt) {
        tt = document.createElement('div');
        tt.id = 'emon-chart-tooltip';
        tt.className = 'chart-tooltip fixed bg-on-surface text-surface px-3 py-1.5 rounded-lg shadow-xl text-xs pointer-events-none z-50';
        document.body.appendChild(tt);
      }
      tt.innerHTML = `
        <div class="font-bold text-surface-bright">${title || ''}</div>
        <div class="text-surface-variant font-medium">${text}</div>
      `;
      tt.style.left = `${e.clientX + 10}px`;
      tt.style.top = `${e.clientY - 35}px`;
      tt.classList.add('show');
    }

    static hideChartTooltip() {
      const tt = document.getElementById('emon-chart-tooltip');
      if (tt) tt.classList.remove('show');
    }

    /**
     * Renders a Donut/Pie Chart into an SVG container
     * @param {string|SVGElement} target
     * @param {Object} options - { data: [{label, value, color}], donut: bool, size: 200 }
     */
    static renderDonutChart(target, options = {}) {
      const svg = typeof target === 'string' ? document.querySelector(target) : target;
      if (!svg) return;

      const segments = options.data || [
        { label: 'Segment A', value: 40, color: 'var(--primary)' },
        { label: 'Segment B', value: 30, color: 'var(--secondary)' },
        { label: 'Segment C', value: 20, color: 'var(--tertiary)' },
        { label: 'Other', value: 10, color: 'var(--outline-variant)' }
      ];
      const size = options.size || 180;
      const donut = options.donut !== false;
      const cx = size / 2;
      const cy = size / 2;
      const outerR = size / 2 - 10;
      const innerR = donut ? outerR * 0.6 : 0;

      svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
      svg.innerHTML = '';

      const total = segments.reduce((s, d) => s + d.value, 0);
      if (total === 0) return;

      let startAngle = -Math.PI / 2;

      segments.forEach((seg, idx) => {
        const sliceAngle = (seg.value / total) * 2 * Math.PI;
        const endAngle = startAngle + sliceAngle;

        const x1 = cx + outerR * Math.cos(startAngle);
        const y1 = cy + outerR * Math.sin(startAngle);
        const x2 = cx + outerR * Math.cos(endAngle);
        const y2 = cy + outerR * Math.sin(endAngle);

        const xi1 = cx + innerR * Math.cos(endAngle);
        const yi1 = cy + innerR * Math.sin(endAngle);
        const xi2 = cx + innerR * Math.cos(startAngle);
        const yi2 = cy + innerR * Math.sin(startAngle);

        const largeArc = sliceAngle > Math.PI ? 1 : 0;

        let d;
        if (donut) {
          d = [
            `M ${x1} ${y1}`,
            `A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2}`,
            `L ${xi1} ${yi1}`,
            `A ${innerR} ${innerR} 0 ${largeArc} 0 ${xi2} ${yi2}`,
            'Z'
          ].join(' ');
        } else {
          d = [
            `M ${cx} ${cy}`,
            `L ${x1} ${y1}`,
            `A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2}`,
            'Z'
          ].join(' ');
        }

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('fill', seg.color);
        path.setAttribute('stroke', 'var(--surface-container-lowest)');
        path.setAttribute('stroke-width', '2');
        path.style.cursor = 'pointer';
        path.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        path.style.transformOrigin = `${cx}px ${cy}px`;

        path.addEventListener('mouseenter', (e) => {
          path.style.opacity = '0.85';
          path.style.transform = 'scale(1.04)';
          const pct = ((seg.value / total) * 100).toFixed(1);
          EmonCharts.showChartTooltip(e, `${seg.value} (${pct}%)`, seg.label);
        });
        path.addEventListener('mouseleave', () => {
          path.style.opacity = '1';
          path.style.transform = 'scale(1)';
          EmonCharts.hideChartTooltip();
        });

        svg.appendChild(path);
        startAngle = endAngle;
      });

      // Center label for donut
      if (donut && options.centerLabel) {
        const textGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

        const val = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        val.setAttribute('x', cx);
        val.setAttribute('y', cy + 2);
        val.setAttribute('text-anchor', 'middle');
        val.setAttribute('dominant-baseline', 'middle');
        val.setAttribute('fill', 'var(--on-surface)');
        val.setAttribute('font-size', size * 0.13);
        val.setAttribute('font-weight', '700');
        val.setAttribute('font-family', 'var(--font-display)');
        val.textContent = options.centerLabel;

        if (options.centerSub) {
          const sub = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          sub.setAttribute('x', cx);
          sub.setAttribute('y', cy + size * 0.11);
          sub.setAttribute('text-anchor', 'middle');
          sub.setAttribute('fill', 'var(--on-surface-variant)');
          sub.setAttribute('font-size', size * 0.07);
          sub.textContent = options.centerSub;
          textGroup.appendChild(val);
          textGroup.appendChild(sub);
        } else {
          textGroup.appendChild(val);
        }
        svg.appendChild(textGroup);
      }
    }

    /**
     * Renders a Radial Gauge Chart into an SVG
     * @param {string|SVGElement} target
     * @param {Object} options - { value: 0-100, min, max, label, color, size }
     */
    static renderGaugeChart(target, options = {}) {
      const svg = typeof target === 'string' ? document.querySelector(target) : target;
      if (!svg) return;

      const size = options.size || 160;
      const cx = size / 2;
      const cy = size / 2;
      const R = size / 2 - 16;
      const min = options.min || 0;
      const max = options.max || 100;
      const raw = Math.min(Math.max(options.value || 0, min), max);
      const pct = (raw - min) / (max - min);
      const color = options.color || 'var(--primary)';
      const label = options.label || '';

      // Gauge arc: 225deg span (from 225deg to 315deg, going clockwise)
      const startDeg = 225;
      const totalDeg = 270;
      const fillDeg = totalDeg * pct;

      function polarToXY(deg, r) {
        const rad = ((deg - 90) * Math.PI) / 180;
        return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
      }

      function arcPath(startD, endD, r) {
        const start = polarToXY(startD, r);
        const end = polarToXY(endD, r);
        const large = endD - startD > 180 ? 1 : 0;
        return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`;
      }

      svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
      svg.innerHTML = '';

      // Background track
      const track = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      track.setAttribute('d', arcPath(startDeg, startDeg + totalDeg, R));
      track.setAttribute('fill', 'none');
      track.setAttribute('stroke', 'var(--surface-container)');
      track.setAttribute('stroke-width', '12');
      track.setAttribute('stroke-linecap', 'round');
      svg.appendChild(track);

      // Value fill
      if (pct > 0) {
        const fill = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        fill.setAttribute('d', arcPath(startDeg, startDeg + fillDeg, R));
        fill.setAttribute('fill', 'none');
        fill.setAttribute('stroke', color);
        fill.setAttribute('stroke-width', '12');
        fill.setAttribute('stroke-linecap', 'round');
        svg.appendChild(fill);
      }

      // Value text
      const valText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      valText.setAttribute('x', cx);
      valText.setAttribute('y', cy + 6);
      valText.setAttribute('text-anchor', 'middle');
      valText.setAttribute('dominant-baseline', 'middle');
      valText.setAttribute('fill', 'var(--on-surface)');
      valText.setAttribute('font-size', size * 0.18);
      valText.setAttribute('font-weight', '700');
      valText.setAttribute('font-family', 'var(--font-display)');
      valText.textContent = `${Math.round(pct * 100)}%`;
      svg.appendChild(valText);

      // Label text
      if (label) {
        const lblText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        lblText.setAttribute('x', cx);
        lblText.setAttribute('y', cy + size * 0.22);
        lblText.setAttribute('text-anchor', 'middle');
        lblText.setAttribute('fill', 'var(--on-surface-variant)');
        lblText.setAttribute('font-size', size * 0.08);
        lblText.textContent = label;
        svg.appendChild(lblText);
      }
    }
  }

  window.EmonCharts = EmonCharts;
})();
