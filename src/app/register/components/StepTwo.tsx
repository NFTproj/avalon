'use client'

import { useState, FormEvent, useContext } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'
import CustomButton from '@/components/core/Buttons/CustomButton'
import CustomInput from '@/components/core/Inputs/CustomInput'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { RegisterPayload } from '@/lib/api/auth'
import PasswordStrengthIndicator from '@/components/auth/PasswordStrengthIndicator'
import { validatePassword } from '@/utils/passwordValidation'

interface StepTwoProps {
  nextStep: () => void
  prevStep: () => void
  updateField: <K extends keyof RegisterPayload>(
    field: K,
    value: RegisterPayload[K],
  ) => void
  formData: Partial<RegisterPayload>
  registrationError?: string | null
}

export default function StepTwo({
  nextStep,
  prevStep,
  updateField,
  formData,
  registrationError,
}: Readonly<StepTwoProps>) {
  const { colors, texts } = useContext(ConfigContext)
  const stepZeroTexts = texts?.register?.['step-zero']
  const stepTwoTexts = texts?.register?.['step-two']

  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setPasswordError(null)

    if (!formData.password || formData.password.trim() === '') {
      setPasswordError('Senha não pode ser vazia')
      return
    }

    // Validar força da senha
    const { isValid } = validatePassword(formData.password)
    if (!isValid) {
      setPasswordError('A senha não atende aos requisitos mínimos de segurança')
      return
    }

    if (formData.password !== confirm) {
      setPasswordError('As senhas não coincidem')
      return
    }

    nextStep()
  }

  const errorStyle = passwordError || registrationError ? 'border-red-500' : ''

  return (
    <div className="w-full max-w-md">
      <p
        className="mb-2 text-sm"
        style={{ color: colors?.colors['color-secondary'] }}
      >
        {stepZeroTexts?.fase}{' '}
        <span
          style={{ color: colors?.colors['color-primary'], fontWeight: 'bold' }}
        >
          {stepTwoTexts?.counter?.current}
        </span>{' '}
        {stepTwoTexts?.counter?.total}
      </p>

      <h1
        className="text-3xl font-bold mb-4"
        style={{ color: colors?.colors['color-primary'] }}
      >
        {stepTwoTexts?.title || 'Agora escolha uma senha'}
      </h1>

      <p className="mb-6 text-gray-600">
        {stepTwoTexts?.description ||
          'Utilize letras, números e caracteres especiais.'}
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6">
        <input
          type="text"
          name="username"
          autoComplete="username"
          className="hidden"
        />

        <CustomInput
          type={showPassword ? 'text' : 'password'}
          label={stepTwoTexts?.labels?.password || 'Digite uma senha'}
          placeholder="Digite uma senha"
          value={formData.password ?? ''}
          onChange={(e) => updateField('password', e.target.value)}
          autoComplete="new-password"
          className={`border-gray-300 rounded-xl focus:outline-none focus:ring-2 pr-10 ${errorStyle}`}
          iconRight={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          }
        />

        {/* Indicador de força da senha */}
        {formData.password && (
          <PasswordStrengthIndicator password={formData.password} />
        )}

        <CustomInput
          type={showConfirm ? 'text' : 'password'}
          label={stepTwoTexts?.labels?.confirmPassword || 'Repita sua senha'}
          placeholder="Repita a sua senha"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          className={`border-gray-300 rounded-xl focus:outline-none focus:ring-2 pr-10 ${errorStyle}`}
          iconRight={
            <button type="button" onClick={() => setShowConfirm(!showConfirm)}>
              {showConfirm ? <FaEyeSlash /> : <FaEye />}
            </button>
          }
        />

        {(passwordError || registrationError) && (
          <p className="text-sm text-red-500 -mt-2">
            {passwordError || registrationError}
          </p>
        )}

        <p className="text-xs text-gray-600 mt-2">
          {stepTwoTexts?.disclaimer ||
            'Ao continuar você aceita os termos e políticas da Slab.'}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <CustomButton
            text={stepTwoTexts?.['button-back'] || 'Voltar'}
            color={colors?.buttons['button-third']}
            textColor={colors?.colors['color-primary']}
            borderColor={colors?.border['border-primary']}
            className="w-full sm:w-1/2 h-[52px] font-bold"
            onClick={prevStep}
            type="button"
          />

          <CustomButton
            text={stepTwoTexts?.['button-continue'] || 'Continuar'}
            className="w-full sm:w-1/2 h-[52px] font-bold"
            textColor={colors?.colors['color-primary']}
            borderColor={colors?.border['border-primary']}
            type="submit"
          />
        </div>
      </form>
    </div>
  )
}
