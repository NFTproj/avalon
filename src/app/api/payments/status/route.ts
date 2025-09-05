import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const apiUrl = process.env.BLOXIFY_URL_BASE
    const apiKey = process.env.BLOXIFY_API_KEY
    const access = req.cookies.get('accessToken')?.value

    const { searchParams } = new URL(req.url)
    const identifier = searchParams.get('identifier') || ''

    if (!apiUrl || !apiKey) return NextResponse.json({ error: 'Configuração ausente' }, { status: 500 })
    if (!access)           return NextResponse.json({ error: 'Access token ausente' }, { status: 401 })
    if (!identifier)       return NextResponse.json({ error: 'identifier é obrigatório' }, { status: 400 })

    // >>> usa o endpoint do print
    const url = `${apiUrl.replace(/\/+$/, '')}/transaction/${encodeURIComponent(identifier)}`
    const upstream = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        authorization: `Bearer ${access}`,
      },
      cache: 'no-store',
    })

    const ct = upstream.headers.get('content-type') || ''
    const status = upstream.status

    if (ct.includes('application/json')) {
      const data = await upstream.json().catch(() => ({}))
      return NextResponse.json(data, { status })
    }
    const txt = await upstream.text()
    return NextResponse.json({ error: 'Resposta não-JSON do backend', status, raw: txt.slice(0, 400) }, { status })
  } catch (err) {
    console.error('[payments/status] erro', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
