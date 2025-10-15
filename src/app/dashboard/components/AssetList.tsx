import React, { useContext, useEffect, useState, useMemo } from 'react'
import AssetCard from './AssetCard'
import { ConfigContext } from '@/contexts/ConfigContext'
import { useAuth } from '@/contexts/AuthContext'
import { useUserTokenBalances } from '@/hooks/useUserTokenBalances'
import { getAllCards } from '@/lib/api/cards'
import { Card } from '@/types/card'

// Mapear tipos da API para tipos internos
interface ApiCard {
  id: string
  name: string
  description: string
  image: string
  status: string
  clientId: string
  cardBlockchainData?: {
    tokenName?: string
    tokenSymbol?: string
    tokenAddress?: string
    network?: string
  }
}

// Dados de exemplo para quando a API não estiver funcionando
const fallbackCards: Card[] = [
  {
    id: '1',
    name: 'Token de Energia Limpa',
    status: 'ACTIVE',
    CardBlockchainData: {
      tokenAddress: '0x1234567890123456789012345678901234567890' as `0x${string}`,
      tokenNetwork: 'polygon',
      tokenChainId: 137,
      tokenPrice: '1.00',
    }
  },
  {
    id: '2',
    name: 'Token de Energia Solar',
    status: 'ACTIVE',
    CardBlockchainData: {
      tokenAddress: '0x2345678901234567890123456789012345678901' as `0x${string}`,
      tokenNetwork: 'polygon',
      tokenChainId: 137,
      tokenPrice: '2.50',
    }
  }
]

// Converter API Card para Card interno com validação
const convertApiCardToCard = (apiCard: ApiCard): Card | null => {
  // Validar se tem dados blockchain
  if (!apiCard.cardBlockchainData?.tokenAddress) {
    console.warn(`Card ${apiCard.id} não tem tokenAddress válido:`, apiCard.cardBlockchainData)
    return null
  }

  return {
    id: apiCard.id,
    name: apiCard.name,
    status: apiCard.status as 'ACTIVE' | 'INACTIVE',
    CardBlockchainData: {
      tokenAddress: apiCard.cardBlockchainData.tokenAddress as `0x${string}`,
      tokenNetwork: apiCard.cardBlockchainData.network || 'polygon',
      tokenChainId: getChainIdFromNetwork(apiCard.cardBlockchainData.network || 'polygon'),
      tokenPrice: '1.00', // Valor padrão, pode ser ajustado
    }
  }
}

// Mapear rede para Chain ID
const getChainIdFromNetwork = (network: string): number => {
  switch (network.toLowerCase()) {
    case 'ethereum':
    case 'eth':
      return 1
    case 'polygon':
    case 'matic':
      return 137
    case 'arbitrum':
      return 42161
    case 'sepolia':
      return 11155111
    default:
      return 137 // Polygon como padrão
  }
}

export default function AssetList() {
  const { texts, colors } = useContext(ConfigContext)
  const { user } = useAuth()
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usingFallback, setUsingFallback] = useState(false)

  // Buscar dados reais dos cards - EXECUTAR APENAS UMA VEZ
  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true)
        setError(null)
        setUsingFallback(false)
        
        console.log('🔍 Iniciando busca de cards da API...')
        const response = await getAllCards()
        console.log('📡 API Response completa:', response)
        
        if (response.data && Array.isArray(response.data)) {
          console.log('✅ Dados da API são um array válido')
          
          // Converter cards da API para o formato interno, filtrando inválidos
          const convertedCards = response.data
            .map(convertApiCardToCard)
            .filter((card): card is Card => card !== null)
          
          console.log('🔄 Cards convertidos:', convertedCards)
          
          if (convertedCards.length > 0) {
            setCards(convertedCards)
            console.log('🎯 Cards definidos com sucesso')
          } else {
            console.warn('⚠️ Nenhum card válido da API, usando dados de exemplo')
            setCards(fallbackCards)
            setUsingFallback(true)
          }
        } else {
          console.warn('⚠️ API não retornou dados válidos, usando dados de exemplo')
          setCards(fallbackCards)
          setUsingFallback(true)
        }
      } catch (error) {
        console.error('❌ Erro ao buscar cards da API, usando dados de exemplo:', error)
        setCards(fallbackCards)
        setUsingFallback(true)
        setError('API indisponível - mostrando dados de exemplo')
      } finally {
        setLoading(false)
      }
    }

    fetchCards()
  }, []) // SEMPRE VAZIO - executa apenas uma vez

  // Usar o hook real para buscar saldos de tokens
  const { assets, loading: balancesLoading } = useUserTokenBalances(
    cards,
    user?.walletAddress as `0x${string}` | undefined
  )

  // Calcular valor total
  const totalBalance = useMemo(() => {
    if (assets.length === 0) return 0
    return assets.reduce((sum, asset) => {
      const balance = Number(asset.balanceRaw) / Math.pow(10, asset.decimals)
      return sum + balance
    }, 0)
  }, [assets])

  const assetListTexts = texts?.dashboard?.['asset-list']
  const headerBgColor = colors?.dashboard?.background?.header ?? '#404040'
  const headerTextColor = colors?.dashboard?.colors?.text ?? '#FFFFFF'
  const highlightColor = colors?.dashboard?.colors?.highlight ?? '#00ffe1'
  const tableHeaderBgColor =
    colors?.dashboard?.background?.['table-header'] ?? '#f8f7e9'
  const tableBodyBgColor =
    colors?.dashboard?.background?.['table-body'] ?? '#fdfcf7'
  const tableTextColor = colors?.dashboard?.colors?.['table-text'] ?? '#404040'

  // Mostrar erro se houver
  if (error) {
    return (
      <div className="w-full mt-8 rounded-t-lg overflow-hidden">
        <div className="p-8 text-center">
          <div className="text-red-600 mb-2">⚠️ {error}</div>
          {usingFallback && (
            <p className="text-sm text-gray-500 mb-4">
              Mostrando dados de exemplo enquanto a API não está disponível
            </p>
          )}
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  if (loading || balancesLoading) {
    return (
      <div className="w-full mt-8 rounded-t-lg overflow-hidden">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando dados da carteira...</p>
        </div>
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="w-full mt-8 rounded-t-lg overflow-hidden">
        <div className="p-8 text-center">
          <p className="text-gray-600">Nenhum projeto encontrado</p>
          <p className="text-sm text-gray-500 mt-1">Entre em contato com o suporte</p>
        </div>
      </div>
    )
  }

  if (assets.length === 0) {
    const assetTexts = texts?.dashboard?.['asset-list'] as any
    return (
      <div className="w-full mt-8 rounded-t-lg overflow-hidden">
        <div className="p-8 text-center">
          <p className="text-gray-600">{assetTexts?.messages?.['no-tokens'] || 'Nenhum token encontrado na sua carteira'}</p>
          <p className="text-sm text-gray-500 mt-1">
            {usingFallback 
              ? (assetTexts?.messages?.['sample-data'] || 'Dados de exemplo não têm saldos reais')
              : (assetTexts?.messages?.['buy-to-start'] || 'Compre tokens para começar a investir')
            }
          </p>
        </div>
      </div>
    )
  }

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
        {totalBalance > 0 && (
          <p className="text-sm mt-1" style={{ color: headerTextColor }}>
            Valor total: R$ {totalBalance.toFixed(2)}
          </p>
        )}
        {usingFallback && (
          <p className="text-xs mt-1 text-yellow-300">
            ⚠️ Dados de exemplo - API indisponível
          </p>
        )}
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

      {/* Listagem dos ativos reais */}
      <div style={{ backgroundColor: tableBodyBgColor }}>
        {assets.map((asset, index) => {
          const balance = Number(asset.balanceRaw) / Math.pow(10, asset.decimals)
          const unitValue = parseFloat(asset.card?.CardBlockchainData?.tokenPrice || '1.00')
          const totalValue = balance * unitValue

          return (
            <AssetCard
              key={`${asset.card.id}-${index}`}
              name={asset.card.name || 'Token'}
              symbol={asset.symbol || 'TKN'}
              unitValue={unitValue}
              totalValue={totalValue}
              buyText={assetListTexts?.buttons?.buy ?? 'Comprar'}
              sellText={assetListTexts?.buttons?.sell ?? 'Vender'}
            />
          )
        })}
        <div className="border-t border-gray-300"></div>
      </div>
    </div>
  )
}
