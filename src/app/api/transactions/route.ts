import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

/**
 * GET /api/transactions
 * 
 * Busca transações do backend Bloxify (endpoint: /transaction)
 * Query params opcionais:
 * - cardId: filtrar por card específico
 * - page: número da página (default: 1)
 * - limit: itens por página (default: 10)
 * - transactionType: filtrar por tipo (500 = burn/certificado)
 */
export async function GET(req: NextRequest) {
  try {
    const apiBase = (process.env.BLOXIFY_URL_BASE || '').replace(/\/+$/, '')
    const apiKey = process.env.BLOXIFY_API_KEY
    const accessToken = req.cookies.get('accessToken')?.value

    if (!apiBase || !apiKey) {
      return NextResponse.json(
        { error: 'Configuração ausente (BLOXIFY_URL_BASE/BLOXIFY_API_KEY).' },
        { status: 500 }
      )
    }

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token ausente.' },
        { status: 401 }
      )
    }

    // Pega query params
    const { searchParams } = new URL(req.url)
    const cardId = searchParams.get('cardId')
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '10'
    const transactionType = searchParams.get('transactionType') || '500' // 500 = burn/certificado

    // Monta URL com query params
    const queryString = new URLSearchParams({
      page,
      limit,
      transactionType,
      ...(cardId && { cardId }),
    }).toString()

    const upstreamUrl = `${apiBase}/transaction?${queryString}`

    const upstream = await fetch(upstreamUrl, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
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
      { error: 'Erro interno ao buscar transações.' },
      { status: 500 }
    )
  }
}
