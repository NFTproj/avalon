'use client'

import { useContext, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, X } from 'lucide-react'
import ProgressBar from '@/components/common/ProgressBar'
import { ConfigContext } from '@/contexts/ConfigContext'
import { useAuth } from '@/contexts/AuthContext'

type Props = {
  tokenInfo?: any
  formattedPrice: string
  sold: number
  total: number
  minInvestmentBRL?: string
  /** id do card/token para montar a rota de compra */
  tokenId: string | number
}

export default function SidebarActions({
  tokenInfo,
  formattedPrice,
  sold,
  total,
  minInvestmentBRL = 'R$ 100',
  tokenId,
}: Props) {
  const { colors } = useContext(ConfigContext)
  const { user, loading } = useAuth()
  const router = useRouter()
  const [showLoginModal, setShowLoginModal] = useState(false)

  const handleBuy = useCallback(() => {
    if (!user && !loading) {
      setShowLoginModal(true)
      return
    }
    router.push(`/buy-tokens?token=${encodeURIComponent(String(tokenId))}`)
  }, [user, loading, router, tokenId])

  const handleGoToLogin = useCallback(() => {
    router.push('/login')
  }, [router])

  const handleCloseModal = useCallback(() => {
    setShowLoginModal(false)
  }, [])

  // Verifica se há tokens vendidos para mostrar a barra de progresso
  const hasTokensSold = sold > 0

  return (
    <>
      <div className="w-full lg:w-80 xl:w-96">
        <div className="lg:sticky lg:top-24">
          <div
            className="rounded-xl shadow-lg p-6 flex flex-col gap-3"
            style={{
              backgroundColor: colors?.token['background'],
              border: '2px solid transparent',
              borderImage: `linear-gradient(90deg, ${colors?.border['border-primary']}, ${colors?.dashboard?.colors.highlight}) 1`,
            }}
          >
            <h3
              className="text-lg font-bold mb-4"
              style={{ color: colors?.colors['color-primary'] }}
            >
              {tokenInfo?.['sold']}
            </h3>

            {hasTokensSold && <ProgressBar sold={sold} total={total} />}

            <div className={`flex justify-between items-center ${hasTokensSold ? 'mt-4' : 'mt-0'}`}>
              <span className="text-sm font-medium" style={{ color: colors?.colors['color-tertiary'] }}>
                {tokenInfo?.['token-price']}
              </span>
              <span className="font-bold text-sm" style={{ color: colors?.colors['color-primary'] }}>
                {formattedPrice}
              </span>
            </div>

            <div className="flex justify-between items-center mt-2">
              <span className="text-sm font-medium" style={{ color: colors?.colors['color-tertiary'] }}>
                {tokenInfo?.['minimum-investment']}
              </span>
              <span className="font-bold text-sm" style={{ color: colors?.colors['color-primary'] }}>
                {minInvestmentBRL}
              </span>
            </div>

            <button
              type="button"
              onClick={handleBuy}
              disabled={loading}
              className={`mt-4 w-full py-2 rounded-lg transition
                          ${loading ? 'opacity-80' : 'hover:opacity-90 active:scale-[0.99]'}
                          `}
              style={{
                backgroundColor: colors?.colors['color-primary'],
                color: '#FFFFFF',
                cursor: loading ? 'wait' : 'pointer',
              }}
              aria-busy={loading}
            >
              {loading ? (tokenInfo?.['processing'] ?? 'Processando...') : tokenInfo?.['buy']}
            </button>
          </div>

          <div className="flex justify-center gap-2 text-xs text-gray-500 mt-2">
            <div className="flex items-start gap-2 w-4/5">
              <AlertCircle className="w-6 h-6 flex-shrink-0 mt-1" />
              <span className="text-sm">{tokenInfo?.['disclaimer']}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Login Necessário */}
      {showLoginModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={handleCloseModal}
        >
          <div 
            className="relative rounded-xl shadow-2xl p-8 max-w-md w-full mx-4"
            style={{ backgroundColor: colors?.token['background'] }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-200 transition"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" style={{ color: colors?.colors['color-tertiary'] }} />
            </button>

            <div className="flex flex-col items-center text-center gap-4">
              <AlertCircle 
                className="w-16 h-16" 
                style={{ color: colors?.colors['color-primary'] }} 
              />
              
              <h3 
                className="text-xl font-bold"
                style={{ color: colors?.colors['color-primary'] }}
              >
                {tokenInfo?.['login-required-title'] ?? 'Login Necessário'}
              </h3>
              
              <p 
                className="text-sm"
                style={{ color: colors?.colors['color-tertiary'] }}
              >
                {tokenInfo?.['login-required-message'] ?? 'Você precisa estar logado para comprar tokens. Faça login para continuar.'}
              </p>

              <div className="flex gap-3 w-full mt-4">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 py-2 px-4 rounded-lg border transition hover:opacity-80"
                  style={{
                    borderColor: colors?.colors['color-primary'],
                    color: colors?.colors['color-primary'],
                  }}
                >
                  {tokenInfo?.['cancel'] ?? 'Cancelar'}
                </button>
                
                <button
                  onClick={handleGoToLogin}
                  className="flex-1 py-2 px-4 rounded-lg transition hover:opacity-90"
                  style={{
                    backgroundColor: colors?.colors['color-primary'],
                    color: '#FFFFFF',
                  }}
                >
                  {tokenInfo?.['go-to-login'] ?? 'Ir para Login'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
