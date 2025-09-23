'use client'

import React, { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cookieToInitialState, WagmiProvider } from 'wagmi'
import { wagmiAdapter, projectId, networks } from '@/config/web3modal'
import { createAppKit } from '@reown/appkit/react'
// IMPORTANTE: não force defaultChain agora; deixe a carteira escolher

const metadata = {
  name: 'Bloxify',
  description: 'Tokenização',
  url: 'http://localhost:3000',
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
}

// evita criar AppKit 2x em HMR
let inited = false
if (typeof window !== 'undefined' && !inited) {
  createAppKit({
    adapters: [wagmiAdapter],
    projectId,
    // 👇 se o TS encher o saco aqui, faça um cast controlado e siga em frente
    networks: networks as unknown as [any, ...any[]],
    // não setar defaultChain => AppKit usa a rede da carteira do usuário
    metadata,
    features: { connectMethodsOrder: ['wallet'] },
  })
  inited = true
}

const queryClient = new QueryClient()

export default function ContextProvider({
  children,
  cookies,
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
