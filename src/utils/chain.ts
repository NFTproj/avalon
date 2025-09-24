// src/utils/chain.ts
export const CHAIN = {
  MAINNET: 1,
  POLYGON: 137,
  ARBITRUM: 42161,
  BASE: 8453,
  SEPOLIA: 11155111,
} as const

export function inferChainIdFromToken(token: any): number | undefined {
  const card = token?.CardBlockchainData ?? null
  const rawPlatform =
    token?.blockchainPlatform ??
    card?.blockchainPlatform ??
    card?.tokenNetwork ??
    token?.network ??
    token?.chain ??
    ''
  const p = String(rawPlatform || '').toLowerCase().trim()

  if (typeof card?.tokenChainId === 'number') return card.tokenChainId
  if (typeof token?.chainId === 'number') return token.chainId
  if (typeof token?.networkChainId === 'number') return token.networkChainId

  if (p.includes('polygon') || p === 'matic') return CHAIN.POLYGON
  if (p.includes('arbitrum') || p === 'arb') return CHAIN.ARBITRUM
  if (p.includes('base')) return CHAIN.BASE
  if (p.includes('sepolia')) return CHAIN.SEPOLIA
  if (p.includes('ethereum') || p === 'eth' || p === 'mainnet') return CHAIN.MAINNET

  return undefined
}
