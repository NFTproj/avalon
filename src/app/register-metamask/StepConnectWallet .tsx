'use client'

import { useContext, useState } from 'react'
import { useAppKit }          from '@reown/appkit/react'    
import { ConfigContext } from '@/contexts/ConfigContext'
import CustomButton from '@/components/core/Buttons/CustomButton'

export default function StepConnectWallet() {
  const { colors, texts } = useContext(ConfigContext)
  const [walletConnected, setWalletConnected] = useState(false)
  const { open } = useAppKit()     
  

  const metamaskTexts = texts?.register?.['metamask-register-login'] as any;

  return (
    <div className="w-full max-w-md">
      {/* Contador de passos */}
      <p className="mb-2 text-sm" style={{ color: colors?.colors['color-secondary'] }}>
        {metamaskTexts?.fase}{' '}
        <span style={{ color: colors?.colors['color-primary'], fontWeight: 'bold' }}>
          {metamaskTexts?.counter?.current}
        </span>{' '}
        {metamaskTexts?.counter?.total}
      </p>

      <h1 className="text-3xl font-bold mb-4" style={{ color: colors?.colors['color-primary'] }}>
        {metamaskTexts?.title || 'Conecte sua carteira'}
      </h1>

      <p className="mb-6 text-gray-600">
        {metamaskTexts?.['paragraph-Wallet'] || 'Selecione a carteira digital que você deseja usar.'}
      </p>

      <div className="flex flex-col gap-4 mb-6">
        <CustomButton
          text={walletConnected ? 'Carteira conectada' : (metamaskTexts?.['button-Wallet-choose'] || 'Escolher carteira')}
          className="shrink-0 w-[210px] h-[52px] font-bold"
          textColor={colors?.colors['color-primary']}
          borderColor={colors?.border['border-primary']}
          onClick={() => open()}     
        />
      </div>

      <p className="text-sm text-left" style={{ color: colors?.colors['color-secondary'] }}>
        {texts?.register?.['step-one']?.['already-have-account'] || 'Já possui uma conta?'}{' '}
        <a href="/login" className="underline">
          {texts?.register?.['step-one']?.['login-link'] || 'Login'}
        </a>
      </p>
    </div>
  )
}
