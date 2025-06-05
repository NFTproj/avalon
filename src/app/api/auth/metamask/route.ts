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

    // ⚠️ clientId precisa estar aqui!
    const payload = {
      walletAddress,
      signature,
      clientId
    }

    const res = await fetch(`${apiUrl}/auth/metamask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    console.error('[API ERROR] /auth/metamask:', error)
    return NextResponse.json(
      { error: 'Erro ao processar requisição no servidor.' },
      { status: 500 }
    )
  }
}
