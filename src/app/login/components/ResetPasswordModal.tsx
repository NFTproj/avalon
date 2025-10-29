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
  const [otpCode, setOtpCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'email' | 'newPassword'>('email')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleEmailSubmit = async (e: React.FormEvent) => {
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

      // Avança para o próximo passo
      setStep('newPassword')
    } catch (err: any) {
      setError(err.message || resetTexts?.errors?.generic || 'Erro ao enviar e-mail de recuperação')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validar código OTP
    if (!otpCode || otpCode.length < 6) {
      setError(resetTexts?.errors?.['invalid-otp'] || 'Código deve ter pelo menos 6 caracteres')
      return
    }

    // Validar se as senhas conferem
    if (newPassword !== confirmPassword) {
      setError(resetTexts?.errors?.['passwords-dont-match'] || 'As senhas não conferem')
      return
    }

    // Validar tamanho mínimo da senha
    if (newPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/verify-reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          otpCode,
          newPassword 
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao alterar a senha')
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Erro ao alterar a senha')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setEmail('')
    setOtpCode('')
    setNewPassword('')
    setConfirmPassword('')
    setError(null)
    setSuccess(false)
    setStep('email')
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
              {resetTexts?.success?.['password-changed-title'] || 'Senha Alterada!'}
            </h2>
            
            <p className="text-gray-600 mb-6">
              {resetTexts?.success?.['password-changed-message'] || 
               'Sua senha foi alterada com sucesso. Você já pode fazer login com sua nova senha.'}
            </p>
            
            <CustomButton
              text={resetTexts?.buttons?.close || 'Fechar'}
              onClick={handleClose}
              className="w-full"
              borderColor={colors?.border?.['border-primary']}
              textColor={colors?.colors?.['color-primary']}
            />
          </div>
        ) : step === 'email' ? (
          /* Formulário de E-mail */
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {resetTexts?.title || 'Recuperar Senha'}
            </h2>
            
            <p className="text-gray-600 mb-6">
              {resetTexts?.description || 'Digite seu e-mail para iniciar a recuperação de senha.'}
            </p>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
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
                  text={loading ? (resetTexts?.buttons?.sending || 'Enviando...') : (resetTexts?.buttons?.send || 'Continuar')}
                  type="submit"
                  disabled={loading || !email}
                  className="flex-1"
                  borderColor={colors?.border?.['border-primary']}
                  textColor={colors?.colors?.['color-primary']}
                />
              </div>
            </form>
          </div>
        ) : (
          /* Formulário de Nova Senha */
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {resetTexts?.['new-password-title'] || 'Nova Senha'}
            </h2>
            
            <p className="text-gray-600 mb-6">
              {resetTexts?.['new-password-description'] || 'Digite o código enviado para seu e-mail e sua nova senha.'}
            </p>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {resetTexts?.['otp-label'] || 'Código de Verificação'}
                </label>
                <CustomInput
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.slice(0, 6))}
                  placeholder={resetTexts?.['otp-placeholder'] || 'ABC123'}
                  required
                  //maxLength={6}
                  className="w-full border-gray-300 rounded-xl focus:outline-none focus:ring-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {resetTexts?.['new-password-label'] || 'Nova Senha'}
                </label>
                <CustomInput
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={resetTexts?.['new-password-placeholder'] || '••••••••'}
                  required
                  minLength={6}
                  className="w-full border-gray-300 rounded-xl focus:outline-none focus:ring-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {resetTexts?.['confirm-password-label'] || 'Confirmar Nova Senha'}
                </label>
                <CustomInput
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={resetTexts?.['confirm-password-placeholder'] || '••••••••'}
                  required
                  minLength={6}
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
                  onClick={() => setStep('email')}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  {resetTexts?.buttons?.back || 'Voltar'}
                </button>
                
                <CustomButton
                  text={loading ? (resetTexts?.buttons?.saving || 'Salvando...') : (resetTexts?.buttons?.save || 'Salvar Senha')}
                  type="submit"
                  disabled={loading || !newPassword || !confirmPassword}
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