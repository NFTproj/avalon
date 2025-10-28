'use client'

import { useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ConfigContext } from '@/contexts/ConfigContext'
import { useAuth } from '@/contexts/AuthContext'
import { apiFetch } from '@/lib/api/fetcher'
import Image from 'next/image'

interface TokenSelectorProps {
  onTokenSelect: (cardId: string) => void
}

export default function TokenSelector({ onTokenSelect }: TokenSelectorProps) {
  const { colors, texts } = useContext(ConfigContext)
  const { user } = useAuth()
  const router = useRouter()
  const [cards, setCards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await apiFetch<any>('/api/cards')
        setCards(response.data || [])
      } catch (error) {
        console.error('Erro ao buscar tokens:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCards()
  }, [])

  // Filtrar apenas tokens que o usuário possui
  const userTokens = cards.filter(card => {
    const balance = user?.balances?.find((b: any) => b.id === card.id)
    return balance && balance.balance > 0
  })

  const titleColor = colors?.certificateEmission?.colors?.title || '#1F2937'
  const cardBg = colors?.certificateEmission?.background?.card || '#FFFFFF'
  const cardBorder = colors?.certificateEmission?.border?.card || '#E5E7EB'

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Carregando seus tokens...</p>
      </div>
    )
  }

  if (userTokens.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Nenhum token encontrado
        </h3>
        <p className="text-gray-600 mb-4">
          Você precisa possuir tokens para emitir certificados
        </p>
        <button
          onClick={() => router.push('/tokens')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Comprar Tokens
        </button>
      </div>
    )
  }

  return (
    <div>
      <h2 
        className="text-xl font-semibold mb-6 text-center"
        style={{ color: titleColor }}
      >
        Selecione o token para emitir certificado
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {userTokens.map((card) => {
          const balance = user?.balances?.find((b: any) => b.id === card.id)
          const userBalance = balance?.balance || 0

          return (
            <button
              key={card.id}
              onClick={() => onTokenSelect(card.id)}
              className="p-4 rounded-xl border-2 hover:border-blue-500 transition-all duration-200 hover:shadow-md text-left"
              style={{ 
                backgroundColor: cardBg,
                borderColor: cardBorder
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {card.logoUrl ? (
                    <Image 
                      src={card.logoUrl} 
                      alt={card.name} 
                      width={48} 
                      height={48} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{card.name}</h3>
                  <p className="text-sm text-gray-600">
                    Saldo: {userBalance.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} tokens
                  </p>
                </div>
              </div>
              
              {card.tags && card.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {card.tags.slice(0, 2).map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full"
                    >
                      {tag.toUpperCase()}
                    </span>
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}