// DocumentsTab.tsx
'use client'

import Link from 'next/link'
import { useContext } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'

export default function DocumentsTab({ tokenDetails }: { tokenDetails?: any }) {
  const { colors } = useContext(ConfigContext)
  const docs = [
    { title: 'Documentos essenciais (Anexo E)', href: '#' },
    { title: 'Contrato de investimento', href: '#' },
    { title: 'Contrato Social', href: '#' },
  ]
  return (
    <div
      className="rounded-xl shadow-lg border p-6"
      style={{
        backgroundColor: colors?.token['background'],
        borderColor: colors?.token['border'],
        borderWidth: '1px',
      }}
    >
      <h4 className="font-semibold mb-4" style={{ color: colors?.colors['color-primary'] }}>
        {tokenDetails?.tabs?.docs?.title ?? 'Documentos'}
      </h4>
      <ul className="space-y-2">
        {docs.map((doc) => (
          <li key={doc.title}>
            <Link href={doc.href} className="text-sm font-medium" style={{ color: colors?.colors['color-primary'] }}>
              {doc.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
