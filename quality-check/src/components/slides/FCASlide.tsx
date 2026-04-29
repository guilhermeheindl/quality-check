'use client';
import type { OverviewRow } from '@/lib/types';
import { FlagBadge } from '@/components/FlagBadge';

export function FCASlide({
  data,
  overviewData,
  period,
}: {
  data: unknown[];
  overviewData: OverviewRow[];
  period: string;
}) {
  const criticos = overviewData.filter((r) => {
    const fato = r.fato?.trim() ?? '';
    return fato.length > 0 && fato !== '—' && fato !== '-';
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Situação Crítica</h2>
        <span className="text-sm text-slate-400 bg-slate-800 px-3 py-1 rounded-full">{period}</span>
      </div>

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        {criticos.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            Sem clientes com situações críticas registradas ✅
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-center px-4 py-3 text-slate-400 font-medium w-14">Flag</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Cliente</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Fato</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Causa</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Ação</th>
              </tr>
            </thead>
            <tbody>
              {criticos.map((row, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-elevated/60 transition-colors">
                  <td className="px-4 py-3 text-center text-xl"><FlagBadge flag={row.flag} /></td>
                  <td className="px-4 py-3 font-medium text-white whitespace-nowrap">{row.cliente}</td>
                  <td className="px-4 py-3 text-slate-300 text-xs leading-relaxed max-w-[220px]">{row.fato || '—'}</td>
                  <td className="px-4 py-3 text-slate-300 text-xs leading-relaxed max-w-[180px]">{row.causa || '—'}</td>
                  <td className="px-4 py-3 text-slate-300 text-xs leading-relaxed max-w-[180px]">{row.acao || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
