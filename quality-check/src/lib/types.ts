export type FlagColor = 'green' | 'yellow' | 'red' | 'black' | 'none';

export interface InvestimentoRow {
  grupo: string;
  cliente: string;
  gp: string;
  metaInvest: number | null;
  fee: number | null;
  atingidoInvestTotal: number | null;
  atingidoInvestMeta: number | null;
  atingidoInvestGoogle: number | null;
  percentInvest: number | null;
  metaFaturamento: number | null;
  atingidoFaturamento: number | null;
  percentFaturamento: number | null;
  obs: string | null;
}

export interface OverviewRow {
  cliente: string;
  fase: string;
  flag: FlagColor;
  lt: number | null;
  nps: number | null;
  csat: number | null;
  csatAtendimento: number | null;
  csatCampanhas: number | null;
  csatCopys: number | null;
  csatDesigns: number | null;
  csatPrazos: number | null;
  csatResultados: number | null;
  observacaoRelevante: string | null;
  fato: string | null;
  causa: string | null;
  acao: string | null;
  proposta: string | null;
  statusMonetizacao: string | null;
  comentarioMonetizacao: string | null;
}

export interface OKRRow {
  flag: FlagColor;
  cliente: string;
  plan: string;
  realizado: string;
  analise: string;
  okr1Meta: string;
  okr1Realizado: string;
  okr1Pct: string;
  okr2Meta: string;
  okr2Realizado: string;
  okr2Pct: string;
  okr3Meta: string;
  okr3Realizado: string;
  okr3Pct: string;
}

export interface NPSRow {
  flag: FlagColor;
  cliente: string;
  npsNota: number | null;
  npsLink: string | null;
  npsAnalise: string;
  csatAtend: number | null;
  csatPrazo: number | null;
  csatResult: number | null;
  csatDesign: number | null;
  csatSocial: number | null;
  csatCopy: number | null;
  csatTrafego: number | null;
  csatSatisf: string | null;
  csatAnalise: string;
}

export interface FCARow {
  cliente: string;
  lt: number | null;
  step: string | null;
  situacoes: string;
}

export interface TodoRow {
  operacao: string;
  cs: string;
  qualidade: string;
}

export interface SlideData {
  investimento: InvestimentoRow[];
  overview: OverviewRow[];
  okrs: OKRRow[];
  nps: NPSRow[];
  fca: FCARow[];
  todo: TodoRow[];
  observations: string;
  gpName: string;
  period: string;
}

export interface Snapshot {
  id: string;          // "2025-04-semana-02"
  month: string;       // "2025-04"
  weekOfMonth: number; // 2
  label: string;       // "Semana 2 · Abril 2025"
  createdAt: string;
  gps: Record<string, Partial<SlideData>>;
}
