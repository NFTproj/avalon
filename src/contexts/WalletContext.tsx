// src/contexts/WalletContext.tsx
'use client'

import React, { createContext, useContext, useMemo, useCallback } from 'react'
import { useAccount, useDisconnect, useSwitchChain, useSignMessage } from 'wagmi'
import { createAppKit, useAppKit } from '@reown/appkit/react'
import { wagmiAdapter, projectId, networks } from '@/config/web3modal'
import { getAccount, watchAccount } from '@wagmi/core' // ⬅️ actions do wagmi

type WalletCtx = {
  address?: `0x${string}`
  isConnected: boolean
  chainId?: number
  connector?: any
  openModal: () => Promise<void>
  disconnect: () => Promise<void>
  ensureConnected: () => Promise<`0x${string}`>
  ensureChain: (target: number) => Promise<void>
  ensureConnectedOnChain: (target: number) => Promise<`0x${string}`>  // ⬅️ novo helper
  signAndGetSig: (message: string) => Promise<string>
}

const Ctx = createContext<WalletCtx | null>(null)

/* ——— AppKit init (client-only, uma vez) ——— */
const metadata = {
  name: 'Bloxify',
  description: 'Tokenização',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
}

declare global { interface Window { __APPKIT_INIT__?: boolean } }

if (typeof window !== 'undefined' && !window.__APPKIT_INIT__) {
  createAppKit({
    adapters: [wagmiAdapter],
    projectId,
    networks: networks as unknown as [any, ...any[]],
    metadata,
    features: { connectMethodsOrder: ['wallet'] },
  })
  window.__APPKIT_INIT__ = true
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected, chainId, connector } = useAccount()
  const { disconnectAsync } = useDisconnect()
  const { switchChainAsync } = useSwitchChain()
  const { open } = useAppKit()
  const { signMessageAsync } = useSignMessage()

  const openModal = useCallback(async () => { await open?.() }, [open])

  const disconnect = useCallback(async () => { await disconnectAsync() }, [disconnectAsync])

  // ✅ Conecta usando actions do wagmi, funciona com MetaMask e WalletConnect
  const ensureConnected = useCallback(async () => {
    const cfg = wagmiAdapter.wagmiConfig
    const acc = getAccount(cfg)
    if (acc.isConnected && acc.address) return acc.address as `0x${string}`

    await openModal()

    return await new Promise<`0x${string}`>((resolve, reject) => {
      const timeout = setTimeout(() => {
        unwatch(); reject(new Error('Conexão de carteira não confirmada.'))
      }, 30_000) // 30s

      const unwatch = watchAccount(cfg, {
        onChange(a) {
          if (a.status === 'connected' && a.address) {
            clearTimeout(timeout)
            unwatch()
            resolve(a.address as `0x${string}`)
          }
        },
      })
    })
  }, [openModal])

  // ✅ Troca de rede (só depois de conectado)
  const ensureChain = useCallback(async (target: number) => {
    if (!target) throw new Error('chainId alvo inválido')
    // se ainda não estiver conectado, o switch pode falhar em alguns conectores
    const cfg = wagmiAdapter.wagmiConfig
    const acc = getAccount(cfg)
    if (!acc.isConnected) await ensureConnected()

    if (chainId !== target) {
      await switchChainAsync({ chainId: target })
    }
  }, [chainId, ensureConnected, switchChainAsync])

  // ✅ Helper que faz os dois passos em sequência
  const ensureConnectedOnChain = useCallback(async (target: number) => {
    const addr = await ensureConnected()
    await ensureChain(target)
    return addr
  }, [ensureConnected, ensureChain])

  const signAndGetSig = useCallback(async (message: string) => {
    if (!message) throw new Error('Mensagem vazia para assinatura')
    return await signMessageAsync({ message })
  }, [signMessageAsync])

  const value = useMemo<WalletCtx>(() => ({
    address: address as `0x${string}` | undefined,
    isConnected,
    chainId,
    connector,
    openModal,
    disconnect,
    ensureConnected,
    ensureChain,
    ensureConnectedOnChain, // ⬅️ exposto
    signAndGetSig,
  }), [address, isConnected, chainId, connector, openModal, disconnect, ensureConnected, ensureChain, ensureConnectedOnChain, signAndGetSig])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useWallet() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useWallet deve ser usado dentro de <WalletProvider>')
  return v
}
