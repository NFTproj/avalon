'use client'

import { useContext, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ConfigContext } from '@/contexts/ConfigContext'
import { AlertTriangle } from 'lucide-react'

interface CloseAccountSectionProps {
  userEmail: string
}

export default function CloseAccountSection({ userEmail }: CloseAccountSectionProps) {
  const { colors, texts } = useContext(ConfigContext)
  const router = useRouter()
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const profileTexts = texts?.profile?.['close-account']
  const accentColor = colors?.border?.['border-primary'] || '#08CEFF'
  const textColor = colors?.colors?.['color-primary'] || '#1F2937'
  const secondaryTextColor = colors?.colors?.['color-secondary'] || '#6B7280'
  const bgColor = colors?.background?.['background-primary'] || '#FFFFFF'

  const handleCloseAccount = async () => {
    setError('')
    setLoading(true)
    
    try {
      // TODO: Implementar API de encerramento de conta
      // const response = await apiFetch('/api/user/close-account', {
      //   method: 'POST',
      //   body: JSON.stringify({ reason })
      // })
      
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Redirecionar para home após sucesso
      alert(profileTexts?.['success-message'] || 'Conta encerrada com sucesso')
      router.push('/')
    } catch (err) {
      setError(profileTexts?.['error-message'] || 'Erro ao encerrar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 md:p-8">
      {/* Título */}
      <h2 className="text-2xl md:text-3xl font-bold mb-6" style={{ color: textColor }}>
        {profileTexts?.title || 'Encerrar conta'}
      </h2>

      {/* Warning Box */}
      <div 
        className="border rounded-lg p-4 mb-6 flex gap-3"
        style={{ 
          backgroundColor: '#FEF2F2',
          borderColor: '#FCA5A5'
        }}
      >
        <AlertTriangle size={20} className="flex-shrink-0 text-red-600 mt-0.5" />
        <div>
          <h3 className="font-bold text-red-600 mb-1 text-sm">
            {profileTexts?.['warning-title'] || 'Atenção'}
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            {profileTexts?.['warning-message'] || 
              'Encerrar sua é uma ação permanente.Todos seus dados serão excluídos e não poderão ser recuperados.Certifique-se de que deseja realmente prosseguir com a exclusão.'}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="mb-6">
        <label 
          htmlFor="reason-input" 
          className="block text-sm font-medium mb-2"
          style={{ color: textColor }}
        >
          {profileTexts?.['email-label'] || 'Motivo da exclusão(opcional)'}
        </label>
        <textarea
          id="reason-input"
          value={reason}
          onChange={(e) => {
            setReason(e.target.value)
            setError('')
          }}
          placeholder={profileTexts?.['email-placeholder'] || 'Nos diga por que está encerrando sua conta'}
          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none"
          rows={4}
          style={{
            borderColor: error ? '#DC2626' : '#D1D5DB',
            backgroundColor: '#FFFFFF',
          }}
          disabled={loading}
        />
        {error && (
          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-start">
        <button
          onClick={() => setReason('')}
          disabled={loading}
          className="px-6 py-2 rounded-lg border font-medium transition-all hover:bg-gray-50 disabled:opacity-50"
          style={{
            borderColor: '#D1D5DB',
            color: secondaryTextColor,
            backgroundColor: '#FFFFFF'
          }}
        >
          {profileTexts?.['button-cancel'] || 'Cancelar'}
        </button>
        <button
          onClick={handleCloseAccount}
          disabled={loading}
          className="px-6 py-2 rounded-lg font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
          style={{
            backgroundColor: '#DC2626',
          }}
        >
          {loading 
            ? 'Processando...' 
            : profileTexts?.['button-confirm'] || 'Encerrar conta'}
        </button>
      </div>
    </div>
  )
}
