// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log(body)

    const apiKey = process.env.BLOXIFY_API_KEY
    const apiUrl = process.env.BLOXIFY_URL_BASE
    const clientId     = process.env.CLIENT_ID                 
    const permissions  = process.env.CLIENT_PERMISSIONS    

    if (!apiKey || !apiUrl) {
      return NextResponse.json(
        { error: 'Chaves de API não configuradas corretamente.' },
        { status: 500 }
      )
    }

    const res = await fetch(`${apiUrl}/user/mpc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    console.error('[API ERROR] /auth/register:', error)
    return NextResponse.json(
      { error: 'Erro ao processar requisição no servidor.' },
      { status: 500 }
    )
  }

  
}
