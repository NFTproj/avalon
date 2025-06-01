// src/contexts/AuthContext.tsx
'use client'

import { createContext, useContext } from 'react'
import useSWR from 'swr'
import { apiFetch } from '@/lib/api/fetcher'
import { useRouter } from 'next/navigation'

type MeResponse = { user: any | null }   // 👈 tipagem da rota /api/auth/me

type AuthValue = {
  user: any | null
  loading: boolean
  logout: () => Promise<void>
  mutate: () => void
}

const AuthCtx = createContext<AuthValue>({} as AuthValue)
export const useAuth = () => useContext(AuthCtx)

/* --------------- exporta mutate para refreshAccess ---------------- */
export let mutateUser: () => void = () => {}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  /* ---------- agora usamos <MeResponse> ---------- */
  const {
    data,
    isLoading,
    mutate,
  } = useSWR<MeResponse>(
    '/api/auth/me',
    (url) => apiFetch<MeResponse>(url),
    { revalidateOnFocus: false },
  )

  mutateUser = mutate            // permite refreshAccess → mutate()

  const logout = async () => {
    await apiFetch('/api/auth/logout', { method: 'POST' })
    mutate()                      // zera user no contexto
    router.replace('/login')
  }

  return (
    <AuthCtx.Provider
      value={{
        user   : data?.user ?? null,   // ← agora TS conhece a chave user
        loading: isLoading,
        logout,
        mutate,
      }}
    >
      {children}
    </AuthCtx.Provider>
  )
}
