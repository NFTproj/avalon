'use client'

import { createContext, useContext, useState } from 'react'
import useSWR from 'swr'
import { apiFetch } from '@/lib/api/fetcher'
import { useRouter } from 'next/navigation'
import { useDisconnect } from 'wagmi'
import { useAppKit } from '@reown/appkit/react'
import LoadingOverlay from '@/components/common/LoadingOverlay'// ajuste o caminho conforme necessário

type MeResponse = { user: any | null }

type AuthValue = {
  user: any | null
  loading: boolean
  logout: () => Promise<void>
  mutate: () => void
}

const AuthCtx = createContext<AuthValue>({} as AuthValue)
export const useAuth = () => useContext(AuthCtx)
export let logoutUser: () => Promise<void> = async () => {}
export let mutateUser: () => void = () => {}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { disconnect } = useDisconnect()
  const { close } = useAppKit()

  const [showLoading, setShowLoading] = useState(false)

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
      setShowLoading(true) // 👈 ativa o loading
      disconnect()
      close()
      sessionStorage.removeItem('accessToken')
      sessionStorage.removeItem('refreshToken')

      await apiFetch('/api/auth/logout', { method: 'POST' })

      mutate()

      setTimeout(() => {
        window.location.href = '/login'
      }, 800) // dá um tempo para o loading aparecer suavemente
    } catch (err) {
      console.error('[Logout error]', err)
      setShowLoading(false)
    }
  }

  logoutUser = logout

  return (
    <AuthCtx.Provider
      value={{
        user: data?.user ?? null,
        loading: isLoading,
        logout,
        mutate,
      }}
    >
      {showLoading && <LoadingOverlay overrideMessage="Saindo..." />}
      {children}
    </AuthCtx.Provider>
  )
}
