import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const apiUrl = process.env.BLOXIFY_URL_BASE
    const clientId = process.env.CLIENT_ID

    if (!apiUrl || !clientId) {
      return NextResponse.json({ error: 'Configuração ausente (BLOXIFY_URL_BASE ou CLIENT_ID)' }, { status: 500 })
    }

    const { searchParams } = new URL(req.url)
    const pageRaw = searchParams.get('page') ?? '1'
    const limitRaw = searchParams.get('limit') ?? '20'

    const page = Math.max(1, Number.isFinite(+pageRaw) ? parseInt(pageRaw, 10) : 1)
    const limit = Math.max(1, Number.isFinite(+limitRaw) ? parseInt(limitRaw, 10) : 20)

    // monta a URL com clientId automático
    const url = `${apiUrl}/card?clientId=${encodeURIComponent(clientId)}&page=${page}&limit=${limit}`

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