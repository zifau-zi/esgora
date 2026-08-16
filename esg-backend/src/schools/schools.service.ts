import {
  findSchoolById,
  getLatestAssessment,
  getLatestRecommendations,
  getSchoolHistory,
  searchSchools,
  toSchoolDetail,
} from './schools.repository.js';
import { createError } from '../utils/errors.js';
import type { SchoolDetail, SchoolSearchResult } from '../types/index.js';

export function search(q: string): SchoolSearchResult[] {
  return searchSchools(q);
}

export function getSchoolDetail(id: number): SchoolDetail {
  const base = findSchoolById(id);
  if (!base) {
    throw createError(404, 'SCHOOL_NOT_FOUND', 'School not found');
  }

  const [latest, history, recommendations] = [
    getLatestAssessment(id),
    getSchoolHistory(id),
    getLatestRecommendations(id),
  ];

  return toSchoolDetail(base, latest, history, recommendations);
}