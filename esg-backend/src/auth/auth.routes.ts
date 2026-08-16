import { Router } from 'express';
import { z } from 'zod';
import { loginUser } from './auth.service.js';
import { parseOrThrow } from '../utils/validate.js';

const router = Router();

const loginSchema = z.object({
  email: z.string().email('Email is invalid').trim().toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

/**
 * POST /api/auth/login
 * Body: { email, password }
 * 200 → { token, user }
 * 401 → { error: { code: 'INVALID_CREDENTIALS', message } }
 */
router.post('/login', (req, res, next) => {
  try {
    const { email, password } = parseOrThrow(loginSchema, req.body);
    const result = loginUser(email, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;