import { getDb } from '../db/connection.js';
import type {
  RecommendationDto,
  SchoolDetail,
  SchoolHistory,
  SchoolSearchResult,
} from '../types/index.js';

export interface SchoolBase {
  id: number;
  name: string;
  npsn: string;
  address: string | null;
}

export interface LatestAssessment {
  overall_score: number | null;
  environmental_score: number | null;
  social_score: number | null;
  governance_score: number | null;
  predicate: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface AssessmentRow {
  year: number;
  environmental_score: number | null;
  social_score: number | null;
  governance_score: number | null;
  overall_score: number | null;
}

interface RecommendationRow {
  category: RecommendationDto['category'];
  title: string;
  text: string;
  priority: RecommendationDto['priority'];
}

// Cari sekolah; overallScore + skor pilar diambil dari assessment terbaru (via correlated subquery).
export function searchSchools(q: string): SchoolSearchResult[] {
  const db = getDb();
  const term = `%${q.trim()}%`;

  const rows = db
    .prepare(
      `
      SELECT
        s.id,
        s.name,
        s.npsn,
        s.address,
        (
          SELECT a.overall_score
          FROM esg_assessments a
          WHERE a.school_id = s.id
          ORDER BY a.year DESC
          LIMIT 1
        ) AS overall_score,
        (
          SELECT a.environmental_score
          FROM esg_assessments a
          WHERE a.school_id = s.id
          ORDER BY a.year DESC
          LIMIT 1
        ) AS environmental_score,
        (
          SELECT a.social_score
          FROM esg_assessments a
          WHERE a.school_id = s.id
          ORDER BY a.year DESC
          LIMIT 1
        ) AS social_score,
        (
          SELECT a.governance_score
          FROM esg_assessments a
          WHERE a.school_id = s.id
          ORDER BY a.year DESC
          LIMIT 1
        ) AS governance_score,
        (
          SELECT a.predicate
          FROM esg_assessments a
          WHERE a.school_id = s.id
          ORDER BY a.year DESC
          LIMIT 1
        ) AS predicate,
        (
          SELECT a.updated_at
          FROM esg_assessments a
          WHERE a.school_id = s.id
          ORDER BY a.year DESC
          LIMIT 1
        ) AS last_updated
      FROM schools s
      WHERE s.name LIKE ? OR s.npsn LIKE ? OR s.address LIKE ?
      ORDER BY s.name ASC
      `,
    )
    .all(term, term, term) as SearchRow[];

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    npsn: r.npsn,
    address: r.address,
    overallScore: r.overall_score,
    environmentalScore: r.environmental_score,
    socialScore: r.social_score,
    governanceScore: r.governance_score,
    predicate: r.predicate,
    lastUpdated: r.last_updated,
  }));
}

interface SearchRow {
  id: number;
  name: string;
  npsn: string;
  address: string | null;
  overall_score: number | null;
  environmental_score: number | null;
  social_score: number | null;
  governance_score: number | null;
  predicate: string | null;
  last_updated: string | null;
}

export function findSchoolById(id: number): SchoolBase | undefined {
  const row = getDb()
    .prepare('SELECT id, name, npsn, address FROM schools WHERE id = ?')
    .get(id) as SchoolBase | undefined;
  return row;
}

// Skor + predikat dari assessment terbaru (NULL bila belum ada).
export function getLatestAssessment(schoolId: number): LatestAssessment {
  const row = getDb()
    .prepare(
      `
      SELECT overall_score, environmental_score, social_score, governance_score,
             predicate, created_at, updated_at
      FROM esg_assessments
      WHERE school_id = ?
      ORDER BY year DESC
      LIMIT 1
      `,
    )
    .get(schoolId) as LatestAssessment | undefined;

  return (
    row ?? {
      overall_score: null,
      environmental_score: null,
      social_score: null,
      governance_score: null,
      predicate: null,
      created_at: null,
      updated_at: null,
    }
  );
}

export function getSchoolHistory(schoolId: number): SchoolHistory[] {
  const rows = getDb()
    .prepare(
      `
      SELECT year, environmental_score, social_score, governance_score, overall_score
      FROM esg_assessments
      WHERE school_id = ?
      ORDER BY year ASC
      `,
    )
    .all(schoolId) as AssessmentRow[];

  return rows
    .filter((a) => a.overall_score != null)
    .map((a) => ({
      year: a.year,
      E: a.environmental_score ?? 0,
      S: a.social_score ?? 0,
      G: a.governance_score ?? 0,
      Total: a.overall_score ?? 0,
    }));
}

// Rekomendasi diambil dari assessment TERBARU sekolah tsb.
export function getLatestRecommendations(schoolId: number): RecommendationDto[] {
  const rows = getDb()
    .prepare(
      `
      SELECT r.category, r.title, r.text, r.priority
      FROM recommendations r
      JOIN esg_assessments a ON a.id = r.assessment_id
      WHERE a.school_id = ?
        AND a.id = (
          SELECT id FROM esg_assessments
          WHERE school_id = ?
          ORDER BY year DESC
          LIMIT 1
        )
      ORDER BY
        CASE r.priority WHEN 'Tinggi' THEN 0 WHEN 'Sedang' THEN 1 ELSE 2 END,
        r.id ASC
      `,
    )
    .all(schoolId, schoolId) as RecommendationRow[];

  return rows.map((r) => ({
    category: r.category,
    title: r.title,
    text: r.text,
    priority: r.priority,
  }));
}

export function toSchoolDetail(
  base: SchoolBase,
  latest: LatestAssessment,
  history: SchoolHistory[],
  recommendations: RecommendationDto[],
): SchoolDetail {
  return {
    id: base.id,
    name: base.name,
    npsn: base.npsn,
    address: base.address,
    overallScore: latest.overall_score,
    environmentalScore: latest.environmental_score,
    socialScore: latest.social_score,
    governanceScore: latest.governance_score,
    predicate: latest.predicate,
    lastUpdated: latest.updated_at,
    publishedAt: latest.created_at,
    history,
    recommendations,
  };
}