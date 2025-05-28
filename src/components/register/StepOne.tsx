'use client'

import { FormEvent, useContext } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'
import CustomButton from '../core/Buttons/CustomButton'
import CustomInput from '../core/Inputs/CustomInput'

interface StepOneProps {
  nextStep: () => void
}

export default function StepOne({ nextStep }: StepOneProps) {
  const { colors, texts } = useContext(ConfigContext)

  // Extrai 'step-zero' e 'step-one' do JSON
  const stepZeroTexts = texts?.register?.['step-zero']
  const stepOneTexts = texts?.register?.['step-one']

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    nextStep()
  }

  return (
    <div className="w-full max-w-md">
      {/* Contador de passos */}
      <p
        className="mb-2 text-sm"
        style={{ color: colors?.colors['color-secondary'] }}
      >
        {/* Fase (de step-zero) */}
        {stepZeroTexts?.fase}{' '}
        {/* Valor atual (current) de step-one */}
        <span style={{ color: colors?.colors['color-primary'], fontWeight: 'bold' }}>
          {stepOneTexts?.counter?.current}
        </span>{' '}
        {/* Valor total (total) de step-one */}
        {stepOneTexts?.counter?.total}
      </p>

      {/* Título */}
      <h1
        className="text-3xl font-bold mb-4"
        style={{ color: colors?.colors['color-primary'] }}
      >
        {stepOneTexts?.title || 'Escolha um e-mail'}
      </h1>

      {/* Descrição */}
      <p className="mb-6 text-gray-600">
        {stepOneTexts?.description ||
          'Se é a sua primeira vez aqui, comece o processo de registro inserindo seu e-mail.'}
      </p>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-semibold mb-1"
            style={{ color: colors?.colors['color-primary'] }}
          >
            {stepOneTexts?.labels?.emailLabel || 'Seu e-mail:'}
          </label>
          <CustomInput
            id="email"
            type="email"
            label={stepOneTexts?.labels?.emailLabel || 'Seu e-mail:'}
            placeholder={stepOneTexts?.placeholders?.email || 'email@email.com'}
          />
        </div>

        {/* Botão Próximo */}
        <div>
          <CustomButton
            text={stepOneTexts?.['button-next'] || 'Próximo'}
            className="shrink-0 w-[210px] h-[52px] font-bold mt-2"
            textColor={colors?.colors['color-primary']}
            borderColor={colors?.border['border-primary']}
          />
        </div>
      </form>

      {/* Já possui conta? */}
      <p
        className="text-sm text-left"
        style={{ color: colors?.colors['color-secondary'] }}
      >
        {stepOneTexts?.['already-have-account'] || 'Já possui uma conta?'}{' '}
        <a href="/login" className="underline">
          {stepOneTexts?.['login-link'] || 'Login'}
        </a>
      </p>
    </div>
  )
}
