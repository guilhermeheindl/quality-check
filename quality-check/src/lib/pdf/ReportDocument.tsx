import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import type { SlideData, OverviewRow, InvestimentoRow, TodoRow } from '@/lib/types';
import { calcInvestFlagColor, scoreColor } from '@/lib/scoring';

// ─── cores ─────────────────────────────────────────────────────────────────

const C = {
  white:   '#FFFFFF',
  surface: '#F8FAFC',
  border:  '#E2E8F0',
  text:    '#1E293B',
  muted:   '#64748B',
  subtle:  '#94A3B8',
  accent:  '#DC2626',
  green:   '#059669',
  yellow:  '#D97706',
  red:     '#DC2626',
};

function flagHex(flag: string): string {
  if (flag === 'green')  return C.green;
  if (flag === 'yellow') return C.yellow;
  if (flag === 'red')    return C.red;
  return C.subtle;
}

function npsHex(v: number): string {
  if (v >= 9) return C.green;
  if (v >= 7) return C.yellow;
  return C.red;
}

function csatHex(v: number): string {
  if (v >= 4) return C.green;
  if (v >= 3) return C.yellow;
  return C.red;
}

function fmtBRL(v: number | null | undefined): string {
  if (v == null) return '—';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency', currency: 'BRL', maximumFractionDigits: 0,
  }).format(v);
}

function fmtPct(v: number | null | undefined): string {
  if (v == null) return '—';
  return `${Math.round(v * 100)}%`;
}

// ─── estilos ───────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  // página (todas em landscape)
  page: {
    backgroundColor: C.white,
    fontFamily: 'Helvetica',
    paddingTop: 28, paddingBottom: 28, paddingLeft: 32, paddingRight: 32,
    fontSize: 8,
    color: C.text,
  },
  // cabeçalho de página
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  logo: {
    width: 20, height: 20,
    backgroundColor: C.accent,
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  logoTxt: { color: '#FFF', fontSize: 7, fontFamily: 'Helvetica-Bold' },
  headerTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold' },
  headerSub:   { fontSize: 7, color: C.muted, marginTop: 1 },
  slideLabel:  { fontSize: 7.5, color: C.muted },
  // título da seção
  sectionTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', marginBottom: 10 },
  // cards de resumo
  cards: { flexDirection: 'row', marginBottom: 12 },
  card: {
    flex: 1, borderRadius: 6,
    borderWidth: 1, borderColor: C.border,
    padding: 10, alignItems: 'center',
    marginRight: 6,
    backgroundColor: C.surface,
  },
  cardNum:   { fontSize: 16, fontFamily: 'Helvetica-Bold' },
  cardLabel: { fontSize: 6, color: C.muted, marginTop: 2 },
  // tabela
  thead: {
    flexDirection: 'row',
    backgroundColor: C.surface,
    borderTopWidth: 1, borderTopColor: C.border,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  trow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5, borderBottomColor: C.border,
  },
  trowAlt: {
    flexDirection: 'row',
    borderBottomWidth: 0.5, borderBottomColor: C.border,
    backgroundColor: '#FAFAFA',
  },
  th: {
    fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: C.muted,
    paddingHorizontal: 6, paddingVertical: 5,
  },
  td: {
    fontSize: 7.5, paddingHorizontal: 6, paddingVertical: 5,
  },
  tdMuted: {
    fontSize: 7.5, color: C.muted, paddingHorizontal: 6, paddingVertical: 5,
  },
  // dot de flag
  dot: { width: 8, height: 8, borderRadius: 4 },
  // barra de progresso
  barRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 5 },
  barTrack: { flex: 1, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, marginRight: 4 },
  barFill:  { height: 4, borderRadius: 2 },
  barTxt:   { width: 28, fontSize: 7, textAlign: 'right' },
  // todo
  todoRow: { flexDirection: 'row' },
  todoCol: {
    flex: 1, borderWidth: 1, borderColor: C.border,
    borderRadius: 6, padding: 10, marginRight: 6,
  },
  todoColLast: {
    flex: 1, borderWidth: 1, borderColor: C.border,
    borderRadius: 6, padding: 10,
  },
  todoColTitle: { fontSize: 8, fontFamily: 'Helvetica-Bold', marginBottom: 6 },
  todoItem:     { flexDirection: 'row', marginBottom: 3 },
  todoBullet:   { width: 8, fontSize: 7, color: C.muted },
  todoText:     { flex: 1, fontSize: 7, lineHeight: 1.4 },
  // separador de GP
  gpSep: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  gpSepBox: {
    borderWidth: 2, borderColor: C.accent, borderRadius: 10,
    paddingHorizontal: 48, paddingVertical: 32, alignItems: 'center',
  },
  gpSepLabel: { fontSize: 10, color: C.muted, marginBottom: 6, letterSpacing: 2 },
  gpSepName:  { fontSize: 28, fontFamily: 'Helvetica-Bold', color: C.text },
  gpSepPeriod:{ fontSize: 10, color: C.muted, marginTop: 8 },
  // vazio
  empty: { padding: 30, textAlign: 'center', color: C.muted, fontSize: 9 },
});

// ─── componentes de suporte ────────────────────────────────────────────────

function PageHeader({ gpName, period, slideLabel }: { gpName: string; period: string; slideLabel: string }) {
  return (
    <View style={s.header}>
      <View style={s.headerLeft}>
        <View style={s.logo}><Text style={s.logoTxt}>V4</Text></View>
        <View>
          <Text style={s.headerTitle}>Quality Check</Text>
          <Text style={s.headerSub}>GP {gpName} · {period}</Text>
        </View>
      </View>
      <Text style={s.slideLabel}>{slideLabel}</Text>
    </View>
  );
}

function FlagDot({ flag }: { flag: string }) {
  return <View style={[s.dot, { backgroundColor: flagHex(flag) }]} />;
}

function PBar({ value }: { value: number | null | undefined }) {
  if (value == null) {
    return (
      <View style={s.barRow}>
        <Text style={[s.barTxt, { color: C.muted }]}>—</Text>
      </View>
    );
  }
  const pct  = Math.round(value * 100);
  const bar  = Math.min(pct, 100);
  const color = scoreColor(value);
  return (
    <View style={s.barRow}>
      <View style={s.barTrack}>
        <View style={[s.barFill, { width: `${bar}%`, backgroundColor: color }]} />
      </View>
      <Text style={[s.barTxt, { color }]}>{pct}%</Text>
    </View>
  );
}

// ─── páginas por slide ─────────────────────────────────────────────────────

function GPSeparator({ gpName, period }: { gpName: string; period: string }) {
  return (
    <Page size="A4" orientation="landscape" style={s.page}>
      <View style={s.gpSep}>
        <View style={s.gpSepBox}>
          <Text style={s.gpSepLabel}>QUALITY CHECK</Text>
          <Text style={s.gpSepName}>GP {gpName}</Text>
          <Text style={s.gpSepPeriod}>{period}</Text>
        </View>
      </View>
    </Page>
  );
}

function OverviewPage({ gpName, period, overview }: { gpName: string; period: string; overview: OverviewRow[] }) {
  const green  = overview.filter(r => r.flag === 'green').length;
  const yellow = overview.filter(r => r.flag === 'yellow').length;
  const red    = overview.filter(r => r.flag === 'red').length;

  return (
    <Page size="A4" orientation="landscape" style={s.page}>
      <PageHeader gpName={gpName} period={period} slideLabel="Overview de Clientes" />
      <Text style={s.sectionTitle}>Overview — GP {gpName}</Text>

      {overview.length > 0 && (
        <View style={s.cards}>
          <View style={s.card}>
            <Text style={s.cardNum}>{overview.length}</Text>
            <Text style={s.cardLabel}>Total Clientes</Text>
          </View>
          <View style={[s.card, { borderColor: '#059669', backgroundColor: '#ECFDF5' }]}>
            <Text style={[s.cardNum, { color: C.green }]}>{green}</Text>
            <Text style={[s.cardLabel, { color: '#065F46' }]}>Safe</Text>
          </View>
          <View style={[s.card, { borderColor: C.yellow, backgroundColor: '#FFFBEB' }]}>
            <Text style={[s.cardNum, { color: C.yellow }]}>{yellow}</Text>
            <Text style={[s.cardLabel, { color: '#92400E' }]}>Care</Text>
          </View>
          <View style={[{ flex: 1, borderRadius: 6, borderWidth: 1, borderColor: C.red, backgroundColor: '#FEF2F2', padding: 10, alignItems: 'center' }]}>
            <Text style={[s.cardNum, { color: C.red }]}>{red}</Text>
            <Text style={[s.cardLabel, { color: '#991B1B' }]}>Critico</Text>
          </View>
        </View>
      )}

      <View style={s.thead}>
        <View style={{ width: 24 }}><Text style={s.th}> </Text></View>
        <View style={{ flex: 3 }}><Text style={s.th}>Cliente</Text></View>
        <View style={{ width: 32 }}><Text style={[s.th, { textAlign: 'center' }]}>NPS</Text></View>
        <View style={{ width: 32 }}><Text style={[s.th, { textAlign: 'center' }]}>CSAT</Text></View>
        <View style={{ flex: 5 }}><Text style={s.th}>Observacoes Relevantes</Text></View>
      </View>
      {overview.map((row, i) => (
        <View key={i} style={i % 2 === 0 ? s.trow : s.trowAlt}>
          <View style={{ width: 24, justifyContent: 'center', alignItems: 'center', paddingVertical: 5 }}>
            <FlagDot flag={row.flag} />
          </View>
          <View style={{ flex: 3, justifyContent: 'center' }}>
            <Text style={[s.td, { fontFamily: 'Helvetica-Bold' }]}>{row.cliente}</Text>
          </View>
          <View style={{ width: 32, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={[s.td, { fontFamily: 'Helvetica-Bold', color: row.nps != null ? npsHex(row.nps) : C.muted }]}>
              {row.nps ?? '—'}
            </Text>
          </View>
          <View style={{ width: 32, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={[s.td, { fontFamily: 'Helvetica-Bold', color: row.csat != null ? csatHex(row.csat) : C.muted }]}>
              {row.csat ?? '—'}
            </Text>
          </View>
          <View style={{ flex: 5, justifyContent: 'center' }}>
            <Text style={s.tdMuted}>{row.observacaoRelevante || '—'}</Text>
          </View>
        </View>
      ))}
      {overview.length === 0 && <Text style={s.empty}>Nenhum cliente encontrado para este GP</Text>}
    </Page>
  );
}

function InvestimentoPage({ gpName, period, investimento }: { gpName: string; period: string; investimento: InvestimentoRow[] }) {
  return (
    <Page size="A4" orientation="landscape" style={s.page}>
      <PageHeader gpName={gpName} period={period} slideLabel="Investimento & Faturamento" />
      <Text style={s.sectionTitle}>Investimento & Faturamento</Text>

      <View style={s.thead}>
        <View style={{ width: 20 }}><Text style={s.th}> </Text></View>
        <View style={{ flex: 3 }}><Text style={s.th}>Cliente</Text></View>
        <View style={{ flex: 2 }}><Text style={[s.th, { textAlign: 'right' }]}>Meta Invest.</Text></View>
        <View style={{ flex: 2 }}><Text style={[s.th, { textAlign: 'right' }]}>Atingido</Text></View>
        <View style={{ flex: 2.5 }}><Text style={s.th}>% Invest.</Text></View>
        <View style={{ flex: 2 }}><Text style={[s.th, { textAlign: 'right' }]}>Meta Fat.</Text></View>
        <View style={{ flex: 2 }}><Text style={[s.th, { textAlign: 'right' }]}>Fat. Atingido</Text></View>
        <View style={{ flex: 2.5 }}><Text style={s.th}>% Fat.</Text></View>
      </View>

      {investimento.map((row, i) => {
        const flag = calcInvestFlagColor(row.percentInvest, row.metaFaturamento, row.atingidoFaturamento);
        return (
          <View key={i} style={i % 2 === 0 ? s.trow : s.trowAlt}>
            <View style={{ width: 20, justifyContent: 'center', alignItems: 'center', paddingVertical: 5 }}>
              <FlagDot flag={flag} />
            </View>
            <View style={{ flex: 3, justifyContent: 'center' }}>
              <Text style={[s.td, { fontFamily: 'Helvetica-Bold' }]}>{row.cliente}</Text>
            </View>
            <View style={{ flex: 2, justifyContent: 'center' }}>
              <Text style={[s.td, { textAlign: 'right' }]}>{fmtBRL(row.metaInvest)}</Text>
            </View>
            <View style={{ flex: 2, justifyContent: 'center' }}>
              <Text style={[s.td, { textAlign: 'right' }]}>{fmtBRL(row.atingidoInvestTotal)}</Text>
            </View>
            <View style={{ flex: 2.5 }}>
              <PBar value={row.percentInvest} />
            </View>
            <View style={{ flex: 2, justifyContent: 'center' }}>
              <Text style={[s.td, { textAlign: 'right' }]}>{fmtBRL(row.metaFaturamento)}</Text>
            </View>
            <View style={{ flex: 2, justifyContent: 'center' }}>
              <Text style={[s.td, { textAlign: 'right' }]}>{fmtBRL(row.atingidoFaturamento)}</Text>
            </View>
            <View style={{ flex: 2.5 }}>
              <PBar value={row.percentFaturamento} />
            </View>
          </View>
        );
      })}
      {investimento.length === 0 && <Text style={s.empty}>Nenhum dado de investimento</Text>}
    </Page>
  );
}

function NPSPage({ gpName, period, overview }: { gpName: string; period: string; overview: OverviewRow[] }) {
  const CSAT_COLS: { key: keyof OverviewRow; label: string }[] = [
    { key: 'csatAtendimento', label: 'Atend.' },
    { key: 'csatCampanhas',   label: 'Camp.'  },
    { key: 'csatCopys',       label: 'Copys'  },
    { key: 'csatDesigns',     label: 'Design' },
    { key: 'csatPrazos',      label: 'Prazos' },
    { key: 'csatResultados',  label: 'Result.'},
  ];

  return (
    <Page size="A4" orientation="landscape" style={s.page}>
      <PageHeader gpName={gpName} period={period} slideLabel="NPS & CSAT" />
      <Text style={s.sectionTitle}>NPS & CSAT</Text>

      <View style={s.thead}>
        <View style={{ width: 20 }}><Text style={s.th}> </Text></View>
        <View style={{ flex: 3 }}><Text style={s.th}>Cliente</Text></View>
        <View style={{ width: 36 }}><Text style={[s.th, { textAlign: 'center' }]}>NPS</Text></View>
        <View style={{ width: 36 }}><Text style={[s.th, { textAlign: 'center' }]}>CSAT</Text></View>
        {CSAT_COLS.map(c => (
          <View key={c.key as string} style={{ flex: 1 }}>
            <Text style={[s.th, { textAlign: 'center' }]}>{c.label}</Text>
          </View>
        ))}
      </View>

      {overview.map((row, i) => (
        <View key={i} style={i % 2 === 0 ? s.trow : s.trowAlt}>
          <View style={{ width: 20, justifyContent: 'center', alignItems: 'center', paddingVertical: 5 }}>
            <FlagDot flag={row.flag} />
          </View>
          <View style={{ flex: 3, justifyContent: 'center' }}>
            <Text style={[s.td, { fontFamily: 'Helvetica-Bold' }]}>{row.cliente}</Text>
          </View>
          <View style={{ width: 36, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={[s.td, { fontFamily: 'Helvetica-Bold', color: row.nps != null ? npsHex(row.nps) : C.muted }]}>
              {row.nps ?? '—'}
            </Text>
          </View>
          <View style={{ width: 36, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={[s.td, { fontFamily: 'Helvetica-Bold', color: row.csat != null ? csatHex(row.csat) : C.muted }]}>
              {row.csat ?? '—'}
            </Text>
          </View>
          {CSAT_COLS.map(c => {
            const val = row[c.key] as number | null;
            return (
              <View key={c.key as string} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={[s.td, { color: val != null ? csatHex(val) : C.muted, fontFamily: 'Helvetica-Bold' }]}>
                  {val ?? '—'}
                </Text>
              </View>
            );
          })}
        </View>
      ))}
      {overview.length === 0 && <Text style={s.empty}>Sem dados de NPS/CSAT</Text>}
    </Page>
  );
}

function FCAPage({ gpName, period, overview }: { gpName: string; period: string; overview: OverviewRow[] }) {
  const criticos = overview.filter(r => {
    const fato = r.fato?.trim() ?? '';
    return fato.length > 0 && fato !== '—' && fato !== '-';
  });

  return (
    <Page size="A4" orientation="landscape" style={s.page}>
      <PageHeader gpName={gpName} period={period} slideLabel="Situacao Critica" />
      <Text style={s.sectionTitle}>Situacao Critica (FCA)</Text>

      {criticos.length === 0 ? (
        <Text style={s.empty}>Sem clientes com situacoes criticas registradas</Text>
      ) : (
        <>
          <View style={s.thead}>
            <View style={{ width: 24 }}><Text style={s.th}> </Text></View>
            <View style={{ flex: 2 }}><Text style={s.th}>Cliente</Text></View>
            <View style={{ flex: 3 }}><Text style={s.th}>Fato</Text></View>
            <View style={{ flex: 3 }}><Text style={s.th}>Causa</Text></View>
            <View style={{ flex: 3 }}><Text style={s.th}>Acao</Text></View>
          </View>
          {criticos.map((row, i) => (
            <View key={i} style={i % 2 === 0 ? s.trow : s.trowAlt}>
              <View style={{ width: 24, justifyContent: 'center', alignItems: 'center', paddingVertical: 5 }}>
                <FlagDot flag={row.flag} />
              </View>
              <View style={{ flex: 2, justifyContent: 'center' }}>
                <Text style={[s.td, { fontFamily: 'Helvetica-Bold' }]}>{row.cliente}</Text>
              </View>
              <View style={{ flex: 3, justifyContent: 'center' }}>
                <Text style={s.tdMuted}>{row.fato || '—'}</Text>
              </View>
              <View style={{ flex: 3, justifyContent: 'center' }}>
                <Text style={s.tdMuted}>{row.causa || '—'}</Text>
              </View>
              <View style={{ flex: 3, justifyContent: 'center' }}>
                <Text style={s.tdMuted}>{row.acao || '—'}</Text>
              </View>
            </View>
          ))}
        </>
      )}
    </Page>
  );
}

function TodoPage({ gpName, period, todo }: { gpName: string; period: string; todo: TodoRow[] }) {
  const AREAS: { key: keyof TodoRow; label: string; color: string }[] = [
    { key: 'operacao',  label: 'Operacao',  color: '#2563EB' },
    { key: 'cs',        label: 'CS',         color: '#7C3AED' },
    { key: 'qualidade', label: 'Qualidade',  color: C.green   },
  ];

  return (
    <Page size="A4" orientation="landscape" style={s.page}>
      <PageHeader gpName={gpName} period={period} slideLabel="To Do" />
      <Text style={s.sectionTitle}>To Do</Text>

      <View style={s.todoRow}>
        {AREAS.map((area, idx) => (
          <View key={area.key as string} style={idx < 2 ? s.todoCol : s.todoColLast}>
            <Text style={[s.todoColTitle, { color: area.color }]}>{area.label.toUpperCase()}</Text>
            {todo.filter(r => r[area.key]).map((row, i) => (
              <View key={i} style={s.todoItem}>
                <Text style={s.todoBullet}>• </Text>
                <Text style={s.todoText}>{row[area.key]}</Text>
              </View>
            ))}
            {todo.every(r => !r[area.key]) && (
              <Text style={[s.todoText, { color: C.muted }]}>Sem itens</Text>
            )}
          </View>
        ))}
      </View>
    </Page>
  );
}

function MonetizacaoPage({ gpName, period, overview }: { gpName: string; period: string; overview: OverviewRow[] }) {
  const rows = overview.filter(r => r.proposta?.trim());

  const STATUS_COLOR: Record<string, string> = {
    vendido:           C.green,
    'contrato na rua': '#2563EB',
    apresentado:       C.yellow,
  };

  function statusColor(s: string) {
    return STATUS_COLOR[s.toLowerCase()] ?? C.muted;
  }

  return (
    <Page size="A4" orientation="landscape" style={s.page}>
      <PageHeader gpName={gpName} period={period} slideLabel="Monetizacao" />
      <Text style={s.sectionTitle}>Monetizacao</Text>

      {rows.length === 0 ? (
        <Text style={s.empty}>Nenhum cliente com monetizacao registrada</Text>
      ) : (
        <>
          <View style={s.thead}>
            <View style={{ flex: 2 }}><Text style={s.th}>Cliente</Text></View>
            <View style={{ flex: 3 }}><Text style={s.th}>Proposta</Text></View>
            <View style={{ flex: 2 }}><Text style={s.th}>Status</Text></View>
            <View style={{ flex: 4 }}><Text style={s.th}>Comentario</Text></View>
          </View>
          {rows.map((row, i) => (
            <View key={i} style={i % 2 === 0 ? s.trow : s.trowAlt}>
              <View style={{ flex: 2, justifyContent: 'center' }}>
                <Text style={[s.td, { fontFamily: 'Helvetica-Bold' }]}>{row.cliente}</Text>
              </View>
              <View style={{ flex: 3, justifyContent: 'center' }}>
                <Text style={s.td}>{row.proposta}</Text>
              </View>
              <View style={{ flex: 2, justifyContent: 'center' }}>
                {row.statusMonetizacao ? (
                  <Text style={[s.td, { color: statusColor(row.statusMonetizacao), fontFamily: 'Helvetica-Bold' }]}>
                    {row.statusMonetizacao}
                  </Text>
                ) : (
                  <Text style={s.tdMuted}>—</Text>
                )}
              </View>
              <View style={{ flex: 4, justifyContent: 'center' }}>
                <Text style={s.tdMuted}>{row.comentarioMonetizacao || '—'}</Text>
              </View>
            </View>
          ))}
          <Text style={{ fontSize: 7, color: C.muted, marginTop: 8, textAlign: 'right' }}>
            {rows.length} cliente{rows.length !== 1 ? 's' : ''} com monetizacao ativa
          </Text>
        </>
      )}
    </Page>
  );
}

// ─── documento principal ───────────────────────────────────────────────────

export interface ReportData {
  period:   string;
  gpOrder:  string[];
  gps:      Record<string, Partial<SlideData>>;
}

export function ReportDocument({ data }: { data: ReportData }) {
  return (
    <Document title={`Quality Check ${data.period}`} author="V4 Company">
      {data.gpOrder.map((gp) => {
        const d = data.gps[gp] ?? {};
        const overview     = (d.overview     ?? []) as OverviewRow[];
        const investimento = (d.investimento ?? []) as InvestimentoRow[];
        const todo         = (d.todo         ?? []) as TodoRow[];
        const period       = d.period ?? data.period;

        return (
          <React.Fragment key={gp}>
            <GPSeparator gpName={gp} period={period} />
            <OverviewPage    gpName={gp} period={period} overview={overview} />
            <InvestimentoPage gpName={gp} period={period} investimento={investimento} />
            <NPSPage         gpName={gp} period={period} overview={overview} />
            <FCAPage         gpName={gp} period={period} overview={overview} />
            <TodoPage        gpName={gp} period={period} todo={todo} />
            <MonetizacaoPage gpName={gp} period={period} overview={overview} />
          </React.Fragment>
        );
      })}
    </Document>
  );
}
