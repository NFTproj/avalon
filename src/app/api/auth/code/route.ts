import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const apiKey = process.env.BLOXIFY_API_KEY
    const apiUrl = process.env.BLOXIFY_URL_BASE

    if (!apiKey || !apiUrl) {
      return NextResponse.json({ error: 'Chaves não configuradas' }, { status: 500 })
    }

    const res = await fetch(`${apiUrl}/auth/code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    console.error('[API ERROR] /auth/code:', err)
    return NextResponse.json({ error: 'Erro ao verificar código' }, { status: 500 })
  }
}
