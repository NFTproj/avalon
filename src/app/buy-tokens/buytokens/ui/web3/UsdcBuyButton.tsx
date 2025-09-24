'use client'

import * as React from 'react'
import type { CSSProperties } from 'react'
import { Wallet, CircleDollarSign } from 'lucide-react'
import { useWallet } from '@/contexts/WalletContext'
import { useUsdcBuy } from '@/lib/services/payments/useUsdcBuy'

type Props = {
  usdAmount: number
  chainId?: number
  saleAddress?: `0x${string}`
  label?: string
  className?: string
  style?: CSSProperties
  onSuccess?: () => void
}

export default function UsdcBuyButton({
  usdAmount,
  chainId,
  saleAddress,
  label = 'Comprar com USDC',
  className,
  style,
  onSuccess,
}: Props) {
  const { address, isConnected, ensureConnected, ensureChain } = useWallet()
  const { buyWithUsdc, loading, error } = useUsdcBuy()

  const [localError, setLocalError] = React.useState<string | null>(null)
  const [connecting, setConnecting] = React.useState(false)

  const disabled =
    loading ||
    connecting ||
    !Number.isFinite(usdAmount) ||
    usdAmount <= 0 ||
    !saleAddress ||
    typeof chainId !== 'number'

  const handleClick = async () => {
    setLocalError(null)

    try {
      // 1) Garantir conexão (1 clique)
      if (!isConnected) {
        setConnecting(true)
        try {
          await ensureConnected() // abre modal e espera address
        } finally {
          setConnecting(false)
        }
      }

      // 2) Validar dados
      if (typeof chainId !== 'number') {
        setLocalError('Configuração on-chain ausente (chainId).')
        return
      }
      if (!saleAddress) {
        setLocalError('Endereço do contrato de venda ausente.')
        return
      }

      // 3) Trocar de rede se necessário
      await ensureChain(chainId)

      // 4) Address do comprador
      const buyer = address as `0x${string}` | undefined
      if (!buyer) {
        setLocalError('Endereço da carteira não encontrado.')
        return
      }

      // 5) Execução (approve -> buy)
      await buyWithUsdc({
        buyer,
        chainId,
        usdAmount,
        saleAddress: saleAddress!,
      })

      onSuccess?.()
    } catch (e: any) {
      setLocalError(e?.shortMessage ?? e?.message ?? 'Falha ao comprar com USDC')
    }
  }

  const anyError = localError || error
  const labelText = loading ? 'Carregando…' : connecting ? 'Conectando…' : label

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={className}
        style={style}
        aria-disabled={disabled}
      >
        <span className="inline-flex items-center justify-center gap-2">
          <span className="relative inline-flex h-5 w-5 items-center justify-center">
            <Wallet className="h-5 w-5" aria-hidden />
            <CircleDollarSign className="absolute -bottom-1 -right-1 h-3 w-3" aria-hidden />
          </span>
          <span>{labelText}</span>
        </span>
      </button>

      {anyError && (
        <p className="mt-3 text-xs text-red-600" role="alert">
          {anyError}
        </p>
      )}
    </>
  )
}
