// app/buy-tokens/components/BuyTokens.tsx
'use client'

import { useContext, useMemo, useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'   // ⬅️ add usePathname
import Header from '@/components/landingPage/Header'
import Footer from '@/components/common/footer'
import { ConfigContext } from '@/contexts/ConfigContext'
import { useAuth } from '@/contexts/AuthContext'
import LoadingOverlay from '@/components/common/LoadingOverlay'
import TokenList, { TokenItem } from './ui/TokenList'
import TokenCarousel from './ui/TokenCarousel'
import BuyPanel from './ui/BuyPanel'
import { useCards } from '@/lib/hooks/useCards'
import TabsBar, { TabKey } from './ui/TabsBar'
import ProgressBar from './ui/ProgressBar'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/* ————————————————— helpers ————————————————— */
const toNum = (v: any): number => {
  if (v === null || v === undefined) return 0
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0
  const s = String(v).replace(/[.,](?=\d{3}\b)/g, '').replace(',', '.')
  const n = Number(s)
  return Number.isFinite(n) ? n : 0
}

function normalizeAddress(addr?: string): `0x${string}` | undefined {
  const a = typeof addr === 'string' ? addr.trim() : ''
  return /^0x[a-fA-F0-9]{40}$/.test(a) ? (a as `0x${string}`) : undefined
}

/* ————————————————— component ————————————————— */
export default function BuyTokens() {
  const { colors, texts } = useContext(ConfigContext)
  const { loading: authLoading } = useAuth()
  const { cards, isLoading, error } = useCards()

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()                                  // ⬅️ add
  const urlTokenKey = (searchParams.get('token') || '').toLowerCase()
  const didInitFromUrl = useRef(false)

  const T: any = (texts as any)?.buyTokens ?? {}
  const t = (k: string, fb: string) => T?.[k] ?? fb

  // identidade visual
  const accent =
    (colors?.border as Record<string, string> | undefined)?.['border-primary'] ??
    colors?.colors?.['color-primary'] ??
    '#19C3F0'

  const neutralItemBorder =
    (colors?.border as Record<string, string> | undefined)?.['border-secondary'] ??
    (colors?.border as Record<string, string> | undefined)?.['border-primary'] ??
    '#E5E7EB'

  type TokenWithSupply = TokenItem & {
    initialSupply?: number
    purchasedQuantity?: number
    titleFromCard?: string
  }

  // map: cards -> tokens para UI (lista)
  const tokens: TokenWithSupply[] = useMemo(() => {
    if (!cards) return []
    return cards.map((c: any) => {
      const priceMicros = toNum(c?.CardBlockchainData?.tokenPrice)
      const initialSupply = toNum(c?.CardBlockchainData?.initialSupply ?? c?.initialSupply)
      const purchasedQuantity = toNum(c?.CardBlockchainData?.purchasedQuantity ?? c?.purchasedQuantity)
      const name = c?.name ?? 'TOKEN'
      const ticker = c?.ticker ?? ''
      return {
        id: c.id,
        name,
        project: c.description ?? c.longDescription ?? '',
        logoUrl: c.logoUrl ?? '/images/tokens/tbio.png',
        tags: c.tags ?? [],
        price: priceMicros ? priceMicros / 1_000_000 : 1,
        ticker,
        initialSupply,
        purchasedQuantity,
        titleFromCard: `${name}${ticker ? ` (#${String(ticker).toUpperCase()})` : ''}`,
      }
    })
  }, [cards])

  // índice on-chain por id (chainId + saleAddress)
  const onchainById = useMemo(() => {
    const map = new Map<
      string,
      { chainId?: number; saleAddress?: `0x${string}`; raw?: any }
    >()
      ; (cards ?? []).forEach((c: any) => {
        const chainId =
          typeof c?.CardBlockchainData?.tokenChainId === 'number'
            ? c.CardBlockchainData.tokenChainId
            : (c?.blockchainPlatform?.toLowerCase?.() === 'polygon'
              ? 137
              : undefined)

        const saleAddress = normalizeAddress(
          c?.CardBlockchainData?.intermediaryContractAddress ??
          c?.intermediaryContractAddress ??
          c?.saleContractAddress
        )

        map.set(c.id, { chainId, saleAddress, raw: c })
      })
    return map
  }, [cards])

  // seleção
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // ⬇️ inicializa a seleção a partir da URL (id OU ticker) e garante fallback pro primeiro token
  useEffect(() => {
    if (!tokens.length) { setSelectedId(null); return }

    if (!didInitFromUrl.current) {
      const pre =
        urlTokenKey &&
        tokens.find(
          t =>
            t.id.toLowerCase() === urlTokenKey ||
            (t.ticker && t.ticker.toLowerCase() === urlTokenKey)
        )
      setSelectedId(pre ? pre.id : tokens[0].id)
      didInitFromUrl.current = true

      // se não tinha ?token=, escreve o primeiro na URL
      if (!urlTokenKey) {
        const qs = new URLSearchParams(searchParams.toString())
        qs.set('token', (pre ? pre.id : tokens[0].id))
        router.replace(`${pathname}?${qs.toString()}`)          // ⬅️ 1 arg
      }
      return
    }

    // tokens mudaram: mantém seleção válida
    if (!selectedId || !tokens.find(t => t.id === selectedId)) {
      setSelectedId(tokens[0].id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokens, urlTokenKey])

  // sincroniza URL quando o usuário seleciona outro token
  const handleSelect = (it: TokenItem) => {
    setSelectedId(it.id)
    const qs = new URLSearchParams(searchParams.toString())
    qs.set('token', it.id)
    router.replace(`${pathname}?${qs.toString()}`)              // ⬅️ 1 arg
  }

  const selected = useMemo(
    () => tokens.find(t => t.id === selectedId) ?? null,
    [tokens, selectedId]
  )

  const selectedOnchain = selectedId ? onchainById.get(selectedId) : undefined

  // abas
  const [tab, setTab] = useState<TabKey>('buy')

  // carrossel
  const carouselRef = useRef<HTMLDivElement | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const scrollCarousel = (direction: 'left' | 'right') => {
    const container = carouselRef.current
    if (!container) return

    const scrollAmount = 280
    const newScrollLeft = direction === 'left'
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount

    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    })
  }

  // header
  const headerTitle = selected?.titleFromCard ?? t('page-title-fallback', 'Comprar Tokens')

  // progresso (só mostra se houver dados)
  const progressValue = useMemo(() => {
    const total = toNum(selected?.initialSupply)
    const sold = toNum(selected?.purchasedQuantity)
    if (total <= 0 || sold <= 0) return null
    return Math.max(0, Math.min(100, (sold / total) * 100))
  }, [selected?.initialSupply, selected?.purchasedQuantity])

  if (process.env.NODE_ENV !== 'production') {
    console.debug('[BuyTokens] selected snapshot', {
      selectedId,
      forcedChainId: selectedOnchain?.chainId,
      forcedSaleAddress: selectedOnchain?.saleAddress,
    })
  }

  return (
    <div className="min-h-dvh flex flex-col bg-[#f0fcff]">
      <Header />
      <main className="flex-1">
        <div className="relative">
          {(authLoading || isLoading) && <LoadingOverlay />}

          <div className="mx-auto max-w-6xl px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* título + tabs */}
            <div className="lg:col-span-12">
              <h1
                className="text-2xl sm:text-[28px] font-bold"
                style={{ color: colors?.colors?.['color-primary'] }}
              >
                {headerTitle}
              </h1>

              {progressValue !== null && (
                <div className="mt-3">
                  <ProgressBar
                    value={progressValue}
                    zeroLabel={t('progress-zero', '0% vendido')}
                    emptyLabel={t('progress-empty', '')}
                  />
                </div>
              )}

              <TabsBar
                active={tab}
                onChange={setTab}
                accentColor={accent}
                labels={{
                  buy: t('tab-buy', 'Comprar'),
                  benefits: t('tab-benefits', 'Benefícios'),
                  orders: t('tab-orders', 'Ordens'),
                }}
              />
            </div>

            {/* esquerda: carrossel */}
            <section className="lg:col-span-6 relative" id="panel-buy" role="tabpanel" aria-labelledby="tab-buy">
              {error ? (
                <div>
                  <h2 className="text-lg font-semibold mb-4">
                    {t('available-tokens', 'Tokens disponíveis')}
                  </h2>
                  <div className="rounded-2xl border-2 bg-white p-5 shadow-lg" style={{ borderColor: accent }}>
                    <p className="text-sm text-red-600">
                      {t('load-error', 'Falha ao carregar tokens.')}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Setas de navegação externas */}
                  {tokens.length > 1 && canScrollLeft && (
                    <button
                      onClick={() => scrollCarousel('left')}
                      className="absolute -left-6 z-30 w-12 h-12 rounded-full bg-white shadow-xl border-2 flex items-center justify-center hover:bg-gray-50 transition-all duration-200 hover:scale-110"
                      style={{
                        borderColor: accent,
                        backgroundColor: 'white',
                        top: 'calc(50% + 20px)' // Posição fixa em relação ao container
                      }}
                      aria-label="Rolar para esquerda"
                    >
                      <ChevronLeft className="w-6 h-6" style={{ color: accent }} />
                    </button>
                  )}

                  {tokens.length > 1 && canScrollRight && (
                    <button
                      onClick={() => scrollCarousel('right')}
                      className="absolute -right-6 z-30 w-12 h-12 rounded-full bg-white shadow-xl border-2 flex items-center justify-center hover:bg-gray-50 transition-all duration-200 hover:scale-110"
                      style={{
                        borderColor: accent,
                        backgroundColor: 'white',
                        top: 'calc(50% + 20px)' // Posição fixa em relação ao container
                      }}
                      aria-label="Rolar para direita"
                    >
                      <ChevronRight className="w-6 h-6" style={{ color: accent }} />
                    </button>
                  )}

                  <div className="rounded-2xl border-2 bg-white shadow-lg" style={{ borderColor: accent }}>
                    <div className="p-5 pb-3">
                      <h2 className="text-lg font-semibold mb-4">
                        {t('available-tokens', 'Tokens disponíveis')}
                      </h2>
                    </div>
                    <div className="px-5 pb-5">
                      <TokenCarousel
                        items={tokens}
                        selectedId={selectedId}
                        onSelect={handleSelect}
                        accentColor={accent}
                        scrollRef={carouselRef}
                        onScrollStateChange={(canLeft: boolean, canRight: boolean) => {
                          setCanScrollLeft(canLeft)
                          setCanScrollRight(canRight)
                        }}
                      />
                    </div>
                  </div>
                </>
              )}
            </section>

            {/* direita: painel de compra */}
            <section className="lg:col-span-6">
              {selected && (tab === 'buy' || tab === 'benefits') && (
                <BuyPanel
                  token={selected}
                  min={100}
                  max={99_999}
                  fiat="USD"
                  activeTab={tab as 'buy' | 'benefits'}
                  onTabChange={(next) => setTab(next)}
                  onSuccessNavigateTo="/dashboard"
                  forcedChainId={selectedOnchain?.chainId}
                  forcedSaleAddress={selectedOnchain?.saleAddress}
                />
              )}
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
