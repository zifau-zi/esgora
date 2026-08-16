import type { EsgPillar, IndicatorScore, Recommendation, RecommendationPriority } from '../types/index.js';

const THRESHOLDS: { max: number; priority: RecommendationPriority }[] = [
  { max: 55, priority: 'Tinggi' },
  { max: 74, priority: 'Sedang' },
  { max: 84, priority: 'Rendah' },
];

function priorityFor(score: number): RecommendationPriority | null {
  for (const t of THRESHOLDS) {
    if (score < t.max) return t.priority;
  }
  return null; // >= 85 → tidak perlu rekomendasi
}

const TEMPLATES: Record<EsgPillar, { title: string; text: string }> = {
  E: {
    title: 'Tingkatkan kinerja lingkungan',
    text: 'Perkuat inisiatif pengelolaan limbah, efisiensi energi, dan fasilitas ramah lingkungan sekolah.',
  },
  S: {
    title: 'Perkuat kinerja sosial',
    text: 'Perbanyak program kesejahteraan siswa, inklusivitas, dan keterlibatan komunitas sekolah.',
  },
  G: {
    title: 'Tingkatkan tata kelola sekolah',
    text: 'Perkuat transparansi, akuntabilitas laporan, dan kepatuhan terhadap regulasi yang berlaku.',
  },
};

/**
 * PURE rule-based recommendation engine.
 * Indikator berskor rendah → rekomendasi ber-priority.
 * Skor ≥ 85 dianggap baik, tidak menghasilkan rekomendasi.
 */
export function generateRecommendations(
  indicatorScores: IndicatorScore[],
): Recommendation[] {
  const result: Recommendation[] = [];

  for (const s of indicatorScores) {
    const priority = priorityFor(s.score);
    if (!priority) continue;

    const category: EsgPillar = categoryOf(s.code, s.label);
    const template = TEMPLATES[category];

    result.push({
      category,
      title: `${template.title}: ${s.label}`,
      text: template.text,
      priority,
    });
  }

  return result.sort(
    (a, b) =>
      priorityRank(a.priority) - priorityRank(b.priority) ||
      a.category.localeCompare(b.category),
  );
}

function priorityRank(p: RecommendationPriority): number {
  switch (p) {
    case 'Tinggi':
      return 0;
    case 'Sedang':
      return 1;
    default:
      return 2;
  }
}

// Inferensi kategori dari kode indikator (mis. 'E-01' → 'E'), fallback E.
function categoryOf(code: string, _label: string): EsgPillar {
  const prefix = code.trim().charAt(0).toUpperCase();
  return prefix === 'S' ? 'S' : prefix === 'G' ? 'G' : 'E';
}
