# ESG Sekolah — Sistem Profil & Scoring ESG Sekolah (Frontend)

Frontend web app untuk platform profil & penilaian ESG (Environmental, Social,
Governance) sekolah di Indonesia. Dibangun dengan **React + Express + Tailwind
CSS**, responsif (HP/tablet/desktop), dan **terintegrasi penuh dengan backend
asli** (`/api`) melalui layer service (`/src/services`) yang memakai `axios`.

> Aplikasi berjalan dalam dua mode: **mock** (`VITE_USE_MOCK=true`, baca data
> dummy di `/src/mock`) atau **backend asli** (`VITE_USE_MOCK=false`, default
> saat ini). Keduanya memakai kontrak yang sama, jadi tinggal pindah mode tanpa
> ubah kode.

## ✨ Fitur

**Portal Admin Sekolah** — perlu login, prefix route `/admin/*`
- Halaman login (dengan tombol "akun demo" untuk testing cepat)
- Dashboard ringkasan skor ESG sekolah
- Formulir **multi-step**: Lingkungan → Sosial → Tata Kelola, lengkap dengan
  upload file bukti/dokumen di tiap tahap
- Halaman **Hasil Analisis**: gauge skor, radar chart, bar chart, grafik
  riwayat, dan kartu rekomendasi per aspek — responsif dengan state loading &
  error, mengambil data asli dari API

**Halaman Publik** — tanpa login
- Beranda dengan pencarian sekolah (live search + filter kota cepat)
- Halaman **Profil ESG Sekolah**: Radar Chart & Bar Chart breakdown E/S/G,
  plus grafik riwayat progres skor dari tahun ke tahun

## 🎨 Sistem Desain

| Elemen | Nilai |
|---|---|
| Environmental | `#10B981` (hijau) |
| Social | `#F59E0B` (kuning/amber) |
| Governance | `#2563EB` (biru) |
| Warna netral/institusional | `#0F172A` (slate-900, "ink") |
| Font judul & angka skor | Space Grotesk (`font-display`) |
| Font body/UI | Inter (`font-sans`, default) |
| Font data (NPSN, kode) | IBM Plex Mono (`font-mono`) |

Warna hijau/kuning/biru **hanya** dipakai untuk elemen yang benar-benar
merepresentasikan pilar E/S/G (gauge, chart, form step). Elemen UI umum
(tombol, link, badge grade) memakai warna netral `slate-900` agar makna warna
pilar tidak tercampur. Skor **keseluruhan** memakai gauge dengan gradasi
tiga warna sekaligus (hijau→kuning→biru) sebagai elemen visual "signature"
yang merepresentasikan gabungan ketiga pilar.

## 🛠️ Tech Stack

React 18 · Vite · React Router v6 · Tailwind CSS v3 · Recharts (Radar/Bar/Line
chart) · Axios · Lucide React (ikon)

## 📁 Struktur Folder

```
src/
├── main.jsx, App.jsx, config.js, index.css
├── mock/            # data dummy: schools.js, esgData.js, auth.js
├── services/         # layer axios: apiClient, schoolService, authService, esgService
├── context/           # AuthContext (status login, token)
├── utils/              # constants.js (warna ESG dll), helpers.js
├── components/
│   ├── ui/          # Button, Card, ScoreGauge, Stepper, FormFields, FileUpload, Feedback
│   ├── layout/    # PublicLayout, AdminLayout, ProtectedRoute
│   ├── charts/    # ESGRadarChart, ESGBarChart, ESGHistoryChart
│   ├── forms/      # EnvironmentalForm, SocialForm, GovernanceForm
│   └── school/    # SchoolCard
└── pages/
    ├── public/    # HomePage, SchoolProfilePage
    └── admin/     # LoginPage, DashboardPage, ESGFormPage, ResultsPage
```

## 🚀 Menjalankan Project

Butuh Node.js 18+.

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`. Build produksi: `npm run build` (hasil di folder
`dist/`), lalu `npm run preview` untuk mencoba hasil build-nya.

## 🔑 Akun Demo (Portal Admin)

Untuk mode mock (`VITE_USE_MOCK=true`):

```
Email    : admin@sman1cendekia.sch.id
Password : esgsekolah2026
```

Untuk mode backend asli, pakai kredensial seed (lihat bagian **Integrasi Backend**).

## 🔌 Integrasi Backend

Backend sudah tersambung dan berjalan. Base URL default-nya **relative `/api`**:

- **Dev**: Vite me-proxy `/api` → `http://localhost:3000` (lihat `vite.config.js`).
- **Produksi Netlify**: `netlify.toml` me-proxy `/api` → URL backend publik
  (isi dulu `to` di `[[redirects]]` dengan alamat backend yang sudah di-deploy).

Kalau benar-benar perlu URL mutlak, set `VITE_API_BASE_URL` mis.
`https://backend-kalian.com/api`. Set `VITE_USE_MOCK=false` untuk API asli
(`true` = data dummy). Pastikan backend berjalan (CORS `*` sudah aktif).

> Seluruh service (`/src/services`) memakai **normalisasi** respons backend →
> bentuk data yang komponen butuhkan (lihat `src/services/normalize.js`).

### Endpoint backend yang dipakai frontend

| Method | Endpoint | Dipakai di |
|---|---|---|
| GET | `/schools?q=` | Pencarian sekolah (Beranda) |
| GET | `/schools/:id` | Profil + skor E/S/G + `history[]` + `recommendations[]` |
| GET | `/indicators` | Mapping kode indikator → `indicatorId` (submit form) |
| POST | `/esg/assessments` | Submit formulir ESG (`multipart/form-data`) |
| POST | `/auth/login` | Login admin |

> History & rekomendasi TIDAK punya endpoint terpisah di backend — keduanya
> disarikan dari `GET /schools/:id` oleh service.

### Kredensial seed backend (dari `npm run seed`)

```
Super admin : superadmin@esg.id / SuperAdmin123!
Admin sekolah: adminsmanegeri1edukasibangsa@esg.id / Admin123!   (sekolah 1)
               adminsmanegeri2harapanjaya@esg.id   / Admin123!   (sekolah 2)
               adminsmanegeri1malang@esg.id        / Admin123!   (sekolah 3)
               adminsmanegeri2surabaya@esg.id      / Admin123!   (sekolah 4)
               adminsmanegeri5surabaya@esg.id      / Admin123!   (sekolah 5)
               adminsmanegeri1sidoarjo@esg.id      / Admin123!   (sekolah 6)
               adminsmanegeri1gresik@esg.id        / Admin123!   (sekolah 7)
```

Tombol "Gunakan Akun Demo" di halaman login sudah mengisi admin sekolah 1.

## 🚀 Deployment (Netlify)

Frontend siap deploy ke Netlify. Config build & redirect sudah ada di
`netlify.toml` (build otomatis + SPA fallback + proxy `/api` ke backend).

Langkah deploy:

1. Deploy backend di host yang mendukung server panjang & SQLite
   (**Render / Railway / Fly.io / VPS** — jangan Vercel/Netlify). Catat URL-nya.
2. Di repo frontend, buka `netlify.toml`, isi `to` pada blok `[[redirects]]`
   untuk `/api/*` dengan alamat backend, mis.
   `to = "https://backend-kalian.up.railway.app/api/:splat"`.
3. Netlify: pilih **New site from Git** (atau **Deploy manually** via drop `dist/`).
   Build command & publish dir sudah dibaca dari `netlify.toml`.
4. ⚠️ **Jangan** biarkan `VITE_API_BASE_URL=http://localhost:3000` — pakai
   relative `/api` (default) agar proxy Netlify bekerja. Kalau backend di host
   terpisah pakai URL mutlak, set `VITE_API_BASE_URL` di **Environment
   variables** Netlify, lalu rebuild.
5. Untuk demo statis tanpa backend, set `VITE_USE_MOCK=true`.

> `VITE_*` dievaluasi saat **build time**, jadi env variable harus diset di
> dashboard Netlify (bukan hanya di `.env` lokal) dan perlu rebuild setelah
> diubah.

## 🗺️ Peta Rute

| Rute | Akses | Halaman |
|---|---|---|
| `/` | Publik | Beranda + pencarian |
| `/sekolah/:schoolId` | Publik | Profil ESG sekolah |
| `/admin/login` | Publik | Login admin |
| `/admin/dashboard` | Admin | Dashboard |
| `/admin/form-esg` | Admin | Formulir ESG multi-step |
| `/admin/hasil-analisis` | Admin | Hasil Analisis & rekomendasi |
