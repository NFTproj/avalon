// src/app/tokens/[id]/components/TokenTabs.tsx
'use client'

import { useContext, useEffect, useMemo, useState } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'

// UI subcomponents
import InfoTab from './ui/TokenTabs/InfoTab'
import TokenInfoTab from './ui/TokenTabs/TokenInfoTab'
// import MetricsTab from './ui/TokenTabs/MetricsTab' // ← (DESATIVADO por enquanto)
import DocumentsTab from './ui/TokenTabs/DocumentsTab'
import BenefitsTab from './ui/TokenTabs/BenefitsTab'

// Reusa o mesmo tipo do MetricsTab
// import type { Stats } from './ui/TokenTabs/MetricsTab' // ← (DESATIVADO por enquanto)

export type TokenTabsProps = {
  token: any
  cbd: { tokenNetwork?: string; tokenAddress?: string }
  explorerHost: string // 'polygonscan' | 'etherscan'
  tokenDetails?: any
  // ===== MÉTRICAS (desativado por enquanto) =====
  // stats: Stats
  // metricsLoading: boolean
  // metricsError: string | null
  // refreshMetrics: () => void
}

export default function TokenTabs({
  token,
  cbd,
  explorerHost,
  tokenDetails,
  // ===== MÉTRICAS (desativado por enquanto) =====
  // stats,
  // metricsLoading,
  // metricsError,
  // refreshMetrics,
}: TokenTabsProps) {
  const { colors } = useContext(ConfigContext)

  // há algum field2..field7 no metadata?
  const hasTokenInfoMeta = useMemo(() => {
    const arr = Array.isArray(token?.metadata) ? token.metadata : []
    if (!arr.length) return false
    const fields = new Set(arr.map((m: any) => m?.field))
    const keys = ['field2','field3','field4','field5','field6','field7']
    return keys.some(k => fields.has(k))
  }, [token])

  // existe CTA de benefícios no locale?
  const hasBenefitsCta = useMemo(() => {
    const cta = tokenDetails?.tabs?.benefits?.cta
    return Boolean(cta?.type || cta?.href) // se tiver tipo ou href explícito, mostra a aba
  }, [tokenDetails])

  // tabs visíveis
  const tabs = useMemo(() => {
    return [
      { key: 'info',      label: tokenDetails?.tabs?.infos?.title ?? 'Informações' },
      ...(hasTokenInfoMeta
        ? [{ key: 'tokenInfo', label: tokenDetails?.tabs?.['token-info']?.title ?? 'Detalhes do Token' }]
        : []),
      // { key: 'metrics',   label: 'Métricas' }, // ← (DESATIVADO por enquanto)
      { key: 'documents', label: tokenDetails?.tabs?.docs?.title ?? 'Documentos' },
      ...(hasBenefitsCta
        ? [{ key: 'benefits',  label: tokenDetails?.tabs?.benefits?.title ?? 'Benefícios' }]
        : []),
    ] as const
  }, [hasTokenInfoMeta, hasBenefitsCta, tokenDetails])

  // estado da aba
  const [tab, setTab] = useState<string>('info')

  // corrige seleção quando alguma aba deixa de existir
  useEffect(() => {
    if (tab === 'tokenInfo' && !hasTokenInfoMeta) setTab('info')
    if (tab === 'benefits'  && !hasBenefitsCta)  setTab('info')
  }, [tab, hasTokenInfoMeta, hasBenefitsCta])

  return (
    <div>
      {/* Nav das abas */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="px-4 py-2 -mb-px font-medium whitespace-nowrap"
            style={{
              borderBottom: tab === key ? `2px solid ${colors?.colors['color-primary']}` : 'none',
              color: tab === key ? colors?.colors['color-primary'] : colors?.colors['color-tertiary'],
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Conteúdo das abas */}
      <div className="mt-6 space-y-6">
        {tab === 'info' && (
          <InfoTab
            token={token}
            cbd={cbd}
            explorerHost={explorerHost}
            tokenDetails={tokenDetails}
          />
        )}

        {hasTokenInfoMeta && tab === 'tokenInfo' && <TokenInfoTab token={token} />}

        {/* ===== MÉTRICAS (desativado por enquanto) =====
        {tab === 'metrics' && (
          <MetricsTab
            stats={stats}
            loading={metricsLoading}
            error={metricsError}
            onRefresh={refreshMetrics}
          />
        )}
        */}

        {tab === 'documents' && <DocumentsTab token={token} tokenDetails={tokenDetails} />}

        {hasBenefitsCta && tab === 'benefits' && (
         <BenefitsTab tokenId={token?.id} tokenDetails={tokenDetails} />
        )}
      </div>
    </div>
  )
}
