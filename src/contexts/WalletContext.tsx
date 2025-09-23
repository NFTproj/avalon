// src/contexts/WalletContext.tsx
'use client'

import React, { createContext, useContext, useMemo, useCallback } from 'react'
import { useAccount, useDisconnect, useSwitchChain, useSignMessage } from 'wagmi'
import { createAppKit, useAppKit } from '@reown/appkit/react'
import { wagmiAdapter, projectId, networks } from '@/config/web3modal'

type WalletCtx = {
  address?: `0x${string}`
  isConnected: boolean
  chainId?: number
  connector?: any
  openModal: () => Promise<void>
  disconnect: () => Promise<void>
  ensureConnected: () => Promise<`0x${string}`>
  ensureChain: (target: number) => Promise<void>
  signAndGetSig: (message: string) => Promise<string>
}

const Ctx = createContext<WalletCtx | null>(null)

// ========== AppKit init no escopo do módulo (client-only) ==========
const metadata = {
  name: 'Bloxify',
  description: 'Tokenização',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
}

declare global {
  interface Window { __APPKIT_INIT__?: boolean }
}

if (typeof window !== 'undefined' && !window.__APPKIT_INIT__) {
  createAppKit({
    adapters: [wagmiAdapter],
    projectId,
    networks: networks as unknown as [any, ...any[]],
    metadata,
    features: { connectMethodsOrder: ['wallet'] },
    // não defina defaultChain; usa a rede da carteira do usuário
  })
  window.__APPKIT_INIT__ = true
}
// ================================================================

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected, chainId, connector } = useAccount()
  const { disconnectAsync } = useDisconnect()
  const { switchChainAsync } = useSwitchChain()
  const { open } = useAppKit()
  const { signMessageAsync } = useSignMessage()

  const openModal = useCallback(async () => {
    await open?.()
  }, [open])

  const disconnect = useCallback(async () => {
    await disconnectAsync()
  }, [disconnectAsync])

  const ensureConnected = useCallback(async () => {
    if (isConnected && address) return address as `0x${string}`
    await openModal()
    // aguarda o Wagmi refletir a conexão
    return await new Promise<`0x${string}`>((resolve, reject) => {
      let tries = 0
      const id = setInterval(() => {
        tries++
        const a = (window as any)?.ethereum?.selectedAddress || undefined
        if (typeof a === 'string' && a.startsWith('0x')) {
          clearInterval(id)
          resolve(a as `0x${string}`)
        } else if (tries > 60) {
          clearInterval(id)
          reject(new Error('Conexão de carteira não confirmada.'))
        }
      }, 100)
    })
  }, [isConnected, address, openModal])

  const ensureChain = useCallback(
    async (target: number) => {
      if (!target) throw new Error('chainId alvo inválido')
      if (chainId === target) return
      await switchChainAsync({ chainId: target })
    },
    [chainId, switchChainAsync]
  )

  const signAndGetSig = useCallback(
    async (message: string) => {
      if (!message) throw new Error('Mensagem vazia para assinatura')
      return await signMessageAsync({ message })
    },
    [signMessageAsync]
  )

  const value = useMemo<WalletCtx>(() => ({
    address: address as `0x${string}` | undefined,
    isConnected,
    chainId,
    connector,
    openModal,
    disconnect,
    ensureConnected,
    ensureChain,
    signAndGetSig,
  }), [address, isConnected, chainId, connector, openModal, disconnect, ensureConnected, ensureChain, signAndGetSig])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useWallet() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useWallet deve ser usado dentro de <WalletProvider>')
  return v
}
