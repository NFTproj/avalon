// src/contexts/AppKitInit.tsx
'use client'

import { useEffect, useRef } from 'react'
import { createAppKit } from '@reown/appkit/react'
import { wagmiAdapter } from '@/config/web3modal'
import { projectId, networks } from '@/config/web3modal'

const metadata = {
  name: 'Bloxify',
  description: 'Tokenização',
  url: 'https://bloxify.app', // ajuste
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
}

export default function AppKitInit() {
  const initedRef = useRef(false)

  useEffect(() => {
    if (initedRef.current) return
    if (typeof window === 'undefined') return

    createAppKit({
      adapters: [wagmiAdapter],
      projectId,
      networks: networks as unknown as [any, ...any[]],
      metadata,
      features: { connectMethodsOrder: ['wallet'] },
      // não setar defaultChain: usa a rede da carteira
    })

    initedRef.current = true
  }, [])

  return null
}
