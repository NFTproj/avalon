import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const apiUrl = process.env.BLOXIFY_URL_BASE
    const apiKey = process.env.BLOXIFY_API_KEY
    const clientId = process.env.CLIENT_ID
    const accessToken = req.cookies.get('accessToken')?.value

    if (!apiUrl || !apiKey || !clientId || !accessToken) {
      return NextResponse.json({ error: 'Configuração ou token ausente' }, { status: 500 })
    }

    const formData = await req.formData()

    if (!formData.has('clientId')) {
      formData.append('clientId', clientId)
    }

    const response = await fetch(`${apiUrl}/user/update-details`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Authorization': `Bearer ${accessToken}`,
        // Não colocar Content-Type manualmente com FormData
      },
      body: formData,
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (err) {
    console.error('[UPDATE DETAILS ERROR]', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
