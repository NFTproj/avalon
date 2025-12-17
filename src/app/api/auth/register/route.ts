// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.BLOXIFY_API_KEY
    const apiUrl = process.env.BLOXIFY_URL_BASE
    const clientId = process.env.CLIENT_ID
    const permissions = process.env.CLIENT_PERMISSIONS

    if (!apiKey || !apiUrl) {
      return NextResponse.json(
        { error: 'Chaves de API não configuradas corretamente.' },
        { status: 500 },
      )
    }

    /* ---------- payload recebido do navegador ---------- */
    const { email, password } = await req.json() // LIDO UMA ÚNICA VEZ
    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-mail e senha são obrigatórios' },
        { status: 400 },
      )
    }

    /* ---------- validação de senha forte ---------- */
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        {
          error: 'A senha deve ter no mínimo 8 caracteres, incluindo letras maiúsculas, minúsculas, números e caracteres especiais'
        },
        { status: 400 },
      )
    }
    /* ---------- monta payload completo ---------- */
    const payload: Record<string, any> = { email, password, clientId }
    if (permissions) payload.permissions = permissions.split(',')

    const res = await fetch(`${apiUrl}/user/mpc`, {
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
    return NextResponse.json(
      { error: 'Erro ao processar requisição no servidor.' },
      { status: 500 },
    )
  }
}
