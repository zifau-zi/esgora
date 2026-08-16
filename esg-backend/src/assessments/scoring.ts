import type {
  AnswerInput,
  EsgPillar,
  IndicatorDef,
  IndicatorOption,
  IndicatorScore,
  ScoringResult,
} from '../types/index.js';

export const PILLARS: readonly EsgPillar[] = ['E', 'S', 'G'];

const round2 = (n: number): number => Math.round(n * 100) / 100;

export function predicateFor(total: number): string {
  if (total >= 85) return 'A';
  if (total >= 70) return 'B';
  if (total >= 55) return 'C';
  return 'D';
}

/** Ambil skor satu indikator (0-100) dari jawaban. */
export function scoreIndicator(indicator: IndicatorDef, answer: AnswerInput | undefined): number {
  const answerValue = answer?.value;
  if (answerValue === undefined || Number.isNaN(answerValue)) {
    return 0;
  }

  const options = parseOptions(indicator.options);
  if (options.length > 0) {
    // Indikator pilihan terstruktur: skor dicocokkan dari opsi.
    const option = options.find((o) => o.value === String(answerValue));
    return option ? clampScore(option.score) : 0;
  }

  // Indikator numerik: nilai mentah dianggap skor langsung (mis. persentase 0-100).
  return clampScore(answerValue);
}

function parseOptions(raw: string | null): IndicatorOption[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isIndicatorOption);
  } catch {
    return [];
  }
}

function isIndicatorOption(value: unknown): value is IndicatorOption {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.value === 'string' &&
    typeof v.label === 'string' &&
    typeof v.score === 'number'
  );
}

function clampScore(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.min(100, Math.max(0, n));
}

/** Skor pilar = Σ(score_i × weight_i) / Σ(weight_i), dibulatkan 2 desimal. */
function scorePillar(scores: IndicatorScore[]): number {
  const totalWeight = scores.reduce((sum, s) => sum + s.weight, 0);
  if (totalWeight === 0) return 0;
  const weighted = scores.reduce((sum, s) => sum + s.score * s.weight, 0);
  return round2(weighted / totalWeight);
}

/**
 * PURE scoring engine.
 * input: indicators (framework) + answers (jawaban per indikator)
 * output: skor 3 pilar (0-100), overall = (E+S+G)/3, predikat, dan skor tiap indikator.
 */
export function scoreAssessment(
  indicators: IndicatorDef[],
  answers: AnswerInput[],
): ScoringResult {
  const byId = new Map(answers.map((a) => [a.indicatorId, a]));

  const indicatorScores: IndicatorScore[] = indicators.map((ind) => ({
    id: ind.id,
    code: ind.code,
    label: ind.label,
    weight: ind.weight,
    score: round2(scoreIndicator(ind, byId.get(ind.id))),
  }));

  const pillarScore = (pillar: EsgPillar): number =>
    scorePillar(indicatorScores.filter((s) => {
      const ind = indicators.find((i) => i.id === s.id);
      return ind?.pillar === pillar;
    }));

  const environmental_score = pillarScore('E');
  const social_score = pillarScore('S');
  const governance_score = pillarScore('G');
  const overall_score = round2((environmental_score + social_score + governance_score) / 3);

  return {
    environmental_score,
    social_score,
    governance_score,
    overall_score,
    predicate: predicateFor(overall_score),
    indicatorScores,
  };
}