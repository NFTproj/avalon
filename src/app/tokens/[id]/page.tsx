// src/app/tokens/[id]/page.tsx
'use client'

import React, { useContext, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { ConfigContext } from '@/contexts/ConfigContext'
import { useCards } from '@/lib/hooks/useCards'
import LoadingOverlay from '@/components/common/LoadingOverlay'
import { AlertCircle } from 'lucide-react'
import TokenHeader, { UiToken } from './components/TokenHeader'
import HighlightsCard from './components/HighlightsCard'
import TokenTabs from './components/TokenTabs'
import SidebarActions from './components/SidebarActions'

// ✅ importa os mesmos helpers que você já usa nos outros componentes
import { toNum, formatUSD6 } from './components/ui/TokenTabs/format'

export default function TokenDetailsPage() {
  const { colors, texts } = useContext(ConfigContext)
  const router = useRouter()
  const { id } = useParams() as { id: string }

  const { cards, isLoading, error } = useCards()

  type Label = { name: string }
  type CardLike = any

  const token = useMemo<CardLike | null>(() => {
    const list = (cards ?? []) as CardLike[]
    return list.find(c => String(c?.id) === String(id)) ?? null
  }, [cards, id])

  const headerLabels: Label[] = useMemo(() => {
    const tags = token?.tags ?? []
    return tags.map((name: string) => ({ name }))
  }, [token])

  // ===== Blockchain data normalizado (Pascal/camel) =====
  const cbd = useMemo(
    () => (token?.cardBlockchainData ?? token?.CardBlockchainData ?? {}) as Record<string, any>,
    [token]
  )

  // ===== Calcula os números como na listagem =====
  const initialSupply     = toNum(cbd.initialSupply ?? token?.initialSupply ?? token?.totalSupply)
  const purchasedQuantity = toNum(cbd.purchasedQuantity ?? token?.purchasedQuantity)
  const tokenPriceMicros  = toNum(cbd.tokenPrice ?? token?.tokenPrice ?? token?.priceMicroUsd)

  const sold  = purchasedQuantity
  const total = initialSupply
  const formattedPrice = formatUSD6(tokenPriceMicros) // "$ 1.00", etc.

  const tokenDetails = texts?.['token-details']
  const tokenInfo    = texts?.['token']

  const longDescription =
    typeof token?.longDescription === 'string'
      ? token.longDescription
      : token?.description

  // ===== Explorer host (se ainda precisar passar) =====
  const explorerHost =
    cbd.tokenNetwork === 'matic' || cbd.tokenNetwork === 'polygon' ? 'polygonscan' : 'etherscan'

  // ===== Comprar no MESMO TAB =====
  const buyHref = `http://localhost:3005/buy-tokens?token=${encodeURIComponent(String(token?.id ?? ''))}`
  const handleBuy = () => router.push(buyHref)

  if (isLoading) return <LoadingOverlay />

  if (error) {
    return (
      <MainLayout>
        <main
          className="min-h-screen py-16 flex items-center justify-center"
          style={{ backgroundColor: colors?.background['background-primary'] }}
        >
          <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>

            <h2 className="text-xl font-semibold mb-2 text-gray-800">Erro ao Carregar Token</h2>
            <p className="text-gray-600 mb-4">{String(error)}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.back()}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Voltar
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        </main>
      </MainLayout>
    )
  }

  if (!token) {
    return (
      <MainLayout>
        <main className="min-h-screen py-16 flex items-center justify-center"
              style={{ backgroundColor: colors?.background['background-primary'] }}>
          <div className="text-center">
            <p className="text-gray-600">Token não encontrado</p>
          </div>
        </main>
      </MainLayout>
    )
  }

  const headerToken: UiToken = {
    name: token?.name ?? undefined,
    description: token?.description ?? undefined,
    image: token?.cardBackgroundUrl ?? undefined,
  }

  const labelColorsPalette = ['#8B7355', '#00D4AA', '#4CAF50']

  return (
    <MainLayout>
      <main
        className="min-h-screen py-16"
        style={{ backgroundColor: colors?.background['background-primary'] }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8">
          {/* Coluna principal */}
          <div className="flex-1 max-w-3xl space-y-12">
            <TokenHeader token={headerToken} labels={headerLabels} labelColors={labelColorsPalette} />

            <HighlightsCard
              title={tokenDetails?.highlights?.title}
              description={longDescription}
              socialLinks={token?.socialLinks}
            />

            <TokenTabs
              token={token}
              cbd={cbd as any}
              explorerHost={explorerHost}
              tokenDetails={tokenDetails}
            />
          </div>

          {/* Sidebar: agora com dados REAIS e onBuy no MESMO TAB */}
         <SidebarActions
          tokenInfo={tokenInfo}
          formattedPrice={formattedPrice}
          sold={purchasedQuantity}
          total={initialSupply}
          tokenId={token.id}
        />
        </div>
      </main>
    </MainLayout>
  )
}
