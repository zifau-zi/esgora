# Backend ESG Sekolah

Backend API untuk penilaian **ESG Sekolah** (Environmental, Social, Governance). Sistem multi-tenant di mana tiap sekolah punya admin sendiri dan ada super admin untuk pengawasan.

**Stack:** Node.js · TypeScript (strict) · Express · better-sqlite3 (SQLite)

---

## Fitur

- **Autentikasi JWT** + multi-tenant (role `super_admin` & `school_admin`).
- **Public API** pencarian & detail sekolah (skor pilar, history multi-tahun, rekomendasi).
- **Scoring engine** murni (pure function): menghitung `environmental_score`, `social_score`, `governance_score` (0-100), `overall_score` = rata-rata pilar, dan predikat (A ≥ 85 · B 70-84 · C 55-69 · D < 55).
- **Rekomendasi** berbasis aturan dari skor indikator rendah.
- **Upload bukti** (Multer) — validasi PDF/JPG/PNG ≤ 10 MB, disimpan ke disk, disajikan aman per tenant.
- **Error contract** terpusat: `{ "error": { "code", "message" } }`.
- **Validasi Zod** terpusat untuk seluruh input.

---

## Arsitektur

```
backend/
├── src/
│   ├── index.ts                     # bootstrap: migrate → listen
│   ├── app.ts                       # express app + mount routes + error handler
│   ├── config.ts                    # env config
│   ├── auth/                        # login, JWT, requireAuth/scopeTenant
│   ├── schools/                     # search & detail sekolah (publik)
│   ├── assessments/                 # submit, scoring, recommendations, evidence
│   ├── uploads/                     # konfigurasi Multer
│   ├── db/                          # koneksi, migrasi, seed, migrations/
│   ├── types/                       # DTO & deklarasi tipe global
│   └── utils/                       # errors + validasi Zod sentral
```

## Database

SQLite (better-sqlite3) dengan file `data/esg.db`. Skema dikelola lewat migrasi di `src/db/migrations/`. Untuk kebutuhan multi-writer di masa depan, migrasi ke Postgres cukup dengan mengganti layer repository.

---

## Teknologi

| Kategori  | Paket                                 |
| --------- | ------------------------------------- |
| Runtime   | Node.js ≥ 20, TypeScript (strict)     |
| Framework | Express 4                             |
| Database  | better-sqlite3 (WAL, foreign_keys ON) |
| Auth      | jsonwebtoken, bcryptjs                |
| Upload    | multer                                |
| Validasi  | zod                                   |
| Env       | dotenv                                |
| Dev/test  | tsx, vitest, supertest                |

---

## Persiapan Lingkungan

1. Masuk ke direktori `backend`:
   ```bash
   cd backend
   ```
2. Install [Node.js ≥ 20](https://nodejs.org/).
3. Install dependency:
   ```bash
   npm install
   ```
4. Buat file `.env` dari contoh:
   ```bash
   cp .env.example .env
   ```
   (Di Windows PowerShell/CMD: `copy .env.example .env`)

Variabel yang dibutuhkan di `.env`:

| Variabel             | Deskripsi                                        | Contoh                    |
| -------------------- | ------------------------------------------------ | ------------------------- |
| `PORT`               | Port server                                      | `4000`                    |
| `NODE_ENV`           | Environment                                      | `development`             |
| `JWT_SECRET`         | Secret penandatanganan JWT (wajib, jaga rahasia) | `change-me-in-production` |
| `DB_PATH`            | Lokasi file SQLite                               | `./data/esg.db`           |
| `UPLOAD_DIR`         | Folder file bukti                                | `./uploads`               |
| `UPLOAD_MAX_SIZE_MB` | Batas ukuran upload (MB)                         | `10`                      |

---

## Menjalankan Lokal

```bash
# 1. Siapkan skema database
npm run migrate

# 2. Seed data awal (super admin, 7 sekolah + admin, indikator, contoh history)
npm run seed

# 3. Jalankan server (mode dev, hot-reload)
npm run dev
```

Server akan berjalan di `http://localhost:4000` (health check: `GET /health`).

Skrip lain:

| Perintah          | Fungsi                          |
| ----------------- | ------------------------------- |
| `npm run migrate` | Terapkan migrasi database       |
| `npm run seed`    | Isi data awal (idempoten)       |
| `npm run dev`     | Jalankan dev server (tsx watch) |
| `npm run build`   | Kompilasi TypeScript ke `dist/` |
| `npm run start`   | Jalankan build `dist/`          |
| `npm run lint`    | Type-check (tsc --noEmit)       |
| `npm run test`    | Jalankan suite tes (Vitest)     |

### Kredensial seed

- Super admin: `superadmin@esg.id` / `SuperAdmin123!`
- Admin sekolah (masing-masing): `admin<slug>@esg.id` / `Admin123!`
  (mis. `adminsmanegeri1edukasibangsa@esg.id`)
- Seed berisi **7 sekolah**: 2 contoh generik (SMA Negeri 1 Edukasi Bangsa,
  SMA Negeri 2 Harapan Jaya) + 5 sekolah Jawa Timur (SMA Negeri 1 Malang,
  SMA Negeri 2 Surabaya, SMA Negeri 5 Surabaya, SMA Negeri 1 Sidoarjo, dan
  SMA Negeri 1 Gresik). Seed **idempoten per sekolah** — aman dijalankan
  berkali-kali tanpa mengubah data lama.

### CORS & integrasi frontend

Backend sudah mengaktifkan **CORS** sehingga bisa diakses frontend. Saat
men-deploy frontend (mis. Netlify), set environment variable frontend
`VITE_API_BASE_URL` ke URL publik backend ini (bukan `localhost`).

---

## Deployment (Render / Railway / Fly.io / VPS)

> ⚠️ Backend ini TIDAK cocok di-deploy ke **Vercel / Netlify** karena mereka
> serverless: kode `app.listen()` tidak dijalankan, filesystem read-only (data
> SQLite & upload di `data/` dan `uploads/` tidak bisa ditulis / hilang).

Cara paling gampang pakai Docker (`Dockerfile` sudah disertakan):

| Platform | Deployment |
|---|---|
| **Render** | New **Web Service** → pilih repo → Build: `docker` / render akan deteksi `Dockerfile` otomatis. |
| **Railway** | New Project → Deploy from repo → otomatis pakai `Dockerfile`. |
| **Fly.io** | `fly launch` di folder `backend`, lalu `fly deploy`. |

Environment yang wajib diset di platform:

```
PORT=3000
NODE_ENV=production
JWT_SECRET=<random-panjang>
UPLOAD_DIR=./uploads
DB_PATH=./data/esg.db
```

⚠️ **Data persisten**: SQLite & upload ditulis ke disk. Di Render/Railway, pasang
**persistent disk** yang di-mount ke `/app/data` dan `/app/uploads` (atau ikuti
path `DB_PATH`/`UPLOAD_DIR` sesuai mount disk) supaya data tidak hilang saat
redeploy. Alternatif untuk auto-migrate saat start: `npm run migrate && npm run seed`
dijalankan sekali di awal (atau via start command).

---

## API Endpoint

> Semua error → `{ "error": { "code", "message" } }` + status HTTP.

### Autentikasi

| Method | Path              | Auth | Deskripsi                                               |
| ------ | ----------------- | ---- | ------------------------------------------------------- |
| `POST` | `/api/auth/login` | —    | Login → `{ token, user }`. Body: `{ email, password }`. |

Kirim token untuk endpoint terproteksi: header `Authorization: Bearer <token>`.

### Sekolah (publik)

| Method | Path               | Deskripsi                                                                              |
| ------ | ------------------ | -------------------------------------------------------------------------------------- |
| `GET`  | `/api/schools?q=`  | Cari sekolah by nama/NPSN → `{ id, name, npsn, address, overallScore }[]`              |
| `GET`  | `/api/schools/:id` | Detail lengkap (`SchoolESG`): skor pilar, `history[]` multi-tahun, `recommendations[]` |

Detail response (`GET /api/schools/1`):

```json
{
  "id": 1,
  "name": "SMA Negeri 1 Edukasi Bangsa",
  "npsn": "20101234",
  "address": "Jl. Pendidikan 1, Jakarta",
  "overallScore": 72,
  "environmentalScore": 70,
  "socialScore": 75,
  "governanceScore": 71,
  "predicate": "B",
  "history": [
    { "year": 2025, "E": 82, "S": 76, "G": 80, "Total": 79.33 },
    { "year": 2026, "E": 70, "S": 75, "G": 71, "Total": 72 }
  ],
  "recommendations": [
    { "category": "E", "title": "...", "text": "...", "priority": "Tinggi" }
  ]
}
```

### Assessment & Evidence (auth + tenant-scoped)

| Method | Path                   | Auth  | Deskripsi                                                                                                 |
| ------ | ---------------------- | ----- | --------------------------------------------------------------------------------------------------------- |
| `POST` | `/api/esg/assessments` | admin | Multipart submit → `{ assessmentId, eScore, sScore, gScore, overallScore, predicate, recommendations[] }` |
| `GET`  | `/api/esg/assessments` | admin | Daftar assessment (draft/submitted). Query: `school_id` (super admin), `year`                             |
| `GET`  | `/api/evidence/:id`    | admin | Serve file bukti (hanya untuk tenan pemilik)                                                              |

### Kontrak Form untuk `POST /api/esg/assessments`

Form-data `multipart/form-data` dengan field berikut:

| Field         | Tipe   | Wajib       | Deskripsi                                                                                   |
| ------------- | ------ | ----------- | ------------------------------------------------------------------------------------------- |
| `year`        | number | ✅          | Tahun penilaian (mis. 2026)                                                                 |
| `school_id`   | number | super admin | Id sekolah (diabaikan untuk `school_admin`)                                                 |
| `answers`     | string | ✅          | JSON `[{ "indicatorId": 1, "value": 3 }]` — jawaban per indikator                           |
| `evidence`    | file   | —           | File bukti (untuk banyak file: ulangi isi field ini)                                        |
| `evidenceFor` | string | —           | JSON array sejajar dengan files: `[{ "indicatorId": 1 }, null]` — pemetaan file → indikator |

---

## Kode Error (umum)

| HTTP | Kode                                      | Keterangan                          |
| ---- | ----------------------------------------- | ----------------------------------- |
| 400  | `VALIDATION_ERROR`                        | Input tidak valid / formula error   |
| 401  | `INVALID_CREDENTIALS`                     | Email/password salah                |
| 401  | `UNAUTHORIZED`                            | Token hilang / user tidak ada       |
| 401  | `INVALID_TOKEN`                           | Token JWT tidak valid / kedaluwarsa |
| 403  | `FORBIDDEN`                               | Tidak punya izin / lintas tenant    |
| 404  | `SCHOOL_NOT_FOUND` / `EVIDENCE_NOT_FOUND` | Data tidak ditemukan                |
| 413  | `FILE_TOO_LARGE`                          | File melebihi batas ukuran          |
| 500  | `INTERNAL_ERROR`                          | Error tak terduga                   |

---

## Migrasi & Modifikasi

- **Database**: SQLite cukup untuk skala sekolah. Bila butuh multi-writer, migrasi ke Postgres cukup mengganti layer repository.
- **Migrasi baru**: tambahkan file `.sql` berurutan di `src/db/migrations/` (diterapkan otomatis oleh `npm run migrate`).

## Lisensi

Proyek internal — untuk keperluan penilaian ESG Sekolah.
