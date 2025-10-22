// src/contexts/AuthContext.tsx
'use client';

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import useSWR from 'swr';

import { apiFetch } from '@/lib/api/fetcher';
import { useRouter } from 'next/navigation';
import { useDisconnect } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import LoadingOverlay from '@/components/common/LoadingOverlay';

/* 1 ▸ Tipos ---------------------------------------------------------------------------------------------------- */

export interface AuthUser {
  id: string;
  userId?: string;
  name: string;
  email: string;
  walletAddress: `0x${string}`;        
  kycStatus: 'pending' | 'approved' | 'rejected';
  kycStatusCode?: number;  
  permissions: string[];
  balances?: Array<{
    id: string;
    name: string;
    ticker?: string;
    logoUrl?: string;
    CardBlockchainData?: {
      tokenAddress?: string;
      tokenNetwork?: string;
      tokenChainId?: number;
      tokenPrice?: string;
    };
    balance: number;
  }>;
}

interface MeResponse {
  user: AuthUser | null;
}

interface AuthValue {
  user: AuthUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  mutate: () => void;
}

/* 2 ▸ Criação do contexto -------------------------------------------------------------------------------------- */

const AuthCtx = createContext<AuthValue>({} as AuthValue);
export const useAuth = () => useContext(AuthCtx);

/* 3 ▸ Mutate e logout globais (mantidos) ----------------------------------------------------------------------- */

export let logoutUser: () => Promise<void> = async () => {};
export let mutateUser: () => void = () => {};

/* 4 ▸ Provider ------------------------------------------------------------------------------------------------- */

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { disconnect } = useDisconnect();
  const { close } = useAppKit();

  const [showLoading, setShowLoading] = useState(false);

  // Verificar se está na página de login/register para não tentar autenticar
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const isPublicPage = pathname === '/login' || pathname === '/register' || pathname === '/register-metamask';

  /** 4.1 ▸ SWR para consultar /api/auth/me */
  const {
    data,
    isLoading,
    mutate,
  } = useSWR<MeResponse>(
    isPublicPage ? null : '/api/auth/me', // Desabilita SWR em páginas públicas
    url => apiFetch<MeResponse>(url),
    { 
      revalidateOnFocus: false,
      shouldRetryOnError: false, // Não tenta novamente em caso de erro
      errorRetryCount: 0, // Não faz retry
    }
  );

  /* 4.2 ▸ expõe mutate globalmente */
  mutateUser = mutate;

  /* 4.3 ▸ Logout */
  const logout = async () => {
    try {
      setShowLoading(true);
      disconnect();        // desconecta MetaMask se estiver
      close();             // fecha AppKit (Reown)
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');

      await apiFetch('/api/auth/logout', { method: 'POST' });
      mutate();            // invalida cache do /me

      // Usar window.location para forçar um hard reload e evitar erros de hidratação
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }, 800);
    } catch (err) {
      console.error('[Logout error]', err);
      setShowLoading(false);
    }
  };

  logoutUser = logout;

  /* 4.4 ▸ Valor exportado */
  const value: AuthValue = {
    user: data?.user ?? null,
    loading: isLoading,
    logout,
    mutate,
  };

  return (
    <AuthCtx.Provider value={value}>
      {showLoading && <LoadingOverlay overrideMessage="Saindo..." />}
      {children}
    </AuthCtx.Provider>
  );
}
