// KycStepStartVerification.tsx
'use client'

import { useContext, useState } from 'react'
import ImageFromJSON from '@/components/core/ImageFromJSON'
import { KycContainer } from '@/components/common/FormsBackground'
import CustomButton from '@/components/core/Buttons/CustomButton'
import { ConfigContext } from '@/contexts/ConfigContext'
import { createKycSession } from '@/lib/api/kyc'
import { useAuth } from '@/contexts/AuthContext'

interface KycStepStartVerificationProps {
  name?: string
  cpf?: string
  address?: string
  onVerify?: () => void
  onBack?: () => void            // <-- NOVO
}

export default function KycStepStartVerification({
  name, cpf, address, onVerify, onBack
}: KycStepStartVerificationProps) {
  const { texts, colors } = useContext(ConfigContext)
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const kycTexts: any = (texts as any)?.kyc ?? {}
  const start: any = kycTexts['start-verification'] ?? {}
  const title       = start?.title ?? kycTexts?.['title-didit-verification'] ?? 'Verificação Didit'
  const description = start?.description ?? kycTexts?.['didit-description'] ?? ''
  const stepLabel   = kycTexts?.['kyc-step-indicator'] ?? 'Etapa 03 de 03'
  const logoSrc     = start?.logo?.src
  const logoAlt     = start?.logo?.alt ?? 'Didit'
  const demoSrc     = start?.demo?.src
  const demoAlt     = start?.demo?.alt ?? 'KYC Demo'

  async function handleVerify() {
    try {
      setLoading(true)
      const userId = user?.id ?? user?.userId
      if (!userId) throw new Error('Usuário não identificado')
      const { url, session_id } = await createKycSession(userId)
      sessionStorage.setItem('verificationSessionId', session_id)
      window.location.href = url
      onVerify?.()
    } finally {
      setLoading(false)
    }
  }

  return (
    <KycContainer className="max-w-[640px] pt-6 pb-10 sm:pb-8">
      <div className="flex items-center justify-between mb-6 sm:mb-4">
        <p className="text-sm text-gray-500">{stepLabel}</p>
        {logoSrc && <ImageFromJSON src={logoSrc} alt={logoAlt} width={70} height={20} />}
      </div>

      <header className="mb-8 sm:mb-6">
        <h1 className="text-2xl sm:text-[28px] font-bold mb-3" style={{ color: colors?.colors['color-primary'] }}>
          {title}
        </h1>
        <p className="text-gray-700 leading-snug">{description}</p>
      </header>

      <div className="flex justify-center mb-8 sm:mb-6">
        <div className="rounded-xl overflow-hidden border border-gray-300 w-[220px] h-[220px] bg-gray-100">
          {demoSrc && <ImageFromJSON src={demoSrc} alt={demoAlt} width={220} height={220} className="object-cover w-full h-full" />}
        </div>
      </div>

      {/* Botões: Voltar + Continuar (2 colunas em telas maiores) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CustomButton
          type="button"
          text={kycTexts?.['button-back'] ?? 'Voltar'}
          onClick={() => onBack?.()}
          className="w-full font-semibold h-[46px]"
          textColor={colors?.colors['color-primary']}
        />
        <CustomButton
          type="button"
          disabled={loading}
          color={colors?.buttons['button-third']}
          borderColor={colors?.border['border-primary']}
          text={loading ? 'Aguarde…' : (start?.['button-continue'] ?? kycTexts?.['button-continue'] ?? 'Continuar')}
          onClick={handleVerify}
          className="w-full font-semibold h-[46px]"
          textColor={colors?.colors['color-primary']}
        />
      </div>
    </KycContainer>
  )
}
