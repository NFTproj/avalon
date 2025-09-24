'use client'
import * as React from 'react'
import { buyWithPix } from '@/lib/api/buytokens'
import type { PixPaymentData } from './types'

export function usePixFlow() {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [data, setData] = React.useState<PixPaymentData | null>(null)

  async function createPix(input: { cardId: string; tokenQuantity: number; buyerAddress: string }) {
    try {
      setLoading(true); setError(null)
      const resp = await buyWithPix(input)
      const pix: PixPaymentData = {
        paymentLink: resp.paymentLink,
        qrCodeImage: resp.qrCodeImage,
        brCode: resp.brCode,
        amountInBRL: resp.amountInBRL,
        tokenQuantity: resp.tokenQuantity,
        buyerAddress: resp.buyerAddress,
        sessionId: resp.sessionId,
      }
      setData(pix)
      return pix
    } catch (e:any) {
      const msg = e?.message || 'Falha ao gerar PIX'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, data, setData, createPix }
}
