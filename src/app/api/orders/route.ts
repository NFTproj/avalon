// app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

// Enum do backend (status numérico)
const TRANSACTION_STATUSES = {
  PENDING: 100,
  PROCESSING: 200,
  COMPLETED: 300,
  FAILED: 400,
  CANCELLED: 500,
} as const

function pick<T>(arr: T[], i: number) {
  return arr[i % arr.length]
}

function mockItem(i: number) {
  const now = Date.now() - i * 36e5 // de 1 em 1h para trás
  const statusCycle = [
    TRANSACTION_STATUSES.PENDING,
    TRANSACTION_STATUSES.PROCESSING,
    TRANSACTION_STATUSES.COMPLETED,
    TRANSACTION_STATUSES.FAILED,
    TRANSACTION_STATUSES.CANCELLED,
  ]
  const networks = ['polygon', 'ethereum', 'base']

  return {
    id: crypto.randomUUID(),
    type: 'BUY',
    amount: ((548 + i * 23) / 100).toFixed(2), // string, como sua API
    status: pick(statusCycle, i),               // ⬅️ número
    txHash: '',
    toAddress: '',
    fromAddress: '',
    network: pick(networks, i),
    tokenAddress: '',
    clientId: crypto.randomUUID(),
    userId: crypto.randomUUID(),
    createdAt: new Date(now).toISOString(),
    updatedAt: new Date(now).toISOString(),
    completedAt: new Date(now + 6e4).toISOString(),
    // se você usa no front:
    tokenAmount: ((i % 3) + 1).toString(),
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page  = Math.max(1, Number(searchParams.get('page') || 1))
    const limit = Math.max(1, Math.min(100, Number(searchParams.get('limit') || 10)))
    const useMock = searchParams.get('mock') === '1' || process.env.NEXT_PUBLIC_MOCK_ORDERS === '1'

    if (useMock) {
      // ===== MOCK PAGINADO =====
      const total = 37
      const totalPages = Math.max(1, Math.ceil(total / limit))
      const start = (page - 1) * limit
      const end = Math.min(total, start + limit)
      const data = Array.from({ length: Math.max(0, end - start) }, (_, k) => mockItem(start + k))

      return NextResponse.json({
        data,
        pagination: { total, totalPages, currentPage: page, limit },
      })
    }

    // ===== INTEGRAÇÃO REAL (comentada por enquanto) =====
    /*
    const apiUrl = process.env.BLOXIFY_URL_BASE
    const apiKey = process.env.BLOXIFY_API_KEY
    const access = req.cookies.get('accessToken')?.value

    if (!apiUrl || !apiKey) return NextResponse.json({ error: 'Configuração ausente' }, { status: 500 })
    if (!access)           return NextResponse.json({ error: 'Access token ausente' }, { status: 401 })

    // backend usa /transactions (plural) ou /transaction (singular) — ajuste conforme ficar definido:
    const qs = searchParams.toString()
    const upstreamUrl = `${apiUrl.replace(/\/+$/, '')}/transactions${qs ? `?${qs}` : ''}`

    const upstream = await fetch(upstreamUrl, {
      method: 'GET',
      headers: { 'x-api-key': apiKey, authorization: `Bearer ${access}` },
      cache: 'no-store',
    })

    const status = upstream.status
    const ct = upstream.headers.get('content-type') || ''
    if (ct.includes('application/json')) {
      const json = await upstream.json().catch(() => ({}))
      return NextResponse.json(json, { status })
    }
    const raw = await upstream.text()
    return NextResponse.json({ error: 'Resposta não-JSON do backend', raw: raw.slice(0, 400) }, { status })
    */

    // Se chegou aqui sem mock e com a integração comentada:
    return NextResponse.json({ data: [], pagination: { total: 0, totalPages: 0, currentPage: page, limit } })
  } catch (err) {
    console.error('[orders] erro', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
