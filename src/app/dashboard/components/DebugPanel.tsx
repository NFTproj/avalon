'use client'

import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
export default function DebugPanel() {
  const [isOpen, setIsOpen] = useState(true)
  const [debugData, setDebugData] = useState<any>(null)
  const [backendDebugData, setBackendDebugData] = useState<any>(null)
  const [tokenDebugData, setTokenDebugData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [backendLoading, setBackendLoading] = useState(false)
  const [tokenLoading, setTokenLoading] = useState(false)
  const { user, loading: authLoading } = useAuth()
  // const walletData = useUserWalletFromMe(user?.balances) // Hook não existe

  const fetchDebugData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/debug/me', {
        credentials: 'include'
      })
      const data = await response.json()
      setDebugData(data)
    } catch (error) {
      setDebugData({ error: 'Erro ao buscar dados' })
    } finally {
      setLoading(false)
    }
  }

  const fetchBackendDebugData = async () => {
    setBackendLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_BLOXIFY_URL_BASE || 'https://bloxify-production.blocklize.io'
      
      const tokenResponse = await fetch('/api/auth/me', {
        credentials: 'include'
      })
      
      if (!tokenResponse.ok) {
        throw new Error('Não foi possível obter token de acesso')
      }

      // Fazer chamada direta ao backend debug
      const backendResponse = await fetch('/api/debug/backend-me', {
        credentials: 'include'
      })
      
      if (!backendResponse.ok) {
        throw new Error(`Backend debug failed: ${backendResponse.status}`)
      }
      
      const data = await backendResponse.json()
      setBackendDebugData(data)
    } catch (error) {
      setBackendDebugData({ error: error instanceof Error ? error.message : 'Erro ao buscar dados do backend' })
    } finally {
      setBackendLoading(false)
    }
  }

  const fetchTokenDebugData = async () => {
    setTokenLoading(true)
    try {
      const response = await fetch('/api/debug/user-tokens', {
        credentials: 'include'
      })
      const data = await response.json()
      setTokenDebugData(data)
    } catch (error) {
      setTokenDebugData({ error: error instanceof Error ? error.message : 'Erro ao buscar dados de tokens' })
    } finally {
      setTokenLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50"
      >
       Debug
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 border-red-500 rounded-lg shadow-xl p-4 max-w-lg max-h-96 overflow-auto z-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-red-600">Debug Panel</h3>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-red-600 hover:bg-red-100 rounded px-2 py-1"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4 text-xs">
        {/* Status de Auth */}
        <div className="bg-gray-50 p-2 rounded">
          <h4 className="font-semibold mb-1">Auth Status</h4>
          <p><strong>Loading:</strong> {authLoading ? 'SIM' : 'NÃO'}</p>
          <p><strong>User:</strong> {user ? 'LOGADO' : 'NÃO LOGADO'}</p>
          <p><strong>Nome:</strong> {user?.name || 'N/A'}</p>
          <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
          <p><strong>Wallet:</strong> {user?.walletAddress || 'N/A'}</p>
          <p><strong>KYC Status:</strong> {user?.kycStatus || 'N/A'}</p>
        </div>

        {/* Status da Carteira */}
        <div className="bg-blue-50 p-2 rounded">
          <h4 className="font-semibold mb-1"> Wallet Status</h4>
          <p><strong>Balances:</strong> N/A (propriedade não existe)</p>
          <p><strong>Assets:</strong> N/A (hook não implementado)</p>
          <p><strong>Total Value:</strong> N/A (hook não implementado)</p>
          <p><strong>Has Assets:</strong> N/A (hook não implementado)</p>
          <p><strong>Loading:</strong> N/A (hook não implementado)</p>
        </div>

        {/* Botões para testar APIs */}
        <div className="space-y-2">
          <button
            onClick={fetchDebugData}
            disabled={loading}
            className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? ' Carregando...' : 'Testar API Frontend'}
          </button>
          
          <button
            onClick={fetchBackendDebugData}
            disabled={backendLoading}
            className="w-full bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 disabled:opacity-50"
          >
            {backendLoading ? ' Carregando...' : ' Debug Backend Completo'}
          </button>

          <button
            onClick={fetchTokenDebugData}
            disabled={tokenLoading}
            className="w-full bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700 disabled:opacity-50"
          >
            {tokenLoading ? 'Carregando...' : 'Debug Tokens do Usuário'}
          </button>
        </div>

        {/* Dados da API Debug Frontend */}
        {debugData && (
          <div className="bg-green-50 p-2 rounded">
            <h4 className="font-semibold mb-1"> Frontend API Debug</h4>
            <pre className="text-xs bg-white p-2 rounded border max-h-32 overflow-auto">
              {JSON.stringify(debugData, null, 2)}
            </pre>
          </div>
        )}

        {/* Dados do Backend Debug */}
        {backendDebugData && (
          <div className="bg-red-50 p-2 rounded">
            <h4 className="font-semibold mb-1"> Backend Debug</h4>
            <pre className="text-xs bg-white p-2 rounded border max-h-40 overflow-auto">
              {JSON.stringify(backendDebugData, null, 2)}
            </pre>
          </div>
        )}

        {/* Raw Balances Data */}
        <div className="bg-yellow-50 p-2 rounded">
          <h4 className="font-semibold mb-1"> Raw Balances</h4>
          <pre className="text-xs bg-white p-2 rounded border max-h-32 overflow-auto">
            Propriedade 'balances' não existe no tipo AuthUser
          </pre>
        </div>
      </div>
    </div>
  )
}