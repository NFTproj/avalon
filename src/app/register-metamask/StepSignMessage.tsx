'use client'

import { useContext, useState } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import { useRouter } from 'next/navigation'
import { ConfigContext } from '@/contexts/ConfigContext'
import { useAuth } from '@/contexts/AuthContext'
import CustomButton from '@/components/core/Buttons/CustomButton'
import LoadingOverlay from '@/components/common/LoadingOverlay'
import { registerWithMetamask } from '@/lib/api/auth'

export default function StepSignMessage() {
  const { colors, texts } = useContext(ConfigContext)
  const { address } = useAccount()
  const { push } = useRouter()
  const { mutate } = useAuth() 

  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const metamaskTexts = texts?.register?.['metamask-register-login'] as any

  const { signMessageAsync } = useSignMessage()

  const handleSign = async () => {
    setError(null)
    setIsLoading(true)

    try {
      const message = `Sign this message to verify ownership of ${address}`
      const signature = await signMessageAsync({ message })

      await registerWithMetamask({ walletAddress: address!, signature })

      await mutate() // 👈 atualiza o contexto Auth (chama /api/auth/me novamente)

      push('/dashboard')
    } catch (err: any) {
      setError(err.message ?? 'Erro inesperado')
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md relative">
      {isLoading && <LoadingOverlay overrideMessage="Conectando..." />}
      <p className="mb-2 text-sm" style={{ color: colors?.colors['color-secondary'] }}>
        {metamaskTexts?.fase}{' '}
        <span style={{ color: colors?.colors['color-primary'], fontWeight: 'bold' }}>
          {metamaskTexts?.counter?.second}
        </span>{' '}
        {metamaskTexts?.counter?.total}
      </p>

      <h1 className="text-3xl font-bold mb-6" style={{ color: colors?.colors['color-primary'] }}>
        {metamaskTexts?.signature?.title}
      </h1>

      <p className="mb-4 text-gray-600">
        {metamaskTexts?.signature?.['paragraph-register']}
      </p>

      <CustomButton
        onClick={handleSign}
        text={metamaskTexts?.signature?.['button-register-wallet'] || 'Create account'}
        fullWidth
        disabled={isLoading}
      />

      {error && (
        <p className="mt-4 text-red-500 text-sm">
          {error}
        </p>
      )}
    </div>
  )
}
