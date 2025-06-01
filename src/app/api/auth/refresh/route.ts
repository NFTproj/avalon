// app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  /* ---------- env ---------- */
  const apiUrl   = process.env.BLOXIFY_URL_BASE
  const apiKey   = process.env.BLOXIFY_API_KEY
  const clientId = process.env.CLIENT_ID

  if (!apiUrl || !apiKey || !clientId) {
    return NextResponse.json(
      { error: 'Variáveis de ambiente ausentes' },
      { status: 500 },
    )
  }

  /* ---------- refreshToken HttpOnly ---------- */
  const refreshToken = req.cookies.get('refreshToken')?.value
  if (!refreshToken) {
    return NextResponse.json({ error: 'Refresh ausente' }, { status: 401 })
  }

  /* ---------- payload que o backend exige ---------- */
  const payload = { refreshToken, clientId }

  const r = await fetch(`${apiUrl}/auth/refresh`, {
    method : 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key'   : apiKey as string,      // <- assertion
    },
    body: JSON.stringify(payload),
  })

  const data = await r.json()
  if (!r.ok) return NextResponse.json(data, { status: r.status })

  /* ---------- grava novo access cookie ---------- */
  const res = NextResponse.json({ success: true }, { status: 200 })
  res.cookies.set({
    name     : 'accessToken',
    value    : data.accessToken,
    httpOnly : true,
    secure   : process.env.NODE_ENV === 'production',
    sameSite : 'lax',
    path     : '/',
    maxAge   : 60 * 15,   // 15 min
  })
  return res
}
