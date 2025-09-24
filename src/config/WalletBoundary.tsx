'use client'

import { WalletProvider } from '@/contexts/WalletContext'

export default function WalletBoundary({ children }: { children: React.ReactNode }) {
  return <WalletProvider>{children}</WalletProvider>
}
