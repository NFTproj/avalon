import React, { useContext, useEffect, useState, useMemo } from 'react'
import TokenCard from '@/components/common/TokenCard'
import { ConfigContext } from '@/contexts/ConfigContext'
import { useAuth } from '@/contexts/AuthContext'
import { useUserTokenBalances } from '@/hooks/useUserTokenBalances'
import { getAllCards, Card as ApiCard } from '@/lib/api/cards'
import { Card as LocalCard } from '@/types/card'
import { useRouter } from 'next/navigation'

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
  const { user } = useAuth()
  const { config } = useContext(ConfigContext)
  const router = useRouter()
  
  const [cards, setCards] = useState<ApiCard[]>([])
  const [loading, setLoading] = useState(true)

  // Buscar cards da API
  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true)
        const response = await getAllCards()
        setCards(response.data || [])
      } catch (error) {
        setCards([])
      } finally {
        setLoading(false)
      }
    }

    fetchCards()
  }, [])

  // Preparar dados para o hook de balanços (apenas cards com blockchain data válido)
  const cardsForHook = useMemo(() => {
    return cards
      .filter(card => card.CardBlockchainData?.tokenAddress)
      .map((card): LocalCard => {
        const blockchainData = card.CardBlockchainData!

        return {
          id: card.id,
          name: card.name,
          status: (card.status as "ACTIVE" | "INACTIVE") || 'ACTIVE',
          CardBlockchainData: {
            tokenAddress: blockchainData.tokenAddress as `0x${string}`,
            tokenNetwork: blockchainData.tokenNetwork || 'polygon',
            tokenChainId: blockchainData.tokenChainId || 137,
            tokenPrice: String(blockchainData.tokenPrice || '1000000'),
          }
        }
      })
  }, [cards])

  // Usar o hook real para buscar saldos de tokens
  const { assets } = useUserTokenBalances(cardsForHook, user?.walletAddress as `0x${string}` | undefined)

  // Processar dados dos cards
  const processedCards = useMemo(() => {
    return cards.map(card => {
      // Verificar se tem dados blockchain válidos
      const blockchainData = card.CardBlockchainData
      const hasValidToken = blockchainData && blockchainData.tokenAddress

      // Encontrar o asset correspondente baseado no ID do card
      const asset = hasValidToken ? assets.find(a => a.card.id === card.id) : null
      
      // Calcular balanço de tokens
      const tokenBalance = asset 
        ? Number(asset.balanceRaw) / Math.pow(10, Number(asset.decimals)) 
        : 0
      
      // Dados do progresso de venda - CORREÇÃO: usar depositedSupply - purchasedQuantity
      const purchasedTokens = blockchainData?.purchasedQuantity 
        ? Number(blockchainData.purchasedQuantity)
        : 0
      const depositedTokens = blockchainData?.depositedSupply
        ? Number(blockchainData.depositedSupply)
        : 0

      // Tokens disponíveis = depositedSupply - purchasedQuantity
      const availableTokens = depositedTokens - purchasedTokens

      // Preparar dados de preço
      const tokenPrice = blockchainData?.tokenPrice 
        ? parseFloat(blockchainData.tokenPrice) / 1_000_000 // Converter formato web3 para USD
        : 15.00 // preço padrão

      // Preparar tags/labels com cores
      const labelMap: { [key: string]: string } = {
        'CPR': '#8B7355',
        'CARBONO': '#00D4AA',
        'VERDE': '#4CAF50',
        'EM DESENVOLVIMENTO': '#FF9800'
      }

      const cardLabels = (card.tags || []).map((tag: string) => ({
        name: tag.toUpperCase(),
        color: labelMap[tag.toUpperCase()] || undefined
      }))

      return {
          id: card.id,
          name: card.name,
        image: card.logoUrl, // Usar logoUrl da API
          userBalance: tokenBalance,
          profitability: 0, // removendo dados mockados
        lastPayDate: card.launchDate || new Date().toISOString(),
        sold: purchasedTokens,
        total: depositedTokens,
        availableTokens: availableTokens, // Adicionar tokens disponíveis
        unitValue: tokenPrice,
          totalValue: tokenBalance,
          labels: cardLabels,
          hasValidToken
        }
    })
  }, [cards, assets])

  // Aplicar limite de cards se especificado
  const displayCards = maxCards ? processedCards.slice(0, maxCards) : processedCards

  const handleBuyToken = (cardId: string) => {
    router.push(`/tokens/${cardId}`)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className={`w-full ${className}`}>
      {showTitle && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Meus Tokens</h2>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayCards.map((processedCard) => {
          const { 
            id, name, image, userBalance, profitability, 
            sold, total, availableTokens, unitValue, totalValue, labels, hasValidToken 
          } = processedCard

          // Encontrar o card original para passar para o TokenCard
          const originalCard = cards.find(c => c.id === id)!

          return (
            <TokenCard
              key={id}
              card={originalCard}
              price={hasValidToken && unitValue > 0 ? `$ ${unitValue.toFixed(2)}` : undefined}
              launchDate={originalCard.launchDate ? new Date(originalCard.launchDate).toLocaleDateString('pt-BR') : undefined}
              tokensAvailable={hasValidToken ? `${availableTokens.toLocaleString('pt-BR')}` : 'Aguardando deploy'}
              identifierCode={originalCard.ticker || originalCard.id.substring(0, 8).toUpperCase()}
              labels={labels}
              sold={sold}
              total={total}
              unitValue={unitValue}
              totalValue={totalValue}
              userBalance={userBalance}
              profitability={profitability}
              onBuy={() => handleBuyToken(originalCard.id)}
            />
          )
        })}
      </div>
      
      {displayCards.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Nenhum token encontrado</p>
        </div>
      )}
    </div>
  )
}