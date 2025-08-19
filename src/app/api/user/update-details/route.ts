import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const apiUrl = process.env.BLOXIFY_URL_BASE;
    const apiKey = process.env.BLOXIFY_API_KEY;
    const access = req.cookies.get('accessToken')?.value;

    if (!apiUrl || !apiKey) {
      console.error('[UPDATE DETAILS ERROR] Missing env BLOXIFY_URL_BASE or BLOXIFY_API_KEY');
      return NextResponse.json({ error: 'Configuração do servidor ausente' }, { status: 500 });
    }

    if (!access) {
      return NextResponse.json({ error: 'Access token ausente' }, { status: 401 });
    }

    // Monta URL final (sem // duplicado)
    const url = `${apiUrl.replace(/\/+$/, '')}/user/update-details`;

    const init: RequestInit & { duplex: 'half' } = {
      method: 'PUT',
      headers: {
        'content-type': req.headers.get('content-type') || '',
        authorization: `Bearer ${access}`,
        'x-api-key': apiKey,
      },
      body: req.body,      // stream multipart original
      duplex: 'half',
      redirect: 'manual',  // captura 301/302 em vez de seguir para HTML
      cache: 'no-store',
    };

    const backendRes = await fetch(url, init);

    const ct = backendRes.headers.get('content-type') || '';
    const status = backendRes.status;

    // Log mínimo para depuração
    console.log('[UPDATE DETAILS DEBUG]', { url, status, contentType: ct });

    // Se não for JSON, tenta ler como texto para entender o que voltou
    if (!ct.includes('application/json')) {
      const txt = await backendRes.text();
      console.error('[UPDATE DETAILS NON-JSON]', status, txt.slice(0, 400));
      return NextResponse.json(
        {
          error: 'Resposta do backend não é JSON',
          status,
          hint: 'Verifique se a rota existe, método PUT, auth e CORS/redirecionamento.',
        },
        { status }
      );
    }

    const data = await backendRes.json();
    return NextResponse.json(data, { status });
  } catch (err) {
    console.error('[UPDATE DETAILS ERROR]', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
