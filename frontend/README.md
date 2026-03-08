# Smart Electrical Installation Cost Estimator — Frontend Web

Aplikasi web modern berbasis React (Vite + TypeScript + Tailwind) untuk membuat estimasi biaya instalasi listrik, melihat hasil breakdown, mengunduh PDF, mengelola material (admin), dan memantau analytics.

## Tech Stack
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Axios
- React Router
- Recharts

## Fitur
- Estimation Form: input parameter, validasi dasar, tombol Calculate.
- Result Page: tabel breakdown, highlight total biaya, pie chart komposisi, tombol unduh PDF.
- Admin Panel: kelola material (tambah, ubah name/type/unit/price, hapus).
- Dashboard: ringkasan total estimasi, biaya rata-rata, kapasitas daya populer, tren bulanan.
- Konfigurasi environment & proxy dev, penanganan loading & error.

## Struktur Proyek
```
src/
  components/           // UI kecil, table, charts
  hooks/                // hooks reusable (useApi)
  pages/                // halaman: EstimateForm, Result, Admin, Dashboard
  services/             // axios clients & API services
  types/                // tipe TS bersama
  utils/                // helper (format, dll.)
  App.tsx               // routing & layout
  main.tsx              // entrypoint React
  index.css             // Tailwind base
```

## Prasyarat
- Node.js 18+
- Backend API berjalan (lihat folder `backend`)

## Variabel Lingkungan
Salin `.env.example` menjadi `.env` dan sesuaikan:
- `VITE_API_URL` — URL backend, contoh `http://localhost:3000`
- `VITE_ADMIN_KEY` — (opsional) jika ingin akses Admin Materials, harus sama dengan `ADMIN_API_KEY` backend

## Menjalankan (Dev)
```
cd frontend
npm install
npm run dev
```
Kunjungi `http://localhost:5173`

## Build & Preview
```
npm run build
npm run preview
```

## Integrasi Dengan Backend
- Secara default, dev server mem-proxy `/api` ke `VITE_API_URL` (atau `http://localhost:3000` jika tidak diset).
- Untuk Admin Panel, isi `VITE_ADMIN_KEY` agar permintaan ke endpoint materials menyertakan header `X-Admin-Key`.

## Halaman
- `/` — Estimation Form
- `/result` — Result (navigasi dari Form)
- `/admin` — Admin Materials (butuh `VITE_ADMIN_KEY`)
- `/dashboard` — Dashboard analytics

## Troubleshooting
- CORS/Network error: pastikan `VITE_API_URL` mengarah ke backend yang aktif, dan dev proxy sudah sesuai.
- Admin 401: pastikan `VITE_ADMIN_KEY` sama dengan `ADMIN_API_KEY` backend.
- PDF tidak terunduh: pastikan ID estimasi valid dan backend dapat diakses langsung dari browser.

## Script NPM
- `npm run dev` — start dev server
- `npm run build` — produksi
- `npm run preview` — pratinjau build
- `npm run typecheck` — cek TypeScript

