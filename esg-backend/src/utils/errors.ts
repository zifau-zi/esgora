import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, AppError);
  }
}

export const createError = (statusCode: number, code: string, message: string): AppError =>
  new AppError(statusCode, code, message);

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction): void {
  next(createError(404, 'NOT_FOUND', 'Resource not found'));
}

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: { code: err.code, message: err.message } });
    return;
  }

  // Zod errors yang bocor dari handler (safety net) → kontrak error sama.
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: err.issues[0]?.message ?? 'Invalid input',
      },
    });
    return;
  }

  // Multer errors
  if (err && typeof err === 'object' && 'code' in err && err.code === 'LIMIT_FILE_SIZE') {
    res.status(413).json({
      error: { code: 'FILE_TOO_LARGE', message: 'File exceeds the maximum allowed size' },
    });
    return;
  }

  console.error('[UnhandledError]', err);
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
  });
}