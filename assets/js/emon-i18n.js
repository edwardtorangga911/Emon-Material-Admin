/**
 * Emon Material Admin - i18n Engine (emon-i18n.js)
 * Lightweight internationalization. Zero dependencies.
 *
 * Usage:
 *   <span data-i18n="dashboard.title"></span>
 *   EmonI18n.t('dashboard.title')
 *   EmonI18n.setLang('en')
 */

(function () {
  'use strict';

  const LOCALES = {
    id: {
      nav: {
        dashboard: 'Dashboard',
        ecommerce: 'E-Commerce',
        analytics: 'Analitik',
        reports: 'Laporan',
        chat: 'Chat & Pesan',
        calendar: 'Kalender',
        taskboard: 'Taskboard',
        products: 'Katalog Produk',
        orders: 'Pesanan & Sales',
        customers: 'Pelanggan',
        pricing: 'Paket Harga',
        profile: 'Profil User',
        timeline: 'Timeline Aktivitas',
        notifications: 'Notifikasi',
        pos: 'Kasir / POS',
        import: 'Import Data',
        settings: 'Settings',
        widgets: 'Live Tiles',
        components: 'Komponen UI'
      },
      common: {
        search: 'Cari...',
        export: 'Ekspor',
        import: 'Import',
        print: 'Cetak',
        save: 'Simpan',
        cancel: 'Batal',
        delete: 'Hapus',
        edit: 'Edit',
        add: 'Tambah',
        close: 'Tutup',
        loading: 'Memuat...',
        noData: 'Tidak ada data',
        confirm: 'Konfirmasi',
        reset: 'Reset',
        filter: 'Filter',
        sort: 'Urutkan',
        all: 'Semua',
        actions: 'Aksi',
        status: 'Status',
        date: 'Tanggal',
        total: 'Total',
        success: 'Berhasil',
        error: 'Kesalahan',
        warning: 'Peringatan',
        info: 'Informasi',
        showing: 'Menampilkan',
        of: 'dari',
        data: 'data',
        prev: 'Sebelumnya',
        next: 'Berikutnya'
      },
      dashboard: {
        title: 'Dashboard Eksekutif',
        revenue: 'Total Pendapatan',
        orders: 'Total Pesanan',
        customers: 'Pelanggan Baru',
        churn: 'Tingkat Churn',
        recentOrders: 'Pesanan Terbaru',
        topProducts: 'Produk Terlaris'
      },
      orders: {
        title: 'Pesanan & Sales',
        id: 'ID Pesanan',
        customer: 'Pelanggan',
        product: 'Produk',
        amount: 'Nominal',
        paid: 'Lunas',
        pending: 'Pending',
        refund: 'Refund',
        processing: 'Diproses'
      },
      auth: {
        login: 'Masuk',
        logout: 'Keluar',
        register: 'Daftar',
        username: 'Nama Pengguna',
        password: 'Kata Sandi',
        confirmPassword: 'Konfirmasi Kata Sandi',
        forgotPassword: 'Lupa Kata Sandi?',
        email: 'Email',
        rememberMe: 'Ingat Saya',
        loginTitle: 'Selamat Datang',
        loginSubtitle: 'Masuk ke akun administrator Anda'
      },
      settings: {
        title: 'Pengaturan',
        theme: 'Tema',
        language: 'Bahasa',
        darkMode: 'Mode Gelap',
        lightMode: 'Mode Terang',
        systemMode: 'Ikuti Sistem',
        radius: 'Sudut Tampilan',
        sidebar: 'Sidebar Mini'
      }
    },

    en: {
      nav: {
        dashboard: 'Dashboard',
        ecommerce: 'E-Commerce',
        analytics: 'Analytics',
        reports: 'Reports',
        chat: 'Chat & Messages',
        calendar: 'Calendar',
        taskboard: 'Taskboard',
        products: 'Product Catalog',
        orders: 'Orders & Sales',
        customers: 'Customers',
        pricing: 'Pricing Plans',
        profile: 'User Profile',
        timeline: 'Activity Timeline',
        notifications: 'Notifications',
        pos: 'Point of Sale',
        import: 'Import Data',
        settings: 'Settings',
        widgets: 'Live Tiles',
        components: 'UI Components'
      },
      common: {
        search: 'Search...',
        export: 'Export',
        import: 'Import',
        print: 'Print',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        add: 'Add',
        close: 'Close',
        loading: 'Loading...',
        noData: 'No data available',
        confirm: 'Confirm',
        reset: 'Reset',
        filter: 'Filter',
        sort: 'Sort',
        all: 'All',
        actions: 'Actions',
        status: 'Status',
        date: 'Date',
        total: 'Total',
        success: 'Success',
        error: 'Error',
        warning: 'Warning',
        info: 'Information',
        showing: 'Showing',
        of: 'of',
        data: 'records',
        prev: 'Previous',
        next: 'Next'
      },
      dashboard: {
        title: 'Executive Dashboard',
        revenue: 'Total Revenue',
        orders: 'Total Orders',
        customers: 'New Customers',
        churn: 'Churn Rate',
        recentOrders: 'Recent Orders',
        topProducts: 'Top Products'
      },
      orders: {
        title: 'Orders & Sales',
        id: 'Order ID',
        customer: 'Customer',
        product: 'Product',
        amount: 'Amount',
        paid: 'Paid',
        pending: 'Pending',
        refund: 'Refund',
        processing: 'Processing'
      },
      auth: {
        login: 'Sign In',
        logout: 'Sign Out',
        register: 'Register',
        username: 'Username',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        forgotPassword: 'Forgot Password?',
        email: 'Email',
        rememberMe: 'Remember Me',
        loginTitle: 'Welcome Back',
        loginSubtitle: 'Sign in to your administrator account'
      },
      settings: {
        title: 'Settings',
        theme: 'Theme',
        language: 'Language',
        darkMode: 'Dark Mode',
        lightMode: 'Light Mode',
        systemMode: 'Follow System',
        radius: 'Corner Radius',
        sidebar: 'Mini Sidebar'
      }
    }
  };

  const STORAGE_KEY = 'emon_lang';

  const EmonI18n = {
    lang: localStorage.getItem(STORAGE_KEY) || 'id',
    locales: LOCALES,

    /**
     * Get translation by dot-notated key
     * EmonI18n.t('common.save') → 'Simpan'
     */
    t(key, fallback) {
      const parts = key.split('.');
      let val = this.locales[this.lang];
      for (const p of parts) {
        if (!val || typeof val !== 'object') return fallback || key;
        val = val[p];
      }
      return (val && typeof val === 'string') ? val : (fallback || key);
    },

    /** Switch language and re-render all [data-i18n] elements */
    setLang(lang) {
      if (!this.locales[lang]) return;
      this.lang = lang;
      localStorage.setItem(STORAGE_KEY, lang);
      this.render();
      document.documentElement.setAttribute('lang', lang);
      if (window.EmonToast) EmonToast.info(`Bahasa diubah ke ${lang.toUpperCase()}`);
    },

    /** Render all [data-i18n] elements in the DOM */
    render() {
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        const translated = this.t(key);
        if (translated && translated !== key) {
          el.textContent = translated;
        }
      });
      document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const translated = this.t(el.dataset.i18nPlaceholder);
        if (translated) el.placeholder = translated;
      });
      document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const translated = this.t(el.dataset.i18nTitle);
        if (translated) el.title = translated;
      });
    },

    /** Add or extend a locale */
    extend(lang, obj) {
      if (!this.locales[lang]) this.locales[lang] = {};
      Object.assign(this.locales[lang], obj);
    },

    /** Get all available language codes */
    available() {
      return Object.keys(this.locales);
    }
  };

  window.EmonI18n = EmonI18n;

  document.addEventListener('DOMContentLoaded', () => {
    document.documentElement.setAttribute('lang', EmonI18n.lang);
    EmonI18n.render();
  });
})();
