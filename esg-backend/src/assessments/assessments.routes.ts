import { Router } from 'express';
import { z } from 'zod';
import { upload } from '../uploads/upload.service.js';
import { requireAuth, scopeTenant } from '../auth/middleware.js';
import { getEvidence, listAssessments, submitAssessment } from './assessments.service.js';
import { createError } from '../utils/errors.js';
import { parseOrThrow } from '../utils/validate.js';
import type { AnswerInput } from '../types/index.js';

const router = Router();
export const evidenceRouter = Router();

const parseJsonAnswers = (raw: string | undefined): AnswerInput[] => {
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw createError(400, 'VALIDATION_ERROR', 'answers must be valid JSON');
  }
  if (!Array.isArray(parsed)) {
    throw createError(400, 'VALIDATION_ERROR', 'answers must be an array');
  }
  return parsed.map((item) => {
    const obj = item as Record<string, unknown>;
    const indicatorId = Number(obj.indicatorId);
    const value = Number(obj.value);
    if (!Number.isInteger(indicatorId) || indicatorId <= 0 || Number.isNaN(value)) {
      throw createError(400, 'VALIDATION_ERROR', 'Invalid answer entry');
    }
    return { indicatorId, value };
  });
};

// JSON array: [ { indicatorId: number|null }, ... ] sejajar dengan files.
const parseEvidenceFor = (raw: string | undefined): (number | null)[] => {
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw createError(400, 'VALIDATION_ERROR', 'evidenceFor must be valid JSON');
  }
  if (!Array.isArray(parsed)) {
    throw createError(400, 'VALIDATION_ERROR', 'evidenceFor must be an array');
  }
  return parsed.map((e) => {
    if (e === null) return null;
    const id = Number((e as Record<string, unknown>).indicatorId);
    return Number.isInteger(id) && id > 0 ? id : null;
  });
};

const submitBody = z.object({
  school_id: z.coerce.number().int().positive().optional(),
  year: z.coerce.number().int().min(2000).max(2100),
});

/**
 * POST /api/esg/assessments — multipart/form-data
 * Fields: school_id*, year, answers (JSON string), evidence (files), evidenceFor (JSON string).
 * *school_id hanya dipakai super_admin; admin sekolah dipaksa scopenya.
 */
router.post(
  '/',
  upload.array('evidence', 10),
  requireAuth,
  scopeTenant,
  (req, res, next) => {
    try {
      const parsed = parseOrThrow(submitBody, { school_id: req.body?.school_id, year: req.body?.year });

      const scope = (res.locals.schoolScope as number | null) ?? null;
      const schoolId = req.user?.role === 'school_admin' ? scope : parsed.school_id ?? scope;
      if (schoolId == null) {
        throw createError(400, 'VALIDATION_ERROR', 'school_id is required');
      }
      if (!req.user) {
        throw createError(401, 'UNAUTHORIZED', 'Authentication required');
      }

      const files = (req.files as Express.Multer.File[] | undefined) ?? [];
      const answerInputs = parseJsonAnswers(req.body?.answers);
      const evidenceFor = parseEvidenceFor(req.body?.evidenceFor);

      const result = submitAssessment({
        schoolId,
        submittedBy: req.user.id,
        year: parsed.year,
        answers: answerInputs,
        files,
        evidenceFor,
      });

      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },
);

/**
 * GET /api/esg/assessments — auth, scoped.
 * Query: school_id (super admin), year (opsional).
 */
router.get('/', requireAuth, scopeTenant, (req, res, next) => {
  try {
    const scope = (res.locals.schoolScope as number | null) ?? null;
    const schoolId = req.query.school_id ? Number(req.query.school_id) : undefined;
    const year = req.query.year ? Number(req.query.year) : undefined;

    const result = listAssessments({ schoolScope: scope, schoolId, year: validNumber(year) });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

const evidenceParam = z.coerce.number().int().positive();

/**
 * GET /api/evidence/:id — auth, scoped.
 * Serve file bukti dari disk dengan otorisasi tenant.
 */
evidenceRouter.get('/:id', requireAuth, scopeTenant, (req, res, next) => {
  try {
    const id = parseOrThrow(evidenceParam, req.params.id);
    const evidence = getEvidence({
      evidenceId: id,
      schoolScope: (res.locals.schoolScope as number | null) ?? null,
      userRole: req.user?.role ?? '',
    });

    res.setHeader('Content-Type', evidence.mime);
    res.setHeader('Content-Disposition', `inline; filename="${evidence.originalName}"`);
    res.sendFile(evidence.path);
  } catch (err) {
    next(err);
  }
});

function validNumber(value: number | undefined): number | undefined {
  return value !== undefined && !Number.isNaN(value) ? value : undefined;
}

export default router;