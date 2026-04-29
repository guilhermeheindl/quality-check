'use client';
import type { NPSRow, OverviewRow } from '@/lib/types';
import { FlagBadge } from '@/components/FlagBadge';

const CSAT_ETAPAS: { key: keyof OverviewRow; label: string }[] = [
  { key: 'csatAtendimento', label: 'Atendimento' },
  { key: 'csatCampanhas',   label: 'Campanhas'   },
  { key: 'csatCopys',       label: 'Copys'       },
  { key: 'csatDesigns',     label: 'Designs'     },
  { key: 'csatPrazos',      label: 'Prazos'      },
  { key: 'csatResultados',  label: 'Resultados'  },
];

function ScoreCell({ v }: { v: number | null }) {
  if (v == null) return <td className="px-2 py-3 text-center text-slate-600">—</td>;
  const color = v >= 4 ? 'text-emerald-400' : v >= 3 ? 'text-yellow-400' : 'text-red-400';
  return <td className={`px-2 py-3 text-center font-bold ${color}`}>{v}</td>;
}

export function NPSSlide({
  data,
  overviewData,
  period,
}: {
  data: NPSRow[];
  overviewData: OverviewRow[];
  period: string;
}) {
  const rows = overviewData;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">NPS & CSAT</h2>
        <span className="text-sm text-slate-400 bg-slate-800 px-3 py-1 rounded-full">{period}</span>
      </div>

      <div className="bg-surface rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-center px-4 py-3 text-slate-400 font-medium w-14">Flag</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">Cliente</th>
              <th className="text-center px-3 py-3 text-slate-400 font-medium">NPS</th>
              <th className="text-center px-3 py-3 text-slate-400 font-medium">CSAT</th>
              <th
                className="text-center px-3 py-3 text-slate-400 font-medium border-l border-border"
                colSpan={CSAT_ETAPAS.length}
              >
                CSAT por Etapa
              </th>
            </tr>
            <tr className="border-b border-border bg-elevated/40 text-xs text-slate-500">
              <th /><th /><th /><th />
              {CSAT_ETAPAS.map((e) => (
                <th key={e.key} className="px-2 py-2 text-center border-l border-border/40 font-medium">
                  {e.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={`${row.cliente}-${i}`} className="border-b border-border/50 hover:bg-elevated/60 transition-colors">
                <td className="px-4 py-3 text-center text-xl"><FlagBadge flag={row.flag} /></td>
                <td className="px-4 py-3 font-medium text-white whitespace-nowrap">{row.cliente}</td>
                <td className="px-3 py-3 text-center">
                  {row.nps != null
                    ? <span className={`font-bold text-lg ${row.nps >= 9 ? 'text-emerald-400' : row.nps >= 7 ? 'text-yellow-400' : 'text-red-400'}`}>{row.nps}</span>
                    : <span className="text-slate-600">—</span>}
                </td>
                <td className="px-3 py-3 text-center">
                  {row.csat != null
                    ? <span className={`font-bold text-lg ${row.csat >= 4 ? 'text-emerald-400' : row.csat >= 3 ? 'text-yellow-400' : 'text-red-400'}`}>{row.csat}</span>
                    : <span className="text-slate-600">—</span>}
                </td>
                {CSAT_ETAPAS.map((e) => (
                  <ScoreCell key={e.key} v={row[e.key] as number | null} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="text-center py-12 text-slate-500">Sem dados de NPS/CSAT preenchidos</div>
        )}
      </div>
    </div>
  );
}
