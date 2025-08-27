// app/ClientSWRProvider.tsx
'use client'
import { SWRConfig } from 'swr'

export default function ClientSWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={{
      provider: () => new Map(),
      dedupingInterval: 30_000,
      revalidateOnFocus: false,
    }}>
      {children}
    </SWRConfig>
  )
}
