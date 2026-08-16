import { beforeAll, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

// Env unik per file, di-set SEBELUM modul backend di-import.
vi.hoisted(() => {
  const fs = require('node:fs');
  const os = require('node:os');
  const p = require('node:path');
  const dir = fs.mkdtempSync(p.join(os.tmpdir(), 'esg-assess-test-'));
  process.env.DB_PATH = p.join(dir, 'test.db');
  process.env.UPLOAD_DIR = p.join(dir, 'uploads');
  process.env.JWT_SECRET = 'test-secret';
  process.env.NODE_ENV = 'test';
});

import { getDb, migrate } from '../db/connection.js';
import { createApp } from '../app.js';
import { hashPassword, loginUser } from '../auth/auth.service.js';

const INDICATOR_OPTIONS = [
  { value: '1', label: 'a', score: 20 },
  { value: '4', label: 'd', score: 90 },
];

let adminToken: string;

beforeAll(() => {
  migrate();
  const db = getDb();
  db.prepare(
    "INSERT INTO schools (id, name, npsn, address) VALUES (1, 'SMA Test', '12345678', 'Jl. Test') ON CONFLICT(id) DO NOTHING",
  ).run();
  db.prepare(
    "INSERT INTO users (id, email, password_hash, full_name, role, school_id) VALUES (1, 'admin@test.id', ?, 'Admin', 'school_admin', 1) ON CONFLICT(id) DO NOTHING",
  ).run(hashPassword('pass1234'));

  const insertInd = db.prepare(
    'INSERT INTO indicators (id, pillar, code, label, weight, options, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
  );
  insertInd.run(1, 'E', 'E-01', 'Pengelolaan Limbah', 1, JSON.stringify(INDICATOR_OPTIONS), 0);
  insertInd.run(2, 'S', 'S-01', 'Kesejahteraan Siswa', 1, JSON.stringify(INDICATOR_OPTIONS), 1);
  insertInd.run(3, 'G', 'G-01', 'Transparansi', 1, JSON.stringify(INDICATOR_OPTIONS), 2);

  adminToken = loginUser('admin@test.id', 'pass1234').token;
});

describe('POST /api/esg/assessments', () => {
  it('menolak tanpa token (401)', async () => {
    const res = await request(createApp())
      .post('/api/esg/assessments')
      .field('year', '2026')
      .field('answers', JSON.stringify([{ indicatorId: 1, value: 4 }]));
    expect(res.status).toBe(401);
  });

  it('menolak tipe file selain PDF/JPG/PNG (400)', async () => {
    const res = await request(createApp())
      .post('/api/esg/assessments')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('year', '2026')
      .field('answers', JSON.stringify([{ indicatorId: 1, value: 4 }]))
      .attach('evidence', Buffer.from('not a pdf'), {
        filename: 'data.txt',
        contentType: 'text/plain',
      });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_FILE_TYPE');
  });

  it('submit jawaban + file → skor pilar & rekomendasi benar', async () => {
    const res = await request(createApp())
      .post('/api/esg/assessments')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('year', '2026')
      .field('answers', JSON.stringify([
        { indicatorId: 1, value: 4 }, // E → 90
        { indicatorId: 2, value: 4 }, // S → 90
        { indicatorId: 3, value: 1 }, // G → 20
      ]))
      .field('evidenceFor', JSON.stringify([{ indicatorId: 1 }]))
      .attach('evidence', Buffer.from('%PDF-1.4 bukti'), {
        filename: 'bukti.pdf',
        contentType: 'application/pdf',
      });

    expect(res.status).toBe(201);
    const body = res.body;
    expect(body.environmentalScore).toBe(90);
    expect(body.socialScore).toBe(90);
    expect(body.governanceScore).toBe(20);
    // overall = (90+90+20)/3 = 66.67 → predikat C
    expect(body.overallScore).toBeCloseTo(66.67);
    expect(body.predicate).toBe('C');
    expect(body.assessmentId).toBeGreaterThan(0);
    expect(body.recommendations.length).toBeGreaterThan(0);
  });

  it('resubmission tahun sama memperbarui assessment (upsert)', async () => {
    const res = await request(createApp())
      .post('/api/esg/assessments')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('year', '2026')
      .field('answers', JSON.stringify([
        { indicatorId: 1, value: 4 },
        { indicatorId: 2, value: 4 },
        { indicatorId: 3, value: 4 },
      ]));
    expect(res.status).toBe(201);
    expect(res.body.governanceScore).toBe(90);
  });
});

describe('GET /api/esg/assessments (scoped)', () => {
  it('admin sekolah hanya melihat assessment sekolahnya', async () => {
    const res = await request(createApp())
      .get('/api/esg/assessments')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    for (const item of res.body) {
      expect(item.schoolId).toBe(1);
    }
  });
});

describe('GET /api/evidence/:id', () => {
  it('serves file yang diupload admin sekolah tsb (200)', async () => {
    const res = await request(createApp())
      .get('/api/evidence/1')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/pdf');
  });

  it('evidence tidak ditemukan → 404', async () => {
    const res = await request(createApp())
      .get('/api/evidence/9999')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });
});