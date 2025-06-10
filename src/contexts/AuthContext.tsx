'use client'

import { createContext, useContext } from 'react'
import useSWR from 'swr'
import { apiFetch } from '@/lib/api/fetcher'
import { useRouter } from 'next/navigation'
import { useDisconnect } from 'wagmi'
import { useAppKit } from '@reown/appkit/react' // ✅ substitui o useWeb3Modal

type MeResponse = { user: any | null }

type AuthValue = {
  user: any | null
  loading: boolean
  logout: () => Promise<void>
  mutate: () => void
}

const AuthCtx = createContext<AuthValue>({} as AuthValue)
export const useAuth = () => useContext(AuthCtx)

export let mutateUser: () => void = () => {}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { disconnect } = useDisconnect()
  const { close } = useAppKit() // ✅ substituto seguro do useWeb3Modal

  const {
    data,
    isLoading,
    mutate,
  } = useSWR<MeResponse>(
    '/api/auth/me',
    (url) => apiFetch<MeResponse>(url),
    { revalidateOnFocus: false }
  )

  mutateUser = mutate

  const logout = async () => {
    try {
      disconnect()        // Desconecta carteira
      close()             // Fecha modal da carteira
      sessionStorage.removeItem('accessToken')
      sessionStorage.removeItem('refreshToken')

      await apiFetch('/api/auth/logout', { method: 'POST' })

      mutate()
      router.replace('/login')
    } catch (err) {
      console.error('[Logout error]', err)
    }
  }

  return (
    <AuthCtx.Provider
      value={{
        user: data?.user ?? null,
        loading: isLoading,
        logout,
        mutate,
      }}
    >
      {children}
    </AuthCtx.Provider>
  )
}
