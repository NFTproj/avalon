import * as React from 'react'
import { usePublicClient, useWriteContract, useSwitchChain, useChainId } from 'wagmi'
import { parseUnits, zeroAddress } from 'viem'
import { erc20Abi } from '@/lib/contracts/abis/erc20'
import { saleAbi } from '@/lib/contracts/abis/sale'
import { USDC_ADDRESS, STABLE_DECIMALS } from '@/lib/contracts/registry/stablecoins' // ou stablecoins.ts

type HexAddr = `0x${string}`

type BuyWithUsdcParams = {
  buyer: HexAddr
  chainId: number
  usdAmount: number
  saleAddress: HexAddr
  usdcAddress?: HexAddr
}

export function useUsdcBuy() {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Pode ser undefined dependendo da config → vamos checar antes de usar.
  const publicClient = usePublicClient()
  const { writeContractAsync } = useWriteContract()
  const activeChainId = useChainId()
  const { switchChainAsync } = useSwitchChain()

  async function ensureAllowance(
    owner: HexAddr,
    token: HexAddr,
    spender: HexAddr,
    needed: bigint,
    chainId: number
  ) {
    if (!publicClient) throw new Error('RPC indisponível (publicClient não inicializado)')

    // read allowance
    const current = await publicClient.readContract({
      address: token,
      abi: erc20Abi,
      functionName: 'allowance',
      args: [owner, spender],
    }) as bigint

    if (current >= needed) return

    // approve
    const approveHash = await writeContractAsync({
      chainId,
      address: token,
      abi: erc20Abi,
      functionName: 'approve',
      args: [spender, needed],
    })

    // esperar receipt
    await publicClient.waitForTransactionReceipt({ hash: approveHash })
  }

  async function buyWithUsdc(params: BuyWithUsdcParams) {
    const { buyer, chainId, usdAmount, saleAddress, usdcAddress } = params

    if (!buyer || buyer === (zeroAddress as any)) throw new Error('Carteira não conectada')
    if (!Number.isFinite(usdAmount) || usdAmount <= 0) throw new Error('Valor inválido')
    if (!publicClient) throw new Error('RPC indisponível (publicClient não inicializado)')

    // troca para a rede do card, se necessário
    if (chainId !== activeChainId) {
      await switchChainAsync?.({ chainId })
    }

    const usdc = usdcAddress ?? (USDC_ADDRESS as HexAddr)
    const stableAmount = parseUnits(usdAmount.toFixed(2), STABLE_DECIMALS)

    setLoading(true)
    setError(null)
    try {
      // 1) approve se necessário
      await ensureAllowance(buyer, usdc, saleAddress, stableAmount, chainId)

      // 2) buyTokens(_stablecoinAmount)
      const buyHash = await writeContractAsync({
        chainId,
        address: saleAddress,
        abi: saleAbi,
        functionName: 'buyTokens',
        args: [stableAmount],
      })

      const receipt = await publicClient.waitForTransactionReceipt({ hash: buyHash })
      return receipt
    } catch (e: any) {
      const msg = e?.shortMessage || e?.message || 'Erro ao comprar com USDC'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }

  return { buyWithUsdc, loading, error }
}