import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'


export async function POST() {
  try {
    const cookieStore = await Promise.resolve(cookies())
    const refreshToken = cookieStore.get('refreshToken')?.value

    if (!refreshToken) {
      return NextResponse.json({ error: 'Refresh token ausente' }, { status: 401 })
    }

    const apiKey = process.env.BLOXIFY_API_KEY
    const apiUrl = process.env.BLOXIFY_URL_BASE

    const response = await fetch(`${apiUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey!,
      },
      body: JSON.stringify({ refreshToken }),
    })

    const data = await response.json()
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    const res = new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

    res.cookies.set('accessToken', data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 15,
    })

    res.cookies.set('refreshToken', data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    return res
  } catch (err) {
    return NextResponse.json({ error: 'Erro ao renovar token' }, { status: 500 })
  }
}
