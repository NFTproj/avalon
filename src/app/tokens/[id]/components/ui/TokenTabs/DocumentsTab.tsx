// ui/TokenTabs/DocumentsTab.tsx
'use client'

import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { useContext, useMemo } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'

type Props = {
  token: any
  tokenDetails?: any
}

type LinkKey = 'link1' | 'link2' | 'link3' | 'link4' | 'link5' | 'link6'
type DocItem = { id: LinkKey; href: string; label: string }

export default function DocumentsTab({ token, tokenDetails }: Props) {
  const { colors } = useContext(ConfigContext)

  const docs = useMemo<DocItem[]>(() => {
    const sl = (token?.socialLinks ?? {}) as Record<string, unknown>
    const i18n = (tokenDetails?.tabs?.docs ?? {}) as Record<string, string>
    const keys: LinkKey[] = ['link1','link2','link3','link4','link5','link6']

    return keys
      .map((k, i) => {
        const href = typeof sl[k] === 'string' ? (sl[k] as string) : ''
        if (!href.trim()) return null
        const label = i18n[k] ?? `Documento ${i + 1}`
        return { id: k, href, label }
      })
      .filter((x): x is DocItem => Boolean(x))
  }, [token, tokenDetails])

  if (docs.length === 0) return null

  return (
    <div
      className="rounded-xl shadow-lg border p-6"
      style={{
        backgroundColor: colors?.token['background'],
        borderColor: colors?.token['border'],
        borderWidth: '1px',
      }}
    >
      <h4
        className="font-semibold mb-4"
        style={{ color: colors?.colors['color-primary'] }}
      >
        {tokenDetails?.tabs?.docs?.title ?? 'Documentos'}
      </h4>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
        {docs.map(doc => (
          <li key={doc.id}>
            <Link
              href={doc.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base font-semibold inline-flex items-center gap-2"
              style={{ color: colors?.colors['color-primary'] }}
            >
              {doc.label}
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
