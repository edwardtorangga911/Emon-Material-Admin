# Emon Material Admin

> **Offline-First Customizable Admin Dashboard Theme combining Google Material 3 and Microsoft Metro UI.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Offline Capable](https://img.shields.io/badge/Offline-100%25%20Ready-success.svg)](OFFLINE_GUIDE.md)
[![Design System](https://img.shields.io/badge/Design-Material%203%20%2B%20Metro-orange.svg)](DESIGN.md)

---

## 🌟 Tentang Emon Material Admin

**Emon Material Admin** adalah repositori tema dashboard admin modern dan elegan yang dirancang khusus dengan filosofi **offline-first**. Tema ini menggabungkan ketegasan tipografi dan *modular live tile* khas **Microsoft Metro** dengan kehalusan elevasi permukaan (*tonal surface elevation*), interaksi taktil, dan ergonomi warna dari **Google Material 3**.

Dibuat untuk aplikasi enterprise, intranet pemerintahan/sekolah, sistem kasir/POS, perangkat IoT, dan server lokal yang membutuhkan dashboard tangguh tanpa ketergantungan pada CDN internet luar.

---

## ✨ Fitur Unggulan

### 1. 📴 100% Berjalan Offline (Zero External CDN)
- **Font & Ikon Lokal**: Font `Inter`, `Plus Jakarta Sans`, dan ikon `Material Symbols Outlined` (.woff2) tersimpan lokal di dalam folder `assets/fonts/`.
- **Tailwind Standalone Lokal**: Berisi bundle `assets/js/tailwind.js` yang dieksekusi langsung tanpa menyentuh server CDN luar.
- **Aset Vektor Native**: Logo merek, ikon sistem, dan avatar pengguna menggunakan file SVG lokal.

### 2. 🎨 Live Theme Customizer (Kustomisasi Offline)
- **Palet Warna Siap Pakai**:
  - *Classic Blue* (Material 3 default)
  - *Emerald Teal* (Fintech & Healthcare)
  - *Royal Purple* (AI & Telemetri)
  - *Metro Amber* (Hangat & Kontras)
  - *Crimson Rose* (Tegas & Bold)
  - *Cyber Slate* (Modern Dark)
- **Pemilih Warna Kustom**: Input warna hex (`<input type="color">`) yang menghitung kontras dan tone warna secara dinamis.
- **Mode Tampilan**: Light Mode, Dark Mode, dan Auto (Sistem).
- **Border Radius Fleksibel**: Pilihan sudut tajam (0px), normal (8px), halus (14px), atau bentuk kapsul/pill (20px).
- **Ekspor Instan**:
  - Salin variabel CSS `:root` ke clipboard hanya dengan 1 klik.
  - Unduh konfigurasi tema dalam format file JSON (`emon-material-theme.json`).
- **Penyimpanan Lokal**: Preferensi tema otomatis tersimpan di `localStorage` peramban.

### 3. 📊 Grafik Vektor SVG Interaktif Tanpa Dependensi (`emon-charts.js`)
- Menyediakan grafik Area, Batang, dan Sparkline menggunakan generator SVG native.
- Tidak membutuhkan library pihak ketiga (tanpa Chart.js, tanpa D3, tanpa ApexCharts).
- Reaktif: Grafik otomatis menyesuaikan warnanya saat pengguna mengganti tema di Customizer.

### 4. 📑 20+ Halaman Lengkap & Siap Pakai (Primer UI Inspired)
| Kategori | Halaman | Keterangan |
|---|---|---|
| **Dashboards** | [**`index.html`**](file:///root/Emon-Material-Admin/index.html) | Dashboard Eksekutif utama (Live Tiles, Grafik Telemetri, Gauge NVMe & SLA, Ledger Transaksi, Modal Entri Cepat). |
| | [**`ecommerce.html`**](file:///root/Emon-Material-Admin/ecommerce.html) | Dashboard E-Commerce (Ringkasan Penjualan, Tren Wilayah, Produk Terlaris, Metrik ARR). |
| | [**`analytics.html`**](file:///root/Emon-Material-Admin/analytics.html) | Analitik telemetri data, grafik mingguan (WAS), corong konversi, dan sebaran peramban. |
| **Applications** | [**`chat.html`**](file:///root/Emon-Material-Admin/chat.html) | Aplikasi Chat & Pesan interaktif, daftar kontak aktif, status online, dan composer pesan. |
| | [**`calendar.html`**](file:///root/Emon-Material-Admin/calendar.html) | Kalender jadwal kegiatan interaktif (Month/Week/Day), filter kategori, dan modal event. |
| | [**`taskboard.html`**](file:///root/Emon-Material-Admin/taskboard.html) | Papan kerja Kanban 4-kolom (Backlog, In Progress, Review, Done) dengan kartu tugas dan modal task baru. |
| **E-Commerce** | [**`products.html`**](file:///root/Emon-Material-Admin/products.html) | Katalog produk grid view dengan rating bintang, filter kategori, badge stok, dan modal tambah produk. |
| | [**`orders.html`**](file:///root/Emon-Material-Admin/orders.html) | Manajemen pesanan & penjualan dengan pengurutan kolom, filter status, dan modal rincian transaksi. |
| | [**`customers.html`**](file:///root/Emon-Material-Admin/customers.html) | Direktori pelanggan dan anggota, badge status keanggotaan, dan kontak teknis. |
| | [**`pricing.html`**](file:///root/Emon-Material-Admin/pricing.html) | Matriks perbandingan paket harga lisensi transparan (Starter, Pro Enterprise, Dedicated Cluster). |
| | [**`invoice-print.html`**](file:///root/Emon-Material-Admin/invoice-print.html) | Faktur penjualan siap cetak (A4 / PDF print-optimized) dengan CSS `@media print`. |
| **Halaman & Akun** | [**`profile.html`**](file:///root/Emon-Material-Admin/profile.html) | Profil pengguna profesional dengan hero avatar, bio, badge keahlian teknis, dan log aktivitas. |
| | [**`timeline.html`**](file:///root/Emon-Material-Admin/timeline.html) | Timeline vertikal log aktivitas, deployment rilis v1.2, audit keamanan, dan backup snapshot. |
| | [**`blank.html`**](file:///root/Emon-Material-Admin/blank.html) | Template halaman kosong (Starter Kit) siap pakai untuk membuat modul baru tanpa mengulang boilerplate. |
| | [**`lockscreen.html`**](file:///root/Emon-Material-Admin/lockscreen.html) | Layar kunci sesi dengan jam digital aktif, avatar pengguna, input PIN/password, dan verifikasi biometrik. |
| | [**`login.html`**](file:///root/Emon-Material-Admin/login.html) | Layar masuk administrator dengan desain dual-split Metro tile + form Material 3. |
| | [**`register.html`**](file:///root/Emon-Material-Admin/register.html) | Formulir pendaftaran akun administrator baru. |
| | [**`forgot-password.html`**](file:///root/Emon-Material-Admin/forgot-password.html) | Layar pemulihan kata sandi. |
| | [**`404.html`**](file:///root/Emon-Material-Admin/404.html) | Halaman penanganan rute tidak ditemukan bergaya Metro Material. |
| | [**`500.html`**](file:///root/Emon-Material-Admin/500.html) | Halaman penanganan kesalahan server internal dengan toggle log diagnostik. |
| **UI & Widgets** | [**`widgets.html`**](file:///root/Emon-Material-Admin/widgets.html) | Koleksi lengkap Live Tiles bergaya Windows Metro (Cuaca, NVMe I/O, Checklist Tugas, Metrik Sosial). |
| | [**`components.html`**](file:///root/Emon-Material-Admin/components.html) | Katalog komponen UI lengkap (Tombol, Chip, Badge, Form Input, Dropdown, Toggle, Notifikasi Toast). |
| | [**`settings.html`**](file:///root/Emon-Material-Admin/settings.html) | Pusat konfigurasi tema offline, salin CSS variables, dan pengaturan profil admin. |

### 5. ⚡ Fitur Engine Baru (v3.3.0)
- **Emon Motion Engine (`emon-anim.js`)**: Animasi transisi 60fps native, ripple effect koordinat sentuh, counter angka naik (count-up KPI), dan 3D tile tilt.
- **PWA & Offline Service Worker (`sw.js`)**: Dapat diinstall sebagai aplikasi native desktop/mobile dan tersimpan di cache browser.
- **Precompiled Production CSS (`emon-material.min.css`)**: File CSS statis terkompilasi hanya berukuran ~68KB untuk performa instan di server/perangkat terbatas.
- **Client-Side Data Grid Engine**:
  - Pengurutan tabel interaktif (klik header untuk sortir ASC / DESC).
  - Ekspor instan tabel ke format CSV & JSON menggunakan native JavaScript `Blob` (tanpa backend).
- **Command Palette (Ctrl + K / ⌘K)**: Modal pencarian cepat untuk navigasi instan antar menu.
- **Drawer Kustomisasi Mengambang**: Tombol palet mengambang di pojok layar untuk mengubah tema kapan saja.
- **Responsive Navigation**: Sidebar kolapsibel (Mini Sidebar mode) dan drawer ramah seluler (*mobile-friendly*).

---

## 🚀 Memulai (Quick Start)

### Menjalankan Langsung (Direct Browser)
Karena seluruh path bersifat lokal dan independen, Anda dapat membuka halaman manapun langsung dari file manager:
- Klik dua kali file `index.html`.

### Menjalankan via Server Lokal (Opsional)

```bash
# Clone repository
git clone https://github.com/edwardtorangga911/Emon-Material-Admin.git
cd Emon-Material-Admin

# Menggunakan Python 3:
python3 -m http.server 8080

# Atau menggunakan PHP:
php -S localhost:8080

# Atau menggunakan Node.js:
npx serve .
```

Buka peramban di: `http://localhost:8080`

---

## 📁 Struktur Direktori

```
Emon-Material-Admin/
├── index.html                 # Executive Dashboard
├── analytics.html             # Analytics & Telemetry Hub
├── orders.html                # Orders & Sales Management
├── customers.html             # Customer Directory
├── components.html            # UI Components Kit & Styleguide
├── settings.html              # Settings & Theme Configurator
├── DESIGN.md                  # Spesifikasi Desain & Warna
├── OFFLINE_GUIDE.md           # Panduan Kustomisasi Offline Lengkap
├── README.md                  # Dokumentasi Repositori
├── package.json               # Konfigurasi Paket
├── LICENSE                    # Lisensi MIT
└── assets/
    ├── css/
    │   └── emon-theme.css     # CSS Custom Properties (:root) & Dark Mode
    ├── fonts/
    │   ├── fonts.css          # Deklarasi @font-face lokal
    │   ├── inter-*.woff2      # Font woff2 Inter
    │   ├── plus-jakarta-*.woff2 # Font woff2 Plus Jakarta Sans
    │   └── material-symbols-*.woff2 # Ikon woff2 Material Symbols
    ├── js/
    │   ├── tailwind.js        # Engine Tailwind lokal (offline)
    │   ├── emon-theme.js      # Engine tema & live customizer drawer
    │   ├── emon-charts.js     # Engine grafik vektor SVG native
    │   └── emon-app.js        # Logika aplikasi (modal, dropdown, filter)
    └── images/
        ├── emon-logo.svg      # Logo Emon Material Admin
        ├── emon-icon.svg      # Favicon / icon brand
        └── avatars/           # Avatar SVG pengguna lokal
```

---

## 🎨 Panduan Kustomisasi CSS

Semua variabel warna dapat diganti melalui blok CSS `:root`:

```css
:root {
  --primary: #005bbf;          /* Warna utama */
  --primary-hover: #004da3;    /* Warna hover */
  --primary-container: #1a73e8;/* Latar container utama */
  --secondary: #006b5f;        /* Warna aksen kedua & sukses */
  --tertiary: #6833ea;         /* Warna aksen ketiga */
  --radius-md: 0.5rem;         /* Kelengkungan sudut (8px) */
}
```

Untuk petunjuk lebih mendalam tentang integrasi dengan Laravel, PHP, CodeIgniter, atau framework lainnya, silakan baca [**OFFLINE_GUIDE.md**](OFFLINE_GUIDE.md).

---

## 📜 Lisensi & Kontributor

- **Pengembang**: [Edward Torangga](https://github.com/edwardtorangga911)
- **Lisensi**: [MIT License](LICENSE) &copy; 2026 Emon Material Admin.
