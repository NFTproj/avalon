'use client'

import React, { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cookieToInitialState, WagmiProvider } from 'wagmi'
import { wagmiAdapter, projectId } from '@/config/web3modal'
import { createAppKit } from '@reown/appkit/react'
import { mainnet, arbitrum } from '@reown/appkit/networks'

// Metadados para o modal do Web3Modal / AppKit
const metadata = {
  name: 'Bloxify',
  description: 'Tokenização',
  url: 'http://localhost:3000',
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

// Criação do modal
createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [mainnet, arbitrum],
  defaultNetwork: mainnet,
  metadata,
  features: {
    // Adicione esta propriedade para controlar os métodos de conexão
    connectMethodsOrder: ['wallet']
    // Se você tiver outras features, mantenha-as aqui, por exemplo:
    // analytics: true,
    // swaps: false,
    // onramp: false,
  }
})

// Instância do React Query Client
const queryClient = new QueryClient()

// Componente que fornece contexto do AppKit + Wagmi
export default function ContextProvider({
  children,
  cookies
}: {
  children: ReactNode
  cookies: string | null
}) {
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig, cookies)

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
