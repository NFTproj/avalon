'use client'

import { FormEvent, useContext } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'
import CustomButton from '../core/Buttons/CustomButton'
import CustomInput from '../core/Inputs/CustomInput'

interface StepThreeProps {
  nextStep: () => void
}

export default function StepThree({ nextStep }: StepThreeProps) {
  const { colors, texts } = useContext(ConfigContext)

  const stepZeroTexts = texts?.register?.['step-zero']
  const stepThreeTexts = texts?.register?.['step-three']

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    // Aqui você pode validar o código inserido
    nextStep()
  }

  return (
    <div className="w-full max-w-md">
      {/* Contador de passos */}
      <p className="mb-2 text-sm" style={{ color: colors?.colors['color-secondary'] }}>
        {stepZeroTexts?.fase}{' '}
        <span style={{ color: colors?.colors['color-primary'], fontWeight: 'bold' }}>
          {stepThreeTexts?.counter?.current}
        </span>{' '}
        {stepThreeTexts?.counter?.total}
      </p>

      {/* Título */}
      <h1 className="text-3xl font-bold mb-4" style={{ color: colors?.colors['color-primary'] }}>
        {stepThreeTexts?.title || 'Verifique seu e-mail!'}
      </h1>

      {/* Descrição */}
      <p className="mb-6 text-gray-600">
        {stepThreeTexts?.description || 'Insira o código que foi enviado para o seu e-mail.'}
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6">
        <CustomInput
          id="code"
          type="text"
          label={stepThreeTexts?.labels?.code || 'Insira o código'}
          placeholder={stepThreeTexts?.placeholders?.code || 'Código'}
        />

        <CustomButton
          type="submit"
          text={stepThreeTexts?.['button-verify'] || 'Verificar'}
          className="shrink-0 w-full sm:w-[210px] h-[52px] font-bold"
          textColor={colors?.colors['color-primary']}
          borderColor={colors?.border['border-primary']}
        />
      </form>
    </div>
  )
}
