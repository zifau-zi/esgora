import type { NextFunction, Request, Response } from 'express';
import type { UserRole } from '../types/index.js';
import { findUserById, toAuthUser, verifyToken } from './auth.service.js';
import { createError } from '../utils/errors.js';

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next(createError(401, 'UNAUTHORIZED', 'Missing Bearer token'));
    return;
  }

  const token = header.slice('Bearer '.length).trim();
  let payload: ReturnType<typeof verifyToken>;
  try {
    payload = verifyToken(token);
  } catch (err) {
    next(err);
    return;
  }

  const row = findUserById(payload.userId);
  if (!row) {
    next(createError(401, 'UNAUTHORIZED', 'User no longer exists'));
    return;
  }

  req.user = toAuthUser(row);
  next();
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(createError(401, 'UNAUTHORIZED', 'Authentication required'));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(createError(403, 'FORBIDDEN', 'You do not have permission to perform this action'));
      return;
    }
    next();
  };
}

/**
 * Tenant scoping, applied ONCE in the middleware chain.
 * - school_admin: dipaksa ke school_id miliknya (abaikan school_id di body/query).
 * - super_admin: bebas lintas sekolah.
 * Menempelkan `res.locals.schoolScope` untuk dipakai query assessment/evidence.
 */
export function scopeTenant(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    next(createError(401, 'UNAUTHORIZED', 'Authentication required'));
    return;
  }

  if (req.user.role === 'school_admin') {
    if (req.user.schoolId == null) {
      next(createError(403, 'FORBIDDEN', 'School admin has no assigned school'));
      return;
    }
    res.locals.schoolScope = req.user.schoolId;
    next();
    return;
  }

  // super_admin: scope bebas, boleh ambil school_id dari query/body
  const requested = (req.query.school_id as string | undefined) ?? (req.body?.school_id as unknown);
  res.locals.schoolScope =
    requested === undefined || requested === '' || Number.isNaN(Number(requested))
      ? null
      : Number(requested);
  next();
}
