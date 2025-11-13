// app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const page   = searchParams.get('page')  || '1'
    const limit  = searchParams.get('limit') || '10'
    const userId = searchParams.get('userId') || '' // opcional, quando vier repassamos

    const apiBase = (process.env.BLOXIFY_URL_BASE || '').replace(/\/+$/, '')
    const apiKey  = process.env.BLOXIFY_API_KEY
    const access  = req.cookies.get('accessToken')?.value

    if (!apiBase || !apiKey) {
      return NextResponse.json({ error: 'Configuração ausente (BLOXIFY_URL_BASE/BLOXIFY_API_KEY).' }, { status: 500 })
    }
    if (!access) {
      return NextResponse.json({ error: 'Access token ausente.' }, { status: 401 })
    }

    // igual ao Postman: /transaction?page=...&limit=...&userId=...
    const upstreamUrl =
      `${apiBase}/transaction?page=${encodeURIComponent(page)}` +
      `&limit=${encodeURIComponent(limit)}` +
      (userId ? `&userId=${encodeURIComponent(userId)}` : '')

    const upstream = await fetch(upstreamUrl, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        authorization: `Bearer ${access}`,
      },
      cache: 'no-store',
    })

    const status = upstream.status
    const ct = upstream.headers.get('content-type') || ''

    if (ct.includes('application/json')) {
      const json = await upstream.json().catch(() => ({}))

      // Normaliza: se vier "transactions", devolvemos em "data" + paginação
      const list =
        Array.isArray(json?.transactions) ? json.transactions :
        Array.isArray(json?.data) ? json.data :
        []

      const pagination =
        json?.pagination ?? {
          currentPage: Number(page),
          limit: Number(limit),
          total: Number(json?.total ?? list.length),
          totalPages: Math.max(1, Math.ceil(Number(json?.total ?? list.length) / Number(limit))),
        }

      return NextResponse.json({ data: list, pagination }, { status })
    }

    const raw = await upstream.text()
    return NextResponse.json(
      { error: 'Resposta não-JSON do backend', raw: raw.slice(0, 400) },
      { status }
    )
  } catch (err) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
