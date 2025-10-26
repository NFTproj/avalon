// app/buy-tokens/components/ui/TokenCarousel.tsx
'use client'
import Image from 'next/image'
import * as React from 'react'

export type TokenItem = {
  id: string
  name: string
  project?: string
  logoUrl?: string
  tags?: string[]
  price: number
  ticker?: string
}

type Props = {
  items: TokenItem[]
  selectedId: string | null
  onSelect: (item: TokenItem) => void
  accentColor?: string
  onScrollStateChange?: (canScrollLeft: boolean, canScrollRight: boolean) => void
  scrollRef?: React.RefObject<HTMLDivElement | null>
}

export default function TokenCarousel({
  items,
  selectedId,
  onSelect,
  accentColor = '#19C3F0',
  onScrollStateChange,
  scrollRef: externalScrollRef,
}: Props) {
  const internalScrollRef = React.useRef<HTMLDivElement>(null)
  const scrollRef = externalScrollRef || internalScrollRef
  const [canScrollLeft, setCanScrollLeft] = React.useState(false)
  const [canScrollRight, setCanScrollRight] = React.useState(false)

  // Encontrar o índice do item selecionado
  const selectedIndex = React.useMemo(() => {
    if (!selectedId || !items.length) return -1
    const index = items.findIndex(item => item.id === selectedId)
    return index >= 0 ? index : 0
  }, [items, selectedId])

  // Verificar se pode rolar
  const checkScroll = React.useCallback(() => {
    const container = scrollRef.current
    if (!container) return

    const scrollLeft = container.scrollLeft
    const maxScroll = container.scrollWidth - container.clientWidth
    
    const canLeft = scrollLeft > 5
    const canRight = scrollLeft < maxScroll - 5
    
    setCanScrollLeft(canLeft)
    setCanScrollRight(canRight)
    
    // Notificar o componente pai
    onScrollStateChange?.(canLeft, canRight)
  }, [onScrollStateChange])

  // Rolar para o item selecionado quando mudar
  React.useEffect(() => {
    const container = scrollRef.current
    if (!container || selectedIndex === -1) return

    const itemWidth = 280
    const scrollPosition = selectedIndex * itemWidth
    
    container.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
    })
  }, [selectedIndex])

  React.useEffect(() => {
    checkScroll()
    const container = scrollRef.current
    if (container) {
      container.addEventListener('scroll', checkScroll)
      return () => container.removeEventListener('scroll', checkScroll)
    }
  }, [checkScroll])

  // Verificar scroll quando items mudarem
  React.useEffect(() => {
    const timer = setTimeout(() => {
      checkScroll()
    }, 100)
    
    return () => clearTimeout(timer)
  }, [items, checkScroll])

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12 px-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        </div>
        <p className="text-sm text-gray-500 font-medium">Nenhum token disponível no momento</p>
        <p className="text-xs text-gray-400 mt-1">Novos tokens serão listados em breve</p>
      </div>
    )
  }

  return (
    <div className="relative -mx-5">
      {/* Container do carrossel */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 px-5"
        style={{ 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none'
        }}
      >
        {items.map((item) => {
          const selected = item.id === selectedId
          const tags = Array.isArray(item.tags) ? item.tags.slice(0, 3) : []

          return (
            <div
              key={item.id}
              className="flex-shrink-0 w-64"
            >
              <button
                type="button"
                onClick={() => onSelect(item)}
                className="w-full text-left rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-md"
                style={{ 
                  borderColor: selected ? accentColor : '#D1D5DB',
                  backgroundColor: selected ? '#F0F9FF' : '#FFFFFF'
                }}
              >
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-shrink-0">
                      <div className="relative w-12 h-12 rounded-lg ring-2 ring-gray-200 overflow-hidden bg-white shadow-sm">
                        {item.logoUrl ? (
                          <Image src={item.logoUrl} alt={item.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full grid place-items-center">
                            <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold text-gray-900 truncate">{item.name}</h3>
                        {!!item.ticker && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                            #{String(item.ticker).toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatMoney(item.price, 'USD', 'en-US')}
                        </span>
                        
                        {selected && (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }}></div>
                            <span className="text-xs font-medium" style={{ color: accentColor }}>Selecionado</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map((tag, i) => (
                        <span
                          key={`${item.id}-tag-${i}`}
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getTagStyle(i)}`}
                        >
                          {String(tag).toUpperCase()}
                        </span>
                      ))}
                    </div>
                  )}

                  {item.project && (
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                      {item.project}
                    </p>
                  )}
                </div>
              </button>
            </div>
          )
        })}
      </div>

      {/* Indicador de posição melhorado */}
      <div className="flex justify-center mt-3 gap-1">
        {items.map((item, index) => {
          const isActive = index === selectedIndex
          return (
            <button
              key={`indicator-${item.id}`}
              onClick={() => onSelect(item)}
              className={`h-2 rounded-full transition-all duration-200 ${
                isActive ? 'w-6' : 'w-2 hover:w-3'
              }`}
              style={{ 
                backgroundColor: isActive ? accentColor : '#D1D5DB'
              }}
              aria-label={`Ir para ${item.name}`}
            />
          )
        })}
      </div>
    </div>
  )
}

function formatMoney(n: number, currency = 'BRL', locale = 'pt-BR') {
  if (!Number.isFinite(n)) return '—'
  try { 
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(n) 
  } catch { 
    return n.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) 
  }
}

function getTagStyle(index: number) {
  const styles = [
    'bg-emerald-50 border-emerald-200 text-emerald-800',
    'bg-blue-50 border-blue-200 text-blue-800', 
    'bg-purple-50 border-purple-200 text-purple-800',
    'bg-orange-50 border-orange-200 text-orange-800',
    'bg-pink-50 border-pink-200 text-pink-800'
  ]
  return styles[index % styles.length]
}