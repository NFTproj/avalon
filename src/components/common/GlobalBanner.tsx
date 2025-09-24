'use client'

import * as React from 'react'
import { CheckCircle2, XCircle, X } from 'lucide-react'
import { ConfigContext } from '@/contexts/ConfigContext'

type BannerData = { type: 'success' | 'error'; text: string }

type BannerCtx = {
  banner: BannerData | null
  showBanner: (b: BannerData, opts?: { timeout?: number }) => void
  hideBanner: () => void
}

const Ctx = React.createContext<BannerCtx | null>(null)

export function BannerProvider({ children }: { children: React.ReactNode }) {
  const [banner, setBanner] = React.useState<BannerData | null>(null)
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const showBanner = React.useCallback((b: BannerData, opts?: { timeout?: number }) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setBanner(b)
    const t = opts?.timeout === 0 ? 0 : (opts?.timeout ?? 6000)
    if (t) timerRef.current = setTimeout(() => setBanner(null), t)
  }, [])

  const hideBanner = React.useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setBanner(null)
  }, [])

  return <Ctx.Provider value={{ banner, showBanner, hideBanner }}>{children}</Ctx.Provider>
}

export function useBanner() {
  const v = React.useContext(Ctx)
  if (!v) throw new Error('useBanner deve ser usado dentro de <BannerProvider>')
  return v
}

/** Slot fixo no topo direito da viewport (acima do conteúdo) */
export function BannerSlot({ topOffset = 72 }: { topOffset?: number }) {
  const { banner, hideBanner } = useBanner()
  const { colors } = React.useContext(ConfigContext)
  if (!banner) return null

  const accent = colors?.colors?.['color-primary'] || '#19C3F0'
  const isSuccess = banner.type === 'success'
  const bg = isSuccess ? withAlpha(accent, 0.12) : '#FEF2F2'
  const br = isSuccess ? accent : '#EF4444'
  const fg = isSuccess ? '#0b1a2b' : '#991B1B'

  return (
    <div
      className="fixed right-4 z-[60] pointer-events-none" // fica por cima e não bloqueia a página
      style={{ top: topOffset }}
    >
      <div
        className="pointer-events-auto rounded-xl border-2 px-4 py-3 shadow-sm flex items-start gap-3 max-w-[520px]"
        role="status"
        aria-live="polite"
        style={{ backgroundColor: bg, borderColor: br, color: fg }}
      >
        <span className="mt-0.5">
          {isSuccess
            ? <CheckCircle2 className="h-5 w-5" aria-hidden />
            : <XCircle className="h-5 w-5" aria-hidden />}
        </span>

        <p className="text-sm font-medium flex-1">{banner.text}</p>

        <button
          type="button"
          onClick={hideBanner}
          className="ml-2 rounded p-1 hover:opacity-80"
          aria-label="Fechar"
          style={{ color: fg }}
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  )
}

function withAlpha(hex?: string, alpha = 0.08) {
  const h = hex?.trim() || '#19C3F0'
  const m = h.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
  if (!m) return `rgba(25,195,240,${alpha})`
  const r = parseInt(m[1], 16), g = parseInt(m[2], 16), b = parseInt(m[3], 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
