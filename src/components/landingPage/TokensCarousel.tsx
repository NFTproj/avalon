'use client'

import { useContext, useMemo, useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ConfigContext } from '@/contexts/ConfigContext'
import { useCards } from '@/lib/hooks/useCards'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const toNum = (v: any): number => {
  if (v === null || v === undefined) return 0
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0
  const s = String(v).replace(/[.,](?=\d{3}\b)/g, '').replace(',', '.')
  const n = Number(s)
  return Number.isFinite(n) ? n : 0
}

function SkeletonCard() {
  return (
    <div className="flex-shrink-0 w-80 rounded-xl border bg-white p-4 shadow-lg animate-pulse">
      <div className="h-40 w-full rounded-lg bg-gray-200 mb-4" />
      <div className="h-6 w-2/3 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-1/2 bg-gray-200 rounded mb-4" />
      <div className="flex gap-2 mb-4">
        <div className="h-6 w-16 rounded-full bg-gray-200" />
        <div className="h-6 w-20 rounded-full bg-gray-200" />
      </div>
      <div className="h-3 w-full bg-gray-200 rounded" />
    </div>
  )
}

export default function TokensCarousel() {
  const { colors, texts } = useContext(ConfigContext)
  const { cards, isLoading, error } = useCards()
  const router = useRouter()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const landingTexts = texts?.['landing-page']
  const accentColor = colors?.border['border-primary'] || '#08CEFF'
  const titleColor = colors?.colors?.['color-primary'] || '#202020'
  const bgColor = colors?.background['background-primary'] || '#F2FCFF'

  // Mapear cards da API para o formato adequado
  const tokens = useMemo(() => {
    if (!cards) return []
    return cards
      .filter((c: any) => String(c?.status ?? '100') !== '500')
      .slice(0, 10) // Limite de 10 tokens para o carousel
      .map((c: any) => {
        const cbd = c?.CardBlockchainData ?? {}
        const initialSupply = toNum(cbd.initialSupply)
        const purchasedQuantity = toNum(cbd.purchasedQuantity)
        const tokenPriceMicros = toNum(cbd.tokenPrice)
        const price = tokenPriceMicros / 1_000_000

        return {
          id: c.id,
          name: c.name ?? 'TOKEN',
          ticker: c.ticker ?? '',
          image: c.logoUrl ?? '/images/tokens/default.png',
          price: price,
          sold: purchasedQuantity,
          total: initialSupply,
          available: Math.max(0, initialSupply - purchasedQuantity),
          tags: c.tags ?? [],
        }
      })
  }, [cards])

  // Função para rolar o carousel
  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return
    const scrollAmount = 350
    const newScrollLeft =
      scrollContainerRef.current.scrollLeft +
      (direction === 'right' ? scrollAmount : -scrollAmount)
    
    scrollContainerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth',
    })
  }

  // Atualizar estado dos botões de navegação
  const updateScrollButtons = () => {
    if (!scrollContainerRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }

  useEffect(() => {
    updateScrollButtons()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', updateScrollButtons)
      window.addEventListener('resize', updateScrollButtons)
      return () => {
        container.removeEventListener('scroll', updateScrollButtons)
        window.removeEventListener('resize', updateScrollButtons)
      }
    }
  }, [tokens])

  const handleCardClick = () => {
    router.push('/tokens')
  }

  if (error) {
    return null // Não mostrar nada se houver erro
  }

  return (
    <section className="py-20 px-4 md:px-8" style={{ backgroundColor: bgColor }}>
      <div className="max-w-7xl mx-auto">
        {/* Título da Seção */}
        <div className="text-center mb-12">
          <div
            className="w-32 h-1.5 rounded-full mx-auto mb-8"
            style={{ backgroundColor: accentColor }}
          />
          <h2
            className="text-4xl md:text-5xl font-bold mb-4 leading-tight"
            style={{ color: titleColor }}
          >
            {landingTexts?.tokens?.title || 'Tokens Disponíveis'}
          </h2>
          <p
            className="text-lg md:text-xl"
            style={{ color: colors?.colors?.['color-secondary'] || '#6B7280' }}
          >
            {landingTexts?.tokens?.subtitle || 'Explore nossos tokens tokenizados'}
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Botão Esquerda */}
          {!isLoading && canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110 bg-white"
              style={{ color: accentColor }}
              aria-label="Anterior"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Botão Direita */}
          {!isLoading && canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110 bg-white"
              style={{ color: accentColor }}
              aria-label="Próximo"
            >
              <ChevronRight size={24} />
            </button>
          )}

          {/* Scroll Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {/* Loading State */}
            {isLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={`skeleton-${i}`} />
              ))}

            {/* Token Cards */}
            {!isLoading &&
              tokens.map((token) => (
                <div
                  key={token.id}
                  onClick={handleCardClick}
                  className="flex-shrink-0 w-80 rounded-xl border bg-white p-5 shadow-lg cursor-pointer transition-all hover:shadow-2xl hover:scale-105"
                  style={{ borderColor: colors?.token?.border || '#E5E7EB' }}
                >
                  {/* Imagem */}
                  <div className="relative h-40 w-full rounded-lg overflow-hidden mb-4 bg-gray-100">
                    <img
                      src={token.image}
                      alt={token.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/images/tokens/default.png'
                      }}
                    />
                  </div>

                  {/* Nome e Ticker */}
                  <h3
                    className="text-xl font-bold mb-1 truncate"
                    style={{ color: titleColor }}
                  >
                    {token.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">#{token.ticker}</p>

                  {/* Tags */}
                  {token.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {token.tags.slice(0, 3).map((tag: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: `${accentColor}20`,
                            color: accentColor,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Preço */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Preço unitário</p>
                    <p className="text-2xl font-bold" style={{ color: accentColor }}>
                      ${token.price.toFixed(2)}
                    </p>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Vendidos: {token.sold.toLocaleString()}</span>
                      <span>Total: {token.total.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${token.total > 0 ? (token.sold / token.total) * 100 : 0}%`,
                          backgroundColor: accentColor,
                        }}
                      />
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="text-center mt-4">
                    <span
                      className="text-sm font-semibold hover:underline"
                      style={{ color: accentColor }}
                    >
                      Ver detalhes →
                    </span>
                  </div>
                </div>
              ))}

            {/* Empty State */}
            {!isLoading && tokens.length === 0 && (
              <div className="w-full text-center py-12">
                <p className="text-gray-500">Nenhum token disponível no momento.</p>
              </div>
            )}
          </div>
        </div>

        {/* Botão Ver Todos */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.push('/tokens')}
            className="px-8 py-3 rounded-lg font-semibold text-white transition-all hover:shadow-lg hover:scale-105"
            style={{ backgroundColor: accentColor }}
          >
            Ver todos os tokens
          </button>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  )
}
