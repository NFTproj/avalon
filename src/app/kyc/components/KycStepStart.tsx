'use client'

import { useContext } from 'react'
import { KycContainer } from '@/components/common/FormsBackground'
import CustomButton from '@/components/core/Buttons/CustomButton'
import { ConfigContext } from '@/contexts/ConfigContext'

interface KycStepStartProps {
  onNext: () => void
}

export default function KycStepStart({ onNext }: KycStepStartProps) {
  const { colors, texts } = useContext(ConfigContext)
  const kycTexts = (texts as any)?.kyc

  return (
    <KycContainer>
      <h1 className="text-2xl font-bold mb-4" style={{ color: colors?.colors['color-primary'] }}>
        {kycTexts?.['kyc-step-one-title'] || 'Realize sua Verificação KYC!'}
      </h1>

      <p className="text-gray-700 mb-6">
        {kycTexts?.['kyc-step-one-paragraph'] || 'Sua conta ainda não foi verificada. Realize a verificação dos seus dados para garantir que as transações ocorram com segurança.'}
      </p>

      <CustomButton
        type="button"
        text={kycTexts?.['kyc-step-one-button'] || 'Começar verificação'}
        onClick={onNext}
        className="w-full font-semibold py-2 px-6 h-[48px]"
        textColor={colors?.colors['color-primary']}
        color={colors?.buttons['button-primary']}
      />
    </KycContainer>
  )
}
