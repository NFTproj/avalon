import { useEffect, useState } from 'react'
import { Contract } from 'ethers'
import { Card, WalletAsset } from '@/types/card'
import { getProvider } from '@/utils/getProvider'
import { erc20Abi } from '@/utils/erc20'

export function useUserTokenBalances(
  cards: Card[] | undefined,
  walletAddress: `0x${string}` | undefined,
) {
  const [assets, setAssets] = useState<WalletAsset[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!cards || !walletAddress) return

    let cancelled = false

    ;(async () => {
      setLoading(true)
      const rows: WalletAsset[] = []

      await Promise.all(
        cards.map(async (card) => {
          const { tokenAddress, tokenChainId } = card.CardBlockchainData

          try {
            const provider = getProvider(tokenChainId)
            const contract = new Contract(tokenAddress, erc20Abi, provider)

            const [balance, decimals, symbol] = await Promise.all([
              contract.balanceOf(walletAddress) as Promise<bigint>,
              contract.decimals() as Promise<number>,
              contract.symbol() as Promise<string>,
            ])

            if (!cancelled && balance > BigInt(0)) {
              rows.push({ card, balanceRaw: balance, decimals, symbol })
            }
          } catch (err) {
            /* não bloqueia a página se um token falhar */
            console.warn('Erro lendo token', tokenAddress, err)
          }
        }),
      )

      if (!cancelled) {
        setAssets(rows)
        setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [cards, walletAddress])

  return { assets, loading }
}
