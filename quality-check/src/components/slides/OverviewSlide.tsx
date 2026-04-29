'use client';
import type { OverviewRow } from '@/lib/types';
import { FlagBadge } from '@/components/FlagBadge';

export function OverviewSlide({
  data,
  gpName,
  period,
}: {
  data: OverviewRow[];
  observations?: string;
  gpName: string;
  period: string;
}) {
  const green  = data.filter((r) => r.flag === 'green').length;
  const yellow = data.filter((r) => r.flag === 'yellow').length;
  const red    = data.filter((r) => r.flag === 'red').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Overview — GP {gpName}</h2>
        <span className="text-sm text-slate-400 bg-slate-800 px-3 py-1 rounded-full">{period}</span>
      </div>

      {data.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-elevated rounded-xl p-4 border border-border text-center">
            <p className="text-2xl font-bold text-white">{data.length}</p>
            <p className="text-xs text-slate-400 mt-1">Total Clientes</p>
          </div>
          <div className="bg-emerald-900/30 rounded-xl p-4 border border-emerald-800/40 text-center">
            <p className="text-2xl font-bold text-emerald-400">{green}</p>
            <p className="text-xs text-emerald-500 mt-1">🟢 Safe</p>
          </div>
          <div className="bg-yellow-900/30 rounded-xl p-4 border border-yellow-800/40 text-center">
            <p className="text-2xl font-bold text-yellow-400">{yellow}</p>
            <p className="text-xs text-yellow-500 mt-1">🟡 Care</p>
          </div>
          <div className="bg-red-900/30 rounded-xl p-4 border border-red-800/40 text-center">
            <p className="text-2xl font-bold text-red-400">{red}</p>
            <p className="text-xs text-red-500 mt-1">🔴 Crítico</p>
          </div>
        </div>
      )}

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-center px-4 py-3 text-slate-400 font-medium w-14">Flag</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Cliente</th>
              <th className="text-center px-3 py-3 text-slate-400 font-medium">NPS</th>
              <th className="text-center px-3 py-3 text-slate-400 font-medium">CSAT</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Observações Relevantes</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={`${row.cliente}-${i}`} className="border-b border-border/50 hover:bg-elevated/60 transition-colors">
                <td className="px-4 py-3 text-center text-xl"><FlagBadge flag={row.flag} /></td>
                <td className="px-4 py-3 font-medium text-white whitespace-nowrap">{row.cliente}</td>
                <td className="px-3 py-3 text-center">
                  {row.nps != null
                    ? <span className={`font-bold text-base ${row.nps >= 9 ? 'text-emerald-400' : row.nps >= 7 ? 'text-yellow-400' : 'text-red-400'}`}>{row.nps}</span>
                    : <span className="text-slate-600">—</span>}
                </td>
                <td className="px-3 py-3 text-center">
                  {row.csat != null
                    ? <span className={`font-bold text-base ${row.csat >= 4 ? 'text-emerald-400' : row.csat >= 3 ? 'text-yellow-400' : 'text-red-400'}`}>{row.csat}</span>
                    : <span className="text-slate-600">—</span>}
                </td>
                <td className="px-4 py-3 text-slate-300 text-xs leading-relaxed max-w-sm">
                  {row.observacaoRelevante || <span className="text-slate-600">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            Nenhum cliente encontrado para este GP
          </div>
        )}
      </div>
    </div>
  );
}
