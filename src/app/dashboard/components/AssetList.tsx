import React, { useContext } from 'react'
import AssetCard from './AssetCard'
import { ConfigContext } from '@/contexts/ConfigContext'

const mockAssets = [
  {
    id: 1,
    name: 'Token de Energia Limpa',
    symbol: 'CLEL',
    unitValue: 1.0,
    totalValue: 1000000000.0,
  },
  {
    id: 2,
    name: 'Token de Energia Limpa',
    symbol: 'CLEL',
    unitValue: 1.0,
    totalValue: 1000000000.0,
  },
  {
    id: 3,
    name: 'Token de Energia Limpa',
    symbol: 'CLEL',
    unitValue: 1.0,
    totalValue: 1000000000.0,
  },
  {
    id: 4,
    name: 'Token de Energia Limpa',
    symbol: 'CLEL',
    unitValue: 1.0,
    totalValue: 1000000000.0,
  },
  {
    id: 5,
    name: 'Token de Energia Limpa',
    symbol: 'CLEL',
    unitValue: 1.0,
    totalValue: 1000000000.0,
  },
]

export default function AssetList() {
  const { texts, colors } = useContext(ConfigContext)

  const assetListTexts = texts?.dashboard?.['asset-list']
  const headerBgColor = colors?.dashboard?.background?.header ?? '#404040'
  const headerTextColor = colors?.dashboard?.colors?.text ?? '#FFFFFF'
  const highlightColor = colors?.dashboard?.colors?.highlight ?? '#00ffe1'
  const tableHeaderBgColor =
    colors?.dashboard?.background?.['table-header'] ?? '#f8f7e9'
  const tableBodyBgColor =
    colors?.dashboard?.background?.['table-body'] ?? '#fdfcf7'
  const tableTextColor = colors?.dashboard?.colors?.['table-text'] ?? '#404040'

  return (
    <div className="w-full mt-8 rounded-t-lg overflow-hidden">
      {/* Cabeçalho */}
      <div className="p-4" style={{ backgroundColor: headerBgColor }}>
        <h2
          className="text-xl font-bold flex items-center"
          style={{ color: headerTextColor }}
        >
          {assetListTexts?.title ?? 'Sua carteira'}{' '}
          <span style={{ color: highlightColor }}>
            {assetListTexts?.highlight ?? 'Slab'}
          </span>
        </h2>
      </div>

      {/* Cabeçalhos da tabela */}
      <div
        className="grid"
        style={{
          backgroundColor: tableHeaderBgColor,
          color: tableTextColor,
          gridTemplateColumns: '30% 30% 40%',
        }}
      >
        <div className="py-3 pl-6 font-medium">
          {assetListTexts?.columns?.project ?? 'Projeto'}
        </div>
        <div className="py-3 font-medium text-center">
          {assetListTexts?.columns?.['unit-value'] ?? 'Valor unitário'}
        </div>
        <div className="py-3 pl-6 font-medium">
          {assetListTexts?.columns?.['total-value'] ?? 'Valor Total'}
        </div>
      </div>

      {/* Listagem dos ativos */}
      <div style={{ backgroundColor: tableBodyBgColor }}>
        {mockAssets.map((asset) => (
          <AssetCard
            key={asset.id}
            name={asset.name}
            symbol={asset.symbol}
            unitValue={asset.unitValue}
            totalValue={asset.totalValue}
            buyText={assetListTexts?.buttons?.buy ?? 'Comprar'}
            sellText={assetListTexts?.buttons?.sell ?? 'Vender'}
          />
        ))}
        <div className="border-t border-gray-300"></div>
      </div>
    </div>
  )
}
