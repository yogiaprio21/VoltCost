# Smart Electrical Installation Cost Estimator — Backend API

REST API produksi untuk penghitungan biaya instalasi listrik rumah, dibangun dengan Node.js, Express, PostgreSQL, Prisma, Zod, Swagger, dan PDFKit. Arsitektur bersih (controllers, services, routes, prisma, middleware, utils) dengan dukungan Docker.

## Tech Stack
- Node.js 18+, Express 4
- PostgreSQL 15
- Prisma ORM
- Zod validation
- Swagger OpenAPI 3 (swagger-ui-express)
- PDFKit (ekspor PDF)
- Docker & docker-compose

## Fitur
- Material Management (Admin): CRUD material dengan proteksi JWT dan role `ADMIN`.
- Estimation Engine: POST /estimate menyimpan histori lengkap dengan breakdown & total biaya.
- PDF Export: GET /estimate/:id/pdf unduh PDF profesional.
- Dashboard Analytics: total estimasi, biaya rata-rata, kapasitas daya terbanyak, tren bulanan.
- Dokumentasi Swagger: /api/docs

## Struktur Proyek
```
src/
  controllers/      // logika HTTP tipis, panggil services
  middleware/       // error handler, admin auth, validator
  prisma/           // Prisma client
  routes/           // definisi rute Express
  services/         // business logic
  utils/            // estimation logic, PDF, swagger, helper
  app.js            // inisialisasi Express
  server.js         // entrypoint server
prisma/
  schema.prisma     // skema DB
  seed.js           // seed default materials
```

## Prasyarat
- Node.js 18+
- PostgreSQL (lokal) atau Docker

## Variabel Lingkungan
Letakkan pada file `.env`:
- `PORT` — port API (default 3000)
- `DATABASE_URL` — URL koneksi Postgres, contoh:
  - `postgresql://postgres:postgres@localhost:5432/volt_cost?schema=public`

> Jangan membagikan secret database dan JWT. Untuk produksi gunakan secret manager/vars layanan.

## Setup (Lokal)
1. Masuk direktori backend:
   ```
   cd backend
   ```
2. Install dependency:
   ```
   npm install
   ```
3. Generate Prisma Client:
   ```
   npx prisma generate
   ```
4. Migrasi schema (membuat tabel):
   ```
   npx prisma migrate dev --name init
   ```
5. Seed data material default:
   ```
   npm run prisma:seed
   ```
6. Jalankan API:
   ```
   npm start
   ```
7. Cek health:
   - GET `http://localhost:3000/api/health` → `{ "status": "ok" }`
8. Swagger:
   - Buka `http://localhost:3000/api/docs`

## Docker
Menjalankan Postgres + API:
```
docker-compose up --build
```
- API: `http://localhost:3000`
- Docs: `http://localhost:3000/api/docs`

## Endpoint Utama
- Materials (Admin, JWT role `ADMIN`)
  - GET `/api/materials`
  - POST `/api/materials`
  - PUT `/api/materials/:id`
  - DELETE `/api/materials/:id`
- Estimation
  - POST `/api/estimate`
  - GET `/api/estimate/:id/pdf`
- Analytics
  - GET `/api/analytics`

## Alur Estimasi (Ringkas)
1. Terima input (luas rumah, titik lampu/stopkontak, AC, pompa, kapasitas daya, jenis instalasi).
2. Hitung panjang kabel, jumlah MCB, conduit, panel.
3. Ambil harga material dari tabel `Material`, hitung subtotal + tenaga kerja + premium (jika `installationType=premium`).
4. Simpan `Estimation` dengan `breakdown` JSON; kembalikan `id` dan `totalCost`.
5. Ekspor PDF berdasarkan data tersimpan (`GET /estimate/:id/pdf`).

## Keamanan
- Endpoint material, analytics, dan logs dilindungi JWT serta role `ADMIN`.
- Endpoint update estimasi mengecek owner/admin.
- Endpoint PDF mengecek owner/admin untuk estimasi milik user; estimasi guest tetap dapat diunduh berdasarkan ID.
- Jangan commit nilai rahasia ke repo publik.

## Troubleshooting
- Masalah prisma client:
  ```
  npx prisma generate
  ```
- Migrasi gagal: cek `DATABASE_URL` dan hak akses database.
- `Unauthorized` pada materials: pastikan token login valid dan user memiliki role `ADMIN`.
- PDF kosong/unduhan gagal: pastikan `id` estimasi valid dan data tersedia.

## Script NPM
- `npm start` — jalankan API
- `npm run dev` — hot reload dengan nodemon
- `npm run test:estimation` — test calculation engine tanpa framework tambahan
- `npm run prisma:generate` — generate Prisma client
- `npm run prisma:migrate` — migrasi dev
- `npm run prisma:deploy` — migrasi deploy (CI/CD)
- `npm run prisma:seed` — seed material default
