import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs'; // executa no Node (precisa do cookie)

export async function POST(req: NextRequest) {
  try {
    /* ───── variáveis de ambiente ───── */
    const apiBase = process.env.BLOXIFY_URL_BASE!;
    const apiKey  = process.env.BLOXIFY_API_KEY!;
    const access  = req.cookies.get('accessToken')?.value;

    if (!access) {
      return NextResponse.json(
        { error: 'Access token ausente' },
        { status: 401 },
      );
    }

    /* ───── forward → backend ───── */
    const backendRes = await fetch(`${apiBase}/kyc/session`, {
  method : 'POST',
  headers: {
    authorization : `Bearer ${access}`,
    'x-api-key'   : apiKey,
    'content-type': 'application/json',
  },
  body: JSON.stringify({}),                // ou { clientId: process.env.CLIENT_ID }
});

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (err) {
    console.error('[KYC SESSION ERROR]', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
