'use client'

import { useContext } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'

export default function TokenInfoTab() {
  const { colors } = useContext(ConfigContext)
  const bullets = [
    'Token baseado no padrão ERC-20, compatível com rede Polygon',
    'Pode ser usado para staking em jogos e recompensas dinâmicas',
    'Planejado para uso em futuras votações de governança (DAO)',
    'Launchpad integrado para novos meme tokens e projetos emergentes',
    'Tokenomics planejado com queima parcial para controle de oferta',
    'Código do contrato será aberto e auditado antes do lançamento',
  ]
  return (
    <div
      className="rounded-xl shadow-lg border p-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
      style={{
        backgroundColor: colors?.token['background'],
        borderColor: colors?.token['border'],
        borderWidth: '1px',
      }}
    >
      {bullets.map((txt, idx) => (
        <div key={idx + txt} className="flex items-start gap-2 w-full">
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
      ))}
    </div>
  )
}
