'use client'

import { FormEvent, useContext, useState } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'
import CustomButton from '../core/Buttons/CustomButton'
import CustomInput from '../core/Inputs/CustomInput'
import { FaEye, FaEyeSlash } from 'react-icons/fa'

interface StepFourProps {
  nextStep: () => void
  prevStep: () => void
}

export default function StepFour({ nextStep, prevStep }: StepFourProps) {
  const { colors, texts } = useContext(ConfigContext)

  // Supondo que você tenha "step-zero" (pra fase) e "step-four" no JSON
  const stepZeroTexts = texts?.register?.['step-zero']
  const stepFourTexts = texts?.register?.['step-four']

  // Estado para mostrar/ocultar senha
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    // Validar login, etc.
    nextStep()
  }

  return (
    <div className="w-full max-w-md">
      {/* Contador de passos (se quiser manter) */}
      <p className="mb-2 text-sm" style={{ color: colors?.colors['color-secondary'] }}>
        {stepZeroTexts?.fase}{' '}
        <span style={{ color: colors?.colors['color-primary'], fontWeight: 'bold' }}>
          {stepFourTexts?.counter?.current}
        </span>{' '}
        {stepFourTexts?.counter?.total}
      </p>

      {/* Título */}
      <h1
        className="text-3xl font-bold mb-4"
        style={{ color: colors?.colors['color-primary'] }}
      >
        {stepFourTexts?.title || 'Acesse a sua conta'}
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6">
        {/* Parágrafo + Input de Email */}
        <p className="text-sm text-gray-600">
          {stepFourTexts?.paragraphEmail || 'Seu e-mail'}
        </p>

        <CustomInput
          type="email"
          placeholder={stepFourTexts?.placeholders?.email || 'email@email.com'}
          label={stepFourTexts?.labels?.email || ''}
          className="border-gray-300 rounded-xl focus:outline-none focus:ring-2"
        />

        {/* Parágrafo + Input de Senha */}
        <p className="text-sm text-gray-600">
          {stepFourTexts?.paragraphPassword || 'Digite a sua senha'}
        </p>

        <CustomInput
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder={stepFourTexts?.placeholders?.password || '••••••••'}
          label={stepFourTexts?.labels?.password || ''}
          className="border-gray-300 rounded-xl focus:outline-none focus:ring-2 pr-10"
          iconRight={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          }
        />

        <div className="flex flex-col sm:flex-row gap-4 w-full mt-4">
          {/* Se quiser botão "Voltar" */}
          <CustomButton
            text={stepFourTexts?.['button-back'] || 'Voltar'}
            onClick={prevStep}
            type="button"
            className="w-full sm:w-1/2 h-[52px] font-bold"
            borderColor={colors?.border['border-primary']}
            textColor={colors?.colors['color-primary']}
          />

          {/* Botão Entrar */}
          <CustomButton
            text={stepFourTexts?.['button-login'] || 'Entrar'}
            className="w-full sm:w-1/2 h-[52px] font-bold"
            borderColor={colors?.border['border-primary']}
            textColor={colors?.colors['color-primary']}
            type="submit"
          />
        </div>
      </form>
    </div>
  )
}
