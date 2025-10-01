// BenefitsTab.tsx
'use client'

import { useContext } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'

export default function BenefitsTab({ tokenDetails }: { tokenDetails?: any }) {
  const { colors } = useContext(ConfigContext)
  return (
    <div
      className="rounded-xl shadow-lg border p-6"
      style={{
        backgroundColor: '#FFFFFF',
        borderColor: colors?.token['border'],
        borderWidth: '1px',
      }}
    >
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold" style={{ color: colors?.colors['color-primary'] }}>
            {tokenDetails?.tabs?.benefits?.['rights'] ?? 'Direitos'}
          </h4>
          <p className="text-sm" style={{ color: colors?.colors['color-secondary'] }}>
            O Meowl Token (MEWL) representa um ativo digital...
          </p>
        </div>
        <div>
          <h4 className="font-semibold" style={{ color: colors?.colors['color-primary'] }}>
            {tokenDetails?.tabs?.benefits?.['risks'] ?? 'Riscos'}
          </h4>
          <p className="text-sm" style={{ color: colors?.colors['color-secondary'] }}>
            Os detentores de MEWL estão cientes de que não há garantias...
          </p>
        </div>
      </div>
    </div>
  )
}
