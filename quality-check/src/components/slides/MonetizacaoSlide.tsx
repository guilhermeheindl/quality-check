'use client';
import type { OverviewRow } from '@/lib/types';

const STATUS_STYLE: Record<string, string> = {
  vendido:           'bg-emerald-900/40 text-emerald-300',
  'contrato na rua': 'bg-blue-900/40 text-blue-300',
  apresentado:       'bg-yellow-900/30 text-yellow-300',
};

function statusStyle(status: string) {
  return STATUS_STYLE[status.toLowerCase()] ?? 'bg-slate-800 text-slate-300';
}

export function MonetizacaoSlide({
  overviewData,
  period,
}: {
  overviewData: OverviewRow[];
  period: string;
}) {
  const rows = overviewData.filter(
    (r) => r.proposta?.trim(),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Monetização</h2>
        <span className="text-sm text-slate-400 bg-slate-800 px-3 py-1 rounded-full">{period}</span>
      </div>

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        {rows.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            Nenhum cliente com monetização registrada
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Cliente</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Proposta</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Comentário</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-elevated/60 transition-colors">
                  <td className="px-4 py-3 font-medium text-white whitespace-nowrap">{row.cliente}</td>
                  <td className="px-4 py-3 text-slate-300">{row.proposta}</td>
                  <td className="px-4 py-3">
                    {row.statusMonetizacao ? (
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyle(row.statusMonetizacao)}`}>
                        {row.statusMonetizacao}
                      </span>
                    ) : <span className="text-slate-600">—</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs leading-relaxed max-w-xs">
                    {row.comentarioMonetizacao || <span className="text-slate-600">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-xs text-slate-500 text-right">{rows.length} cliente{rows.length !== 1 ? 's' : ''} com monetização ativa</p>
    </div>
  );
}
