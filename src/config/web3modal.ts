'use client'

import { cookieStorage, createStorage } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, arbitrum, polygon, base, sepolia } from '@reown/appkit/networks'

export const projectId = process.env.NEXT_PUBLIC_WEB3MODAL_PROJECT_ID!
if (!projectId) throw new Error('Project ID is not defined')

// 👇 array MUTÁVEL (sem "as const", sem "satisfies")
export const networks = [mainnet, arbitrum, polygon, base, sepolia]

export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks, // OK
  ssr: true,
  storage: createStorage({ storage: cookieStorage }),
  // se essa prop gerar warning de tipos na sua versão, remova-a
  // autoConnect: true,
})

export const config = wagmiAdapter.wagmiConfig
