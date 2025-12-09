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

    // Obter FormData do request
    const formData = await req.formData()

    // Adicionar clientId automaticamente ao FormData
    formData.append('clientId', clientId)

    // Fazer a chamada para a API externa do Bloxify
    const url = `${apiUrl}/card`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'client-id': clientId,
        Authorization: `Bearer ${accessToken}`,
        // NÃO definir Content-Type - deixar o fetch definir automaticamente com boundary para FormData
      },
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.message || data?.error || 'Erro ao criar token' },
        { status: response.status },
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    console.error('Erro ao criar token:', error)
    return NextResponse.json(
      { error: error?.message || 'Erro ao criar token' },
      { status: 500 },
    )
  }
}
