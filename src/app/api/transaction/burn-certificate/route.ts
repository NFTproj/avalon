import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

/**
 * POST /api/transaction/burn-certificate
 * 
 * Proxy para o endpoint do backend Bloxify:
 * POST /transaction/burn-certificate
 * 
 * Payload esperado:
 * {
 *   clientId: string;
 *   cardId: string;
 *   tokenAddress: string;
 *   amount: string;
 *   network?: string;
 * }
 * 
 * Respostas possíveis:
 * - 200: { message: string, transactionId?: string }
 * - 400: { error: string } - validação de payload
 * - 401: { error: string } - não autenticado
 * - 500: { error: string } - erro interno
 */
export async function POST(req: NextRequest) {
  try {
    const apiBase = (process.env.BLOXIFY_URL_BASE || '').replace(/\/+$/, '')
    const apiKey = process.env.BLOXIFY_API_KEY
    const clientId = process.env.CLIENT_ID
    const accessToken = req.cookies.get('accessToken')?.value

    if (!apiBase || !apiKey || !clientId) {
      return NextResponse.json(
        { error: 'Configuração ausente (BLOXIFY_URL_BASE/BLOXIFY_API_KEY/CLIENT_ID).' },
        { status: 500 }
      )
    }

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token ausente.' },
        { status: 401 }
      )
    }

    // Parse e valida o body
    let body: any
    try {
      body = await req.json()
    } catch {
      return NextResponse.json(
        { error: 'Body inválido ou ausente.' },
        { status: 400 }
      )
    }

    const { cardId, tokenAddress, amount, network } = body

    // Validações básicas
    if (!cardId || !tokenAddress || !amount) {
      return NextResponse.json(
        { error: 'Campos obrigatórios ausentes: cardId, tokenAddress, amount.' },
        { status: 400 }
      )
    }

    // Monta payload para o backend
    const payload: any = {
      clientId: clientId, // Usa o CLIENT_ID do ambiente
      cardId,
      tokenAddress,
      amount,
    }

    if (network) {
      payload.network = network
    }


    // Chama o backend
    const upstreamUrl = `${apiBase}/transaction/burn-certificate`
    const upstream = await fetch(upstreamUrl, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    })

    const status = upstream.status
    const contentType = upstream.headers.get('content-type') || ''


    if (contentType.includes('application/json')) {
      const json = await upstream.json().catch(() => ({}))
      return NextResponse.json(json, { status })
    }

    // Resposta não-JSON
    const text = await upstream.text()
    return NextResponse.json(
      { error: 'Resposta não-JSON do backend', raw: text.slice(0, 400) },
      { status }
    )
  } catch (err) {
    return NextResponse.json(
      { error: 'Erro interno ao processar burn-certificate.' },
      { status: 500 }
    )
  }
}
