import { Router } from 'express';
import { getDb } from '../db/connection.js';

const router = Router();

interface IndicatorRow {
  id: number;
  pillar: 'E' | 'S' | 'G';
  code: string;
  label: string;
  weight: number;
  options: string | null;
}

/**
 * GET /api/indicators — publik.
 * Daftar framework indikator ESG (id, kode, pilar, bobot, opsi terstruktur).
 * Dipakai frontend untuk memetakan jawaban form ke indicatorId.
 */
router.get('/', (_req, res, next) => {
  try {
    const rows = getDb()
      .prepare(
        `SELECT id, pillar, code, label, weight, options
         FROM indicators
         ORDER BY sort_order ASC`,
      )
      .all() as IndicatorRow[];

    const indicators = rows.map((r) => ({
      id: r.id,
      pillar: r.pillar,
      code: r.code,
      label: r.label,
      weight: r.weight,
      options: parseOptions(r.options),
    }));

    res.json(indicators);
  } catch (err) {
    next(err);
  }
});

function parseOptions(raw: string | null): unknown[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default router;
