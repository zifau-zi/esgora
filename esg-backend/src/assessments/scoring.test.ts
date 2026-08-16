import { describe, expect, it } from 'vitest';
import { predicateFor, scoreAssessment, scoreIndicator } from './scoring.js';
import { generateRecommendations } from './recommendations.js';
import type { IndicatorDef } from '../types/index.js';

// Framework indikator uji (pillar + bobot + opsi terstruktur).
const indicators: IndicatorDef[] = [
  {
    id: 1,
    pillar: 'E',
    code: 'E-01',
    label: 'Pengelolaan Limbah',
    weight: 1,
    options: JSON.stringify([
      { value: '1', label: 'Tidak ada', score: 20 },
      { value: '2', label: 'Dasar', score: 40 },
      { value: '3', label: 'Aktif', score: 70 },
      { value: '4', label: 'Komprehensif', score: 90 },
    ]),
  },
  {
    id: 2,
    pillar: 'E',
    code: 'E-02',
    label: 'Energi Terbarukan',
    weight: 2,
    options: null, // numerik: nilai = skor
  },
  {
    id: 3,
    pillar: 'S',
    code: 'S-01',
    label: 'Kesejahteraan Siswa',
    weight: 1,
    options: JSON.stringify([
      { value: '1', label: 'Belum', score: 20 },
      { value: '3', label: 'Aktif', score: 75 },
    ]),
  },
  {
    id: 4,
    pillar: 'G',
    code: 'G-01',
    label: 'Transparansi',
    weight: 1,
    options: JSON.stringify([
      { value: '1', label: 'Tanpa', score: 15 },
      { value: '3', label: 'Berkala', score: 72 },
    ]),
  },
];

describe('scoreIndicator', () => {
  const e1 = indicators[0]!;

  it('matches skor dari opsi yang dipilih', () => {
    expect(scoreIndicator(e1, { indicatorId: 1, value: 3 })).toBe(70);
    expect(scoreIndicator(e1, { indicatorId: 1, value: 4 })).toBe(90);
  });

  it('skor 0 bila kode opsi tidak valid', () => {
    expect(scoreIndicator(e1, { indicatorId: 1, value: 99 })).toBe(0);
  });

  it('indikator numerik memakai nilai mentah (clamped 0-100)', () => {
    expect(scoreIndicator(indicators[1]!, { indicatorId: 2, value: 82 })).toBe(82);
    expect(scoreIndicator(indicators[1]!, { indicatorId: 2, value: 150 })).toBe(100);
  });

  it('jawaban kosong → 0', () => {
    expect(scoreIndicator(e1, undefined)).toBe(0);
  });
});

describe('scoreAssessment', () => {
  it('menghitung skor pilar berbobot dan overall = rata-rata pilar', () => {
    const result = scoreAssessment(indicators, [
      { indicatorId: 1, value: 4 }, // E-01 → 90
      { indicatorId: 2, value: 60 }, // E-02 → 60 (bobot 2)
      { indicatorId: 3, value: 3 }, // S-01 → 75
      { indicatorId: 4, value: 3 }, // G-01 → 72
    ]);

    // E = (90*1 + 60*2) / (1+2) = 210/3 = 70
    const E = (90 + 60 * 2) / 3;
    expect(result.environmental_score).toBeCloseTo(E);
    expect(result.social_score).toBeCloseTo(75);
    expect(result.governance_score).toBeCloseTo(72);

    const total = (E + 75 + 72) / 3;
    expect(result.overall_score).toBeCloseTo(Math.round(total * 100) / 100);
    expect(result.predicate).toBe(predicateFor(result.overall_score));
  });

  it('menangani indikator tanpa jawaban → skor 0', () => {
    const result = scoreAssessment(indicators, [{ indicatorId: 1, value: 4 }]);
    // E: (90 + 0*2)/(1+2)=30; S=0; G=0 → overall=10
    expect(result.environmental_score).toBeCloseTo(30);
    expect(result.overall_score).toBe(10);
  });

  it('menghindari pembagian nol saat tidak ada indikator', () => {
    const result = scoreAssessment([], []);
    expect(result).toMatchObject({
      environmental_score: 0,
      social_score: 0,
      governance_score: 0,
      overall_score: 0,
    });
  });
});

describe('predicateFor', () => {
  it('menerapkan batas A≥85, B 70-84, C 55-69, D<55', () => {
    expect(predicateFor(85)).toBe('A');
    expect(predicateFor(84.99)).toBe('B');
    expect(predicateFor(70)).toBe('B');
    expect(predicateFor(55)).toBe('C');
    expect(predicateFor(54.99)).toBe('D');
  });
});

describe('generateRecommendations', () => {
  it('menghasilkan rekomendasi hanya utk skor < 85, dengan priority sesuai skor', () => {
    const rekomendasi = generateRecommendations([
      { id: 1, code: 'E-01', label: 'Limbah', weight: 1, score: 50 }, // Tinggi
      { id: 2, code: 'E-02', label: 'Energi', weight: 1, score: 65 }, // Sedang
      { id: 3, code: 'S-01', label: 'Sosial', weight: 1, score: 80 }, // Rendah
      { id: 4, code: 'G-01', label: 'Tata Kelola', weight: 1, score: 90 }, // tidak
    ]);

    expect(rekomendasi).toHaveLength(3);
    expect(rekomendasi.map((r) => r.priority)).toEqual(['Tinggi', 'Sedang', 'Rendah']);
  });

  it('kategori diinfer dari kode indikator', () => {
    const rekomendasi = generateRecommendations([
      { id: 1, code: 'S-01', label: 'Sosial', weight: 1, score: 40 },
    ]);
    expect(rekomendasi[0]?.category).toBe('S');
  });

  it('mengurutkan berdasarkan prioritas (Tinggi dulu)', () => {
    const rekomendasi = generateRecommendations([
      { id: 1, code: 'G-01', label: 'G', weight: 1, score: 20 },
      { id: 2, code: 'E-01', label: 'E', weight: 1, score: 20 },
    ]);
    // keduanya Tinggi → urut kategori E lalu G
    expect(rekomendasi.map((r) => r.category)).toEqual(['E', 'G']);
  });
});