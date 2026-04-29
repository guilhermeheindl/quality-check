'use client';
import type { OKRRow } from '@/lib/types';
import { FlagBadge } from '@/components/FlagBadge';

export function OKRSlide({ data, period }: { data: OKRRow[]; period: string }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Status das OKRs</h2>
        <span className="text-sm text-slate-400 bg-slate-800 px-3 py-1 rounded-full">{period}</span>
      </div>
      <div className="bg-surface rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-slate-400 font-medium"></th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Cliente</th>
              <th className="text-center px-3 py-3 text-slate-400 font-medium" colSpan={3}>Objetivo</th>
              <th className="text-center px-3 py-3 text-slate-400 font-medium border-l border-border" colSpan={2}>OKR 1</th>
              <th className="text-center px-3 py-3 text-slate-400 font-medium border-l border-border" colSpan={2}>OKR 2</th>
              <th className="text-center px-3 py-3 text-slate-400 font-medium border-l border-border" colSpan={2}>OKR 3</th>
            </tr>
            <tr className="border-b border-border bg-elevated/40 text-xs text-slate-500">
              <th className="px-4 py-2" /><th className="px-4 py-2" />
              <th className="px-3 py-2">Plan</th>
              <th className="px-3 py-2">Realizado</th>
              <th className="px-3 py-2">Análise</th>
              {(['1','2','3'] as const).flatMap((n) => [
                <th key={`m${n}`} className="px-3 py-2 border-l border-border">Meta</th>,
                <th key={`r${n}`} className="px-3 py-2">%</th>,
              ])}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-elevated/60 transition-colors">
                <td className="px-4 py-3 text-center"><FlagBadge flag={row.flag} /></td>
                <td className="px-4 py-3 font-medium text-white whitespace-nowrap">{row.cliente}</td>
                <td className="px-3 py-3 text-slate-300 text-center">{row.plan || '—'}</td>
                <td className="px-3 py-3 text-slate-300 text-center">{row.realizado || '—'}</td>
                <td className="px-3 py-3 text-center text-base">{row.analise || '—'}</td>
                <td className="px-3 py-3 text-slate-300 text-center border-l border-border">{row.okr1Meta || '—'}</td>
                <td className="px-3 py-3 text-center"><PctChip v={row.okr1Pct} /></td>
                <td className="px-3 py-3 text-slate-300 text-center border-l border-border">{row.okr2Meta || '—'}</td>
                <td className="px-3 py-3 text-center"><PctChip v={row.okr2Pct} /></td>
                <td className="px-3 py-3 text-slate-300 text-center border-l border-border">{row.okr3Meta || '—'}</td>
                <td className="px-3 py-3 text-center"><PctChip v={row.okr3Pct} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            Aba de OKRs não configurada —{' '}
            <span className="text-accent">adicione OKR_GID no .env.local</span>
          </div>
        )}
      </div>
    </div>
  );
}

function PctChip({ v }: { v: string }) {
  if (!v) return <span className="text-slate-500">—</span>;
  return <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">{v}</span>;
}
