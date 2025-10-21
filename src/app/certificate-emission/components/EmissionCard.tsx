'use client'

import { useState, useContext } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'
import { useAuth } from '@/contexts/AuthContext'
import { apiFetch } from '@/lib/api/fetcher'

interface EmissionCardProps {
  card: any
  userBalance: number
  onSuccess: () => void
}

export default function EmissionCard({ card, userBalance, onSuccess }: EmissionCardProps) {
  const { colors, texts, locale } = useContext(ConfigContext)
  const { user } = useAuth()
  
  const [quantity, setQuantity] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Cores dinâmicas do tema
  const accentColor = colors?.certificateEmission?.colors?.accent || '#08CEFF'
  const cardBg = colors?.certificateEmission?.background?.card || '#FFFFFF'
  const cardBorder = colors?.certificateEmission?.border?.card || '#E5E7EB'
  const inputBorder = colors?.certificateEmission?.border?.input || '#08CEFF'
  const labelColor = colors?.certificateEmission?.colors?.label || '#1F2937'
  const inputTextColor = colors?.certificateEmission?.colors?.['input-text'] || '#4B5563'
  const inputDisabledColor = colors?.certificateEmission?.colors?.['input-disabled'] || '#9CA3AF'
  const buttonBg = colors?.certificateEmission?.button?.['primary-bg'] || '#08CEFF'
  const buttonText = colors?.certificateEmission?.button?.['primary-text'] || '#FFFFFF'
  const successBg = colors?.certificateEmission?.colors?.['success-bg'] || '#F0FDF4'
  const successBorder = colors?.certificateEmission?.colors?.['success-border'] || '#22C55E'
  const successText = colors?.certificateEmission?.colors?.['success-text'] || '#16A34A'
  const errorBorder = colors?.certificateEmission?.colors?.['error-border'] || '#FCA5A5'
  const errorText = colors?.certificateEmission?.colors?.['error-text'] || '#DC2626'
  const maxQuantity = Math.min(userBalance, 1500)

  // Evita erro de indexação tipada em objetos gerados a partir de JSON
  const ceTexts = texts?.certificateEmission as Record<string, string> | undefined
  const t = (key: string, fallback: string) => ceTexts?.[key] ?? fallback

  const handleEmit = async () => {
    if (quantity <= 0 || quantity > maxQuantity) {
      setError(
        t(
          'error-message',
          'A emissão do seu certificado não foi concluída. Verifique se há saldo suficiente em tokens e tente novamente',
        ),
      )
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Chamar API para emitir certificado
      await apiFetch('/api/certificates/emit', {
        method: 'POST',
        body: JSON.stringify({
          cardId: card.id,
          quantity,
          userId: user?.id,
        }),
      })

      setSuccess(true)
      setTimeout(() => {
        onSuccess()
      }, 3000)
    } catch (err: any) {
      console.error('Erro ao emitir certificado:', err)
      setError(
        t(
          'error-message',
          'A emissão do seu certificado não foi concluída. Verifique se há saldo suficiente em tokens e tente novamente',
        ),
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      className="rounded-2xl shadow-xl border p-8 md:p-12 max-w-2xl mx-auto"
      style={{ 
        backgroundColor: cardBg,
        borderColor: cardBorder
      }}
    >
      {/* Token a ser utilizado */}
      <div className="mb-8">
        <label className="block text-lg font-bold mb-4" style={{ color: labelColor }}>
          {t('token-label', 'Token a ser utilizado')}
        </label>
        <div className="relative">
          <input
            type="text"
            value={card.name}
            disabled
            className="w-full px-6 py-4 border-3 rounded-2xl text-lg font-medium focus:outline-none"
            style={{ 
              borderColor: inputBorder,
              borderWidth: '3px',
              backgroundColor: cardBg,
              color: inputDisabledColor
            }}
          />
          
          {/* Mensagem de Sucesso */}
          {success && (
            <div className="absolute left-full ml-4 top-0 bottom-0 flex items-center">
              <div 
                className="flex items-start gap-3 p-4 rounded-lg border-l-4 shadow-lg min-w-[300px]"
                style={{ 
                  backgroundColor: successBg,
                  borderColor: successBorder
                }}
              >
                <div 
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5"
                  style={{ backgroundColor: `${successBorder}20` }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: successText }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {t(
                      'success-message',
                      'Seu certificado foi emitido. Acompanhe o andamento da análise e verifique regularmente seu e-mail para futuras atualizações.',
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Mensagem de Erro */}
          {error && (
            <div className="absolute left-full ml-4 top-0 bottom-0 flex items-center">
              <div 
                className="flex items-start gap-3 p-4 rounded-lg border-l-4 shadow-lg min-w-[300px]"
                style={{ 
                  backgroundColor: `${errorBorder}20`,
                  borderColor: errorBorder
                }}
              >
                <div 
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5"
                  style={{ backgroundColor: `${errorBorder}40` }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: errorText }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quantidade de tokens compensados */}
      <div className="mb-10">
        <label className="block text-lg font-bold mb-4" style={{ color: labelColor }}>
          {t('quantity-label', 'Quantidade de tokens compensados')}
        </label>
        <div className="relative">
          <select
            value={quantity}
            onChange={(e) => {
              setQuantity(Number(e.target.value))
              setError(null)
              setSuccess(false)
            }}
            className="w-full px-6 py-4 border-3 rounded-2xl text-lg font-medium focus:outline-none appearance-none cursor-pointer"
            style={{ 
              borderColor: inputBorder,
              borderWidth: '3px',
              backgroundColor: cardBg,
              color: inputTextColor
            }}
            disabled={loading || success}
          >
            <option value={0}>{t('quantity-placeholder', '0-1500')}</option>
            {Array.from({ length: Math.min(15, Math.ceil(maxQuantity / 100)) }, (_, i) => {
              const value = (i + 1) * 100
              if (value <= maxQuantity) {
                return (
                  <option key={value} value={value}>
                    {value.toLocaleString(locale || 'pt-BR')}
                  </option>
                )
              }
              return null
            })}
          </select>
          {/* Ícone de seta */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Botão de emissão */}
      <button
        type="button"
        onClick={handleEmit}
        disabled={loading || success || quantity <= 0}
        className="w-full py-5 rounded-2xl text-xl font-bold transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl"
        style={{
          backgroundColor: buttonBg,
          color: buttonText
        }}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {t('button-emitting', 'Emitindo...')}
          </>
        ) : success ? (
          <>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {t('button-emitted', 'Certificado Emitido')}
          </>
        ) : (
          <>
            {t('button-emit', 'Emitir certificado')}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
            </svg>
          </>
        )}
      </button>
    </div>
  )
}
