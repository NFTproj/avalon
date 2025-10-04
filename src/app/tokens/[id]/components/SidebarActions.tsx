'use client'

import { useContext, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
import ProgressBar from '@/components/common/ProgressBar'
import { ConfigContext } from '@/contexts/ConfigContext'

type Props = {
  tokenInfo?: any
  formattedPrice: string
  sold: number
  total: number
  minInvestmentBRL?: string
  /** id do card/token para montar a rota de compra */
  tokenId: string | number
}

export default function SidebarActions({
  tokenInfo,
  formattedPrice,
  sold,
  total,
  minInvestmentBRL = 'R$ 100',
  tokenId,
}: Props) {
  const { colors } = useContext(ConfigContext)
  const router = useRouter()
  const [navigating, setNavigating] = useState(false)

  const handleBuy = useCallback(() => {
    if (navigating) return
    setNavigating(true)
    const base = (process.env.NEXT_PUBLIC_BUY_BASE_URL || '').replace(/\/$/, '')
    const path = `/buy-tokens?token=${encodeURIComponent(String(tokenId))}`
    const url = base ? `${base}${path}` : path
    router.push(url) // mesma aba
  }, [tokenId, navigating, router])

  return (
    <div className="w-full lg:w-80 xl:w-96">
      <div className="lg:sticky lg:top-24">
        <div
          className="rounded-xl shadow-lg p-6 flex flex-col gap-3"
          style={{
            backgroundColor: colors?.token['background'],
            border: '2px solid transparent',
            borderImage: `linear-gradient(90deg, ${colors?.border['border-primary']}, ${colors?.dashboard?.colors.highlight}) 1`,
          }}
        >
          <h3
            className="text-lg font-bold mb-4"
            style={{ color: colors?.colors['color-primary'] }}
          >
            {tokenInfo?.['sold']}
          </h3>

          <ProgressBar sold={sold} total={total} />

          <div className="flex justify-between items-center mt-4">
            <span className="text-sm font-medium" style={{ color: colors?.colors['color-tertiary'] }}>
              {tokenInfo?.['token-price']}
            </span>
            <span className="font-bold text-sm" style={{ color: colors?.colors['color-primary'] }}>
              {formattedPrice}
            </span>
          </div>

          <div className="flex justify-between items-center mt-2">
            <span className="text-sm font-medium" style={{ color: colors?.colors['color-tertiary'] }}>
              {tokenInfo?.['minimum-investment']}
            </span>
            <span className="font-bold text-sm" style={{ color: colors?.colors['color-primary'] }}>
              {minInvestmentBRL}
            </span>
          </div>

          <button
            type="button"
            onClick={handleBuy}
            disabled={navigating}
            className={`mt-4 w-full py-2 rounded-lg transition
                        ${navigating ? 'opacity-80' : 'hover:opacity-90 active:scale-[0.99]'}
                        `}
            style={{
              backgroundColor: colors?.colors['color-primary'],
              color: '#FFFFFF',
              cursor: navigating ? 'wait' : 'pointer',
            }}
            aria-busy={navigating}
          >
            {navigating ? (tokenInfo?.['processing'] ?? 'Processando...') : tokenInfo?.['buy']}
          </button>
        </div>

        <div className="flex justify-center gap-2 text-xs text-gray-500 mt-2">
          <div className="flex items-start gap-2 w-4/5">
            <AlertCircle className="w-6 h-6 flex-shrink-0 mt-1" />
            <span className="text-sm">{tokenInfo?.['disclaimer']}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
