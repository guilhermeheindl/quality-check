'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { SlideData, Snapshot } from '@/lib/types';
import { InvestimentoSlide } from './slides/InvestimentoSlide';
import { OverviewSlide } from './slides/OverviewSlide';
import { NPSSlide } from './slides/NPSSlide';
import { FCASlide } from './slides/FCASlide';
import { MonetizacaoSlide } from './slides/MonetizacaoSlide';
import { TodoSlide } from './slides/TodoSlide';
import { ErrorBoundary } from './ErrorBoundary';

const SLIDES = [
  { id: 'overview',     label: 'Overview',        icon: '👥' },
  { id: 'investimento', label: 'Invest. & Fat.',   icon: '💰' },
  { id: 'nps',          label: 'NPS & CSAT',       icon: '⭐' },
  { id: 'fca',          label: 'Situação Crítica', icon: '🚨' },
  { id: 'todo',         label: 'To Do',            icon: '✅' },
  { id: 'monetizacao',  label: 'Monetização',      icon: '💎' },
];

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
               'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function toMonthLabel(m: string) {
  const [y, mo] = m.split('-');
  return mo ? `${MESES[parseInt(mo, 10) - 1]} ${y}` : m;
}

const EMPTY: SlideData = {
  investimento: [], overview: [], okrs: [], nps: [], fca: [], todo: [],
  observations: '', gpName: 'GP', period: '',
};

export function Dashboard({ defaultGP, period }: { defaultGP: string; period: string }) {
  const [activeSlide, setActiveSlide]   = useState('investimento');
  const [activeGP, setActiveGP]         = useState(defaultGP);
  const [gpList, setGpList]             = useState<string[]>([defaultGP]);
  const [data, setData]                 = useState<SlideData>({ ...EMPTY, gpName: defaultGP, period });
  const [snapshots, setSnapshots]       = useState<Omit<Snapshot, 'gps'>[]>([]);
  const [activeSnap, setActiveSnap]     = useState<string | null>(null);
  const [snapCache, setSnapCache]       = useState<Snapshot | null>(null);
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [exporting, setExporting]       = useState(false);
  const [toast, setToast]               = useState<string | null>(null);

  // Evita que useEffect dispare loadLive quando trocamos GP dentro de um snapshot
  const skipLiveRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const loadLive = useCallback(async (gp: string) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    setLoading(true);
    setActiveSnap(null);
    setSnapCache(null);
    try {
      const res = await fetch(`/api/sheets?gp=${encodeURIComponent(gp)}`, { signal });
      const json = await res.json();
      if (json.gps) setGpList(json.gps);
      setData((prev) => ({
        ...prev,
        gpName: gp,
        investimento: json.investimento ?? [],
        overview: json.overview ?? [],
        todo: json.todo ?? [],
      }));
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      showToast('Erro ao buscar dados da planilha');
    } finally {
      setLoading(false);
    }
  }, []);

  const applySnapForGP = useCallback((snap: Snapshot, gp: string) => {
    const gpData = snap.gps[gp] ?? {};
    setData({ ...EMPTY, gpName: gp, period: snap.label, ...gpData });
  }, []);

  const loadSnapshotById = useCallback(async (id: string) => {
    setLoading(true);
    setActiveSnap(id);
    try {
      const res = await fetch(`/api/snapshots?id=${id}`);
      const snap: Snapshot = await res.json();
      setSnapCache(snap);
      applySnapForGP(snap, activeGP);
    } catch {
      showToast('Erro ao carregar snapshot');
    } finally {
      setLoading(false);
    }
  }, [activeGP, applySnapForGP]);

  const loadSnapshotList = useCallback(async () => {
    const res = await fetch('/api/snapshots');
    setSnapshots(await res.json());
  }, []);

  // Carrega dados ao vivo quando GP muda (exceto quando estamos dentro de um snapshot)
  useEffect(() => {
    if (skipLiveRef.current) {
      skipLiveRef.current = false;
      return;
    }
    loadLive(activeGP);
    loadSnapshotList();
  }, [activeGP, loadLive, loadSnapshotList]);

  const handleGPChange = (gp: string) => {
    if (activeSnap !== null && snapCache !== null) {
      // Dentro de snapshot: só troca os dados sem recarregar da API
      skipLiveRef.current = true;
      setActiveGP(gp);
      applySnapForGP(snapCache, gp);
    } else {
      // Modo ao vivo: useEffect cuida do reload
      setActiveGP(gp);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/snapshots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, gp: activeGP }),
      });
      const json = await res.json();
      showToast(`💾 ${json.label} salvo!`);
      loadSnapshotList();
    } catch {
      showToast('Erro ao salvar snapshot');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      let gpsData: Record<string, Partial<SlideData>>;

      if (activeSnap !== null && snapCache !== null) {
        // Snapshot: todos os GPs já estão em memória
        gpsData = snapCache.gps;
      } else {
        // Ao vivo: busca cada GP da planilha
        const entries = await Promise.all(
          gpList.map(async (gp) => {
            const res  = await fetch(`/api/sheets?gp=${encodeURIComponent(gp)}`);
            const json = await res.json();
            return [gp, {
              investimento: json.investimento ?? [],
              overview:     json.overview     ?? [],
              todo:         json.todo         ?? [],
              gpName:       gp,
              period:       data.period || period,
            }] as [string, Partial<SlideData>];
          })
        );
        gpsData = Object.fromEntries(entries);
      }

      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gps:     gpsData,
          gpOrder: gpList,
          period:  data.period || period,
        }),
      });
      if (!res.ok) throw new Error('export failed');
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `Relatorio QC ${data.period || period}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      showToast('Erro ao gerar relatório');
    } finally {
      setExporting(false);
    }
  };

  // Agrupa snapshots por mês para a sidebar
  const snapshotsByMonth = snapshots.reduce<Record<string, typeof snapshots>>((acc, s) => {
    const m = s.month || 'outro';
    (acc[m] ??= []).push(s);
    return acc;
  }, {});

  return (
    <div className="flex h-screen overflow-hidden bg-base">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-surface border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center text-xs font-black text-white">V4</div>
            <span className="font-bold text-white text-sm">Growthx</span>
          </div>

          <div>
            <p className="text-xs text-slate-500 mb-1.5">Gestor de Projetos</p>
            <div className="space-y-1">
              {gpList.map((gp) => (
                <button
                  key={gp}
                  onClick={() => handleGPChange(gp)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    activeGP === gp
                      ? 'bg-accent text-white font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-elevated'
                  }`}
                >
                  {gp}
                </button>
              ))}
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 py-1">Slides</p>
          {SLIDES.map((slide) => (
            <button
              key={slide.id}
              onClick={() => setActiveSlide(slide.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                activeSlide === slide.id
                  ? 'bg-accent/20 text-accent font-medium'
                  : 'text-slate-400 hover:text-white hover:bg-elevated'
              }`}
            >
              <span>{slide.icon}</span>
              <span>{slide.label}</span>
            </button>
          ))}

          {/* Histórico */}
          <div className="pt-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 py-1">Histórico</p>

            <button
              onClick={() => loadLive(activeGP)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                activeSnap === null
                  ? 'bg-emerald-900/30 text-emerald-400 font-medium'
                  : 'text-slate-400 hover:text-white hover:bg-elevated'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Ao vivo
            </button>

            {Object.entries(snapshotsByMonth)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([month, snaps]) => (
                <div key={month} className="mt-3">
                  <p className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <span>📁</span>{toMonthLabel(month)}
                  </p>
                  {snaps
                    .sort((a, b) => b.weekOfMonth - a.weekOfMonth)
                    .map((snap) => (
                      <button
                        key={snap.id}
                        onClick={() => loadSnapshotById(snap.id)}
                        className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors text-left ${
                          activeSnap === snap.id
                            ? 'bg-accent/20 text-accent font-medium'
                            : 'text-slate-400 hover:text-white hover:bg-elevated'
                        }`}
                      >
                        <span className="text-slate-600">📅</span>
                        <span className="truncate">{snap.label}</span>
                      </button>
                    ))}
                </div>
              ))}
          </div>
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-surface border-b border-border flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-white">
              {SLIDES.find((s) => s.id === activeSlide)?.label}
            </span>
            <span className="text-xs text-slate-500 bg-elevated px-2 py-0.5 rounded-full">
              GP {activeGP}
            </span>
            {loading && (
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <span className="w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                Carregando...
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-elevated rounded-lg px-3 py-1.5 text-sm text-slate-300">
              <span>📅</span>
              <span>{data.period || period}</span>
              {activeSnap === null && <span className="ml-1 text-xs text-emerald-400">● ao vivo</span>}
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-elevated hover:bg-border rounded-lg text-sm text-slate-300 hover:text-white transition-colors disabled:opacity-50"
            >
              {saving ? '...' : '💾'} Salvar semana
            </button>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-accent hover:bg-accent-dim rounded-lg text-sm text-white font-medium transition-colors disabled:opacity-50"
            >
              {exporting ? 'Gerando...' : '📄'} Exportar Relatório
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {activeSlide === 'overview' && (
            <ErrorBoundary label="Overview">
              <OverviewSlide
                data={data.overview}
                observations={data.observations}
                gpName={data.gpName}
                period={data.period || period}
              />
            </ErrorBoundary>
          )}
          {activeSlide === 'investimento' && (
            <ErrorBoundary label="Investimento">
              <InvestimentoSlide data={data.investimento} period={data.period || period} />
            </ErrorBoundary>
          )}
          {activeSlide === 'nps' && (
            <ErrorBoundary label="NPS & CSAT">
              <NPSSlide data={data.nps} overviewData={data.overview} period={data.period || period} />
            </ErrorBoundary>
          )}
          {activeSlide === 'fca' && (
            <ErrorBoundary label="Situação Crítica">
              <FCASlide data={data.fca} overviewData={data.overview} period={data.period || period} />
            </ErrorBoundary>
          )}
          {activeSlide === 'monetizacao' && (
            <ErrorBoundary label="Monetização">
              <MonetizacaoSlide overviewData={data.overview} period={data.period || period} />
            </ErrorBoundary>
          )}
          {activeSlide === 'todo' && (
            <ErrorBoundary label="To Do">
              <TodoSlide data={data.todo} period={data.period || period} />
            </ErrorBoundary>
          )}
        </main>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-elevated border border-border text-white text-sm px-4 py-3 rounded-xl shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
