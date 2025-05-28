'use client'

import { FormEvent, useContext, useState } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'
import CustomButton from '../core/Buttons/CustomButton'
import CustomInput from '../core/Inputs/CustomInput'
import { FaEye, FaEyeSlash } from 'react-icons/fa'

interface StepTwoProps {
  nextStep: () => void
  prevStep: () => void
}

export default function StepTwo({ nextStep, prevStep }: StepTwoProps) {
  const { colors, texts } = useContext(ConfigContext)

  const stepZeroTexts = texts?.register?.['step-zero']
  const stepTwoTexts = texts?.register?.['step-two']

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    nextStep()
  }

  return (
    <div className="w-full max-w-md">
      {/* Contador de passos */}
      <p className="mb-2 text-sm" style={{ color: colors?.colors['color-secondary'] }}>
        {stepZeroTexts?.fase}{' '}
        <span style={{ color: colors?.colors['color-primary'], fontWeight: 'bold' }}>
          {stepTwoTexts?.counter?.current}
        </span>{' '}
        {stepTwoTexts?.counter?.total}
      </p>

      {/* Título */}
      <h1
        className="text-3xl font-bold mb-4"
        style={{ color: colors?.colors['color-primary'] }}
      >
        {stepTwoTexts?.title || 'Agora escolha uma senha'}
      </h1>

      {/* Descrição */}
      <p className="mb-6 text-gray-600">
        {stepTwoTexts?.description || 'Utilize letras, números e caracteres especiais.'}
      </p>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6">
        {/* Campo “username” oculto, para evitar o warning sobre password forms */}
        <input
          type="text"
          name="username"
          autoComplete="username"
          className="hidden"
        />

        {/* Campo de Senha */}
        <CustomInput
          type={showPassword ? 'text' : 'password'}
          label={stepTwoTexts?.labels?.password || 'Digite uma senha'}
          placeholder="Digite uma senha"
          autoComplete="new-password"
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

        {/* Campo de Confirmação */}
        <CustomInput
          type={showConfirm ? 'text' : 'password'}
          label={stepTwoTexts?.labels?.confirmPassword || 'Repita sua senha'}
          placeholder="Repita a sua senha"
          autoComplete="new-password"
          className="border-gray-300 rounded-xl focus:outline-none focus:ring-2 pr-10"
          iconRight={
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? <FaEyeSlash /> : <FaEye />}
            </button>
          }
        />

        {/* Disclaimer */}
        <p className="text-xs text-gray-600 mt-2">
          {stepTwoTexts?.disclaimer ||
            'Ao continuar você aceita os termos e políticas da Slab.'}
        </p>

        {/* Botões */}
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          {/* Botão Voltar */}
          <CustomButton
            text={stepTwoTexts?.['button-back'] || 'Voltar'}
            color={colors?.buttons['button-third']}
            textColor={colors?.colors['color-primary']}
            borderColor={colors?.border['border-primary']}
            className="w-full sm:w-1/2 h-[52px] font-bold"
            onClick={prevStep}
            type="button"
          />

          {/* Botão Continuar */}
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
