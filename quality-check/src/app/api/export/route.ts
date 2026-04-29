import { NextRequest, NextResponse } from 'next/server';
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { ReportDocument } from '@/lib/pdf/ReportDocument';
import type { ReportData } from '@/lib/pdf/ReportDocument';

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Corpo inválido' }, { status: 400 });
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Corpo inválido' }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;
  const data: ReportData = {
    period:  typeof raw.period === 'string' ? raw.period : '',
    gpOrder: Array.isArray(raw.gpOrder) ? (raw.gpOrder as string[]) : [],
    gps:     (typeof raw.gps === 'object' && raw.gps !== null) ? (raw.gps as ReportData['gps']) : {},
  };

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(React.createElement(ReportDocument, { data }) as any);

    const safePeriod = data.period.replace(/[/\\:*?"<>|]/g, '-');
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Relatorio Quality Check ${safePeriod}.pdf"`,
      },
    });
  } catch (err) {
    console.error('pdf export error', err);
    return NextResponse.json({ error: 'Falha ao gerar PDF' }, { status: 500 });
  }
}
