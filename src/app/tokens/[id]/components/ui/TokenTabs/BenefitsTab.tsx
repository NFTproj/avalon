// src/app/tokens/[id]/components/ui/TokenTabs/BenefitsTab.tsx
'use client'

import Link from 'next/link'
import { useContext, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { ConfigContext } from '@/contexts/ConfigContext'

type Props = {
  token?: any               // passe o token aqui (como faz no InfoTab)
  tokenId?: string | number // opcional: se quiser forçar via prop
  tokenDetails?: any
}

export default function BenefitsTab({ token, tokenId, tokenDetails }: Props) {
  const { colors } = useContext(ConfigContext)
  const params = useParams()
  const routeId = (params as Record<string, string | undefined>)?.id
  const cta = tokenDetails?.tabs?.benefits?.cta ?? {}

  // ============================================================================
  // TEMPORÁRIO: Redirecionando para /under-development
  // TODO: Remover quando a funcionalidade de queima estiver pronta
  // ============================================================================
  const href = '/under-development'

  /* ============================================================================
   * CÓDIGO ORIGINAL - DESCOMENTAR QUANDO A QUEIMA ESTIVER FUNCIONANDO
   * ============================================================================
   
  // 1) Descobre o ID do card de forma robusta
  const cardId =
    tokenId ??
    token?.cardId ??
    token?.card?.id ??
    token?.Card?.id ??
    token?.id ??
    token?.card_id ??
    routeId // último fallback: [id] da rota

  // 2) Resolve a rota base
  const basePathname = useMemo(() => {
    if (typeof cta.href === 'string' && cta.href.trim()) return cta.href.trim()
    const t = String(cta.type || '').toLowerCase()
    if (t === 'certificate' || t === 'certificado') return '/certificate-emission'
    if (t === 'dividends' || t === 'dividendos') return '/dividendos/extrato'
    return undefined
  }, [cta])

  // 3) Monta a URL FINAL como string, preservando queries existentes e adicionando cardId
  const href = useMemo(() => {
    if (!basePathname) return undefined

    // Garante que conseguimos usar URL mesmo em SSR
    const origin = typeof window === 'undefined' ? 'http://localhost' : window.location.origin
    const url = new URL(basePathname.startsWith('http') ? basePathname : origin + basePathname)

    if (cardId != null && String(cardId).trim()) {
      url.searchParams.set('cardId', String(cardId))
    }

    // Retorna somente path + query (sem origin) quando for interno
    if (!basePathname.startsWith('http')) {
      const qs = url.searchParams.toString()
      return `${url.pathname}${qs ? `?${qs}` : ''}`
    }

    // Se for link externo, devolve completo
    return url.toString()
  }, [basePathname, cardId])
  
   * ============================================================================
   * FIM DO CÓDIGO ORIGINAL
   * ============================================================================ */

  if (!href) return null

  const label = cta.label || 'Emitir certificado'
  const border = colors?.colors?.['color-primary'] ?? '#0ea5e9'
  const text = colors?.colors?.['color-primary'] ?? '#0f172a'
  const pillBg = '#F8FBFD'

  return (
    <div
      className="rounded-xl shadow-lg border p-6"
      style={{
        backgroundColor: '#FFFFFF',
        borderColor: colors?.token['border'],
        borderWidth: '1px',
      }}
    >
      <Link
        href={href}
        className="inline-flex items-center gap-3 rounded-full px-6 py-3 text-lg font-extrabold border-2 shadow-sm"
        style={{ color: text, borderColor: border, backgroundColor: pillBg }}
      >
        {label}
        <span
          className="inline-flex items-center justify-center w-9 h-9 rounded-full"
          style={{ border: `2px solid ${border}` }}
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke={border}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2l8 4.5v9L12 20l-8-4.5v-9L12 2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </span>
      </Link>
    </div>
  )
}
