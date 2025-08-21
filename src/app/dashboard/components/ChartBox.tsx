'use client'

import { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ConfigContext } from '@/contexts/ConfigContext'
import { useAuth } from '@/contexts/AuthContext'
import { TransactionService } from '@/lib/services/TransactionService'
import { MdShoppingCart } from 'react-icons/md'
import {
  AiFillFileText,
  AiFillWallet,
  AiFillProfile,
  AiFillCheckCircle,
} from 'react-icons/ai'

export default function ChartBox() {
  const { texts, colors } = useContext(ConfigContext)
  const { user } = useAuth()
  const router = useRouter()
  const [totalBalance, setTotalBalance] = useState(0)
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const borderColor = colors?.dashboard?.buttons?.['action-border'] || '#00ffe1'
  const iconColor = '#00838F'

  // Buscar dados reais da carteira - executar apenas quando walletAddress mudar
  useEffect(() => {
    if (!user?.walletAddress) {
      setLoading(false)
      setTotalBalance(0)
      setRecentTransactions([])
      return
    }

    let cancelled = false

    const fetchWalletData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const transactionService = new TransactionService()
        
        // Buscar histórico de transações
        const txHistory = await transactionService.getTransactionHistory(
          user.walletAddress,
          10, // últimas 10 transações
          1
        )

        if (!cancelled) {
          if (txHistory.success && txHistory.data?.transactions) {
            setRecentTransactions(txHistory.data.transactions)
            
            // Calcular saldo total baseado nas transações
            let balance = 0
            txHistory.data.transactions.forEach(tx => {
              if (tx.type === 'receive') {
                balance += parseFloat(tx.value || '0')
              } else if (tx.type === 'send') {
                balance -= parseFloat(tx.value || '0')
              }
            })
            setTotalBalance(balance)
          } else {
            console.warn('Nenhuma transação encontrada ou erro na resposta:', txHistory)
            setRecentTransactions([])
            setTotalBalance(0)
          }
        }
      } catch (error) {
        console.error('Erro ao buscar dados da carteira:', error)
        if (!cancelled) {
          setError('Erro ao carregar dados da carteira')
          setRecentTransactions([])
          setTotalBalance(0)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchWalletData()

    return () => {
      cancelled = true
    }
  }, [user?.walletAddress])

  const actionButtons = [
    { id: 1, name: 'Buy', icon: <MdShoppingCart size={22} color={iconColor} /> },
    { id: 2, name: 'Earnings', icon: <AiFillFileText size={22} color={iconColor} /> },
    { id: 3, name: 'Withdraw', icon: <AiFillWallet size={22} color={iconColor} /> },
    { id: 4, name: 'Statements', icon: <AiFillProfile size={22} color={iconColor} /> },
    { id: 5, name: 'Verify Identity', icon: <AiFillCheckCircle size={22} color={iconColor} /> },
  ]

  const handleClick = (id: number) => {
    switch (id) {
      case 1:
        router.push('/tokens')
        break
      case 5:
        router.push('/kyc')
        break
      // você pode adicionar outras rotas conforme necessário
    }
  }

  return (
    <div className="mt-6 w-full">
      {/* Card de saldo real */}
      {!loading && !error && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border-2 border-blue-200">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Saldo da Carteira
            </h3>
            <div className="text-3xl font-bold text-blue-600">
              R$ {totalBalance.toFixed(2)}
            </div>
            {recentTransactions.length > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {recentTransactions.length} transações recentes
              </p>
            )}
          </div>
        </div>
      )}

      {/* Mostrar erro se houver */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-center">
            <div className="text-red-600 mb-2">⚠️ {error}</div>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      )}

      {/* Botões de ação */}
      <div className="flex lg:hidden overflow-x-auto gap-3 px-2 scrollbar-hide">
        {actionButtons.map((button) => (
          <div
            key={button.id}
            onClick={() => handleClick(button.id)}
            className="shrink-0 w-[7rem] sm:w-[8rem] md:w-[8.5rem] h-20 bg-white rounded-md cursor-pointer hover:bg-gray-50 transition-colors px-2 py-2"
            style={{ border: `2px solid ${borderColor}` }}
          >
            <div className="flex flex-col items-start justify-center h-full">
              <div className="mb-1">{button.icon}</div>
              <p className="text-[#404040] text-xs leading-tight">{button.name}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden lg:flex lg:justify-center lg:gap-4">
        {actionButtons.map((button) => (
          <div
            key={button.id}
            onClick={() => handleClick(button.id)}
            className="w-48 h-24 bg-white rounded-md cursor-pointer hover:bg-gray-50 transition-colors px-4 py-3"
            style={{ border: `2px solid ${borderColor}` }}
          >
            <div className="flex flex-col items-start justify-center h-full">
              <div className="mb-1">
                {(() => {
                  switch (button.id) {
                    case 1: return <MdShoppingCart size={30} color={iconColor} />
                    case 2: return <AiFillFileText size={30} color={iconColor} />
                    case 3: return <AiFillWallet size={30} color={iconColor} />
                    case 4: return <AiFillProfile size={30} color={iconColor} />
                    case 5: return <AiFillCheckCircle size={30} color={iconColor} />
                  }
                })()}
              </div>
              <p className="text-[#404040] text-sm">{button.name}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="mt-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando dados da carteira...</p>
        </div>
      )}
    </div>
  )
}
