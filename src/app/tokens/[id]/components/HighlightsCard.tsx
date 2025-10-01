'use client'

import { useContext, useMemo } from 'react'
import Link from 'next/link'
import { ConfigContext } from '@/contexts/ConfigContext'

type HighlightsCardProps = {
  title?: string
  description?: string
  // ex.: { chave1: 'https://...', chave2: 'https://...' }
  socialLinks?: Record<string, string> | null | undefined
  // mapeia a chave para o rótulo do botão
  labelMap?: Record<string, string> | undefined
}

export default function HighlightsCard({
  title,
  description,
  socialLinks,
  labelMap,
}: HighlightsCardProps) {
  const { colors } = useContext(ConfigContext)

  const links = useMemo(
    () =>
      Object.entries(socialLinks ?? {})
        .filter(([, href]) => typeof href === 'string' && href.trim().length > 0)
        .map(([key, href]) => ({
          href,
          label: labelMap?.[key] ?? key, // fallback: usa a chave como label
        })),
    [socialLinks, labelMap]
  )

  return (
    <div
      className="rounded-lg border-2 p-6"
      style={{
        backgroundColor: colors?.token['background'],
        borderColor: colors?.token['border'],
        borderWidth: '1px',
      }}
    >
      {title && (
        <h2
          className="text-2xl font-semibold mb-6"
          style={{ color: colors?.colors['color-primary'] }}
        >
          {title}
        </h2>
      )}

      {/* Parágrafo único: o \n vira espaço (não quebramos em colunas) */}
      {description && (
        <p className="text-sm" style={{ color: colors?.colors['color-secondary'] }}>
          {description}
        </p>
      )}

      {!!links.length && (
        <div className="mt-4 flex gap-3 flex-wrap">
          {links.map(({ href, label }, i) => (
            <Link
              key={`${href}-${i}`}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-full cursor-pointer"
              style={{
                backgroundColor: colors?.background['background-highlight'],
                color: colors?.colors['color-primary'],
              }}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
