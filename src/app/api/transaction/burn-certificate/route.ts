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

    const { clientId: clientIdFromBody, cardId, tokenAddress, amount, network } = body

    // Validações básicas
    if (!clientIdFromBody || !cardId || !tokenAddress || !amount) {
      return NextResponse.json(
        { error: 'Campos obrigatórios ausentes: clientId, cardId, tokenAddress, amount.' },
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

    console.log('[burn-certificate] Payload enviado ao backend:', JSON.stringify(payload, null, 2))

    // Chama o backend
    const upstreamUrl = `${apiBase}/transaction/burn-certificate`
    console.log('[burn-certificate] URL do backend:', upstreamUrl)
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

    console.log('[burn-certificate] Status do backend:', status)
    console.log('[burn-certificate] Content-Type:', contentType)

    if (contentType.includes('application/json')) {
      const json = await upstream.json().catch(() => ({}))
      console.log('[burn-certificate] Resposta JSON do backend:', JSON.stringify(json, null, 2))
      return NextResponse.json(json, { status })
    }

    // Resposta não-JSON
    const text = await upstream.text()
    console.log('[burn-certificate] Resposta não-JSON do backend:', text.slice(0, 400))
    return NextResponse.json(
      { error: 'Resposta não-JSON do backend', raw: text.slice(0, 400) },
      { status }
    )
  } catch (err) {
    console.error('[burn-certificate] erro', err)
    return NextResponse.json(
      { error: 'Erro interno ao processar burn-certificate.' },
      { status: 500 }
    )
  }
}
