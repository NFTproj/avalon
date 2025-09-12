import React, { useContext, useEffect, useState, useMemo } from 'react'
import TokenCard from '@/components/common/TokenCard'
import { ConfigContext } from '@/contexts/ConfigContext'
import { useAuth } from '@/contexts/AuthContext'
import { useUserTokenBalances } from '@/hooks/useUserTokenBalances'
import { getAllCards, Card as ApiCard } from '@/lib/api/cards'
import { Card as LocalCard } from '@/types/card'
import { useRouter } from 'next/navigation'
import { isValidCardForBlockchain, getChainIdFromNetwork } from '@/lib/utils/cardValidation'

interface TokenGridProps {
  showTitle?: boolean
  maxCards?: number
  className?: string
}

export default function TokenGrid({ 
  showTitle = true, 
  maxCards,
  className = ''
}: TokenGridProps) {
  const { texts, colors } = useContext(ConfigContext)
  const { user } = useAuth()
  const router = useRouter()
  const [cards, setCards] = useState<ApiCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Buscar dados reais dos cards
  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await getAllCards()
        
        if (response.data && Array.isArray(response.data)) {
          
          // Separar cards com e sem blockchain data
          const cardsWithToken = response.data.filter(isValidCardForBlockchain)
          const cardsWithoutToken = response.data.filter(card => !isValidCardForBlockchain(card) && card.name)
          
          
          // Usar todos os cards (com e sem token para exibição)
          const allCards = [...cardsWithToken, ...cardsWithoutToken]
          
          if (allCards.length > 0) {
            setCards(allCards)
          } else {
            setCards([])
            setError('Nenhum card disponível no momento')
          }
        } else {
          setCards([])
          setError('API não retornou dados válidos')
        }
      } catch (error) {
        setCards([])
        setError('Erro ao conectar com a API. Tente novamente.')
      } finally {
        setLoading(false)
      }
    }

    fetchCards()
  }, [])

  // Converter ApiCards para o formato esperado pelo hook (apenas cards com tokenAddress válido)
  const cardsForHook = useMemo(() => {
    if (!cards || cards.length === 0) return []
    
    return cards
      .filter(isValidCardForBlockchain)
      .map((apiCard): LocalCard => {
        const blockchainData = apiCard.CardBlockchainData!
        return {
          id: apiCard.id,
          name: apiCard.name,
          status: apiCard.status as 'ACTIVE' | 'INACTIVE',
          CardBlockchainData: {
            tokenAddress: blockchainData.tokenAddress as `0x${string}`,
            tokenNetwork: (blockchainData.tokenNetwork || 'polygon') as string,
            tokenChainId: blockchainData.tokenChainId || getChainIdFromNetwork(blockchainData.tokenNetwork),
            tokenPrice: String(blockchainData.tokenPrice || '1.00'),
          }
        }
      })
  }, [cards])

  // Usar o hook real para buscar saldos de tokens
  const { assets, loading: balancesLoading } = useUserTokenBalances(
    cardsForHook,
    user?.walletAddress as `0x${string}` | undefined
  )

  // Preparar cards para exibição
  const cardsToShow = useMemo(() => {
    if (!cards || cards.length === 0) return []
    
    let displayCards = cards
    
    if (maxCards) {
      displayCards = displayCards.slice(0, maxCards)
    }

    return displayCards.map(card => {
      // Verificar se o card tem tokenAddress válido
      const hasValidToken = isValidCardForBlockchain(card)
      
      // Encontrar o asset correspondente baseado no ID do card (apenas para cards válidos)
      const asset = hasValidToken ? assets.find(a => a.card.id === card.id) : null
      
      // Calcular balanço de tokens (apenas para cards com token válido)
      const tokenBalance = asset 
        ? Number(asset.balanceRaw) / Math.pow(10, Number(asset.decimals)) 
        : 0
      
      // Dados do progresso de venda (apenas se CardBlockchainData disponível)
      const soldTokens = card.CardBlockchainData?.purchasedQuantity 
        ? Number(card.CardBlockchainData.purchasedQuantity)
        : 0
      const totalSupply = card.CardBlockchainData?.initialSupply 
        ? Number(card.CardBlockchainData.initialSupply)
        : 1000000 // valor padrão quando não há dados
      
      // Preparar dados de preço
      const tokenPrice = card.CardBlockchainData?.tokenPrice 
        ? parseFloat(card.CardBlockchainData.tokenPrice)
        : 15.00 // preço padrão

      // Preparar tags/labels com cores
      const labelMap: { [key: string]: string } = {
        'CPR': '#8B7355',
        'CARBONO': '#00D4AA',
        'VERDE': '#4CAF50',
        'EM DESENVOLVIMENTO': '#FF9800'
      }

      const cardLabels = card.tags.map(tag => ({
        name: tag.toUpperCase(),
        color: labelMap[tag.toUpperCase()] || undefined
      }))

      // Adicionar label especial se não tem token válido
      if (!hasValidToken) {
        cardLabels.push({
          name: 'EM DESENVOLVIMENTO',
          color: '#FF9800'
        })
      }

      return {
        apiCard: card,
        unitValue: tokenPrice,
        totalValue: tokenBalance,
        userBalance: tokenBalance,
        profitability: 0, // removendo dados mockados
        lastPayDate: card.launchDate || new Date().toISOString(),
        sold: soldTokens,
        total: totalSupply,
        hasValidToken, // Flag para indicar se tem token válido
        labels: cardLabels
      }
    })
  }, [cards, assets, maxCards, balancesLoading])

  const headerTextColor = colors?.dashboard?.colors?.text ?? '#FFFFFF'
  const highlightColor = colors?.dashboard?.colors?.highlight ?? '#00ffe1'

  const handleCardClick = (cardId: string) => {
    router.push(`/tokens/${cardId}`)
  }

  const handleBuyToken = (cardId: string) => {
    // Implementar lógica de compra
  }

  const handleSellToken = (cardId: string) => {
    // Implementar lógica de venda
  }

  if (loading || balancesLoading) {
    return (
      <div className={`w-full ${className}`}>
        {showTitle && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold" style={{ color: headerTextColor }}>
              Tokens Disponíveis
            </h2>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gray-300 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-3 bg-gray-300 rounded"></div>
                <div className="h-3 bg-gray-300 rounded w-3/4"></div>
              </div>
              <div className="flex gap-3">
                <div className="flex-1 h-8 bg-gray-300 rounded"></div>
                <div className="flex-1 h-8 bg-gray-300 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`w-full ${className}`}>
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <div className="text-red-600 mb-2">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  if (cardsToShow.length === 0) {
    return (
      <div className={`w-full ${className}`}>
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <p className="text-gray-600">Nenhum token encontrado</p>
          <p className="text-sm text-gray-500 mt-1">
            Entre em contato com o suporte para mais informações
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full ${className}`}>
      {showTitle && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: headerTextColor }}>
            Tokens Disponíveis
            <span style={{ color: highlightColor }}>
              {texts?.dashboard?.['asset-list']?.highlight ?? 'Slab'}
            </span>
          </h2>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cardsToShow.map(({ apiCard, unitValue, totalValue, userBalance, profitability, lastPayDate, sold, total, hasValidToken, labels }) => (
          <TokenCard
            key={apiCard.id}
            card={apiCard}
            unitValue={unitValue}
            totalValue={totalValue}
            userBalance={userBalance}
            profitability={profitability}
            launchDate={apiCard.launchDate ? new Date(apiCard.launchDate).toLocaleDateString('pt-BR') : undefined}
            sold={sold}
            total={total}
            price={hasValidToken && unitValue > 0 ? `$ ${unitValue.toFixed(2)}` : undefined}
            tokensAvailable={hasValidToken ? `${(total - sold).toLocaleString('pt-BR')}` : 'Aguardando deploy'}
            identifierCode={apiCard.ticker || apiCard.id.substring(0, 8).toUpperCase()}
            labels={labels}
            onBuy={() => handleBuyToken(apiCard.id)}
            onSell={userBalance > 0 ? () => handleSellToken(apiCard.id) : undefined}
            onClick={() => handleCardClick(apiCard.id)}
            buyText={texts?.dashboard?.['asset-list']?.buttons?.buy ?? 'Comprar'}
            sellText={texts?.dashboard?.['asset-list']?.buttons?.sell ?? 'Vender'}
            showActions={true}
          />
        ))}
      </div>
    </div>
  )
}