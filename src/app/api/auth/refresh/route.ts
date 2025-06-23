import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const apiUrl   = process.env.BLOXIFY_URL_BASE
  const apiKey   = process.env.BLOXIFY_API_KEY
  const clientId = process.env.CLIENT_ID

  if (!apiUrl || !apiKey || !clientId) {
    return NextResponse.json({ error: 'Variáveis de ambiente ausentes' }, { status: 500 })
  }

  const refreshToken = req.cookies.get('refreshToken')?.value
  if (!refreshToken) {
    return NextResponse.json({ error: 'Refresh ausente' }, { status: 401 })
  }

  const payload = { refreshToken, clientId }

  const r = await fetch(`${apiUrl}/auth/refresh-token`, {
    method : 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key'   : apiKey,
    },
    body: JSON.stringify(payload),
  })

  const data = await r.json()
  if (!r.ok || !data.accessToken) {
    return NextResponse.json(data, { status: r.status })
  }

  const res = NextResponse.json({ success: true }, { status: 200 })

  res.cookies.set({
    name     : 'accessToken',
    value    : data.accessToken,
    httpOnly : true,
    secure   : process.env.NODE_ENV === 'production',
    sameSite : 'strict',
    path     : '/',
    maxAge   : 60 * 15, // 15 minutos
  })

  return res
}
