'use client'

import React, { createContext, useContext, useCallback, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api/client'   // seu axios pré-configurado

interface AuthContextData {
  accessToken : string | null
  refreshToken: string | null
  isAuthenticated: boolean
  login  : (access: string, refresh: string) => void
  logout : () => void
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData)
export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()

  /* tokens ficam só para a sessão atual */
  const [accessToken , setAccessToken ] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)

  /* -------- 1. carrega o que existe no sessionStorage ---------- */
  useEffect(() => {
    const storedAccess = sessionStorage.getItem('accessToken');
    const storedRefresh = sessionStorage.getItem('refreshToken');
    if (storedAccess) setAccessToken(storedAccess);
    if (storedRefresh) setRefreshToken(storedRefresh);
  }, []);

  /* -------- 2. salva sempre que mudar ---------- */
  useEffect(() => {
    if (accessToken) sessionStorage.setItem('accessToken', accessToken);
    if (refreshToken) sessionStorage.setItem('refreshToken', refreshToken);
  }, [accessToken, refreshToken]);

  /* -------- 3. funções públicas ---------- */
  const login = useCallback((access: string, refresh: string) => {
    setAccessToken(access);
    setRefreshToken(refresh);
    router.replace('/dashboard');
  }, [router]);

  const logout = useCallback(() => {
    setAccessToken(null)
    setRefreshToken(null)
    sessionStorage.clear()
    router.replace('/login')
  }, [router])

  const value: AuthContextData = {
    accessToken,
    refreshToken,
    isAuthenticated: !!accessToken,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
