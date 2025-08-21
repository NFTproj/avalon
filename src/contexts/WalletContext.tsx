'use client'

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react'
import { useAccount, useSwitchChain, useChainId } from 'wagmi'
import { WalletData, Network, SUPPORTED_NETWORKS, WalletError } from '@/types/wallet'

// Estado do contexto
interface WalletState {
  wallets: WalletData[]
  activeWallet: WalletData | null
  isLoading: boolean
  error: string | null
  selectedNetwork: Network
  isConnected: boolean
}

// Ações do reducer
type WalletAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_WALLETS'; payload: WalletData[] }
  | { type: 'SET_ACTIVE_WALLET'; payload: WalletData | null }
  | { type: 'SET_SELECTED_NETWORK'; payload: Network }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'UPDATE_WALLET_DATA'; payload: { address: string; data: Partial<WalletData> } }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET_STATE' }

// Estado inicial
const initialState: WalletState = {
  wallets: [],
  activeWallet: null,
  isLoading: false,
  error: null,
  selectedNetwork: SUPPORTED_NETWORKS[0], // Ethereum por padrão
  isConnected: false,
}

// Reducer para gerenciar o estado
function walletReducer(state: WalletState, action: WalletAction): WalletState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }
    
    case 'SET_WALLETS':
      return { ...state, wallets: action.payload }
    
    case 'SET_ACTIVE_WALLET':
      return { ...state, activeWallet: action.payload }
    
    case 'SET_SELECTED_NETWORK':
      return { ...state, selectedNetwork: action.payload }
    
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload }
    
    case 'UPDATE_WALLET_DATA':
      return {
        ...state,
        wallets: state.wallets.map(wallet =>
          wallet.address === action.payload.address
            ? { ...wallet, ...action.payload.data }
            : wallet
        ),
        activeWallet: state.activeWallet?.address === action.payload.address
          ? { ...state.activeWallet, ...action.payload.data }
          : state.activeWallet,
      }
    
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    
    case 'RESET_STATE':
      return initialState
    
    default:
      return state
  }
}

// Interface do contexto
interface WalletContextValue {
  // Estado
  wallets: WalletData[]
  activeWallet: WalletData | null
  isLoading: boolean
  error: string | null
  selectedNetwork: Network
  isConnected: boolean
  
  // Ações
  connectWallet: (network: Network) => Promise<void>
  disconnectWallet: (address: string) => void
  refreshData: () => Promise<void>
  switchNetwork: (network: Network) => Promise<void>
  clearError: () => void
  updateWalletData: (address: string, data: Partial<WalletData>) => void
}

// Criação do contexto
const WalletContext = createContext<WalletContextValue | undefined>(undefined)

// Provider do contexto
export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(walletReducer, initialState)
  
  // Hooks do Wagmi
  const { address, isConnected: wagmiConnected } = useAccount()
  const { switchChain } = useSwitchChain()
  const chainId = useChainId()
  
  // Atualizar estado de conexão quando Wagmi mudar
  React.useEffect(() => {
    dispatch({ type: 'SET_CONNECTED', payload: wagmiConnected })
    
    if (wagmiConnected && address) {
      // Usuário conectado - buscar dados da wallet
      refreshData()
    } else {
      // Usuário desconectado - limpar dados
      dispatch({ type: 'SET_WALLETS', payload: [] })
      dispatch({ type: 'SET_ACTIVE_WALLET', payload: null })
    }
  }, [wagmiConnected, address])
  
  // Atualizar rede selecionada quando chainId mudar
  React.useEffect(() => {
    const network = SUPPORTED_NETWORKS.find(n => n.id === chainId)
    if (network && network.id !== state.selectedNetwork.id) {
      dispatch({ type: 'SET_SELECTED_NETWORK', payload: network })
    }
  }, [chainId, state.selectedNetwork.id])
  
  // Conectar wallet
  const connectWallet = useCallback(async (network: Network) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'CLEAR_ERROR' })
      
      // Se não estiver conectado, conectar via Wagmi
      if (!wagmiConnected) {
        // Aqui você pode implementar a lógica de conexão
        // Por enquanto, vamos assumir que já está conectado
        throw new Error('Wallet connection not implemented yet')
      }
      
      // Se estiver conectado mas em rede diferente, trocar rede
      if (chainId !== network.id) {
        await switchChain({ chainId: network.id })
      }
      
      dispatch({ type: 'SET_SELECTED_NETWORK', payload: network })
      
      // Buscar dados da wallet
      await refreshData()
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      console.error('[WalletContext] Connect wallet error:', error)
    }
  }, [wagmiConnected, chainId, switchChain])
  
  // Desconectar wallet
  const disconnectWallet = useCallback((address: string) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    
    try {
      // Remover wallet específica
      const updatedWallets = state.wallets.filter(w => w.address !== address)
      dispatch({ type: 'SET_WALLETS', payload: updatedWallets })
      
      // Se era a wallet ativa, limpar
      if (state.activeWallet?.address === address) {
        dispatch({ type: 'SET_ACTIVE_WALLET', payload: null })
      }
      
      dispatch({ type: 'SET_LOADING', payload: false })
    } catch (error) {
      console.error('[WalletContext] Disconnect wallet error:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to disconnect wallet' })
    }
  }, [state.wallets, state.activeWallet])
  
  // Atualizar dados da wallet
  const refreshData = useCallback(async () => {
    if (!address || !wagmiConnected) return
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'CLEAR_ERROR' })
      
      // TODO: Implementar busca de dados reais da blockchain
      // Por enquanto, vamos criar dados mock para teste
      const mockWalletData: WalletData = {
        address,
        network: state.selectedNetwork,
        balance: {
          native: '0.0',
          usd: 0,
        },
        tokens: [],
        transactions: [],
        lastUpdated: new Date(),
        totalValueUSD: 0,
      }
      
      dispatch({ type: 'SET_WALLETS', payload: [mockWalletData] })
      dispatch({ type: 'SET_ACTIVE_WALLET', payload: mockWalletData })
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh wallet data'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      console.error('[WalletContext] Refresh data error:', error)
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [address, wagmiConnected, state.selectedNetwork])
  
  // Trocar rede
  const switchNetwork = useCallback(async (network: Network) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'CLEAR_ERROR' })
      
      if (chainId !== network.id) {
        await switchChain({ chainId: network.id })
      }
      
      dispatch({ type: 'SET_SELECTED_NETWORK', payload: network })
      
      // Atualizar dados para a nova rede
      await refreshData()
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to switch network'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      console.error('[WalletContext] Switch network error:', error)
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [chainId, switchChain, refreshData])
  
  // Limpar erro
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' })
  }, [])
  
  // Atualizar dados específicos da wallet
  const updateWalletData = useCallback((address: string, data: Partial<WalletData>) => {
    dispatch({ type: 'UPDATE_WALLET_DATA', payload: { address, data } })
  }, [])
  
  // Valor do contexto
  const contextValue: WalletContextValue = {
    // Estado
    wallets: state.wallets,
    activeWallet: state.activeWallet,
    isLoading: state.isLoading,
    error: state.error,
    selectedNetwork: state.selectedNetwork,
    isConnected: state.isConnected,
    
    // Ações
    connectWallet,
    disconnectWallet,
    refreshData,
    switchNetwork,
    clearError,
    updateWalletData,
  }
  
  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  )
}

// Hook para usar o contexto
export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

// Hook para verificar se o contexto está disponível
export function useWalletContext() {
  const context = useContext(WalletContext)
  return context
}
