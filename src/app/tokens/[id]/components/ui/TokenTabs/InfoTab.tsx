'use client'

import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { useContext, useMemo } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'
import {
  formatLaunchDateUTC,   // <<< usa a função nova
  shortAddr,
  formatUSD6,
  formatBRNumber,
  pick,
  getExplorerBaseUrl,
  toNum,
} from './format'

export type InfoTabProps = {
  token: any
  cbd: { tokenNetwork?: string; tokenAddress?: string }
  tokenDetails?: any
  /** opcional/legado; será ignorado quando a rede estiver presente */
  explorerHost?: string
}

function Field({ label, value }: { label: string; value: string | number }) {
  const { colors } = useContext(ConfigContext)
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium" style={{ color: colors?.colors['color-tertiary'] }}>
        {label}
      </span>
      <p className="font-semibold text-sm" style={{ color: colors?.colors['color-primary'] }}>
        {value}
      </p>
    </div>
  )
}

export default function InfoTab({ token, cbd, tokenDetails }: InfoTabProps) {
  const { colors } = useContext(ConfigContext)

  // === pega o bloco de blockchain em Pascal/camel
  const cbdObj = (token?.CardBlockchainData ?? token?.cardBlockchainData ?? {}) as Record<string, any>

  // === datas (UTC, sem timezone-shift)
  const launchDate = pick<string>(token, [
    'launchDate',
    'card.launchDate',
    'details.launchDate',
    'launch_date',
  ])

  // === preço (micros) e supply: mesma regra da página de listagem
  const priceMicros = toNum(
    cbdObj.tokenPrice ??
      token.tokenPrice ??
      token.priceMicroUsd ??
      token.price_micro_usd ??
      token.unitPrice ??
      token.price
  )

  const initialSupply = toNum(
    cbdObj.initialSupply ??
      token.initialSupply ??
      token.supply ??
      token.totalSupply ??
      token.initial_supply
  )

  const ticker = pick<string>(token, ['ticker', 'symbol']) || 'N/A'

  // >>> data igual à listagem
  const offerOpening = formatLaunchDateUTC(launchDate, 'pt-BR')
  const unitValue = formatUSD6(priceMicros)          // ex.: 1_000_000 -> $ 1.00
  const tonsOffered = formatBRNumber(initialSupply)  // ex.: 100000000 -> 100.000.000
  const addrShort = shortAddr(cbd?.tokenAddress)

  const explorerUrl = useMemo(() => {
    if (!cbd?.tokenAddress) return undefined
    const base = getExplorerBaseUrl(cbd?.tokenNetwork) // polygon → polygonscan.com
    return `${base}/token/${cbd.tokenAddress}`
  }, [cbd?.tokenNetwork, cbd?.tokenAddress])

  return (
    <section className="grid grid-cols-1 gap-6">
      <div
        className="rounded-xl shadow-lg border p-6"
        style={{
          backgroundColor: colors?.token['background'],
          borderColor: colors?.token['border'],
          borderWidth: '1px',
        }}
      >
        <h2
          className="text-2xl font-semibold mb-6"
          style={{ color: colors?.colors['color-primary'] }}
        >
          {tokenDetails?.tabs?.infos?.title ?? 'Informações'}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          <Field
            label={tokenDetails?.tabs?.infos?.['offer-opening'] ?? 'Abertura da oferta'}
            value={offerOpening}
          />
          <Field
            label={tokenDetails?.tabs?.infos?.['identifier-code'] ?? 'Código ISIN'}
            value={ticker}
          />

          {/* Endereço + copiar */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium" style={{ color: colors?.colors['color-tertiary'] }}>
              {tokenDetails?.tabs?.infos?.['token-address'] || 'Endereço do Token'}
            </span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm font-mono" style={{ color: colors?.colors['color-primary'] }}>
                {addrShort}
              </span>
              {cbd?.tokenAddress && (
                <button
                  onClick={() => navigator.clipboard.writeText(cbd.tokenAddress!)}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Copiar endereço"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <Field
            label={tokenDetails?.tabs?.infos?.['unit-value'] ?? 'Valor unitário'}
            value={unitValue}
          />
          <Field
            label={tokenDetails?.tabs?.infos?.['tons-offered'] ?? 'Toneladas em oferta'}
            value={tonsOffered}
          />

          {/* Explorer */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium" style={{ color: colors?.colors['color-tertiary'] }}>
              {tokenDetails?.tabs?.infos?.['blockchain-link'] || 'Link da blockchain'}
            </span>
            {explorerUrl ? (
              <Link
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm font-medium hover:opacity-80"
                style={{ color: colors?.colors['color-primary'] }}
              >
                Ver no Explorer
                <ExternalLink className="w-3 h-3" />
              </Link>
            ) : (
              <span className="text-sm text-gray-500">N/A</span>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
