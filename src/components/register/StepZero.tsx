'use client'

import { useContext } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'
import CustomButton from '../core/Buttons/CustomButton'

interface StepOneProps {
  nextStep: () => void
}

export default function StepZero({ nextStep }: StepOneProps) {
  const { colors, texts } = useContext(ConfigContext)
  const stepOneTexts = texts?.['register']?.['step-zero']

  return (
    <div className="w-full max-w-md">
      <h1
        className="text-3xl font-bold mb-4"
        style={{ color: colors?.colors['color-primary'] }}
      >
        {stepOneTexts?.title}
      </h1>

      <p className="mb-6 text-gray-600">
        {stepOneTexts?.description}
      </p>

      {/* 
        Mantemos flex-wrap para, se precisar quebrar em telas muito pequenas,
        mas adicionamos shrink-0 para manter o w-[xxx] fixo 
      */}
      <div className="flex flex-wrap gap-4 mb-6">
        <CustomButton
          text={stepOneTexts?.['button-email'] || 'Criar com E-mail'}
          onClick={nextStep}
          textColor={colors?.colors['color-primary']}
          borderColor={colors?.border['border-primary']}
          className="shrink-0 w-[210px] h-[52px] font-bold"
        />

        <CustomButton
          text={stepOneTexts?.['button-metamask'] || 'Criar com MetaMask'}
          color={colors?.buttons['button-third']}
          textColor={colors?.colors['color-primary']}
          borderColor={colors?.border['border-primary']}
          className="shrink-0 w-[210px] h-[52px] font-bold"
        />
      </div>

      <p
        className="text-sm text-left"
        style={{ color: colors?.colors['color-secondary'] }}
      >
        {stepOneTexts?.['already-have-account']}{' '}
        <a href="/login" className="underline">
          {stepOneTexts?.['login-link']}
        </a>
      </p>
    </div>
  )
}
