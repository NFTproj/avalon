// app/api/auth/metamask/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.BLOXIFY_API_KEY
    const apiUrl = process.env.BLOXIFY_URL_BASE
    const clientId = process.env.CLIENT_ID

    if (!apiKey || !apiUrl || !clientId) {
      return NextResponse.json(
        { error: 'Chaves de API não configuradas corretamente.' },
        { status: 500 }
      )
    }

    const { walletAddress, signature } = await req.json()
    if (!walletAddress || !signature) {
      return NextResponse.json(
        { error: 'walletAddress e signature são obrigatórios.' },
        { status: 400 }
      )
    }

    const payload = { walletAddress, signature, clientId }

    const response = await fetch(`${apiUrl}/auth/metamask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    // ✅ Agora setamos os cookies HttpOnly como no login tradicional
    const res = NextResponse.json({ success: true }, { status: 200 })

    res.cookies.set('accessToken', data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 15, // 15 minutos
    })

    res.cookies.set('refreshToken', data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    })

    return res
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao processar requisição no servidor.' },
      { status: 500 }
    )
  }
}
