'use client'

import React, { useContext, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { ConfigContext } from '@/contexts/ConfigContext'
import { useCards } from '@/lib/hooks/useCards'
import ProgressBar from '@/components/common/ProgressBar'
import LoadingOverlay from '@/components/common/LoadingOverlay'
import { AlertCircle } from 'lucide-react'
import TokenHeader, { UiToken } from './components/TokenHeader'
import HighlightsCard from './components/HighlightsCard'
import TokenTabs from './components/TokenTabs'

export default function TokenDetailsPage() {
  const { colors, texts } = useContext(ConfigContext)
  const router = useRouter()
  const { id } = useParams() as { id: string }

  // ====== BUSCA DE DADOS (useCards) ======
  const { cards, isLoading, error } = useCards()

  // Tipagens leves só pro que usamos aqui
  type Label = { name: string }
  type CardLike = {
    id?: string | number
    name?: string
    description?: string
    image?: string
    logoUrl?: string
    cardBackgroundUrl?: string
    status?: string
    ticker?: string
    tags?: string[]
    launchDate?: string
    tokenPrice?: string | number
    initialSupply?: string | number
    cardBlockchainData?: { tokenNetwork?: string; tokenAddress?: string }
    CardBlockchainData?: { tokenNetwork?: string; tokenAddress?: string }
    [k: string]: any
  }

  const token = useMemo<CardLike | null>(() => {
    const list = (cards ?? []) as CardLike[]
    return list.find(c => String(c?.id) === String(id)) ?? null
  }, [cards, id])

  // Labels derivadas de token.tags -> [{name}]
  const headerLabels: Label[] = useMemo(() => {
    const tags = token?.tags ?? []
    return tags.map((name) => ({ name }))
  }, [token])

  // Normaliza camelCase/PascalCase vinda da API
  const cbd = useMemo(
    () =>
      (token?.cardBlockchainData ?? token?.CardBlockchainData ?? {
        tokenNetwork: undefined,
        tokenAddress: undefined,
      }) as { tokenNetwork?: string; tokenAddress?: string },
    [token]
  )

  // Explorer (etherscan/polygonscan) a partir do network
  const explorerHost =
    cbd.tokenNetwork === 'matic' || cbd.tokenNetwork === 'polygon' ? 'polygonscan' : 'etherscan'

  const labelColorsPalette = ['#8B7355', '#00D4AA', '#4CAF50']

  // ====== Estados auxiliares mock (mantidos) ======
  const formattedPrice = '$ 15.00'
  const sold = 516820
  const total = 1000000

  const tokenDetails = texts?.['token-details']
  const tokenInfo = texts?.['token']

  const longDescription =
    typeof (token as any)?.longDescription === 'string'
      ? (token as any).longDescription
      : token?.description

  const socialLinks =
    (token as any)?.socialLinks as Record<string, string> | undefined

  const labelMap = {
    chave1: tokenDetails?.highlights?.['view-docs'] ?? 'Ver docs',
    chave2: tokenDetails?.highlights?.['more-info'] ?? 'Mais info',
  }

  // ====== Guards de carregamento/erro ======
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
        <main
          className="min-h-screen py-16 flex items-center justify-center"
          style={{ backgroundColor: colors?.background['background-primary'] }}
        >
          <div className="text-center">
            <p className="text-gray-600">Token não encontrado</p>
          </div>
        </main>
      </MainLayout>
    )
  }

  // ====== PROPS do HEADER ======
  const headerToken: UiToken = {
    name: token?.name ?? undefined,
    description: token?.description ?? undefined,
    image: token?.cardBackgroundUrl ?? undefined, // só o background
  }

  // ====== ABAS (passa o token cru) ======
  return (
    <MainLayout>
      <main
        className="min-h-screen py-16"
        style={{ backgroundColor: colors?.background['background-primary'] }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8">
          {/* Coluna principal - conteúdo */}
          <div className="flex-1 max-w-3xl space-y-12">
            {/* HEADER */}
            <TokenHeader
              token={headerToken}
              labels={headerLabels}
              labelColors={labelColorsPalette}
            />

            {/* Destaques */}
            <HighlightsCard
              title={tokenDetails?.highlights?.title}
              description={longDescription}
              socialLinks={socialLinks}
              labelMap={labelMap}
            />

            {/* ABAS – via componente (métricas mockadas/sem fetch) */}
            <TokenTabs
              token={token}
              cbd={cbd}
              explorerHost={explorerHost}
              tokenDetails={tokenDetails}
              // métricas desativadas
              //stats={null}
              //metricsLoading={false}
              //metricsError={null}
              //refreshMetrics={() => {}}
            />
          </div>

          {/* Coluna lateral */}
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
                <ProgressBar sold={516820} total={1000000} />
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
                    R$ 100
                  </span>
                </div>
                <button
                  className="mt-4 w-full py-2 rounded-lg"
                  style={{ backgroundColor: colors?.colors['color-primary'], color: '#FFFFFF' }}
                >
                  {tokenInfo?.['buy']}
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
        </div>
      </main>
    </MainLayout>
  )
}
