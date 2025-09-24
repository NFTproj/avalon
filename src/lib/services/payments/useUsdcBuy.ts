// src/lib/services/payments/useUsdcBuy.ts
import * as React from 'react'
import { parseUnits, zeroAddress } from 'viem'
import { erc20Abi } from '@/lib/contracts/abis/erc20'         // tem allowance/approve
import { saleAbi } from '@/lib/contracts/abis/sale'
import { USDC_ADDRESS, STABLE_DECIMALS } from '@/lib/contracts/registry/stablecoins'
import { useWriteContract, useSwitchChain } from 'wagmi'
import { wagmiAdapter } from '@/config/web3modal'
import { getPublicClient, getAccount } from '@wagmi/core'

type HexAddr = `0x${string}`

/** ABI mínimo só para ler `decimals()` */
const erc20MetaAbi = [
  {
    type: 'function',
    name: 'decimals',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint8' }],
  },
] as const

type BuyWithUsdcParams = {
  buyer: HexAddr
  chainId: number
  usdAmount: number
  saleAddress: HexAddr
  usdcAddress?: HexAddr // override opcional
}

export function useUsdcBuy() {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const { writeContractAsync } = useWriteContract()
  const { switchChainAsync } = useSwitchChain()

  function getPc(targetChainId: number) {
    const pc = getPublicClient(wagmiAdapter.wagmiConfig, { chainId: targetChainId })
    if (!pc) throw new Error('RPC indisponível para a rede alvo')
    return pc
  }

  async function ensureAllowance(
    owner: HexAddr,
    token: HexAddr,
    spender: HexAddr,
    needed: bigint,
    chainId: number
  ) {
    const pc = getPc(chainId)

    const current = (await pc.readContract({
      address: token,
      abi: erc20Abi,        // aqui seu ABI com allowance/approve
      functionName: 'allowance',
      args: [owner, spender],
    })) as bigint

    if (current >= needed) return

    const approveHash = await writeContractAsync({
      chainId,
      address: token,
      abi: erc20Abi,        // idem
      functionName: 'approve',
      args: [spender, needed],
    })

    await pc.waitForTransactionReceipt({ hash: approveHash })
  }

  async function buyWithUsdc(params: BuyWithUsdcParams) {
    const { buyer, chainId, usdAmount, saleAddress, usdcAddress } = params

    if (!buyer || buyer === (zeroAddress as any)) throw new Error('Carteira não conectada')
    if (!Number.isFinite(usdAmount) || usdAmount <= 0) throw new Error('Valor inválido')

    // Garante rede correta
    const acc = getAccount(wagmiAdapter.wagmiConfig)
    if (!acc.isConnected) throw new Error('Conecte sua carteira para continuar')
    if (acc.chainId !== chainId) await switchChainAsync?.({ chainId })

    // Resolve USDC por rede (ou override)
    const usdc = usdcAddress ?? USDC_ADDRESS[chainId]
    if (!usdc) throw new Error('USDC não configurado para esta rede')

    setLoading(true)
    setError(null)
    try {
      const pc = getPc(chainId)

      // Lê decimals com ABI mínimo; cai no registry se falhar
      let decimals: number = STABLE_DECIMALS[chainId] ?? 6
      try {
        const d = await pc.readContract({
          address: usdc,
          abi: erc20MetaAbi,
          functionName: 'decimals',
        })
        decimals = Number(d) // ✅ garante number (não bigint)
      } catch {
        /* keep default */
      }

      // Monta a quantia (2 casas → USD → base units com `decimals`)
      const stableAmount = parseUnits(usdAmount.toFixed(2), decimals)

      // Approve se necessário
      await ensureAllowance(buyer, usdc, saleAddress, stableAmount, chainId)

      // buyTokens(_stablecoinAmount)
      const buyHash = await writeContractAsync({
        chainId,
        address: saleAddress,
        abi: saleAbi,
        functionName: 'buyTokens',
        args: [stableAmount],
      })

      const receipt = await pc.waitForTransactionReceipt({ hash: buyHash })
      return receipt
    } catch (e: any) {
      const msg = e?.shortMessage || e?.cause?.shortMessage || e?.message || 'Erro ao comprar com USDC'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }

  return { buyWithUsdc, loading, error }
}
