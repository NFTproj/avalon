// src/lib/contracts/registry/stablecoins.ts
export type HexAddr = `0x${string}`

// USDC nativo (Circle) na Polygon (chainId 137):
//  - Nativo: 0x3c499c54...  ✅
//  - Bridged (USDC.e): 0x2791Bca1...  ⛔ (não use se o sale espera o nativo)
export const USDC_ADDRESS: Record<number, HexAddr> = {
  137: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
  // Se usar testnet Amoy, preencha aqui:
  // 80002: '0x....',
}

export const STABLE_DECIMALS: Record<number, number> = {
  137: 6,
  // 80002: 6,
}
