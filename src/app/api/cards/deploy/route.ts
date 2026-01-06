import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const apiUrl = process.env.BLOXIFY_URL_BASE
    const apiKey = process.env.BLOXIFY_API_KEY
    const clientId = process.env.CLIENT_ID

    if (!apiUrl || !apiKey || !clientId) {
      return NextResponse.json(
        {
          error:
            'Configuração ausente (BLOXIFY_URL_BASE, BLOXIFY_API_KEY ou CLIENT_ID)',
        },
        { status: 500 },
      )
    }

    // Obter accessToken do cookie
    const accessToken = req.cookies.get('accessToken')?.value

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Token de autenticação ausente. Faça login novamente.' },
        { status: 401 },
      )
    }

    // Obter body do request
    const body = await req.json()

    // Validar campos obrigatórios
    if (
      !body.cardId ||
      !body.tokenName ||
      !body.tokenSymbol ||
      !body.initialSupply ||
      !body.network
    ) {
      return NextResponse.json(
        {
          error:
            'Campos obrigatórios ausentes (cardId, tokenName, tokenSymbol, initialSupply, network)',
        },
        { status: 400 },
      )
    }

    // Adicionar clientId automaticamente ao body
    const payload = {
      ...body,
      clientId,
    }

    // Fazer a chamada para a API externa do Bloxify
    const url = `${apiUrl}/token/deploy`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            data?.message || data?.error || 'Erro ao fazer deploy do token',
        },
        { status: response.status },
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    console.error('Erro ao fazer deploy do token:', error)
    return NextResponse.json(
      { error: error?.message || 'Erro ao fazer deploy do token' },
      { status: 500 },
    )
  }
}

