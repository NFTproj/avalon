'use client'

import { useContext, useMemo, useState } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'
import MainLayout from '@/components/layout/MainLayout'
import Token from '@/components/common/Token'
import { useCards } from '@/lib/hooks/useCards'

const toNum = (v: any): number => {
  if (v === null || v === undefined) return 0
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0
  const s = String(v).replace(/[.,](?=\d{3}\b)/g, '').replace(',', '.')
  const n = Number(s)
  return Number.isFinite(n) ? n : 0
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-lg h-full animate-pulse">
      <div className="h-28 w-full rounded-lg bg-gray-200 mb-4" />
      <div className="h-5 w-2/3 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-1/2 bg-gray-200 rounded mb-4" />
      <div className="flex gap-2 mb-4">
        <div className="h-6 w-16 rounded-full bg-gray-200" />
        <div className="h-6 w-20 rounded-full bg-gray-200" />
        <div className="h-6 w-14 rounded-full bg-gray-200" />
      </div>
      <div className="h-4 w-3/4 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-1/2 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-2/3 bg-gray-200 rounded mb-4" />
      <div className="h-3 w-full bg-gray-200 rounded" />
    </div>
  )
}

export default function TokensPage() {
  const { colors, texts } = useContext(ConfigContext)
  const [filter, setFilter] = useState<'all' | 'available'>('all')
  const tokensPage = texts?.['tokensPage']

  const { cards, isLoading, error } = useCards()

  // ====== map Card -> Token props (exatamente como você pediu) ======
  const tokens = useMemo(() => {
    if (!cards) return []
    return cards
      // opcional: esconda cards cancelados (status '500')
      .filter((c: any) => String(c?.status ?? '100') !== '500')
      .map((c: any) => {
        const cbd = c?.CardBlockchainData ?? {}
        const depositedSupply = toNum(cbd.depositedSupply)         // deposited supply
        const purchasedQuantity    = toNum(cbd.purchasedQuantity)       // sold
        const available = Math.max(0, depositedSupply - purchasedQuantity)
        const tokenPriceMicros     = toNum(cbd.tokenPrice)              // "1000000"
        const price                = tokenPriceMicros / 1_000_000       // ex.: 1.0
        return {
          id: c.id,
          name: c.name ?? 'TOKEN',
          subtitle: '',                                 // aguardando backend retornar
          labels: (c.tags ?? []).map((name: string) => ({ name })),
          price: String(price),                         // TokenCard espera string
          launchDate: c.launchDate ?? '',               // ISO string
          tokensAvailable: String(depositedSupply),     // ← tokens depositados
          identifierCode: c.ticker ?? '',               // ticker
          image: c.logoUrl ?? '/images/tokens/default.png', // logo real
          sold: purchasedQuantity,                      // vendidos
          total: depositedSupply,                       // total depositado (para barra)
          // (se seu <Token/> também mostra “Disponíveis”, ele calcula via total - sold)
          available,                                    // só se você usar no componente
        }
      })
  }, [cards])

  const tokensToShow =
    filter === 'available'
      ? tokens.filter(t => (t.total - t.sold) > 0)
      : tokens

  function splitGradient(text: string): Array<{ text: string; gradient: boolean }> {
  const out: Array<{ text: string; gradient: boolean }> = []
  if (!text) return out
  const parts = text.split(/(\[\[.*?\]\])/g) // mantém os marcadores no array
  for (const p of parts) {
    if (!p) continue
    const m = p.match(/^\[\[(.*?)\]\]$/)
    if (m) out.push({ text: m[1], gradient: true })
    else out.push({ text: p, gradient: false })
  }
  return out
}

const rawTitle = tokensPage?.title ?? ''
const titleParts = splitGradient(rawTitle)
  return (
    <MainLayout>
      <main
        className="min-h-screen py-16"
        style={{ backgroundColor: colors?.background['background-primary'] }}
      >
        <div className="max-w-6xl mx-auto text-center mb-12">
          <h1
            className="
              text-balance
              text-4xl sm:text-5xl lg:text-6xl
              font-extrabold leading-tight tracking-[-0.015em] mb-4
            "
            style={{ color: colors?.colors['color-primary'] }}
          >
            {titleParts.map((part, i) =>
              part.gradient ? (
                <span
                  key={i}
                  className="
                    bg-gradient-to-r from-[#2a6cff] via-[#8a5cff] to-[#f21bd8]
                    bg-clip-text text-transparent
                  "
                >
                  {part.text}
                </span>
              ) : (
                <span key={i}>{part.text}</span>
              )
            )}
          </h1>
          <p
            className="text-xl sm:text-2xl lg:text-3xl px-0 lg:px-24"
            style={{ color: colors?.colors['color-secondary'] }}
          >
            {tokensPage?.subtitle}
          </p>
        </div>

        {/* filtros */}
        <div className="flex justify-start gap-4 mb-8">
          <button
            onClick={() => setFilter('all')}
            className="px-4 py-2 rounded-lg cursor-pointer shadow-md"
            style={{
              backgroundColor:
                filter === 'all' ? colors?.colors['color-primary'] : 'white',
              color:
                filter === 'all' ? '#FFFFFF' : colors?.colors['color-primary'],
            }}
          >
            {tokensPage?.filters?.all}
          </button>
          <button
            onClick={() => setFilter('available')}
            className="px-4 py-2 rounded-lg cursor-pointer shadow-md"
            style={{
              backgroundColor:
                filter === 'available'
                  ? colors?.colors['color-primary']
                  : 'white',
              color:
                filter === 'available'
                  ? '#FFFFFF'
                  : colors?.colors['color-primary'],
            }}
          >
            {tokensPage?.filters?.available}
          </button>
        </div>

        {/* grid 1/2/3/4 e estados */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={`sk-${i}`} />
            ))}

          {!isLoading && !error && tokensToShow.map((t: any) => (
            <div key={t.id} className="h-full">
              <Token
                name={t.name}
                subtitle={t.subtitle}
                price={t.price}
                launchDate={t.launchDate}
                tokensAvailable={t.tokensAvailable}  // total supply
                identifierCode={t.identifierCode}
                image={t.image}  
                href={`/tokens/${t.id}`}                     // logoUrl real
                labels={t.labels}
                sold={t.sold}
                total={t.total}
              />
            </div>
          ))}

          {!isLoading && !error && tokensToShow.length === 0 && (
            <p className="text-sm text-gray-500 col-span-full">
              Nenhum token disponível.
            </p>
          )}

          {!isLoading && error && (
            <p className="text-sm text-red-600 col-span-full">
              Falha ao carregar tokens.
            </p>
          )}
        </div>
      </main>
    </MainLayout>
  )
}