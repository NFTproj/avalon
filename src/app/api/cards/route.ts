import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const apiUrl = process.env.BLOXIFY_URL_BASE
    const clientId = process.env.CLIENT_ID

    if (!apiUrl || !clientId) {
      return NextResponse.json({ error: 'Configuração ausente' }, { status: 500 })
    }

    // lê page e limit da query do front, com defaults
    const { searchParams } = new URL(req.url)
    const page = searchParams.get('page') ?? '1'
    const limit = searchParams.get('limit') ?? '20'

    const url = `${apiUrl}/card?clientId=${encodeURIComponent(clientId)}&page=${encodeURIComponent(page)}&limit=${encodeURIComponent(limit)}`

    const response = await fetch(url, { method: 'GET' })
    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[GET CARDS ERROR]', error)
    return NextResponse.json({ error: 'Erro ao buscar cards' }, { status: 500 })
  }
}
