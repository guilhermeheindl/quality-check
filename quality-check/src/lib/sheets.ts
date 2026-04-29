import type { InvestimentoRow, OverviewRow, TodoRow, FlagColor } from './types';

const SHEET_ID = process.env.SHEET_ID ?? '15nLPDAFZmQ6FujYy03mF3Yi6xXs0AP1DhCAvQQlsvks';

function gvizUrl(gid: string) {
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${gid}`;
}

function gvizUrlByName(sheetName: string) {
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
}

interface GvizCell {
  v: string | number | null;
  f?: string;
}

interface GvizTable {
  cols: { label: string; type: string }[];
  rows: { c: (GvizCell | null)[] }[];
}

async function fetchGviz(gid: string): Promise<GvizTable> {
  const res = await fetch(gvizUrl(gid), { next: { revalidate: 60 } });
  const text = await res.text();
  const json = text
    .replace(/^\/\*.*?\*\/\s*/, '')
    .replace(/^google\.visualization\.Query\.setResponse\(/, '')
    .replace(/\);?\s*$/, '');
  const parsed = JSON.parse(json);
  return parsed.table as GvizTable;
}

function cellStr(cell: GvizCell | null | undefined): string {
  return cell?.f ?? (cell?.v != null ? String(cell.v) : '');
}

function roundCsat(v: number | null): number | null {
  return v == null ? null : Math.round(v);
}

function cellNum(cell: GvizCell | null | undefined): number | null {
  if (cell?.v == null) return null;
  if (typeof cell.v === 'number') return cell.v;
  const n = parseFloat(String(cell.v).replace(/[^\d.,-]/g, '').replace(',', '.'));
  return isNaN(n) ? null : n;
}

// Retorna todos os GPs únicos da planilha de investimento
export async function fetchGPs(): Promise<string[]> {
  const gid = process.env.INVESTMENT_GID ?? '229103756';
  const table = await fetchGviz(gid);
  const gps = new Set<string>();
  for (const row of table.rows) {
    const gp = cellStr(row.c[12]).trim();
    if (gp) gps.add(gp);
  }
  return Array.from(gps).sort();
}

export async function fetchInvestimento(gp?: string): Promise<InvestimentoRow[]> {
  const gid = process.env.INVESTMENT_GID ?? '229103756';
  const table = await fetchGviz(gid);

  return table.rows
    .map((row) => {
      const c = row.c;
      const cliente = cellStr(c[1]).trim();
      if (!cliente) return null;

      // Coluna M (índice 12) = GP
      const rowGp = cellStr(c[12]).trim();
      if (gp && rowGp.toLowerCase() !== gp.toLowerCase()) return null;

      return {
        grupo: cellStr(c[0]),
        cliente,
        gp: rowGp,
        metaInvest: cellNum(c[2]),
        fee: cellNum(c[3]),
        atingidoInvestTotal: cellNum(c[4]),
        atingidoInvestMeta: cellNum(c[5]),
        atingidoInvestGoogle: cellNum(c[6]),
        percentInvest: cellNum(c[7]),
        metaFaturamento: cellNum(c[9]),
        atingidoFaturamento: cellNum(c[10]),
        percentFaturamento: cellNum(c[11]),
        obs: null as string | null,
      } satisfies InvestimentoRow;
    })
    .filter((r): r is InvestimentoRow => r !== null);
}

export async function fetchOverview(gp?: string): Promise<OverviewRow[]> {
  // Aba: Acompanhamento Projetos
  // [0]Cliente | [1]Flag | [2]LT | [3]NPS | [4]CSAT
  // [5]CSAT Atend | [6]Campanhas | [7]Copys | [8]Designs | [9]Prazos | [10]Resultados
  // [11]Obs Relevante | [12]Fato | [13]Causa | [14]Ação
  // [15]Proposta | [16]Status | [17]Comentário
  const sheetName = 'Acompanhamento Projetos';
  const url = gvizUrlByName(sheetName);
  const res = await fetch(url, { next: { revalidate: 60 } });
  const text = await res.text();
  const json = text
    .replace(/^\/\*.*?\*\/\s*/, '')
    .replace(/^google\.visualization\.Query\.setResponse\(/, '')
    .replace(/\);?\s*$/, '');
  const table = (JSON.parse(json) as { table: GvizTable }).table;

  // Filtro por GP: cruza com clientes da planilha de investimento
  let clientesDoGP: Set<string> | null = null;
  if (gp) {
    const investimento = await fetchInvestimento(gp);
    clientesDoGP = new Set(investimento.map((r) => r.cliente.toLowerCase()));
  }

  return table.rows
    .map((row) => {
      const c = row.c;
      const cliente = cellStr(c[0]).trim();
      if (!cliente) return null;
      if (clientesDoGP && !clientesDoGP.has(cliente.toLowerCase())) return null;

      const flagStr = cellStr(c[1]);
      let flag: FlagColor = 'none';
      if (flagStr.includes('🟢')) flag = 'green';
      else if (flagStr.includes('🟡')) flag = 'yellow';
      else if (flagStr.includes('🔴')) flag = 'red';
      else if (flagStr.includes('⚫')) flag = 'black';

      return {
        cliente,
        fase: 'Ongoing',
        flag,
        lt: cellNum(c[2]),
        nps: cellNum(c[3]),
        csat: roundCsat(cellNum(c[4])),
        csatAtendimento: roundCsat(cellNum(c[5])),
        csatCampanhas: roundCsat(cellNum(c[6])),
        csatCopys: roundCsat(cellNum(c[7])),
        csatDesigns: roundCsat(cellNum(c[8])),
        csatPrazos: roundCsat(cellNum(c[9])),
        csatResultados: roundCsat(cellNum(c[10])),
        observacaoRelevante: cellStr(c[11]) || null,
        fato: cellStr(c[12]) || null,
        causa: cellStr(c[13]) || null,
        acao: cellStr(c[14]) || null,
        proposta: cellStr(c[15]) || null,
        statusMonetizacao: cellStr(c[16]) || null,
        comentarioMonetizacao: cellStr(c[17]) || null,
      } satisfies OverviewRow;
    })
    .filter((r): r is OverviewRow => r !== null);
}

export async function fetchTodo(): Promise<TodoRow[]> {
  const sheetName = process.env.TODO_SHEET ?? 'To do squad';
  const url = gvizUrlByName(sheetName);
  const res = await fetch(url, { next: { revalidate: 60 } });
  const text = await res.text();
  const json = text
    .replace(/^\/\*.*?\*\/\s*/, '')
    .replace(/^google\.visualization\.Query\.setResponse\(/, '')
    .replace(/\);?\s*$/, '');
  const table = (JSON.parse(json) as { table: GvizTable }).table;

  // Linha 0 = título "TO-DO", linha 1 = cabeçalhos → pula as duas
  return table.rows
    .slice(2)
    .map((row) => ({
      operacao:  cellStr(row.c[0]) || '',
      cs:        cellStr(row.c[1]) || '',
      qualidade: cellStr(row.c[2]) || '',
    }))
    .filter((r) => r.operacao || r.cs || r.qualidade);
}
