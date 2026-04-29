'use client';
import { scoreColor } from '@/lib/scoring';

export function ProgressBar({ value, max = 100 }: { value: number | null; max?: number }) {
  if (value == null) return <span className="text-slate-500 text-xs">—</span>;

  // value é sempre decimal: 0.84 = 84%, 1.09 = 109%
  const displayPct = Math.round(value * 100);
  const color = scoreColor(displayPct / 100);
  const barPct = Math.min(displayPct, 100);

  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="progress-bar flex-1">
        <div className="progress-fill" style={{ width: `${barPct}%`, background: color }} />
      </div>
      <span className="text-xs font-semibold tabular-nums w-12 text-right" style={{ color }}>
        {displayPct}%
      </span>
    </div>
  );
}

export function formatBRL(val: number | null): string {
  if (val == null) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
}
