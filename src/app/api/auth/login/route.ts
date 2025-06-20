// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    const apiUrl = process.env.BLOXIFY_URL_BASE
    const apiKey = process.env.BLOXIFY_API_KEY
    const clientId = process.env.CLIENT_ID 

    if (!apiUrl || !apiKey) {
      return NextResponse.json({ error: 'Configuração inválida' }, { status: 500 })
    }

    const payload = { email, password, clientId }

    const response = await fetch(`${apiUrl}/auth/login`, {
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

    const res = NextResponse.json({ success: true }, { status: 200 })

    res.cookies.set('accessToken', data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      
    })

    res.cookies.set('refreshToken', data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
     
    })

    return res
  } catch (error) {
    console.error('[LOGIN API ERROR]', error)
    return NextResponse.json({ error: 'Erro no servidor de login' }, { status: 500 })
  }
}
