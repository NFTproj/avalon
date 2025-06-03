'use client'

import { useContext, useState } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import { useRouter } from 'next/navigation'
import { ConfigContext } from '@/contexts/ConfigContext'
import CustomButton from '@/components/core/Buttons/CustomButton'
import LoadingOverlay from '@/components/commom/LoadingOverlay'
import { registerWithMetamask } from '@/lib/api/auth'

export default function StepSignMessage() {
  const { colors } = useContext(ConfigContext)
  const { address } = useAccount()
  const { push } = useRouter()

  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { signMessageAsync } = useSignMessage()

  const handleSign = async () => {
    setError(null)
    setIsLoading(true)

    try {
      const message = `Sign this message to verify ownership of ${address}`
      const signature = await signMessageAsync({ message })

      await registerWithMetamask({ walletAddress: address!, signature })

      // Redireciona para o dashboard
      push('/dashboard')
    } catch (err: any) {
      setError(err.message ?? 'Erro inesperado')
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md relative">
      {isLoading && <LoadingOverlay overrideMessage="Conectando..." />}

      <h1 className="text-3xl font-bold mb-6" style={{ color: colors?.colors['color-primary'] }}>
        Criar sua conta
      </h1>

      <p className="mb-4 text-gray-600">
        Agora só falta um passo! Clique abaixo para assinar e confirmar a criação da sua conta com essa carteira.
      </p>

      <CustomButton
        onClick={handleSign}
        text="Criar conta"
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
