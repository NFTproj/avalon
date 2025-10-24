import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const apiUrl = process.env.BLOXIFY_URL_BASE
    const apiKey = process.env.BLOXIFY_API_KEY
    const clientId = process.env.CLIENT_ID

    const accessToken = req.cookies.get('accessToken')?.value

    if (!apiUrl || !apiKey || !clientId || !accessToken) {
      return NextResponse.json({ error: 'Configuração ou token ausente' }, { status: 500 })
    }

    const response = await fetch(`${apiUrl}/card?clientId=${clientId}`, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

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
