'use client'

import { useContext, useMemo } from 'react'
import Link from 'next/link'
import { ConfigContext } from '@/contexts/ConfigContext'

type HighlightsCardProps = {
  title?: string
  description?: string
  socialLinks?: Record<string, string> | null
}

type BtnLink = { href: string; label: string; key: string }

export default function HighlightsCard({
  title,
  description,
  socialLinks,
}: HighlightsCardProps) {
  const { colors, texts } = useContext(ConfigContext)

  const i18n = (texts?.['token-details']?.highlights ?? {}) as Record<string, string>

  const links = useMemo<BtnLink[]>(() => {
    if (!socialLinks) return []
    
    // Prioriza 'docs' e 'info', mas aceita qualquer chave
    const priorityKeys = ['docs', 'info']
    const allKeys = Object.keys(socialLinks)
    
    // Pega as chaves prioritárias primeiro, depois as outras (limitando a 2 no total)
    const orderedKeys = [
      ...priorityKeys.filter(k => allKeys.includes(k)),
      ...allKeys.filter(k => !priorityKeys.includes(k))
    ].slice(0, 2)

    return orderedKeys
      .map(key => {
        const href = socialLinks[key]
        if (!href || typeof href !== 'string' || !href.trim()) return null
        
        // Usa i18n se existir, senão formata a chave
        const label = i18n[key] ?? key.charAt(0).toUpperCase() + key.slice(1)
        
        return { key, href, label }
      })
      .filter((x): x is BtnLink => Boolean(x))
  }, [socialLinks, i18n])

  if (!title && !description && links.length === 0) return null

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

      {description && (
        <p
          className="text-sm"
          style={{ color: colors?.colors['color-secondary'], whiteSpace: 'pre-line' }}
        >
          {description}
        </p>
      )}

      {!!links.length && (
        <div className="mt-4 flex gap-3 flex-wrap">
          {links.map(({ key, href, label }) => (
            <Link
              key={key}
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
