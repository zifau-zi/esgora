export const USER_ROLES = ['super_admin', 'school_admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const ESG_PILLARS = ['E', 'S', 'G'] as const;
export type EsgPillar = (typeof ESG_PILLARS)[number];

export interface AuthUser {
  id: number;
  email: string;
  fullName: string | null;
  role: UserRole;
  schoolId: number | null;
}

export interface JwtPayload {
  userId: number;
  role: UserRole;
  schoolId: number | null;
}

export interface SchoolSearchResult {
  id: number;
  name: string;
  npsn: string;
  address: string | null;
  overallScore: number | null;
  environmentalScore: number | null;
  socialScore: number | null;
  governanceScore: number | null;
  predicate: string | null;
  lastUpdated: string | null;
}

export interface SchoolHistory {
  year: number;
  E: number;
  S: number;
  G: number;
  Total: number;
}

export interface RecommendationDto {
  category: EsgPillar;
  title: string;
  text: string;
  priority: 'Tinggi' | 'Sedang' | 'Rendah';
}

export interface SchoolDetail {
  id: number;
  name: string;
  npsn: string;
  address: string | null;
  overallScore: number | null;
  environmentalScore: number | null;
  socialScore: number | null;
  governanceScore: number | null;
  predicate: string | null;
  lastUpdated: string | null;
  publishedAt: string | null;
  history: SchoolHistory[];
  recommendations: RecommendationDto[];
}

// --- Milestone 4: Scoring & Recommendations ---

export interface IndicatorOption {
  value: string;
  label: string;
  score: number; // 0-100
}

export interface IndicatorDef {
  id: number;
  pillar: EsgPillar;
  code: string;
  label: string;
  weight: number;
  // JSON string dari kolom `options`; null/undefined utk indikator numerik.
  options: string | null;
}

export interface AnswerInput {
  indicatorId: number;
  value: number; // kode opsi (angka) atau nilai numerik mentah
}

export interface IndicatorScore {
  id: number;
  code: string;
  label: string;
  weight: number;
  score: number; // 0-100
}

export interface ScoringResult {
  environmental_score: number;
  social_score: number;
  governance_score: number;
  overall_score: number;
  predicate: string;
  indicatorScores: IndicatorScore[];
}

export type RecommendationPriority = 'Tinggi' | 'Sedang' | 'Rendah';

export interface Recommendation {
  category: EsgPillar;
  title: string;
  text: string;
  priority: RecommendationPriority;
}