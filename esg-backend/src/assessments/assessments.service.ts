import fs from 'node:fs';
import { getDb } from '../db/connection.js';
import { moveFileToAssessment, evidencePath } from '../uploads/upload.service.js';
import { scoreAssessment } from './scoring.js';
import { generateRecommendations } from './recommendations.js';
import { createError } from '../utils/errors.js';
import type {
  AnswerInput,
  IndicatorDef,
  Recommendation,
  ScoringResult,
} from '../types/index.js';
import type { EsgPillar } from '../types/index.js';

// --- DTO ---

export interface SubmittedResult {
  assessmentId: number;
  environmentalScore: number;
  socialScore: number;
  governanceScore: number;
  overallScore: number;
  predicate: string;
  recommendations: Recommendation[];
}

export interface AssessmentListItem {
  id: number;
  schoolId: number;
  year: number;
  status: string;
  environmentalScore: number | null;
  socialScore: number | null;
  governanceScore: number | null;
  overallScore: number | null;
  predicate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EvidenceFileResult {
  originalName: string;
  mime: string;
  size: number;
  path: string;
}

interface IndicatorRow {
  id: number;
  pillar: EsgPillar;
  code: string;
  label: string;
  weight: number;
  options: string | null;
}

interface AssessmentRow {
  id: number;
  school_id: number;
  year: number;
  status: string;
  environmental_score: number | null;
  social_score: number | null;
  governance_score: number | null;
  overall_score: number | null;
  predicate: string | null;
  created_at: string;
  updated_at: string;
}

interface EvidenceRow {
  id: number;
  assessment_id: number;
  original_name: string;
  stored_name: string;
  mime: string;
  size: number;
}

interface MulterFile {
  originalname: string;
  mimetype: string;
  size: number;
  path: string;
  filename: string;
}

// --- handlers ---

export function submitAssessment(input: {
  schoolId: number;
  submittedBy: number;
  year: number;
  answers: AnswerInput[];
  files: MulterFile[];
  // evidenceFor[i] = indicatorId yang dilampiri file ke-i, atau null.
  evidenceFor: (number | null)[];
}): SubmittedResult {
  const db = getDb();

  const indicators = db
    .prepare('SELECT id, pillar, code, label, weight, options FROM indicators ORDER BY sort_order')
    .all() as IndicatorRow[];

  const indicatorDefs: IndicatorDef[] = indicators.map((i) => ({
    id: i.id,
    pillar: i.pillar,
    code: i.code,
    label: i.label,
    weight: i.weight,
    options: i.options,
  }));

  const scored: ScoringResult = scoreAssessment(indicatorDefs, input.answers);
  const recommendations = generateRecommendations(scored.indicatorScores);

  const tx = db.transaction((): number => {
    const assessmentId = upsert(input.schoolId, input.year, input.submittedBy, scored);

    // Reset jawaban & rekomendasi lama (resubmission) lalu isi ulang.
    db.prepare('DELETE FROM recommendations WHERE assessment_id = ?').run(assessmentId);
    db.prepare('DELETE FROM assessment_answers WHERE assessment_id = ?').run(assessmentId);

    const insertAnswer = db.prepare(
      'INSERT INTO assessment_answers (assessment_id, indicator_id, value, score) VALUES (?, ?, ?, ?)',
    );
    const insertEvidence = db.prepare(
      'INSERT INTO evidence_files (assessment_id, original_name, stored_name, mime, size, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)',
    );
    const linkEvidence = db.prepare(
      'UPDATE assessment_answers SET evidence_file_id = ? WHERE assessment_id = ? AND indicator_id = ?',
    );
    const insertRecommendation = db.prepare(
      'INSERT INTO recommendations (assessment_id, category, title, text, priority) VALUES (?, ?, ?, ?, ?)',
    );

    input.answers.forEach((a, i) => {
      insertAnswer.run(assessmentId, a.indicatorId, String(a.value), scored.indicatorScores[i]?.score ?? 0);
    });

    input.files.forEach((file, i) => {
      // stored_name relative thd UPLOAD_ROOT: "<assessmentId>/<uuid>.<ext>"
      const storedName = `${assessmentId}/${file.filename}`;
      moveFileToAssessment(file.path, assessmentId, file.filename);

      const evidenceId = Number(
        insertEvidence
          .run(assessmentId, file.originalname, storedName, file.mimetype, file.size, input.submittedBy)
          .lastInsertRowid,
      );

      const indicatorId = input.evidenceFor[i];
      if (indicatorId != null) {
        linkEvidence.run(evidenceId, assessmentId, indicatorId);
      }
    });

    for (const r of recommendations) {
      insertRecommendation.run(assessmentId, r.category, r.title, r.text, r.priority);
    }

    return assessmentId;
  });

  const assessmentId = tx();

  return {
    assessmentId,
    environmentalScore: scored.environmental_score,
    socialScore: scored.social_score,
    governanceScore: scored.governance_score,
    overallScore: scored.overall_score,
    predicate: scored.predicate,
    recommendations,
  };
}

function upsert(
  schoolId: number,
  year: number,
  submittedBy: number,
  scored: ScoringResult,
): number {
  const row = getDb()
    .prepare(
      `
      INSERT INTO esg_assessments
        (school_id, year, status, environmental_score, social_score, governance_score, overall_score, predicate, submitted_by, updated_at)
      VALUES (?, ?, 'submitted', ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(school_id, year) DO UPDATE SET
        status = 'submitted',
        environmental_score = excluded.environmental_score,
        social_score = excluded.social_score,
        governance_score = excluded.governance_score,
        overall_score = excluded.overall_score,
        predicate = excluded.predicate,
        submitted_by = excluded.submitted_by,
        updated_at = datetime('now')
      RETURNING id
      `,
    )
    .get(
      schoolId,
      year,
      scored.environmental_score,
      scored.social_score,
      scored.governance_score,
      scored.overall_score,
      scored.predicate,
      submittedBy,
    ) as { id: number };

  return row.id;
}

export function listAssessments(input: {
  schoolScope: number | null;
  schoolId?: number;
  year?: number;
}): AssessmentListItem[] {
  const db = getDb();

  const where: string[] = [];
  const params: unknown[] = [];

  if (input.schoolScope != null) {
    where.push('a.school_id = ?');
    params.push(input.schoolScope);
  } else if (input.schoolId != null) {
    where.push('a.school_id = ?');
    params.push(input.schoolId);
  }
  if (input.year != null) {
    where.push('a.year = ?');
    params.push(input.year);
  }

  const sql = `
    SELECT a.id, a.school_id, a.year, a.status, a.environmental_score, a.social_score,
           a.governance_score, a.overall_score, a.predicate, a.created_at, a.updated_at
    FROM esg_assessments a
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY a.year DESC, a.id DESC
  `;

  const rows = db.prepare(sql).all(...params) as AssessmentRow[];
  return rows.map((r) => ({
    id: r.id,
    schoolId: r.school_id,
    year: r.year,
    status: r.status,
    environmentalScore: r.environmental_score,
    socialScore: r.social_score,
    governanceScore: r.governance_score,
    overallScore: r.overall_score,
    predicate: r.predicate,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

export function getEvidence(input: {
  evidenceId: number;
  schoolScope: number | null;
  userRole: string;
}): EvidenceFileResult {
  const db = getDb();
  const row = db
    .prepare(
      `
      SELECT e.id, e.assessment_id, e.original_name, e.stored_name, e.mime, e.size
      FROM evidence_files e
      WHERE e.id = ?
      `,
    )
    .get(input.evidenceId) as EvidenceRow | undefined;

  if (!row) {
    throw createError(404, 'EVIDENCE_NOT_FOUND', 'Evidence file not found');
  }

  // Tenant check: admin sekolah hanya boleh melihat bukti utk sekolahnya.
  if (input.userRole === 'school_admin') {
    const assessment = db
      .prepare('SELECT school_id FROM esg_assessments WHERE id = ?')
      .get(row.assessment_id) as { school_id: number } | undefined;
    if (!assessment || assessment.school_id !== input.schoolScope) {
      throw createError(403, 'FORBIDDEN', 'You are not allowed to access this evidence');
    }
  }

  const resolved = evidencePath(row.stored_name);
  if (!fs.existsSync(resolved)) {
    throw createError(404, 'EVIDENCE_NOT_FOUND', 'Evidence file is missing on disk');
  }

  return {
    originalName: row.original_name,
    mime: row.mime,
    size: row.size,
    path: resolved,
  };
}