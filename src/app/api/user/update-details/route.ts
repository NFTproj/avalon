// app/api/user/update-details/route.ts
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const apiUrl = process.env.BLOXIFY_URL_BASE
    const apiKey = process.env.BLOXIFY_API_KEY
    const clientId = process.env.CLIENT_ID

    const access = req.cookies.get('accessToken')?.value

    if (!apiUrl || !apiKey) {
      return NextResponse.json({ error: 'Configuração do servidor ausente' }, { status: 500 })
    }
    if (!access) {
      return NextResponse.json({ error: 'Access token ausente' }, { status: 401 })
    }

    // 1) Leia o FormData da requisição do browser
    const inForm = await req.formData()

    // 2) Normalize e monte um NOVO FormData para enviar ao backend
    const outForm = new FormData()
    const get = (k: string) => inForm.get(k) as string | File | null
    const getStr = (k: string) => (inForm.get(k) as string | null) ?? ''
    const digits = (s: string) => s.replace(/\D/g, '')

    const type = getStr('type') as 'individual' | 'business'

    // Campos comuns
    if (clientId) outForm.append('clientId', clientId)
    outForm.append('type', type)
    outForm.append('name', getStr('name'))
    outForm.append('address', getStr('address'))
    outForm.append('city', getStr('city'))
    outForm.append('state', getStr('state'))
    outForm.append('country', getStr('country'))
    outForm.append('zipCode', digits(getStr('zipCode')))

    if (type === 'individual') {
      const cpf = getStr('cpf')
      if (cpf) outForm.append('cpf', digits(cpf))
      // garante que não cai arquivo por engano
      // (se vier do client, ignoramos)
    } else {
      const cnpj = getStr('cnpj')
      if (cnpj) outForm.append('cnpj', digits(cnpj))

      const contractFile = get('contractFile')
      if (contractFile instanceof File) {
        outForm.append('contractFile', contractFile, contractFile.name)
      }
      const proofOfAddressFile = get('proofOfAddressFile')
      if (proofOfAddressFile instanceof File) {
        outForm.append('proofOfAddressFile', proofOfAddressFile, proofOfAddressFile.name)
      }
    }

    // 3) Chame o backend – NÃO defina manualmente content-type!
    const url = `${apiUrl.replace(/\/+$/, '')}/user/update-details`
    const upstream = await fetch(url, {
      method: 'PUT',
      headers: {
        authorization: `Bearer ${access}`,
        'x-api-key': apiKey,
      },
      body: outForm,
      // redirect: 'manual' // opcional
      cache: 'no-store',
    })

    const ct = upstream.headers.get('content-type') || ''
    const status = upstream.status

    // Tenta passar o JSON de forma transparente
    if (ct.includes('application/json')) {
      const data = await upstream.json().catch(() => ({}))
      return NextResponse.json(data, { status })
    }

    // Se não for JSON, devolve texto para facilitar debug
    const txt = await upstream.text()
    return NextResponse.json(
      { error: 'Resposta do backend não é JSON', status },
      { status }
    )
    
  } catch (err) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
