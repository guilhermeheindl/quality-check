import { NextRequest, NextResponse } from 'next/server';
import {
  listSnapshots, loadSnapshot, saveSnapshot,
  weekFileId, weekLabel, currentMonth, weekOfMonth,
} from '@/lib/snapshots';
import type { Snapshot, SlideData } from '@/lib/types';

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (id) {
    const snapshot = await loadSnapshot(id);
    if (!snapshot) return NextResponse.json({ error: 'Snapshot não encontrado' }, { status: 404 });
    return NextResponse.json(snapshot);
  }
  return NextResponse.json(await listSnapshots());
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Corpo de requisição inválido' }, { status: 400 });
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Corpo de requisição inválido' }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;
  const gp: string = typeof raw.gp === 'string' ? raw.gp : 'Geral';
  const gpData: Partial<SlideData> =
    (typeof raw.data === 'object' && raw.data !== null) ? (raw.data as Partial<SlideData>) : {};

  const now = new Date();
  const id = weekFileId(now);
  const month = currentMonth(now);

  // Carrega semana existente ou cria nova
  const existing: Snapshot = (await loadSnapshot(id)) ?? {
    id,
    month,
    weekOfMonth: weekOfMonth(now),
    label: weekLabel(now),
    createdAt: new Date().toISOString(),
    gps: {},
  };

  // Atualiza só o GP que salvou, preserva os demais
  existing.gps[gp] = gpData;
  existing.createdAt = new Date().toISOString();

  await saveSnapshot(existing);
  return NextResponse.json({ ok: true, id, label: existing.label });
}
