import { Router } from 'express';
import { z } from 'zod';
import { getSchoolDetail, search } from './schools.service.js';
import { parseOrThrow } from '../utils/validate.js';

const router = Router();

const searchQuery = z.object({
  q: z.string().trim().max(200).optional().default(''),
});

const idParam = z.coerce.number().int().positive();

/**
 * GET /api/schools?q= — publik
 * Search nama/NPSN (ILIKE). Tanpa q → semua sekolah.
 */
router.get('/', (req, res, next) => {
  try {
    const { q } = parseOrThrow(searchQuery, req.query);
    res.json(search(q));
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/schools/:id — publik
 * Detail lengkap + history[] + recommendations[].
 */
router.get('/:id', (req, res, next) => {
  try {
    const id = parseOrThrow(idParam, req.params.id);
    res.json(getSchoolDetail(id));
  } catch (err) {
    next(err);
  }
});

export default router;