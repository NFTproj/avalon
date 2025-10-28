'use client'

import { useState, useContext } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'
import CustomInput from '@/components/core/Inputs/CustomInput'
import CustomButton from '@/components/core/Buttons/CustomButton'
import { X } from 'lucide-react'

interface ResetPasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ResetPasswordModal({ isOpen, onClose }: ResetPasswordModalProps) {
  const { colors, texts } = useContext(ConfigContext)
  const resetTexts = (texts as any)?.['reset-password']
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar e-mail de recuperação')
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || resetTexts?.errors?.generic || 'Erro ao enviar e-mail de recuperação')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setEmail('')
    setError(null)
    setSuccess(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] max-w-md w-full p-6 relative border-2 border-gray-300">
        {/* Botão fechar */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        {success ? (
          /* Tela de sucesso */
          <div className="text-center py-4">
            <div 
              className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{ backgroundColor: colors?.colors?.['color-primary'] + '20' }}
            >
              <svg 
                className="w-8 h-8" 
                style={{ color: colors?.colors?.['color-primary'] }}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {resetTexts?.success?.title || 'E-mail Enviado!'}
            </h2>
            
            <p className="text-gray-600 mb-6">
              {resetTexts?.success?.message?.replace('{email}', email) || 
               `Enviamos um link de recuperação para ${email}. Verifique sua caixa de entrada e spam.`}
            </p>
            
            <CustomButton
              text={resetTexts?.buttons?.close || 'Fechar'}
              onClick={handleClose}
              className="w-full"
              borderColor={colors?.border?.['border-primary']}
              textColor={colors?.colors?.['color-primary']}
            />
          </div>
        ) : (
          /* Formulário */
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {resetTexts?.title || 'Recuperar Senha'}
            </h2>
            
            <p className="text-gray-600 mb-6">
              {resetTexts?.description || 'Digite seu e-mail para receber um link de recuperação de senha.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {resetTexts?.['email-label'] || 'E-mail'}
                </label>
                <CustomInput
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={resetTexts?.['email-placeholder'] || 'seu@email.com'}
                  required
                  className="w-full border-gray-300 rounded-xl focus:outline-none focus:ring-2"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  {resetTexts?.buttons?.cancel || 'Cancelar'}
                </button>
                
                <CustomButton
                  text={loading ? (resetTexts?.buttons?.sending || 'Enviando...') : (resetTexts?.buttons?.send || 'Enviar Link')}
                  type="submit"
                  disabled={loading || !email}
                  className="flex-1"
                  borderColor={colors?.border?.['border-primary']}
                  textColor={colors?.colors?.['color-primary']}
                />
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}