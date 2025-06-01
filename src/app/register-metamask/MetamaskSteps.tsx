'use client'

import { useContext, useState } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'
import CustomButton from '@/components/core/Buttons/CustomButton'

export default function MetamaskSteps() {
  const { colors, texts } = useContext(ConfigContext)
  const [walletConnected, setWalletConnected] = useState(false)

  const stepZeroTexts = texts?.register?.['step-zero']
  const stepOneTexts = texts?.register?.['step-one']

  return (
    <div className="w-full max-w-md">
      {/* Contador de passos */}
      <p className="mb-2 text-sm" style={{ color: colors?.colors['color-secondary'] }}>
        {stepZeroTexts?.fase}{' '}
        <span style={{ color: colors?.colors['color-primary'], fontWeight: 'bold' }}>
          {stepOneTexts?.counter?.current || 1}
        </span>{' '}
        {stepOneTexts?.counter?.total || 'de 1'}
      </p>

      <h1 className="text-3xl font-bold mb-4" style={{ color: colors?.colors['color-primary'] }}>
        {stepOneTexts?.title || 'Conectar com MetaMask'}
      </h1>

      <p className="mb-6 text-gray-600">
        {stepOneTexts?.description || 'Clique abaixo para conectar sua carteira MetaMask.'}
      </p>

      <div className="flex flex-col gap-4 mb-6">
        <CustomButton
          text={walletConnected ? 'Carteira conectada' : 'Conectar carteira'}
          className="shrink-0 w-[210px] h-[52px] font-bold"
          textColor={colors?.colors['color-primary']}
          borderColor={colors?.border['border-primary']}
          onClick={() => setWalletConnected(true)} // simula conexão
        />
      </div>

      <p className="text-sm text-left" style={{ color: colors?.colors['color-secondary'] }}>
        {stepOneTexts?.['already-have-account'] || 'Já possui uma conta?'}{' '}
        <a href="/login" className="underline">
          {stepOneTexts?.['login-link'] || 'Login'}
        </a>
      </p>
    </div>
  )
}
