import type { z } from 'zod';
import { createError } from './errors.js';

/**
 * Validasi Zod terpusat.
 * Bila input tidak valid → lempar AppError 400 dengan kontrak error konsisten.
 * Dipakai di seluruh route; juga sebagai safety net oleh error middleware.
 */
export function parseOrThrow<S extends z.ZodTypeAny>(
  schema: S,
  data: unknown,
): z.infer<S> {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Invalid input';
    throw createError(400, 'VALIDATION_ERROR', message);
  }
  return parsed.data;
}