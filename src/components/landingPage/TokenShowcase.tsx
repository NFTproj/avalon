'use client'

import { useContext, useMemo, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ConfigContext } from '@/contexts/ConfigContext'
import { useCards } from '@/lib/hooks/useCards'
import Token from '@/components/common/Token'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'

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

  // Garantir que o Swiper só renderize no cliente
  useEffect(() => {
    setIsMounted(true)
  }, [])

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
          <div className="mb-16 max-w-6xl mx-auto px-4">
            <Carousel
              opts={{
                align: 'start',
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {tokens.map((token: any) => (
                  <CarouselItem key={token.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
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
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious 
                className="-left-12 h-14 w-14 border bg-white shadow-md hover:shadow-lg transition-all hover:scale-105 disabled:opacity-30"
                style={{ 
                  color: colors?.border['border-primary'] ?? '#08CEFF', 
                  borderColor: colors?.border['border-primary'] ?? '#08CEFF',
                  borderWidth: '1.5px'
                }}
              />
              <CarouselNext 
                className="-right-12 h-14 w-14 border bg-white shadow-md hover:shadow-lg transition-all hover:scale-105 disabled:opacity-30"
                style={{ 
                  color: colors?.border['border-primary'] ?? '#08CEFF', 
                  borderColor: colors?.border['border-primary'] ?? '#08CEFF',
                  borderWidth: '1.5px'
                }}
              />
            </Carousel>
          </div>
        )}

       
      </div>
    </section>
  )
}
