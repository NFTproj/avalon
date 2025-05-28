'use client'

import { FormEvent, useContext, useEffect, useState } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'
import CustomButton from '../../components/core/Buttons/CustomButton'
import CustomInput from '../../components/core/Inputs/CustomInput'
import LoadingOverlay from '../../components/commom/LoadingOverlay'
import { verifyCode } from '@/lib/api/auth'
import { RegisterPayload } from '@/lib/api/auth'

interface StepThreeProps {
  nextStep: () => void
  updateField: <K extends keyof (RegisterPayload & { otp_code?: string })>(field: K, value: any) => void
  formData: Partial<RegisterPayload & { otp_code?: string }>
  resend: () => Promise<{ success: boolean; message?: string } | undefined>
}

export default function StepThree({ nextStep, updateField, formData, resend }: StepThreeProps) {
  const { colors, texts } = useContext(ConfigContext)
  const stepZeroTexts = texts?.register?.['step-zero']
  const stepThreeTexts = texts?.register?.['step-three']
  const resendTexts = stepThreeTexts?.resend as {
    button?: string
    success?: string
    error?: string
    cooldown?: string
  } || {}

  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resendMessage, setResendMessage] = useState<string | null>(null)

  const [timer, setTimer] = useState(30)
  const [canResend, setCanResend] = useState(false)

  useEffect(() => {
    if (!canResend && timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1)
      }, 1000)

      return () => clearInterval(interval)
    }

    if (timer === 0) {
      setCanResend(true)
    }
  }, [timer, canResend])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setResendMessage(null)

    if (!formData.email) {
      alert('Dados ausentes')
      return
    }

    const payload = {
      email: formData.email,
      otp_code: code,
    }

    setLoading(true)
    try {
      await verifyCode(payload)
      updateField('otp_code', code)
      await new Promise(resolve => setTimeout(resolve, 800))
      nextStep()
    } catch (err) {
      console.error('[StepThree] Código inválido:', err)
      setError('Código inválido ou expirado.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    const result = await resend()
    if (result?.success) {
      setResendMessage(resendTexts.success || 'Código reenviado com sucesso!')
      setError(null)
      setTimer(30)
      setCanResend(false)
    } else {
      setError(result?.message || resendTexts.error || 'Erro ao reenviar código.')
      setResendMessage(null)
    }
  }

  return (
    <div className="relative w-full max-w-md">
      {loading && <LoadingOverlay />}

      <p className="mb-2 text-sm" style={{ color: colors?.colors['color-secondary'] }}>
        {stepZeroTexts?.fase}{' '}
        <span style={{ color: colors?.colors['color-primary'], fontWeight: 'bold' }}>
          {stepThreeTexts?.counter?.current}
        </span>{' '}
        {stepThreeTexts?.counter?.total}
      </p>

      <h1 className="text-3xl font-bold mb-4" style={{ color: colors?.colors['color-primary'] }}>
        {stepThreeTexts?.title || 'Verifique seu e-mail!'}
      </h1>

      <p className="mb-6 text-gray-600">
        {stepThreeTexts?.description || 'Insira o código enviado por e-mail.'}
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-4">
        <CustomInput
          id="code"
          type="text"
          label={stepThreeTexts?.labels?.code || 'Insira o código'}
          placeholder={stepThreeTexts?.placeholders?.code || 'Código'}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className={error ? 'border-red-500' : ''}
        />

        {error && <p className="text-sm text-red-500 -mt-2">{error}</p>}
        {resendMessage && <p className="text-sm text-green-600 -mt-2">{resendMessage}</p>}

        <CustomButton
          type="submit"
          text={loading ? 'Verificando...' : stepThreeTexts?.['button-verify'] || 'Verificar'}
          className="shrink-0 w-full sm:w-[210px] h-[52px] font-bold"
          textColor={colors?.colors['color-primary']}
          borderColor={colors?.border['border-primary']}
          disabled={loading}
        />
      </form>

      <div className="flex flex-col items-start gap-1 mt-2">
        <button
          type="button"
          onClick={handleResend}
          disabled={!canResend}
          className={`text-sm font-medium ${canResend ? 'text-blue-600 underline' : 'text-gray-400 cursor-not-allowed'}`}
        >
          {resendTexts.button || 'Reenviar código'}
        </button>
        {!canResend && (
          <span className="text-sm text-gray-500">
            {(resendTexts.cooldown || 'Available again in {seconds}s').replace('{seconds}', timer.toString())}
          </span>
        )}
      </div>
    </div>
  )
}
