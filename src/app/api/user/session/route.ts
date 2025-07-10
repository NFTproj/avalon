import { NextRequest, NextResponse } from 'next/server'
import { getClientToken }            from './getDiditToken'
import { VERIFICATION_BASE_URL }     from '@/lib/didit/Auth-didt'

export async function POST (req: NextRequest) {
  try {
    const { vendor_data, callback, features } = await req.json()

    if (!vendor_data || !callback) {
      return NextResponse.json(
        { error: 'callback e vendor_data são obrigatórios' },
        { status: 400 },
      )
    }

    const diditToken = await getClientToken()

    const diditRes = await fetch(`${VERIFICATION_BASE_URL}/v1/session/`, {
      method : 'POST',
      headers: {
        Authorization : `Bearer ${diditToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ vendor_data, callback, features }),
    })

    if (!diditRes.ok) {
      const txt = await diditRes.text()
      console.error('[Didit] erro ▶︎', txt)
      return NextResponse.json({ error: txt }, { status: diditRes.status })
    }

    const data = await diditRes.json()            // { session_id, url, … }
    return NextResponse.json(data)

  } catch (e) {
    console.error('[KYC SESSION ERROR]', e)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
