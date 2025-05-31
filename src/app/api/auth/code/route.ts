import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    //const body = await req.json()
    const apiKey = process.env.BLOXIFY_API_KEY
    const apiUrl = process.env.BLOXIFY_URL_BASE
    const clientId     = process.env.CLIENT_ID          

    if (!apiKey || !apiUrl) {
      return NextResponse.json({ error: 'Chaves não configuradas' }, { status: 500 })
    }

    /* ---------- payload recebido do navegador ---------- */
    const { email, otp_code} = await req.json()               // LIDO UMA ÚNICA VEZ
    if (!email || !otp_code ) {
      return NextResponse.json(
        { error: 'E-mail e código são obrigatórios' },
        { status: 400 },
      )
    }

    /* ---------- monta payload completo ---------- */
    const payload: Record<string, any> = { email, clientId, otp_code }

    const res = await fetch(`${apiUrl}/auth/code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    console.error('[API ERROR] /auth/code:', err)
    return NextResponse.json({ error: 'Erro ao verificar código' }, { status: 500 })
  }
}
