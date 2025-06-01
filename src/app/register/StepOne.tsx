'use client'

//user input e-mail and password
import { FormEvent, useContext, useState } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'
import CustomButton from '@/components/core/Buttons/CustomButton'
import CustomInput from '@/components/core/Inputs/CustomInput'
import { RegisterPayload } from '@/lib/api/auth'

interface StepOneProps {
  nextStep: () => void
  updateField: <K extends keyof RegisterPayload>(field: K, value: RegisterPayload[K]) => void
  formData: Partial<RegisterPayload>
}

export default function StepOne({ nextStep, updateField, formData }: StepOneProps) {
  const { colors, texts } = useContext(ConfigContext)
  const [email, setEmail] = useState(formData.email ?? '')

  const stepZeroTexts = texts?.register?.['step-zero']
  const stepOneTexts = texts?.register?.['step-one']

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    updateField('email', email)
    nextStep()
  }

  return (
    <div className="w-full max-w-md">
      {/* Contador de passos */}
      <p className="mb-2 text-sm" style={{ color: colors?.colors['color-secondary'] }}>
        {stepZeroTexts?.fase}{' '}
        <span style={{ color: colors?.colors['color-primary'], fontWeight: 'bold' }}>
          {stepOneTexts?.counter?.current}
        </span>{' '}
        {stepOneTexts?.counter?.total}
      </p>

      <h1 className="text-3xl font-bold mb-4" style={{ color: colors?.colors['color-primary'] }}>
        {stepOneTexts?.title || 'Escolha um e-mail'}
      </h1>

      <p className="mb-6 text-gray-600">
        {stepOneTexts?.description || 'Se é a sua primeira vez aqui, comece o processo de registro inserindo seu e-mail.'}
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6">
        <label htmlFor="email" className="block text-sm font-semibold mb-1" style={{ color: colors?.colors['color-primary'] }}>
          {stepOneTexts?.labels?.emailLabel || 'Seu e-mail:'}
        </label>

        <CustomInput
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          label={stepOneTexts?.labels?.emailLabel || 'Seu e-mail:'}
          placeholder={stepOneTexts?.placeholders?.email || 'email@email.com'}
        />

        <CustomButton
          type="submit"
          text={stepOneTexts?.['button-next'] || 'Próximo'}
          className="shrink-0 w-[210px] h-[52px] font-bold mt-2"
          textColor={colors?.colors['color-primary']}
          borderColor={colors?.border['border-primary']}
        />
      </form>

      <p className="text-sm text-left" style={{ color: colors?.colors['color-secondary'] }}>
        {stepOneTexts?.['already-have-account'] || 'Já possui uma conta?'}{' '}
        <a href="/login" className="underline">
          {stepOneTexts?.['login-link'] || 'Login'}
        </a>
      </p>
    </div>
  )
}
