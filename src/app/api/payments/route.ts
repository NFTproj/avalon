// src/app/api/payments/pix/route.ts
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

type InBody = { cardId?: string; tokenQuantity?: number; buyerAddress?: string; network?: string }
type CardResponse = { id: string; CardBlockchainData?: { tokenNetwork?: string; tokenChainId?: number } }

function normalizeNetwork(input?: string, chainId?: number): string | undefined {
  const v = (input || '').toLowerCase()
  if (v === 'matic' || v === 'polygon') return 'polygon'
  if (v === 'amoy') return 'amoy'
  if (v === 'sepolia') return 'sepolia'
  if (v === 'ethereum' || v === 'eth') return 'ethereum'
  if (chainId === 137) return 'polygon'
  if (chainId === 80002) return 'amoy'
  if (chainId === 11155111) return 'sepolia'
  return v || undefined
}

export async function POST(req: NextRequest) {
  try {
    const apiUrl   = process.env.BLOXIFY_URL_BASE
    const apiKey   = process.env.BLOXIFY_API_KEY
    const clientId = process.env.CLIENT_ID
    const access   = req.cookies.get('accessToken')?.value

    if (!apiUrl || !apiKey || !clientId) {
      return NextResponse.json({ error: 'Configuração do servidor ausente (BLOXIFY_URL_BASE / BLOXIFY_API_KEY / CLIENT_ID)' }, { status: 500 })
    }
    if (!access) return NextResponse.json({ error: 'Access token ausente' }, { status: 401 })

    const { cardId, tokenQuantity, buyerAddress: buyerFromBody, network }: InBody = await req.json()
    if (!cardId) return NextResponse.json({ error: 'cardId é obrigatório' }, { status: 400 })
    if (!buyerFromBody) return NextResponse.json({ error: 'buyerAddress é obrigatório' }, { status: 400 })

    const qty = Math.max(1, Math.floor(Number(tokenQuantity || 0)))
    if (!Number.isFinite(qty) || qty <= 0) {
      return NextResponse.json({ error: 'tokenQuantity inválido' }, { status: 400 })
    }

    // Inferir network se não vier
    let net = network
    if (!net) {
      try {
        const cardRes = await fetch(`${apiUrl}/cards/${cardId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            authorization: `Bearer ${access}`, // se /cards exigir auth
          },
          cache: 'no-store',
        })
        if (cardRes.ok) {
          const card: CardResponse = await cardRes.json()
          net = normalizeNetwork(card?.CardBlockchainData?.tokenNetwork, card?.CardBlockchainData?.tokenChainId) || net
        } else {
          console.warn('[PIX] Falha ao obter card p/ inferir network:', await cardRes.text())
        }
      } catch (e) {
        console.warn('[PIX] Erro ao consultar card:', e)
      }
    }
    if (!net) net = 'polygon'

    // Repassa para o backend usando a wallet DO PAYLOAD
    const upstreamRes = await fetch(`${apiUrl}/payment/pix`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        authorization: `Bearer ${access}`,
      },
      body: JSON.stringify({
        clientId,
        cardId,
        tokenQuantity: qty,
        buyerAddress: buyerFromBody,
        network: net,
      }),
    })

    const data = await upstreamRes.json().catch(() => ({}))
    if (!upstreamRes.ok) {
      return NextResponse.json(
        { error: data?.error || data?.message || 'Falha ao gerar PIX', details: data },
        { status: upstreamRes.status },
      )
    }
    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    console.error('[PIX route] erro inesperado', err)
    return NextResponse.json({ error: 'Erro interno ao gerar PIX' }, { status: 500 })
  }
}
