# Panduan Kustomisasi Offline (Emon Material Admin)

Dokumen ini menjelaskan arsitektur **offline-first** pada **Emon Material Admin** dan cara melakukan kustomisasi penuh tanpa koneksi internet.

---

## 1. Prinsip Offline-First

Pada umumnya template admin modern bergantung pada CDN eksternal (Google Fonts, Font Awesome, Tailwind CDN, Chart.js CDN, gambar eksternal). Jika diakses di jaringan tertutup (intranet kantor, sekolah, server lokal, atau saat tidak ada koneksi internet), tampilan akan rusak dan ikon tidak muncul.

**Emon Material Admin mengatasi masalah ini dengan:**
1. **Font Lokal**: Font `Inter`, `Plus Jakarta Sans`, dan ikon `Material Symbols Outlined` disimpan secara lokal dalam format `.woff2` di folder `assets/fonts/`.
2. **CSS Variables Berbasis Token**: Semua warna, kelengkungan (*border radius*), bayangan (*elevation*), dan spasi diatur melalui variabel CSS `:root`.
3. **Engine Tailwind Lokal**: File `assets/js/tailwind.js` disediakan langsung di dalam repositori sehingga utilitas styling tetap aktif tanpa perlu koneksi ke `cdn.tailwindcss.com`.
4. **Grafik SVG Zero-Dependency**: File `assets/js/emon-charts.js` menggambar grafik garis, area, dan batang murni dengan manipulasi SVG native tanpa butuh library eksternal.
5. **Theme Customizer Offline**: Pengaturan warna, dark mode, dan density tersimpan otomatis di `localStorage` peramban.

---

## 2. Struktur File Tema

```
Emon-Material-Admin/
├── index.html                 # Dashboard Executive Overview (Live Tiles, Chart, Table)
├── analytics.html             # Telemetri & Analitik mendalam
├── orders.html                # Manajemen Pesanan & Transaksi CRUD
├── customers.html             # Direktori Data Pelanggan
├── components.html            # Katalog Komponen UI Material 3 + Metro
├── settings.html              # Pengaturan Tema & Konfigurasi Sistem
├── OFFLINE_GUIDE.md           # Panduan ini
├── README.md                  # Dokumentasi Umum
├── package.json               # Metadata & script lokal
└── assets/
    ├── css/
    │   └── emon-theme.css     # CSS Custom Properties (:root) & mode malam
    ├── fonts/
    │   ├── fonts.css          # Deklarasi @font-face lokal
    │   ├── inter-*.woff2      # File font Inter
    │   ├── plus-jakarta-*.woff2 # File font Plus Jakarta Sans
    │   └── material-symbols-*.woff2 # File ikon Material Symbols
    ├── js/
    │   ├── tailwind.js        # Engine Tailwind lokal (offline)
    │   ├── emon-theme.js      # Engine kustomisasi & storage offline
    │   ├── emon-charts.js     # Engine grafik vektor SVG native
    │   └── emon-app.js        # Logika aplikasi (modal, dropdown, filter)
    └── images/
        ├── emon-logo.svg      # Logo vektor merek
        ├── emon-icon.svg      # Icon vektor merek
        └── avatars/           # Avatar pengguna SVG lokal
```

---

## 3. Cara Melakukan Kustomisasi Offline

### Metode A: Menggunakan Live Customizer Drawer (Paling Mudah)
1. Buka halaman manapun (misal `index.html`) di browser (cukup klik dua kali atau gunakan server lokal).
2. Klik tombol bulat mengambang dengan ikon palet di pojok kanan bawah, atau klik tombol **"Kustom Tema"** di toolbar.
3. Di dalam drawer kustomisasi:
   - Pilih preset warna instan: **Classic Blue**, **Emerald Teal**, **Royal Purple**, **Metro Amber**, **Crimson Rose**, atau **Cyber Slate**.
   - Atau gunakan **Color Picker** native untuk memilih kode Hex warna pilihan Anda.
   - Pilih mode: **Light**, **Dark**, atau **Auto (Sistem)**.
   - Ubah kelengkungan sudut (*Border Radius*): **Sharp (0px)**, **Normal (8px)**, **Soft (14px)**, atau **Pill (20px)**.
   - Aktifkan **Sidebar Mini** jika ingin tampilan lebih lapang.
4. Klik **"Salin CSS"** untuk menyalin variabel CSS hasil kustomisasi Anda ke clipboard.
5. Klik **"Unduh JSON"** jika ingin menyimpan file konfigurasi tema (`emon-material-theme.json`).

### Metode B: Mengubah Variabel CSS Permanen
Jika Anda ingin menerapkan warna kustom sebagai setelan bawaan tanpa mengandalkan `localStorage`:
Buka `assets/css/emon-theme.css`, lalu ubah variabel di blok `:root`:

```css
:root {
  /* Ganti kode warna sesuai identitas brand Anda */
  --primary: #005bbf;          /* Warna aksen utama */
  --primary-hover: #004da3;    /* Warna saat hover */
  --primary-container: #1a73e8;/* Container tombol aktif */
  --secondary: #006b5f;        /* Warna status & sukses */
  --tertiary: #6833ea;         /* Warna analitik & badge */
  --radius-md: 0.5rem;         /* 8px */
}
```

### Metode C: Mode Gelap (Dark Mode) Permanen
Untuk memaksa dashboard selalu dalam mode gelap, tambahkan kelas `dark` pada tag `<html>`:
```html
<html lang="en" class="dark" data-theme="dark">
```

---

## 4. Cara Menjalankan Tanpa Web Server (Direct File Access)
Tema ini dirancang agar dapat dibuka langsung dari file manager:
- Klik dua kali pada `index.html`.
- Karena semua path menggunakan relative path `./assets/...`, tidak ada error CORS pada file font lokal atau gambar SVG.

Atau jika ingin menggunakan web server lokal:
```bash
# Python 3
python3 -m http.server 8080

# PHP Built-in Server
php -S localhost:8080

# Node.js
npx serve .
```
Akses di browser: `http://localhost:8080`

---

## 5. Integrasi ke Proyek Web (PHP / Laravel / CodeIgniter)

### Integrasi dengan PHP / Blade:
Cukup sertakan file header di layout master Anda:
```html
<!-- Font & Theme CSS Lokal -->
<link rel="stylesheet" href="/assets/fonts/fonts.css">
<link rel="stylesheet" href="/assets/css/emon-theme.css">

<!-- Tailwind Lokal -->
<script src="/assets/js/tailwind.js"></script>
<script>
  tailwind.config = {
    darkMode: "class",
    theme: {
      extend: {
        colors: {
          primary: "var(--primary)",
          secondary: "var(--secondary)",
          surface: "var(--surface)",
          background: "var(--background)",
          // dsb.
        }
      }
    }
  };
</script>
```

Dan sertakan script tema di sebelum penutup `</body>`:
```html
<script src="/assets/js/emon-theme.js"></script>
<script src="/assets/js/emon-charts.js"></script>
<script src="/assets/js/emon-app.js"></script>
```

---

## 6. API JavaScript Global (`window.EmonTheme`)

Anda dapat memanipulasi tema melalui JavaScript:
```javascript
// Mengubah preset tema
window.EmonTheme.setPreset('emerald');

// Mengubah mode tampilan
window.EmonTheme.setMode('dark'); // 'light', 'dark', 'system'

// Menetapkan warna kustom
window.EmonTheme.setCustomColor('primary', '#2563eb');

// Membuka/menutup customizer drawer
window.EmonTheme.toggleCustomizerDrawer(true);

// Menampilkan notifikasi toast lokal
window.EmonTheme.showToast('Data berhasil disimpan secara offline!');
```
