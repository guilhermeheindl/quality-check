import { NextRequest, NextResponse } from 'next/server';
import { fetchInvestimento, fetchOverview, fetchGPs, fetchTodo } from '@/lib/sheets';

export async function GET(req: NextRequest) {
  const gp = req.nextUrl.searchParams.get('gp') ?? undefined;

  try {
    const [investimento, overview, gps, todo] = await Promise.all([
      fetchInvestimento(gp),
      fetchOverview(gp),
      fetchGPs(),
      fetchTodo(),
    ]);
    return NextResponse.json({ investimento, overview, gps, todo });
  } catch (err) {
    console.error('sheets fetch error', err);
    return NextResponse.json({ error: 'Falha ao buscar dados da planilha' }, { status: 500 });
  }
}
