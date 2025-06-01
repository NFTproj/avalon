// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {          // ‹– receba o req
  const apiUrl = process.env.BLOXIFY_URL_BASE
  const apiKey = process.env.BLOXIFY_API_KEY

  /* 1 — lê o accessToken do cookie */
  const accessToken = req.cookies.get('accessToken')?.value
  if (!accessToken) {
    return NextResponse.json({ user: null }, { status: 200 })
  }

  /* 2 — chama o backend /user/me */
  const r = await fetch(`${apiUrl}/user/me`, {
    method : 'GET',
    headers: {
      Authorization : `Bearer ${accessToken}`,
      'x-api-key'   : apiKey as string,
      'Content-Type': 'application/json',
    },
  })

  if (!r.ok) return NextResponse.json({ user: null }, { status: r.status })

  const data = await r.json()            // backend → dados do usuário
  return NextResponse.json({ user: data }, { status: 200 })  // <- devolve
}
