'use client'

import { useContext, useMemo } from 'react'
import Link from 'next/link'
import { ConfigContext } from '@/contexts/ConfigContext'

type HighlightsCardProps = {
  title?: string
  description?: string
  // só precisamos de link1 e link2
  socialLinks?: Partial<Record<'link1' | 'link2', string>> | null
}

type BtnLink = { href: string; label: string }
function isBtnLink(x: { href?: string; label: string }): x is BtnLink {
  return typeof x.href === 'string' && x.href.trim().length > 0
}

export default function HighlightsCard({
  title,
  description,
  socialLinks,
}: HighlightsCardProps) {
  const { colors, texts } = useContext(ConfigContext)

  // ✅ pega labels dos locales sem criar objeto {} tipado
  const labelDocs =
    texts?.['token-details']?.highlights?.['view-docs'] ?? 'View offer docs'
  const labelMore =
    texts?.['token-details']?.highlights?.['more-info'] ?? 'More information'

  const links = useMemo<BtnLink[]>(() => {
    const candidates = [
      { href: socialLinks?.link1, label: labelDocs },
      { href: socialLinks?.link2, label: labelMore },
    ]
    return candidates.filter(isBtnLink)
  }, [socialLinks, labelDocs, labelMore])

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
          {links.map(({ href, label }, i) => (
            <Link
              key={`${href}-${i}`}
              href={href} // agora é string garantida
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
