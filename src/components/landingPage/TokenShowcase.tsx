'use client'

import { useContext, useEffect, useState } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'
import TokenCard from '@/components/common/TokenCard'
import { getAllCards, getPublicCards, Card as APICard } from '@/lib/api/cards'


export default function TokenShowcase() {
  const { colors, texts } = useContext(ConfigContext)
  const [cards, setCards] = useState<APICard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true)
        console.log('TokenShowcase: Iniciando busca de cards públicos da API...')
        
        // Primeiro tenta buscar cards públicos (não requer autenticação)
        const response = await getPublicCards()
        console.log('📡 TokenShowcase: Resposta da API pública recebida:', response)
        
        if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
          const validCards = response.data.slice(0, 3) // Limitamos a 3 cards para a home
          console.log('TokenShowcase: Cards válidos encontrados:', validCards.length)
          setCards(validCards)
          setError(null)
        } else {
          console.log('TokenShowcase: API não retornou dados válidos')
          throw new Error('Nenhum token foi encontrado na API')
        }
      } catch (error) {
        console.error('TokenShowcase: Erro ao buscar cards da API:', error)
        setError(error instanceof Error ? error.message : 'Erro desconhecido ao carregar tokens')
        setCards([])
      } finally {
        setLoading(false)
      }
    }

    fetchCards()
  }, [])

  if (error) {
    return (
      <section
        className="py-20 px-4 md:px-8"
        style={{
          backgroundColor: colors?.background['background-primary'] ?? '#F2FCFF',
        }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <div
            className="w-32 h-1.5 rounded-full mx-auto mb-10"
            style={{
              backgroundColor: colors?.border['border-primary'] ?? '#08CEFF',
            }}
          />
          <h2
            className="text-4xl md:text-5xl lg:text-4xl font-bold mb-6 leading-tight"
            style={{
              color: colors?.colors?.['color-primary'] ?? '#202020',
            }}
          >
            Erro ao Carregar Tokens
          </h2>
          <p className="text-gray-600 text-lg mb-4">
            Não foi possível carregar os dados reais da API.
          </p>
          <p className="text-red-500 text-sm">
            {error}
          </p>
        </div>
      </section>
    )
  }

  if (loading) {
    return (
      <section
        className="py-20 px-4 md:px-8"
        style={{
          backgroundColor: colors?.background['background-primary'] ?? '#F2FCFF',
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div
              className="w-32 h-1.5 rounded-full mx-auto mb-10"
              style={{
                backgroundColor: colors?.border['border-primary'] ?? '#08CEFF',
              }}
            />
            <h2
              className="text-4xl md:text-5xl lg:text-4xl font-bold mb-6 leading-tight"
              style={{
                color: colors?.colors?.['color-primary'] ?? '#202020',
              }}
            >
              {texts?.['landing-page']?.tokens?.title || 'Descubra hoje as melhores oportunidades de tokens digitais'}
            </h2>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 lg:gap-10 mb-16">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-full sm:w-[calc(50%-16px)] lg:w-[calc(33.333%-27px)] max-w-sm animate-pulse"
              >
                <div className="bg-gray-200 rounded-xl h-96"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      className="py-20 px-4 md:px-8"
      style={{
        backgroundColor: colors?.background['background-primary'] ?? '#F2FCFF',
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Título da Seção */}
        <div className="text-center mb-16">
          <div
            className="w-32 h-1.5 rounded-full mx-auto mb-10"
            style={{
              backgroundColor: colors?.border['border-primary'] ?? '#08CEFF',
            }}
          />
          <h2
            className="text-4xl md:text-5xl lg:text-4xl font-bold mb-6 leading-tight"
            style={{
              color: colors?.colors?.['color-primary'] ?? '#202020',
            }}
          >
            {texts?.['landing-page']?.tokens?.title || 'Descubra hoje as melhores oportunidades de tokens digitais'}
          </h2>
        </div>

        {/* Grid de Cards com TokenCard */}
        <div className="flex flex-wrap justify-center gap-8 lg:gap-10 mb-16">
          {cards.map((card) => (
            <div
              key={card.id}
              className="w-full sm:w-[calc(50%-16px)] lg:w-[calc(33.333%-27px)] max-w-sm"
            >
              <TokenCard
                card={card}
                price={card.CardBlockchainData?.tokenPrice || undefined}
                launchDate={card.launchDate ? new Date(card.launchDate).toLocaleDateString('pt-BR') : undefined}
                identifierCode={card.ticker || undefined}
                labels={[
                  { name: 'TOKEN' },
                  { name: 'BLOCKCHAIN' },
                  { name: 'WEB3' }
                ]}
                sold={516820}
                total={1000000}
                showActions={false}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
