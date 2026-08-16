import { getDb, migrate, closeDb } from './connection.js';
import { hashPassword } from '../auth/auth.service.js';

const DB = () => getDb();

function predicateFor(total: number): string {
  if (total >= 85) return 'A';
  if (total >= 70) return 'B';
  if (total >= 55) return 'C';
  return 'D';
}

interface SchoolSeed {
  name: string;
  npsn: string;
  address: string;
  // Riwayat skor tiap tahun untuk sekolah ini.
  history: { year: number; scores: { env: number; soc: number; gov: number } }[];
}

// Daftar sekolah + riwayat penilaian (2 sekolah contoh + 5 sekolah terkenal Jawa Timur).
const SCHOOL_SEEDS: SchoolSeed[] = [
  {
    name: 'SMA Negeri 1 Edukasi Bangsa',
    npsn: '20101234',
    address: 'Jl. Pendidikan 1, Jakarta',
    history: [
      { year: 2025, scores: { env: 82, soc: 76, gov: 80 } },
      { year: 2026, scores: { env: 88, soc: 79, gov: 86 } },
    ],
  },
  {
    name: 'SMA Negeri 2 Harapan Jaya',
    npsn: '20105678',
    address: 'Jl. Merdeka 45, Bandung',
    history: [
      { year: 2025, scores: { env: 68, soc: 72, gov: 70 } },
      { year: 2026, scores: { env: 70, soc: 75, gov: 65 } },
    ],
  },
  {
    name: 'SMA Negeri 1 Malang',
    npsn: '20533512',
    address: 'Jl. Tugu No. 1, Malang',
    history: [
      { year: 2025, scores: { env: 88, soc: 84, gov: 86 } },
      { year: 2026, scores: { env: 92, soc: 88, gov: 90 } },
    ],
  },
  {
    name: 'SMA Negeri 2 Surabaya',
    npsn: '20533451',
    address: 'Jl. Wijaya Kusuma No. 48, Surabaya',
    history: [
      { year: 2025, scores: { env: 80, soc: 84, gov: 82 } },
      { year: 2026, scores: { env: 86, soc: 88, gov: 84 } },
    ],
  },
  {
    name: 'SMA Negeri 5 Surabaya',
    npsn: '20533649',
    address: 'Jl. Kusuma Bangsa No. 17, Surabaya',
    history: [
      { year: 2025, scores: { env: 74, soc: 78, gov: 76 } },
      { year: 2026, scores: { env: 80, soc: 82, gov: 79 } },
    ],
  },
  {
    name: 'SMA Negeri 1 Sidoarjo',
    npsn: '20534375',
    address: 'Jl. Mojopahit No. 166, Sidoarjo',
    history: [
      { year: 2025, scores: { env: 68, soc: 72, gov: 70 } },
      { year: 2026, scores: { env: 74, soc: 78, gov: 72 } },
    ],
  },
  {
    name: 'SMA Negeri 1 Gresik',
    npsn: '20533816',
    address: 'Jl. Dr. Wahidin No. 55, Gresik',
    history: [
      { year: 2025, scores: { env: 62, soc: 66, gov: 64 } },
      { year: 2026, scores: { env: 68, soc: 72, gov: 70 } },
    ],
  },
];

// Seed idempoten: jalankan berkali-kali tanpa duplikasi.
function seed(): void {
  migrate();
  const db = DB();

  // --- Super admin + indikator framework (dibuat sekali, saat user kosong) ---
  const hasUser = db.prepare('SELECT COUNT(*) AS c FROM users').get() as { c: number };

  if (hasUser.c === 0) {
    const tx = db.transaction(() => {
      db.prepare(
        'INSERT INTO users (email, password_hash, full_name, role, school_id) VALUES (?, ?, ?, ?, NULL)',
      ).run('superadmin@esg.id', hashPassword('SuperAdmin123!'), 'Super Admin', 'super_admin');

      const indicators: {
        pillar: string;
        code: string;
        label: string;
        weight: number;
        options: unknown[];
      }[] = [
        {
          pillar: 'E',
          code: 'E-01',
          label: 'Pengelolaan Limbah',
          weight: 1,
          options: [
            { value: '1', label: 'Tidak ada pengelolaan', score: 20 },
            { value: '2', label: 'Pemilahan dasar', score: 40 },
            { value: '3', label: 'Program daur ulang aktif', score: 70 },
            { value: '4', label: 'Sistem limbah komprehensif', score: 90 },
          ],
        },
        {
          pillar: 'E',
          code: 'E-02',
          label: 'Energi Terbarukan',
          weight: 1,
          options: [
            { value: '0', label: '0%', score: 0 },
            { value: '25', label: '25%', score: 25 },
            { value: '50', label: '50%', score: 50 },
            { value: '75', label: '75%', score: 75 },
            { value: '100', label: '100%', score: 100 },
          ],
        },
        {
          pillar: 'S',
          code: 'S-01',
          label: 'Kesejahteraan Siswa',
          weight: 1,
          options: [
            { value: '1', label: 'Belum ada program', score: 20 },
            { value: '2', label: 'Program awal', score: 45 },
            { value: '3', label: 'Konseling & inklusif', score: 75 },
            { value: '4', label: 'Kesejahteraan menyeluruh', score: 92 },
          ],
        },
        {
          pillar: 'G',
          code: 'G-01',
          label: 'Transparansi',
          weight: 1,
          options: [
            { value: '1', label: 'Tanpa publikasi', score: 15 },
            { value: '2', label: 'Publikasi sebagian', score: 45 },
            { value: '3', label: 'Laporan berkala', score: 72 },
            { value: '4', label: 'Transparansi penuh', score: 90 },
          ],
        },
        {
          pillar: 'G',
          code: 'G-02',
          label: 'Kepatuhan Regulasi',
          weight: 1,
          options: [
            { value: '1', label: 'Tidak patuh', score: 10 },
            { value: '2', label: 'Patuh sebagian', score: 40 },
            { value: '3', label: 'Patuh penuh', score: 70 },
            { value: '4', label: 'Di atas standar', score: 88 },
          ],
        },
      ];
      const insertInd = db.prepare(
        'INSERT INTO indicators (pillar, code, label, weight, options, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
      );
      indicators.forEach((ind, i) =>
        insertInd.run(ind.pillar, ind.code, ind.label, ind.weight, JSON.stringify(ind.options), i),
      );
    });

    tx();
    console.log('[seed] super admin + framework indikator (5) dibuat');
  }

  // Sekolah + admin sekolah (idempoten per sekolah: skip bila npsn/email sudah ada).
  let created = 0;
  for (const s of SCHOOL_SEEDS) {
    let schoolId = (
      db.prepare('SELECT id FROM schools WHERE npsn = ?').get(s.npsn) as { id: number } | undefined
    )?.id;

    if (!schoolId) {
      schoolId = Number(
        db.prepare('INSERT INTO schools (name, npsn, address) VALUES (?, ?, ?)').run(s.name, s.npsn, s.address)
          .lastInsertRowid,
      );
      created++;
    }

    const slug = s.name.toLowerCase().replace(/[^a-z0-9]+/g, '');
    const adminEmail = `admin${slug}@esg.id`;
    const adminCount = db.prepare('SELECT COUNT(*) AS c FROM users WHERE email = ?').get(adminEmail) as {
      c: number;
    };
    if (adminCount.c === 0) {
      db.prepare(
        'INSERT INTO users (email, password_hash, full_name, role, school_id) VALUES (?, ?, ?, ?, ?)',
      ).run(adminEmail, hashPassword('Admin123!'), `Admin ${s.name}`, 'school_admin', schoolId);
    }
  }
  if (created > 0) console.log(`[seed] ${created} sekolah baru dibuat`);

  // Riwayat assessment + rekomendasi untuk sekolah yang belum punya data.
  seedAssessments();

  console.log('[seed] credentials: superadmin@esg.id / SuperAdmin123!');
  console.log('[seed] admin sekolah: admin<slug-sekolah>@esg.id / Admin123!');
}

// Insert riwayat assessment + rekomendasi per sekolah bila sekolah itu belum punya.
function seedAssessments(): void {
  const db = DB();
  const schoolCount = db.prepare('SELECT COUNT(*) AS c FROM schools').get() as { c: number };
  if (schoolCount.c === 0) return;

  const insertAssessment = db.prepare(`
    INSERT INTO esg_assessments
      (school_id, year, status, environmental_score, social_score, governance_score, overall_score, predicate)
    VALUES (?, ?, 'submitted', ?, ?, ?, ?, ?)
  `);
  const insertRecommendation = db.prepare(`
    INSERT INTO recommendations (assessment_id, category, title, text, priority)
    VALUES (?, ?, ?, ?, ?)
  `);

  const tx = db.transaction(() => {
    for (const school of SCHOOL_SEEDS) {
      const row = db.prepare('SELECT id FROM schools WHERE npsn = ?').get(school.npsn) as
        | { id: number }
        | undefined;
      if (!row) continue;

      const existing = db
        .prepare('SELECT COUNT(*) AS c FROM esg_assessments WHERE school_id = ?')
        .get(row.id) as { c: number };
      if (existing.c > 0) continue;

      for (const y of school.history) {
        const counts = y.scores;
        const overall = Math.round(((counts.env + counts.soc + counts.gov) / 3) * 100) / 100;
        const assessmentId = Number(
          insertAssessment
            .run(row.id, y.year, counts.env, counts.soc, counts.gov, overall, predicateFor(overall))
            .lastInsertRowid,
        );

        // Rekomendasi tiap pilar bila skornya tergolong rendah.
        const rules: {
          category: 'E' | 'S' | 'G';
          title: string;
          text: string;
          priority: 'Tinggi' | 'Sedang';
        }[] = [
          { category: 'E', title: 'Tingkatkan pengelolaan limbah', text: 'Perkuat program pemilahan dan daur ulang sampah di lingkungan sekolah.', priority: counts.env < 85 ? 'Tinggi' : 'Sedang' },
          { category: 'S', title: 'Perkuat kesejahteraan siswa', text: 'Tambah layanan konseling dan program inklusivitas siswa.', priority: counts.soc < 80 ? 'Tinggi' : 'Sedang' },
          { category: 'G', title: 'Tingkatkan transparansi & kepatuhan', text: 'Publikasikan laporan kinerja dan dorong kepatuhan regulasi.', priority: counts.gov < 75 ? 'Tinggi' : 'Sedang' },
        ];

        for (const r of rules) {
          insertRecommendation.run(assessmentId, r.category, r.title, r.text, r.priority);
        }
      }
    }
  });

  tx();
  console.log('[seed] riwayat assessment + rekomendasi per sekolah siap');
}

seed();
closeDb();