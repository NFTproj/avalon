import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.BLOXIFY_API_KEY
    const apiUrl = process.env.BLOXIFY_URL_BASE
    const clientId    = process.env.CLIENT_ID  

    if (!apiUrl || !apiKey || !clientId) {
      return NextResponse.json(
        { error: 'Chaves não configuradas' },
        { status: 500 },
      )
    }

    /* ---------- payload recebido do navegador ---------- */
    const { email } = await req.json()
    if (!email) {
      return NextResponse.json(
        { error: 'E-mail é obrigatório' },
        { status: 400 },
      )
    }

      /* ---------- monta o payload completo p/ backend ---------- */
     const payload = { email, clientId }

    const res = await fetch(`${apiUrl}/auth/code/resend`, {
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
    return NextResponse.json({ error: 'Erro ao reenviar código' }, { status: 500 })
  }
}
