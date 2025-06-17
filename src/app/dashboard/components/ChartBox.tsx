import { useContext } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'

export default function ChartBox() {
  const { texts, colors } = useContext(ConfigContext)

  const actionButtons = texts?.dashboard?.['action-buttons'] || [
    { id: 1, name: 'Comprar', icon: '🛒' },
    { id: 2, name: 'Emitir Certificado', icon: '📜' },
    { id: 3, name: 'Sacar', icon: '💵' },
    { id: 4, name: 'Histórico', icon: '📊' },
    { id: 5, name: 'Verificações KYC', icon: '🔍' },
  ]

  const borderColor = colors?.dashboard?.buttons?.['action-border'] || '#00ffe1'

  return (
    <div className="mt-6 w-full">
      <div className="flex flex-wrap justify-center gap-4">
        {actionButtons.map((button) => (
          <div
            key={button.id}
            className="w-36 h-20 bg-white rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
            style={{ border: `2px solid ${borderColor}` }}
          >
            <div className="text-xl">{button.icon}</div>
            <p className="text-[#404040] text-sm mt-1">{button.name}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
