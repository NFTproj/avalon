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
  tags?: string[]          // se vier vazio/undefined, não renderizamos a seção
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
    return <div className="text-sm text-gray-500 py-8 text-center">Nenhum token disponível no momento.</div>
  }

  return (
    <ul
      ref={listRef}
      className="space-y-4 overflow-y-auto pr-2"
      style={{ maxHeight: maxH }}
      role="listbox"
      aria-label="Tokens disponíveis"
    >
      {items.map((it) => {
        const selected = it.id === selectedId
        const borderColor = selected ? accentColor : neutralBorderColor
        const bg = selected ? hexToRgba(accentColor, 0.06) : '#FFFFFF'
        const ringStyle: CSSWithRingVar = { ['--tw-ring-color']: borderColor }

        const tags = Array.isArray(it.tags) ? it.tags.slice(0, 3) : []

        return (
          <li key={it.id} role="option" aria-selected={selected}>
            <button
              type="button"
              onClick={() => onSelect(it)}
              className="w-full text-left rounded-2xl border bg-white shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2"
              style={{ borderColor, backgroundColor: bg }}
            >
              <div className="p-5 sm:p-6 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  {/* Título + ticker com # */}
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900 truncate">{it.name}</p>
                    {!!it.ticker && (
                      <span className="text-[11px] leading-none text-gray-500 -mt-[1px]">
                        #{String(it.ticker).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Descrição opcional (off por padrão) */}
                  {showProject && it.project && (
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mt-1 truncate">
                      {it.project}
                    </h3>
                  )}

                  {/* Tags (só se vierem do backend) — texto sempre escuro */}
                  {tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {tags.map((tag, i) => (
                        <span
                          key={`${it.id}-tag-${i}`}
                          className={`px-3 py-1 rounded-full text-[11px] font-semibold border shadow-[0_1px_0_rgba(0,0,0,.06)] text-gray-800 ${chipClassByIndex(i)}`}
                        >
                          {String(tag).toUpperCase()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Logo preenchendo o círculo + preço opcional */}
                <div className="flex items-center gap-3 shrink-0">
                  {showPrice && (
                    <p className="text-sm font-semibold text-right">
                      {formatMoney(it.price)}
                      <span className="text-[11px] ml-1 text-gray-500">/ und</span>
                    </p>
                  )}
                  <div
                    className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full ring-2 overflow-hidden bg-white"
                    style={ringStyle}
                  >
                    {it.logoUrl ? (
                      <Image src={it.logoUrl} alt={it.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full grid place-items-center text-xs text-gray-400">logo</div>
                    )}
                  </div>
                </div>
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

/** chips pastel por posição; texto fica sempre escuro */
function chipClassByIndex(index: number) {
  const i = index % 3
  if (i === 0) return 'bg-[#EAEFCB] border-[#C9D79B]' // oliva pastel
  if (i === 1) return 'bg-[#D5FBF0] border-[#9EEFD9]' // mint pastel
  return 'bg-[#E6F8F4] border-[#BFECE3]'              // aqua pastel
}
