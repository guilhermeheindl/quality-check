'use client';
import type { TodoRow } from '@/lib/types';

const AREAS = [
  { key: 'operacao' as const, label: 'Operação', color: 'text-blue-400', bg: 'bg-blue-900/20 border-blue-800/40' },
  { key: 'cs' as const,       label: 'CS',        color: 'text-purple-400', bg: 'bg-purple-900/20 border-purple-800/40' },
  { key: 'qualidade' as const, label: 'Qualidade', color: 'text-emerald-400', bg: 'bg-emerald-900/20 border-emerald-800/40' },
];

export function TodoSlide({ data, period }: { data: TodoRow[]; period: string }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">To Do</h2>
        <span className="text-sm text-slate-400 bg-slate-800 px-3 py-1 rounded-full">{period}</span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {AREAS.map((area) => (
          <div key={area.key} className={`rounded-xl border p-4 space-y-3 ${area.bg}`}>
            <h3 className={`font-bold text-sm uppercase tracking-wider ${area.color}`}>{area.label}</h3>
            {data.map((row, i) => {
              const text = row[area.key];
              if (!text) return null;
              return (
                <div key={i} className="flex gap-2">
                  <span className="mt-1 text-slate-500 shrink-0">•</span>
                  <p className="text-sm text-slate-300 leading-relaxed">{text}</p>
                </div>
              );
            })}
            {data.every((r) => !r[area.key]) && (
              <p className="text-slate-500 text-sm">Sem itens</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
