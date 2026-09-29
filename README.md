# Emon Material Admin

> Dashboard admin offline-first dengan perpaduan Google Material 3 dan Microsoft Metro UI.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Offline Capable](https://img.shields.io/badge/Offline-100%25%20Ready-success.svg)](OFFLINE_GUIDE.md)

---

## ⚡ Fitur Utama

- **100% Offline-First:** Font, ikon, dan engine berjalan lokal tanpa CDN eksternal.
- **Material 3 + Metro:** Tonal surfaces, interactive live tiles, dan micro-interactions.
- **Live Theme Engine:** Customizer warna primer/sekunder, dark mode, dan border radius via `localStorage`.
- **Anti-Glitch Boot:** Initial render mulus bebas kedip tema (anti-FOUC).
- **Native SVG Charts:** Area, bar, donut, gauge, dan sparklines tanpa library pihak ketiga.
- **Client-Side Utilities:** Filter data, pagination, ekspor CSV/JSON, drag-and-drop Kanban, form validator.

---

## 🚀 Cara Menjalankan

### Langsung di Browser
Buka file `index.html` langsung dari file manager atau browser.

### Via Local Server
```bash
# Python 3
python3 -m http.server 8080

# Atau Node.js
npx serve .
```
Akses di `http://localhost:8080`.

---

## 📁 Daftar Halaman

| Kategori | Halaman |
|---|---|
| **Dashboards** | `index.html`, `ecommerce.html`, `analytics.html`, `reports.html` |
| **Apps** | `pos.html`, `chat.html`, `calendar.html`, `taskboard.html`, `data-import.html` |
| **E-Commerce** | `products.html`, `orders.html`, `customers.html`, `pricing.html`, `invoice-print.html` |
| **User & Account** | `profile.html`, `timeline.html`, `notifications.html`, `settings.html` |
| **Auth & Utility** | `login.html`, `register.html`, `forgot-password.html`, `lockscreen.html`, `blank.html`, `components.html`, `widgets.html`, `404.html`, `500.html` |

---

## 🛠️ Stack

- **HTML5 & CSS3** (Material 3 variables + Metro layout)
- **Tailwind CSS Standalone** (Offline build)
- **Vanilla JavaScript** (Zero heavy dependencies)

---

## 📜 Lisensi

[MIT License](LICENSE) &copy; 2026 Edward Torangga.
