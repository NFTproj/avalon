import React, { useContext } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'

interface AssetCardProps {
  name: string
  symbol: string
  unitValue: number
  totalValue: number
  buyText?: string
  sellText?: string
}

export default function AssetCard({
  name,
  symbol,
  unitValue,
  totalValue,
  buyText = 'Comprar',
  sellText = 'Vender',
}: AssetCardProps) {
  const { colors } = useContext(ConfigContext)

  const tableTextColor = colors?.dashboard?.colors?.['table-text'] ?? '#404040'
  const tableBodyBgColor =
    colors?.dashboard?.background?.['table-body'] ?? '#fdfcf7'
  const buttonTextColor =
    colors?.dashboard?.buttons?.['table-button-text'] ?? '#4e4e4e'
  const buttonBgColor =
    colors?.dashboard?.buttons?.['table-button-bg'] ?? 'transparent'

  return (
    <div
      className="grid border-b border-gray-200"
      style={{
        gridTemplateColumns: '30% 30% 40%',
        background: tableBodyBgColor,
      }}
    >
      <div className="py-6 pl-6 flex items-center gap-4">
        <div className="w-[60px] h-[56px] bg-gray-300 rounded-md shrink-0 overflow-hidden"></div>
        <div>
          <h3
            className="text-base font-medium"
            style={{ color: tableTextColor }}
          >
            {name}
          </h3>
          <p className="text-sm text-gray-500">#{symbol}</p>
        </div>
      </div>

      <div className="py-6 flex items-center justify-center pr-7">
        <p style={{ color: tableTextColor }}>$ {unitValue.toFixed(2)}</p>
      </div>

      <div className="py-6 pl-6 pr-6 flex justify-between items-center">
        <p className="font-medium" style={{ color: tableTextColor }}>
          $ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
        <div className="flex gap-3">
          <button
            className="px-4 py-1 text-sm hover:bg-gray-100 transition-colors rounded"
            style={{
              color: buttonTextColor,
              background: buttonBgColor,
            }}
          >
            {buyText}
          </button>
          <button
            className="px-4 py-1 text-sm hover:bg-gray-100 transition-colors rounded"
            style={{
              color: buttonTextColor,
              background: buttonBgColor,
            }}
          >
            {sellText}
          </button>
        </div>
      </div>
    </div>
  )
}
