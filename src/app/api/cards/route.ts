import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/cards - Lista todos os cards
 */
export async function GET(req: NextRequest) {
  try {
    const apiUrl = process.env.BLOXIFY_URL_BASE
    const clientId = process.env.CLIENT_ID

    if (!apiUrl || !clientId) {
      return NextResponse.json(
        { error: 'Configuração ausente (BLOXIFY_URL_BASE ou CLIENT_ID)' },
        { status: 500 },
      )
    }

    const { searchParams } = new URL(req.url)
    const pageRaw = searchParams.get('page') ?? '1'
    const limitRaw = searchParams.get('limit') ?? '20'

    const page = Math.max(
      1,
      Number.isFinite(+pageRaw) ? parseInt(pageRaw, 10) : 1,
    )
    const limit = Math.max(
      1,
      Number.isFinite(+limitRaw) ? parseInt(limitRaw, 10) : 20,
    )

    // monta a URL com clientId automático
    const url = `${apiUrl}/card?clientId=${encodeURIComponent(clientId)}&page=${page}&limit=${limit}`

    const response = await fetch(url, { method: 'GET' })
    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar cards' }, { status: 500 })
  }
}

/**
 * POST /api/cards - Cria um novo card
 */
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
        { error: data?.message || data?.error || 'Erro ao criar card' },
        { status: response.status },
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    console.error('Erro ao criar card:', error)
    return NextResponse.json(
      { error: error?.message || 'Erro ao criar card' },
      { status: 500 },
    )
  }
}
