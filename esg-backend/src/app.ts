import express from 'express';
import type { Express } from 'express';
import authRoutes from './auth/auth.routes.js';
import schoolsRoutes from './schools/schools.routes.js';
import assessmentsRoutes, { evidenceRouter } from './assessments/assessments.routes.js';
import indicatorsRoutes from './indicators/indicators.routes.js';
import { errorMiddleware, notFoundHandler } from './utils/errors.js';

export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));

  // CORS — izinkan frontend dev (Vite) dan origin lain memanggil API.
  app.use((_req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization',
    );
    if (_req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/schools', schoolsRoutes);
  app.use('/api/esg/assessments', assessmentsRoutes);
  app.use('/api/evidence', evidenceRouter);
  app.use('/api/indicators', indicatorsRoutes);

  // 404 + error terpusat (harus di akhir, setelah semua route)
  app.use(notFoundHandler);
  app.use(errorMiddleware);

  return app;
}
