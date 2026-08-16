import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

// DB unik per file, di-set SEBELUM modul backend di-import (vi.hoisted berjalan duluan).
vi.hoisted(() => {
  const fs = require('node:fs');
  const os = require('node:os');
  const p = require('node:path');
  const dbPath = p.join(
    fs.mkdtempSync(p.join(os.tmpdir(), 'esg-auth-test-')),
    `test-${process.pid}-${Date.now()}.db`,
  );
  process.env.DB_PATH = dbPath;
  process.env.JWT_SECRET = 'test-secret';
  process.env.NODE_ENV = 'test';
});

import express from 'express';
import type { Express } from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { getDb, migrate } from '../db/connection.js';
import { hashPassword, signToken } from './auth.service.js';
import { requireAuth, requireRole, scopeTenant } from './middleware.js';
import { errorMiddleware } from '../utils/errors.js';
import { createApp } from '../app.js';

let superToken: string;
let adminToken: string;

// App terpisah khusus menguji middleware (sebelum error handler terpasang).
function makeMiddlewareApp(): Express {
  const app = express();
  app.use(express.json());

  app.get('/me', requireAuth, (req, res) => res.json({ user: req.user }));

  app.post('/super-only', requireAuth, requireRole('super_admin'), (_req, res) =>
    res.json({ ok: true }),
  );

  app.get('/scope', requireAuth, scopeTenant, (_req, res) =>
    res.json({ scope: res.locals.schoolScope }),
  );

  app.use(errorMiddleware);
  return app;
}

beforeAll(() => {
  migrate();
  const db = getDb();
  db.prepare(
    "INSERT INTO schools (id, name, npsn) VALUES (1, 'SMA Test', '12345678') ON CONFLICT(id) DO NOTHING",
  ).run();
  db.prepare(
    "INSERT INTO users (id, email, password_hash, full_name, role, school_id) VALUES (1, 'super@test.id', ?, 'Super', 'super_admin', NULL) ON CONFLICT(id) DO NOTHING",
  ).run(hashPassword('pass1234'));
  db.prepare(
    "INSERT INTO users (id, email, password_hash, full_name, role, school_id) VALUES (2, 'admin@test.id', ?, 'Admin', 'school_admin', 1) ON CONFLICT(id) DO NOTHING",
  ).run(hashPassword('pass1234'));
});

beforeEach(() => {
  superToken = signToken({ userId: 1, role: 'super_admin', schoolId: null });
  adminToken = signToken({ userId: 2, role: 'school_admin', schoolId: 1 });
});

describe('GET /health', () => {
  it('returns ok', async () => {
    const res = await request(createApp()).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'ok' });
  });
});

describe('POST /api/auth/login', () => {
  it('returns token + user for valid credentials', async () => {
    const res = await request(createApp())
      .post('/api/auth/login')
      .send({ email: 'super@test.id', password: 'pass1234' });
    expect(res.status).toBe(200);
    expect(jwt.decode(res.body.token)).toMatchObject({ userId: 1, role: 'super_admin' });
    expect(res.body.user.role).toBe('super_admin');
  });

  it('returns 401 for wrong password with error contract', async () => {
    const res = await request(createApp())
      .post('/api/auth/login')
      .send({ email: 'super@test.id', password: 'wrong' });
    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({ error: { code: 'INVALID_CREDENTIALS' } });
  });

  it('returns 400 validation error for malformed email', async () => {
    const res = await request(createApp())
      .post('/api/auth/login')
      .send({ email: 'not-an-email', password: 'x' });
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ error: { code: 'VALIDATION_ERROR' } });
  });
});

describe('requireAuth', () => {
  it('mengizinkan akses dengan token valid', async () => {
    const res = await request(makeMiddlewareApp())
      .get('/me')
      .set('Authorization', `Bearer ${superToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ id: 1, role: 'super_admin' });
  });

  it('menolak tanpa token (401)', async () => {
    const res = await request(makeMiddlewareApp()).get('/me');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('menolak token invalid (401)', async () => {
    const res = await request(makeMiddlewareApp())
      .get('/me')
      .set('Authorization', 'Bearer bad.token.value');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_TOKEN');
  });
});

describe('requireRole', () => {
  it('menolak school_admin pada route super_only (403)', async () => {
    const res = await request(makeMiddlewareApp())
      .post('/super-only')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('mengizinkan super_admin (200)', async () => {
    const res = await request(makeMiddlewareApp())
      .post('/super-only')
      .set('Authorization', `Bearer ${superToken}`);
    expect(res.status).toBe(200);
  });
});

describe('scopeTenant', () => {
  it('memaksa school_admin ke school_id-nya, abaikan query', async () => {
    const res = await request(makeMiddlewareApp())
      .get('/scope?school_id=99')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ scope: 1 });
  });

  it('super_admin bebas memakai school_id dari query', async () => {
    const res = await request(makeMiddlewareApp())
      .get('/scope?school_id=3')
      .set('Authorization', `Bearer ${superToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ scope: 3 });
  });

  it('super_admin tanpa school_id → scope null (semua sekolah)', async () => {
    const res = await request(makeMiddlewareApp())
      .get('/scope')
      .set('Authorization', `Bearer ${superToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ scope: null });
  });
});