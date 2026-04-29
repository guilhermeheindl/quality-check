import type { FlagColor } from './types';

/** Hex color for a 0-1 score. Used by ProgressBar and flag calculations. */
export function scoreColor(score: number): string {
  if (score >= 0.9) return '#34D399';
  if (score >= 0.7) return '#FBBF24';
  return '#F87171';
}

function investScore(
  percentInvest: number | null,
  metaFat: number | null,
  atingidoFat: number | null,
): number | null {
  const now = new Date();
  const diasNoMes = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const prorata = now.getDate() / diasNoMes;

  const scoreInvest = percentInvest != null ? Math.min(percentInvest / prorata, 1) : null;
  const hasFat = metaFat != null && metaFat > 0 && atingidoFat != null;
  const scoreFat = hasFat ? atingidoFat! / metaFat! : null;

  if (scoreFat == null) return null;
  return 0.2 * (scoreInvest ?? 0) + 0.8 * scoreFat;
}

export function calcInvestFlag(
  percentInvest: number | null,
  metaFat: number | null,
  atingidoFat: number | null,
): '🟢' | '🟡' | '🔴' | '⚪' {
  const score = investScore(percentInvest, metaFat, atingidoFat);
  if (score == null) return '⚪';
  if (score >= 0.9) return '🟢';
  if (score >= 0.7) return '🟡';
  return '🔴';
}

export function calcInvestFlagColor(
  percentInvest: number | null,
  metaFat: number | null,
  atingidoFat: number | null,
): FlagColor {
  const score = investScore(percentInvest, metaFat, atingidoFat);
  if (score == null) return 'none';
  if (score >= 0.9) return 'green';
  if (score >= 0.7) return 'yellow';
  return 'red';
}
