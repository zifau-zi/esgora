import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../db/connection.js';
import { config } from '../config.js';
import type { JwtPayload, UserRole } from '../types/index.js';
import { createError } from '../utils/errors.js';

interface UserRow {
  id: number;
  email: string;
  password_hash: string;
  full_name: string | null;
  role: UserRole;
  school_id: number | null;
}

const BCRYPT_ROUNDS = 12;

export function hashPassword(plain: string): string {
  return bcrypt.hashSync(plain, BCRYPT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string): boolean {
  return bcrypt.compareSync(plain, hash);
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
}

export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, config.jwt.secret) as JwtPayload;
  } catch {
    throw createError(401, 'INVALID_TOKEN', 'Invalid or expired token');
  }
}

export function findUserById(id: number): UserRow | undefined {
  const row = getDb().prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow | undefined;
  return row;
}

export function findUserByEmail(email: string): UserRow | undefined {
  const row = getDb()
    .prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)')
    .get(email) as UserRow | undefined;
  return row;
}

export function toAuthUser(row: UserRow): AuthUserShape {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    schoolId: row.school_id,
  };
}

export interface AuthUserShape {
  id: number;
  email: string;
  fullName: string | null;
  role: UserRole;
  schoolId: number | null;
}

export interface LoginResult {
  token: string;
  user: AuthUserShape;
}

export function loginUser(email: string, password: string): LoginResult {
  const row = findUserByEmail(email.trim());
  if (!row || !verifyPassword(password, row.password_hash)) {
    throw createError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect');
  }

  const token = signToken({ userId: row.id, role: row.role, schoolId: row.school_id });
  return { token, user: toAuthUser(row) };
}