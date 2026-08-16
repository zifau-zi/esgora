import { beforeAll, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

// DB unik per file, di-set SEBELUM modul backend di-import.
vi.hoisted(() => {
  const fs = require('node:fs');
  const os = require('node:os');
  const p = require('node:path');
  const dbPath = p.join(
    fs.mkdtempSync(p.join(os.tmpdir(), 'esg-schools-test-')),
    `test-${process.pid}-${Date.now()}.db`,
  );
  process.env.DB_PATH = dbPath;
  process.env.JWT_SECRET = 'test-secret';
  process.env.NODE_ENV = 'test';
});

import { getDb, migrate } from '../db/connection.js';
import { createApp } from '../app.js';

beforeAll(() => {
  migrate();
  const db = getDb();
  db.prepare(
    "INSERT INTO schools (id, name, npsn, address) VALUES (1, 'SMA Negeri 1 Edukasi Bangsa', '20101234', 'Jl. Pendidikan 1, Jakarta') ON CONFLICT(id) DO NOTHING",
  ).run();
  db.prepare(
    "INSERT INTO esg_assessments (school_id, year, status, environmental_score, social_score, governance_score, overall_score, predicate) VALUES (1, 2025, 'submitted', 82, 76, 80, 79.33, 'B') ON CONFLICT(school_id, year) DO NOTHING",
  ).run();
  db.prepare(
    "INSERT INTO esg_assessments (school_id, year, status, environmental_score, social_score, governance_score, overall_score, predicate) VALUES (1, 2026, 'submitted', 88, 79, 86, 84.33, 'B') ON CONFLICT(school_id, year) DO NOTHING",
  ).run();
  const latest = db
    .prepare('SELECT id FROM esg_assessments WHERE school_id = 1 ORDER BY year DESC LIMIT 1')
    .get() as { id: number };
  db.prepare(
    "INSERT INTO recommendations (assessment_id, category, title, text, priority) VALUES (?, 'E', 'Tingkatkan limbah', 'Perkuat program daur ulang.', 'Tinggi')",
  ).run(latest.id);
});

describe('GET /api/schools?q=', () => {
  it('search by name (public)', async () => {
    const res = await request(createApp()).get('/api/schools?q=edukasi');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({
      id: 1,
      name: 'SMA Negeri 1 Edukasi Bangsa',
      overallScore: 84.33,
    });
  });

  it('search by npsn (public)', async () => {
    const res = await request(createApp()).get('/api/schools?q=20101234');
    expect(res.status).toBe(200);
    expect(res.body[0].npsn).toBe('20101234');
  });

  it('empty result for unknown term', async () => {
    const res = await request(createApp()).get('/api/schools?q=zzz');
    expect(res.body).toEqual([]);
  });
});

describe('GET /api/schools/:id', () => {
  it('returns full detail with history and recommendations', async () => {
    const res = await request(createApp()).get('/api/schools/1');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: 1,
      name: 'SMA Negeri 1 Edukasi Bangsa',
      environmentalScore: 88,
      socialScore: 79,
      governanceScore: 86,
      overallScore: 84.33,
    });
    expect(res.body.history).toEqual([
      { year: 2025, E: 82, S: 76, G: 80, Total: 79.33 },
      { year: 2026, E: 88, S: 79, G: 86, Total: 84.33 },
    ]);
    expect(res.body.recommendations).toEqual([
      { category: 'E', title: 'Tingkatkan limbah', text: 'Perkuat program daur ulang.', priority: 'Tinggi' },
    ]);
  });

  it('returns 404 for unknown school', async () => {
    const res = await request(createApp()).get('/api/schools/999');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('SCHOOL_NOT_FOUND');
  });

  it('returns 400 for non-numeric id', async () => {
    const res = await request(createApp()).get('/api/schools/abc');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});