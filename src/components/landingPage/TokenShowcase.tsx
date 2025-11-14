'use client'

import { useContext, useMemo, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ConfigContext } from '@/contexts/ConfigContext'
import { useCards } from '@/lib/hooks/useCards'
import Token from '@/components/common/Token'
import { Swiper, SwiperSlide } from 'swiper/react'
import { A11y } from 'swiper/modules'
import 'swiper/css'

const toNum = (v: any): number => {
  if (v === null || v === undefined) return 0
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0
  const s = String(v).replace(/[.,](?=\d{3}\b)/g, '').replace(',', '.')
  const n = Number(s)
  return Number.isFinite(n) ? n : 0
}

function SkeletonCard() {
  return (
    <div className="w-full sm:w-[calc(50%-16px)] lg:w-[calc(33.333%-27px)] max-w-sm">
      <div className="rounded-xl border bg-white p-4 shadow-lg h-full animate-pulse">
        <div className="h-28 w-full rounded-lg bg-gray-200 mb-4" />
        <div className="h-5 w-2/3 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-1/2 bg-gray-200 rounded mb-4" />
        <div className="flex gap-2 mb-4">
          <div className="h-6 w-16 rounded-full bg-gray-200" />
          <div className="h-6 w-20 rounded-full bg-gray-200" />
        </div>
        <div className="h-3 w-full bg-gray-200 rounded" />
      </div>
    </div>
  )
}

export default function TokenShowcase() {
  const { colors, texts } = useContext(ConfigContext)
  const { cards, isLoading, error } = useCards()
  const router = useRouter()
  const landingTexts = texts?.['landing-page']?.tokens
  const [isMounted, setIsMounted] = useState(false)
  const [swiperInstance, setSwiperInstance] = useState<any>(null)

  // Mapear cards da API para o formato Token
  const tokens = useMemo(() => {
    if (!cards) return []
    return cards
      .filter((c: any) => String(c?.status ?? '100') !== '500')
      .slice(0, 6) // Limite de 6 tokens para a landing
      .map((c: any) => {
        const cbd = c?.CardBlockchainData ?? {}
        const initialSupply = toNum(cbd.initialSupply)
        const purchasedQuantity = toNum(cbd.purchasedQuantity)
        const tokenPriceMicros = toNum(cbd.tokenPrice)
        const price = tokenPriceMicros / 1_000_000

        return {
          id: c.id,
          name: c.name ?? 'TOKEN',
          subtitle: '',
          labels: (c.tags ?? []).map((name: string) => ({ name })),
          price: String(price),
          launchDate: c.launchDate ?? '',
          tokensAvailable: String(initialSupply),
          identifierCode: c.ticker ?? '',
          image: c.logoUrl ?? '/images/tokens/default.png',
          sold: purchasedQuantity,
          total: initialSupply,
        }
      })
  }, [cards])

  // Garantir que o Swiper só renderize no cliente
  useEffect(() => {
    setIsMounted(true)
    console.log('TokenShowcase mounted, tokens count:', tokens.length)
  }, [tokens.length])

  if (error) {
    return null // Não mostrar nada se houver erro
  }

  return (
    <section
      className="py-20 px-4 md:px-8"
      style={{
        backgroundColor: colors?.background['background-primary'] ?? '#F2FCFF',
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Título da Seção */}
        <div className="text-center mb-16">
          <div
            className="w-32 h-1.5 rounded-full mx-auto mb-10"
            style={{
              backgroundColor: colors?.border['border-primary'] ?? '#08CEFF',
            }}
          />
          <h2
            className="text-4xl md:text-5xl lg:text-4xl font-bold mb-6 leading-tight"
            style={{
              color: colors?.colors?.['color-primary'] ?? '#202020',
            }}
          >
            {landingTexts?.title || 'Tokens Disponíveis'}
          </h2>
        </div>

        {/* Grid de Cards com Flexbox ou Carousel */}
        {isLoading && (
          <div className="flex flex-wrap justify-center gap-8 lg:gap-10 mb-16">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={`skeleton-${i}`} />
            ))}
          </div>
        )}

        {!isLoading && tokens.length === 0 && (
          <div className="flex flex-wrap justify-center gap-8 lg:gap-10 mb-16">
            <p className="text-sm text-gray-500 col-span-full">
              Nenhum token disponível.
            </p>
          </div>
        )}

        {!isLoading && tokens.length > 0 && tokens.length <= 3 && (
          <div className="flex flex-wrap justify-center gap-8 lg:gap-10 mb-16">
            {tokens.map((token: any) => (
              <div
                key={token.id}
                className="w-full sm:w-[calc(50%-16px)] lg:w-[calc(33.333%-27px)] max-w-sm"
              >
                <Token
                  name={token.name}
                  subtitle={token.subtitle}
                  price={token.price}
                  launchDate={token.launchDate}
                  tokensAvailable={token.tokensAvailable}
                  identifierCode={token.identifierCode}
                  image={token.image}
                  href={`/tokens/${token.id}`}
                  labels={token.labels}
                  sold={token.sold}
                  total={token.total}
                />
              </div>
            ))}
          </div>
        )}

        {!isLoading && tokens.length > 3 && isMounted && (
          <div className="mb-16 relative px-8 md:px-12 lg:px-16">
            {/* Botões de navegação customizados */}
            <button
              onClick={() => swiperInstance?.slidePrev()}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all hover:scale-110 disabled:opacity-35 disabled:cursor-not-allowed"
              style={{ color: colors?.border['border-primary'] ?? '#08CEFF' }}
              disabled={!swiperInstance}
              aria-label="Previous slide"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            <button
              onClick={() => swiperInstance?.slideNext()}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all hover:scale-110 disabled:opacity-35 disabled:cursor-not-allowed"
              style={{ color: colors?.border['border-primary'] ?? '#08CEFF' }}
              disabled={!swiperInstance}
              aria-label="Next slide"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>

            <Swiper
              modules={[A11y]}
              spaceBetween={24}
              slidesPerView={1}
              breakpoints={{
                640: { slidesPerView: 2, spaceBetween: 24 },
                1024: { slidesPerView: 3, spaceBetween: 32 },
              }}
              className="pb-6 tokens-swiper"
              onSwiper={setSwiperInstance}
              onInit={() => console.log('Swiper initialized')}
            >
              {tokens.map((token: any) => (
                <SwiperSlide key={token.id}>
                  <div className="flex justify-center">
                    <div className="w-full max-w-sm">
                      <Token
                        name={token.name}
                        subtitle={token.subtitle}
                        price={token.price}
                        launchDate={token.launchDate}
                        tokensAvailable={token.tokensAvailable}
                        identifierCode={token.identifierCode}
                        image={token.image}
                        href={`/tokens/${token.id}`}
                        labels={token.labels}
                        sold={token.sold}
                        total={token.total}
                      />
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}

       
      </div>
    </section>
  )
}
