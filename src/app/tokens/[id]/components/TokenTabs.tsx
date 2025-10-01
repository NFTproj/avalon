'use client'

import { useContext, useState } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'

// UI subcomponents (você já criou)
import InfoTab from './ui/TokenTabs/InfoTab'
import TokenInfoTab from './ui/TokenTabs/TokenInfoTab'
import MetricsTab from './ui/TokenTabs/MetricsTab'
import DocumentsTab from './ui/TokenTabs/DocumentsTab'
import BenefitsTab from './ui/TokenTabs/BenefitsTab'

// Reusa o mesmo tipo do MetricsTab pra evitar divergência
import type { Stats } from './ui/TokenTabs/MetricsTab'

export type TokenTabsProps = {
  token: any
  cbd: { tokenNetwork?: string; tokenAddress?: string }
  explorerHost: string // 'polygonscan' | 'etherscan'
  tokenDetails?: any
  stats: Stats
  metricsLoading: boolean
  metricsError: string | null
  refreshMetrics: () => void
}

export default function TokenTabs({
  token,
  cbd,
  explorerHost,
  tokenDetails,
  stats,
  metricsLoading,
  metricsError,
  refreshMetrics,
}: TokenTabsProps) {
  const { colors } = useContext(ConfigContext)
  const [tab, setTab] = useState<'info' | 'tokenInfo' | 'metrics' | 'documents' | 'benefits'>('info')

  const tabs = [
    { key: 'info',       label: tokenDetails?.tabs?.infos?.title ?? 'Informações' },
    { key: 'tokenInfo',  label: tokenDetails?.tabs?.['token-info']?.title ?? 'Detalhes do Token' },
    { key: 'metrics',    label: 'Métricas' },
    { key: 'documents',  label: tokenDetails?.tabs?.docs?.title ?? 'Documentos' },
    { key: 'benefits',   label: tokenDetails?.tabs?.benefits?.title ?? 'Benefícios' },
  ] as const

  return (
    <div>
      {/* Nav das abas */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key as any)}
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

        {tab === 'tokenInfo' && <TokenInfoTab />}

        {tab === 'metrics' && (
          <MetricsTab
            stats={stats}
            loading={metricsLoading}
            error={metricsError}
            onRefresh={refreshMetrics}
          />
        )}

        {tab === 'documents' && <DocumentsTab tokenDetails={tokenDetails} />}

        {tab === 'benefits' && <BenefitsTab tokenDetails={tokenDetails} />}
      </div>
    </div>
  )
}
