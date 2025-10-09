// src/app/tokens/[id]/components/ui/TokenTabs/BenefitsTab.tsx
'use client'

import Link from 'next/link'
import { useContext, useMemo } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'

type Props = {
  tokenId?: string | number
  tokenDetails?: any
}

export default function BenefitsTab({ tokenId, tokenDetails }: Props) {
  const { colors } = useContext(ConfigContext)
  const cta = tokenDetails?.tabs?.benefits?.cta ?? {}

  // Resolve rota base
  const basePathname = useMemo(() => {
    if (typeof cta.href === 'string' && cta.href.trim()) return cta.href.trim()
    const t = String(cta.type || '').toLowerCase()
    if (t === 'certificate' || t === 'certificado') return '/certificate/emission'
    if (t === 'dividends'  || t === 'dividendos')  return '/dividendos/extrato'
    return undefined
  }, [cta])

  // Monta href com query ?cardId=<id> (quando existir)
  const href =
    basePathname &&
    (tokenId != null
      ? ({ pathname: basePathname, query: { cardId: String(tokenId) } } as const)
      : basePathname)

  if (!href) return null // sem CTA configurado, não renderiza nada

  const label  = cta.label || 'Emitir certificado'
  const border = colors?.colors?.['color-primary'] ?? '#0ea5e9' // cor do tema
  const text   = colors?.colors?.['color-primary'] ?? '#0f172a'
  const pillBg = '#F8FBFD'

  return (
    <div
      className="rounded-xl shadow-lg border p-6"
      style={{ backgroundColor: '#FFFFFF', borderColor: colors?.token['border'], borderWidth: '1px' }}
    >
      <Link
        href={href as any}
        className="inline-flex items-center gap-3 rounded-full px-6 py-3 text-lg font-extrabold border-2 shadow-sm"
        style={{ color: text, borderColor: border, backgroundColor: pillBg }}
      >
        {label}

        {/* Ícone inline (sem libs) */}
        <span
          className="inline-flex items-center justify-center w-9 h-9 rounded-full"
          style={{ border: `2px solid ${border}` }}
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
               stroke={border} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l8 4.5v9L12 20l-8-4.5v-9L12 2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </span>
      </Link>
    </div>
  )
}
