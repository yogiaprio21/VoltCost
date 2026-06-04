# VoltCost Implementation Audit

Tanggal: 2026-06-04

Dokumen ini merangkum implementasi 10 poin peningkatan VoltCost agar aplikasi lebih siap digunakan, lebih kuat sebagai portfolio, dan lebih mudah diaudit.

## 1. Foundation dan Design System

Implementasi:
- Menambahkan `frontend/src/components/Icon.tsx` sebagai icon set terpusat.
- Merapikan `Button`, `IconButton`, `Input`, `Select`, `Field`, `Card`, `Modal`, `Toast`, `StatCard`, `PageHeader`, dan `EmptyState`.
- Menurunkan radius dan shadow agar UI lebih rapi untuk dashboard/operational tool.

Acceptance criteria:
- Komponen shared memiliki state hover, focus, disabled, loading.
- Ikon umum tidak lagi disalin manual di setiap tombol utama.
- Modal memakai role dialog, label, dan description yang dapat dibaca assistive technology.

## 2. Layout dan Navigasi

Implementasi:
- `App.tsx` memisahkan `AuthShell` dan `AppShell`.
- Route halaman memakai `React.lazy` dan `Suspense`.
- Navigasi role-based: Admin hanya muncul untuk role `ADMIN`.

Acceptance criteria:
- Login/register tidak lagi tampil di dalam shell aplikasi utama.
- Navigasi desktop dan mobile memiliki active state jelas.
- Logout memakai replace navigation ke login.

## 3. Auth Pages

Implementasi:
- Login, register, forgot password, dan reset password direbuild dengan field label, helper, error, dan CTA yang konsisten.
- Register sekarang sesuai perilaku hook: setelah akun dibuat, user otomatis masuk dan diarahkan ke dashboard.

Acceptance criteria:
- Tidak ada lagi pesan "Silakan Masuk" setelah sistem melakukan auto-login.
- Email dan password divalidasi sebelum submit.
- Error backend ditampilkan di UI dan toast.

## 4. Estimator Form

Implementasi:
- Form estimator diubah menjadi 4 tahap: Bangunan, Titik, Beban, Kualitas.
- Setiap input numerik memiliki batas realistis dan ringkasan input.
- Informasi keselamatan ditampilkan sebagai catatan estimasi awal.

Acceptance criteria:
- Input invalid tidak dikirim ke API.
- Form responsif dan tidak bergantung pada tabel.
- User dapat melihat ringkasan sebelum submit.

## 5. Calculation Engine

Implementasi:
- Backend menjadi sumber utama perhitungan tersimpan.
- `computeCostFromLines` dipusatkan di backend.
- Update estimasi mempertahankan `metrics`, mencatat `meta`, dan menghitung ulang total di backend.
- Mapping MCB disesuaikan untuk daya rumah umum pada tegangan sekitar 220V: 900 VA = 4A, 1300 VA = 6A, 2200 VA = 10A, 3500 VA = 16A.
- Test ringan ditambahkan di `backend/src/utils/estimation.test.js`.

Acceptance criteria:
- Create/update/PDF memakai data tersimpan yang sama.
- Override quantity tidak menghapus metrics.
- Quantity dan harga negatif dinormalisasi ke 0.
- Test estimasi lolos.

## 6. Result dan PDF

Implementasi:
- Result page membedakan total tersimpan dan pratinjau edit.
- Save rincian memanggil backend dan memperbarui data dari response API.
- Download PDF memakai axios blob request agar token Authorization ikut terkirim.
- Endpoint PDF mengecek akses estimasi.

Acceptance criteria:
- User tidak menganggap pratinjau edit sebagai total final sebelum save.
- PDF hanya bisa diakses owner/admin untuk estimasi user.
- Guest estimate tanpa user tetap dapat diunduh berdasarkan ID.

## 7. Dashboard User

Implementasi:
- Menambahkan query cache ringan di `useApiQuery`.
- Dashboard punya search, sort, refresh, pagination, delete modal, dan empty/error/loading state.
- Tombol PDF, sesuaikan, dan hapus dibuat eksplisit.

Acceptance criteria:
- Search tidak mengubah data server dan dapat dibersihkan.
- Delete memakai modal, bukan browser confirm.
- Pagination stabil dan dapat refresh data.

## 8. Admin

Implementasi:
- Admin menjadi tiga tab: Overview, Material, Log.
- CRUD material memakai modal create/edit/delete.
- Analytics dan logs punya loading/error/empty state.
- Chart tren dan pie chart memakai tooltip/label yang lebih jelas.

Acceptance criteria:
- Material update tidak terjadi diam-diam saat blur.
- Delete material memakai confirmation modal.
- Tab memakai role `tablist` dan `tab`.

## 9. Performance dan Build Hygiene

Implementasi:
- `tsconfig.json` memakai `noEmit: true` agar typecheck tidak menghasilkan `.js` di folder `src`.
- Route besar di-lazy-load.
- Chart tetap dipisah di komponennya dan hanya dirender di halaman yang membutuhkan.

Acceptance criteria:
- Typecheck tidak membuat artefak JS di `frontend/src`.
- Vite build sukses.
- Bundle warning dipantau; code splitting route sudah diterapkan.

## 10. Portfolio Value

Implementasi:
- Dokumentasi ini menjelaskan problem, keputusan, acceptance criteria, dan hasil validasi.
- README perlu dijaga agar selaras dengan auth role-based terbaru, bukan admin key lama.

Acceptance criteria:
- Reviewer portfolio dapat memahami nilai teknis: UX, auth, calculation integrity, admin workflow, dan audit trail.
- Perubahan utama dapat diverifikasi melalui typecheck, build, dan test estimasi.

## Referensi Teknis

- React lazy loading: https://react.dev/reference/react/lazy
- React Router lazy/data route concept: https://reactrouter.com/en/main/route/lazy
- Vite production build: https://vite.dev/guide/build
- Recharts ResponsiveContainer: https://recharts.github.io/en-US/api/ResponsiveContainer
- WAI-ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg
- PUIL 2011 ESDM: https://gatrik.esdm.go.id/assets/uploads/download_index/files/d8197-buku-puil-2011.pdf
