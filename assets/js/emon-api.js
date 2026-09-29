/**
 * Emon Material Admin - API Layer (emon-api.js)
 * Offline-first fetch wrapper. Falls back to static mock data when offline.
 * Usage: EmonAPI.get('/api/orders').then(data => ...)
 */

(function () {
  'use strict';

  const EmonAPI = {
    baseURL: window.EMON_API_BASE || '',
    timeout: 8000,

    async request(method, endpoint, body = null) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeout);

      try {
        const opts = {
          method,
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
        };
        if (body) opts.body = JSON.stringify(body);

        const res = await fetch(this.baseURL + endpoint, opts);
        clearTimeout(timer);

        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return await res.json();
      } catch (err) {
        clearTimeout(timer);

        // Offline fallback: try mock data
        const mock = EmonAPI._getMock(endpoint);
        if (mock !== null) {
          console.info(`[EmonAPI] Offline — serving mock for ${endpoint}`);
          return mock;
        }

        // Surface error
        const msg = err.name === 'AbortError' ? 'Request timeout' : err.message;
        if (window.EmonToast) EmonToast.error(`API Error: ${msg}`);
        throw err;
      }
    },

    get:    (endpoint) => EmonAPI.request('GET', endpoint),
    post:   (endpoint, body) => EmonAPI.request('POST', endpoint, body),
    put:    (endpoint, body) => EmonAPI.request('PUT', endpoint, body),
    delete: (endpoint) => EmonAPI.request('DELETE', endpoint),

    // ---------------------------------------------------------------
    // Mock data registry — extend this with your actual data shapes
    // ---------------------------------------------------------------
    _mocks: {
      '/api/orders': {
        data: [
          { id: 'TRX-9281', customer: 'Andi Wijaya', total: 24750000, status: 'lunas', date: '2026-09-29' },
          { id: 'TRX-9280', customer: 'Sari Indah', total: 8500000, status: 'pending', date: '2026-09-29' },
          { id: 'TRX-9279', customer: 'Budi Santoso', total: 1890000, status: 'lunas', date: '2026-09-28' }
        ],
        meta: { total: 3, page: 1, per_page: 10 }
      },
      '/api/products': {
        data: [
          { id: 1, name: 'MacBook Pro M4', category: 'Elektronik', price: 28500000, stock: 12 },
          { id: 2, name: 'iPhone 17 Pro', category: 'Elektronik', price: 19500000, stock: 34 },
          { id: 3, name: 'Kopi Arabika Gayo', category: 'Makanan', price: 95000, stock: 220 }
        ],
        meta: { total: 3, page: 1, per_page: 10 }
      },
      '/api/customers': {
        data: [
          { id: 1, name: 'Andi Wijaya', email: 'andi@example.com', tier: 'Premium', orders: 14 },
          { id: 2, name: 'Maya Putri', email: 'maya@example.com', tier: 'Regular', orders: 7 }
        ],
        meta: { total: 2, page: 1, per_page: 10 }
      },
      '/api/stats': {
        revenue: 4280000000,
        orders: 18492,
        customers: 3847,
        churn_rate: 2.34
      },
      '/api/notifications': {
        data: [],
        unread: 0
      }
    },

    _getMock(endpoint) {
      // Strip query string
      const base = endpoint.split('?')[0];
      return EmonAPI._mocks[base] !== undefined ? EmonAPI._mocks[base] : null;
    },

    /**
     * Register custom mock data (useful for extending from page scripts)
     * EmonAPI.registerMock('/api/invoices', { data: [...] })
     */
    registerMock(endpoint, data) {
      this._mocks[endpoint] = data;
    }
  };

  window.EmonAPI = EmonAPI;
})();
