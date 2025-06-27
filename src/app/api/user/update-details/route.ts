// app/api/user/update-details/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';                       // executa no Node

export async function POST(req: NextRequest) {
  try {
    /* ─── variáveis de ambiente ─────────────────────────────────────── */
    const apiUrl = process.env.BLOXIFY_URL_BASE!;
    const apiKey = process.env.BLOXIFY_API_KEY!;
    const access = req.cookies.get('accessToken')?.value;

    if (!access) {
      return NextResponse.json(
        { error: 'Access token ausente' },
        { status: 401 },
      );
    }

    /* ─── simplesmente repassamos o mesmo stream multipart ──────────── */
    const init: RequestInit & { duplex: 'half' } = {
      method: 'PUT',
      headers: {
        'content-type': req.headers.get('content-type') || '',
        authorization : `Bearer ${access}`,
        'x-api-key'   : apiKey,
      },
      body: req.body,      // stream original vindo do navegador
      duplex: 'half',      // exigido por Undici/Node 18 para streams
    };

    const backendRes = await fetch(`${apiUrl}/user/update-details`, init);
    const data       = await backendRes.json();

    return NextResponse.json(data, { status: backendRes.status });
  } catch (err) {
    console.error('[UPDATE DETAILS ERROR]', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
