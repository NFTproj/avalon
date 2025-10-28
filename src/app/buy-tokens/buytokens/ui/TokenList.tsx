// app/buy-tokens/components/TokenList.tsx
'use client'
import Image from 'next/image'
import * as React from 'react'

type CSSWithRingVar = React.CSSProperties & { ['--tw-ring-color']?: string }

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
  neutralBorderColor?: string
  visibleRows?: number
  showProject?: boolean
  showPrice?: boolean
}

export default function TokenList({
  items,
  selectedId,
  onSelect,
  accentColor = '#19C3F0',
  neutralBorderColor = '#E5E7EB',
  visibleRows = 2,
  showProject = false,
  showPrice = false,
}: Props) {
  const listRef = React.useRef<HTMLUListElement>(null)
  const [maxH, setMaxH] = React.useState<number | undefined>(undefined)

  React.useEffect(() => {
    function measure() {
      const ul = listRef.current
      if (!ul) return
      const lis = ul.querySelectorAll('li')
      if (!lis.length) return
      const first = lis[0] as HTMLElement
      const firstH = first.getBoundingClientRect().height
      let gap = 0
      if (lis.length > 1) {
        const mt = parseFloat(getComputedStyle(lis[1] as HTMLElement).marginTop || '0')
        gap = mt
      }
      const rows = Math.max(1, visibleRows)
      setMaxH(firstH * rows + gap * (rows - 1))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [items, visibleRows])

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
    <ul
      ref={listRef}
      className="space-y-2 overflow-y-auto pr-1"
      style={{ maxHeight: maxH }}
      role="listbox"
      aria-label="Tokens disponíveis"
    >
      {items.map((it) => {
        const selected = it.id === selectedId
        const borderColor = selected ? accentColor : '#D1D5DB'
        const bg = selected ? '#F0F9FF' : '#FFFFFF'
        const shadowClass = selected ? 'shadow-md border-2' : 'shadow-sm hover:shadow-md border-2'
        const ringStyle: CSSWithRingVar = { ['--tw-ring-color']: `${accentColor}33` }

        const tags = Array.isArray(it.tags) ? it.tags.slice(0, 3) : []

        return (
          <li key={it.id} role="option" aria-selected={selected}>
            <button
              type="button"
              onClick={() => onSelect(it)}
              className={`w-full text-left rounded-xl transition-all duration-200 
                          hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-offset-2 ${shadowClass}`}
              style={{ borderColor, backgroundColor: bg, ...ringStyle }}
            >
              <div className="p-4">
                <div className="flex items-center gap-3">
                  {/* Logo */}
                  <div className="flex-shrink-0">
                    <div
                      className="relative w-12 h-12 rounded-lg ring-2 ring-gray-200 overflow-hidden bg-white shadow-sm"
                    >
                      {it.logoUrl ? (
                        <Image src={it.logoUrl} alt={it.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full grid place-items-center">
                          <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold text-gray-900 truncate">{it.name}</h3>
                      {!!it.ticker && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                          #{String(it.ticker).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatMoney(it.price, 'USD', 'en-US')}
                      </span>
                      
                      {/* Indicador de seleção mais visível */}
                      {selected && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }}></div>
                          <span className="text-xs font-medium" style={{ color: accentColor }}>Selecionado</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tags compactas */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {tags.map((tag, i) => (
                      <span
                        key={`${it.id}-tag-${i}`}
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getTagStyle(i)}`}
                      >
                        {String(tag).toUpperCase()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

/* helpers */
function formatMoney(n: number, currency = 'BRL', locale = 'pt-BR') {
  if (!Number.isFinite(n)) return '—'
  try { return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(n) }
  catch { return n.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }
}

function hexToRgba(hex?: string, alpha = 0.08) {
  const h = hex?.trim() || '#19C3F0'
  const m = h.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
  if (!m) return `rgba(25,195,240,${alpha})`
  const r = parseInt(m[1], 16), g = parseInt(m[2], 16), b = parseInt(m[3], 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/** Estilos melhorados para as tags */
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

/** chips pastel por posição (mantido para compatibilidade) */
function chipClassByIndex(index: number) {
  const i = index % 3
  if (i === 0) return 'bg-[#EAEFCB] border-[#C9D79B]'
  if (i === 1) return 'bg-[#D5FBF0] border-[#9EEFD9]'
  return 'bg-[#E6F8F4] border-[#BFECE3]'
}