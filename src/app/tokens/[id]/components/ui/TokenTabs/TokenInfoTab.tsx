'use client'

import { useContext } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'

type TokenInfoTabProps = {
  token: any // precisa do card inteiro pra ler token.metadata
}

export default function TokenInfoTab({ token }: TokenInfoTabProps) {
  const { colors } = useContext(ConfigContext)

  const meta = Array.isArray(token?.metadata) ? token.metadata : []
  const metaMap: Record<string, string> = meta.reduce((acc: any, it: any) => {
    if (it?.field && it?.value != null) acc[it.field] = String(it.value)
    return acc
  }, {})

  // pega field2..field7 e mantém todos (incluindo repetidos)
  const bullets = Array.from({ length: 6 }, (_, i) => metaMap[`field${i + 2}`])
    .filter((v): v is string => Boolean(v && v.trim()))

  return (
    <div
      className="rounded-xl shadow-lg border p-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
      style={{
        backgroundColor: colors?.token['background'],
        borderColor: colors?.token['border'],
        borderWidth: '1px',
      }}
    >
      {bullets.length > 0 ? (
        bullets.map((txt, idx) => (
          <div key={`${idx}-${txt}`} className="flex items-start gap-2 w-full">
            <span
              className="w-5 h-5 flex items-center justify-center text-xs font-bold rounded-full"
              style={{ backgroundColor: colors?.colors['color-primary'], color: '#FFFFFF' }}
            >
              ✓
            </span>
            <p className="text-base font-bold" style={{ color: colors?.colors['color-primary'] }}>
              {txt}
            </p>
          </div>
        ))
      ) : (
        <p className="text-sm" style={{ color: colors?.colors['color-tertiary'] }}>
          Nenhuma informação adicional disponível.
        </p>
      )}
    </div>
  )
}
