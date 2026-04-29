'use client';
import type { InvestimentoRow } from '@/lib/types';
import { ProgressBar, formatBRL } from '@/components/ProgressBar';
import { calcInvestFlag } from '@/lib/scoring';

export function InvestimentoSlide({ data, period }: { data: InvestimentoRow[]; period: string }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Investimento & Faturamento</h2>
        <span className="text-sm text-slate-400 bg-slate-800 px-3 py-1 rounded-full">{period}</span>
      </div>

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-center px-4 py-3 text-slate-400 font-medium w-14">Flag</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Cliente</th>
              <th className="text-right px-4 py-3 text-slate-400 font-medium">Meta Invest.</th>
              <th className="text-right px-4 py-3 text-slate-400 font-medium">Atingido</th>
              <th className="px-4 py-3 text-slate-400 font-medium">% Invest.</th>
              <th className="text-right px-4 py-3 text-slate-400 font-medium">Meta Fat.</th>
              <th className="text-right px-4 py-3 text-slate-400 font-medium">Fat. Atingido</th>
              <th className="px-4 py-3 text-slate-400 font-medium">% Fat.</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const flag = calcInvestFlag(row.percentInvest, row.metaFaturamento, row.atingidoFaturamento);
              return (
                <tr
                  key={`${row.cliente}-${i}`}
                  className="border-b border-border/50 hover:bg-elevated/60 transition-colors"
                >
                  <td className="px-4 py-3 text-center text-xl">{flag}</td>
                  <td className="px-4 py-3 font-medium text-white">{row.cliente}</td>
                  <td className="px-4 py-3 text-right text-slate-300 tabular-nums">{formatBRL(row.metaInvest)}</td>
                  <td className="px-4 py-3 text-right text-slate-300 tabular-nums">{formatBRL(row.atingidoInvestTotal)}</td>
                  <td className="px-4 py-3">
                    <ProgressBar value={row.percentInvest} max={1} />
                  </td>
                  <td className="px-4 py-3 text-right text-slate-300 tabular-nums">{formatBRL(row.metaFaturamento)}</td>
                  <td className="px-4 py-3 text-right text-slate-300 tabular-nums">{formatBRL(row.atingidoFaturamento)}</td>
                  <td className="px-4 py-3">
                    <ProgressBar value={row.percentFaturamento} max={1} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {data.length === 0 && (
          <div className="text-center py-12 text-slate-500">Nenhum dado carregado</div>
        )}
      </div>
    </div>
  );
}
