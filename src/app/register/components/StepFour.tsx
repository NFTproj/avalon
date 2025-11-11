'use client'

import { FormEvent, useContext, useState } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'
import CustomButton from '@/components/core/Buttons/CustomButton'
import CustomInput from '@/components/core/Inputs/CustomInput'
import LoadingOverlay from '@/components/common/LoadingOverlay'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { loginUser } from '@/lib/api/auth'

interface StepFourProps {
  nextStep: () => void
  prevStep: () => void
}

export default function StepFour({ nextStep, prevStep }: StepFourProps) {
  const { colors, texts } = useContext(ConfigContext)

  const stepZeroTexts = texts?.register?.['step-zero']
  const stepFourTexts = texts?.register?.['step-four']

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    setLoading(true)
    try {
      await loginUser({ email, password })
      console.log('[LOGIN OK] Redirecionando para dashboard...')

      // Usar window.location para forçar reload e recarregar o AuthContext
      window.location.href = '/dashboard'
    } catch (err) {
      console.error('[LOGIN ERROR]', err)
      setError('E-mail ou senha inválidos. Tente novamente.')
      setLoading(false)
    }
  }

  const inputErrorStyle = error ? 'border-red-500' : ''

  return (
    <div className="relative w-full max-w-md">
      {loading && <LoadingOverlay />}

      <p
        className="mb-2 text-sm"
        style={{ color: colors?.colors['color-secondary'] }}
      >
        {stepZeroTexts?.fase}{' '}
        <span
          style={{ color: colors?.colors['color-primary'], fontWeight: 'bold' }}
        >
          {stepFourTexts?.counter?.current}
        </span>{' '}
        {stepFourTexts?.counter?.total}
      </p>

      <h1
        className="text-3xl font-bold mb-4"
        style={{ color: colors?.colors['color-primary'] }}
      >
        {stepFourTexts?.title || 'Acesse a sua conta'}
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6">
        <p className="text-sm text-gray-600">
          {stepFourTexts?.paragraphEmail || 'Seu e-mail'}
        </p>
        <CustomInput
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={stepFourTexts?.placeholders?.email || 'email@email.com'}
          label={stepFourTexts?.labels?.email || ''}
          className={`border-gray-300 rounded-xl focus:outline-none focus:ring-2 ${inputErrorStyle}`}
        />

        <p className="text-sm text-gray-600">
          {stepFourTexts?.paragraphPassword || 'Digite a sua senha'}
        </p>
        <CustomInput
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          placeholder={stepFourTexts?.placeholders?.password || '••••••••'}
          label={stepFourTexts?.labels?.password || ''}
          className={`border-gray-300 rounded-xl focus:outline-none focus:ring-2 pr-10 ${inputErrorStyle}`}
          iconRight={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          }
        />

        {/* Erro em vermelho */}
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}

        <div className="flex flex-col sm:flex-row gap-4 w-full mt-4">
          <CustomButton
            text={stepFourTexts?.['button-back'] || 'Voltar'}
            onClick={prevStep}
            type="button"
            className="w-full sm:w-1/2 h-[52px] font-bold"
            borderColor={colors?.border['border-primary']}
            textColor={colors?.colors['color-primary']}
          />

          <CustomButton
            text={
              loading
                ? 'Entrando...'
                : stepFourTexts?.['button-login'] || 'Entrar'
            }
            type="submit"
            disabled={loading}
            className="w-full sm:w-1/2 h-[52px] font-bold"
            borderColor={colors?.border['border-primary']}
            textColor={colors?.colors['color-primary']}
          />
        </div>
      </form>
    </div>
  )
}
