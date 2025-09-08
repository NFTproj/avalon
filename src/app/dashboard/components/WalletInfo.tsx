'use client'

import { useContext, useEffect, useState } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'
import { useAuth } from '@/contexts/AuthContext'
import { useAccount, useBalance, useChainId } from 'wagmi'
import { formatEther } from 'viem'

interface WalletInfoProps {
  className?: string
  showDetails?: boolean
}

export default function WalletInfo({ className = '', showDetails = true }: WalletInfoProps) {
  const { colors, texts } = useContext(ConfigContext)
  const { user } = useAuth()
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({ address })
  const chainId = useChainId()

  const [ethPriceUSD, setEthPriceUSD] = useState(0)
  const [isLoadingPrice, setIsLoadingPrice] = useState(true)

  // Função para obter nome da rede baseado no chainId
  const getNetworkName = (chainId: number) => {
    switch (chainId) {
      case 1:
        return 'Ethereum'
      case 137:
        return 'Polygon'
      case 42161:
        return 'Arbitrum'
      case 11155111:
        return 'Sepolia'
      default:
        return `Chain ${chainId}`
    }
  }

  const cardBgColor = '#FFFFFF'
  const textColor = '#1F2937'
  const secondaryTextColor = '#6B7280'
  const borderColor = '#E5E7EB'
  const successColor = '#10B981'
  const warningColor = '#F59E0B'

  // Buscar preço do ETH para conversão
  useEffect(() => {
    const fetchEthPrice = async () => {
      try {
        setIsLoadingPrice(true)
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
        const data = await response.json()
        setEthPriceUSD(data.ethereum?.usd || 0)
      } catch (error) {
        setEthPriceUSD(0)
      } finally {
        setIsLoadingPrice(false)
      }
    }

    if (balance) {
      fetchEthPrice()
    }
  }, [balance])

  // Formatar endereço da wallet
  const formatAddress = (address: string) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Calcular valor em USD
  const balanceInEth = balance ? parseFloat(formatEther(balance.value)) : 0
  const balanceInUSD = balanceInEth * ethPriceUSD

  if (!isConnected || !address) {
    return (
      <div
        className={`bg-white rounded-xl shadow-lg border-2 p-6 ${className}`}
        style={{ backgroundColor: cardBgColor, borderColor, color: textColor }}
      >
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">{texts?.dashboard?.['wallet-info']?.['not-connected'] || 'Carteira Não Conectada'}</h3>
          <p className="text-sm" style={{ color: secondaryTextColor }}>
            {texts?.dashboard?.['wallet-info']?.['connect-message'] || 'Conecte sua carteira para visualizar seu saldo e transações'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`bg-white rounded-xl shadow-lg border-2 p-6 ${className}`}
      style={{ backgroundColor: cardBgColor, borderColor, color: textColor }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{texts?.dashboard?.['wallet-info']?.connected || 'Saldo da Carteira'}</h3>
          <p className="text-xs" style={{ color: secondaryTextColor }}>
            Criptomoedas nativas (ETH/MATIC)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: successColor }}
          ></div>
          <span className="text-sm font-medium" style={{ color: successColor }}>
            {texts?.dashboard?.['wallet-info']?.['status-connected'] || 'Conectado'}
          </span>
        </div>
      </div>

      {/* Wallet Address */}
      <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm" style={{ color: secondaryTextColor }}>
              {texts?.dashboard?.['wallet-info']?.['address-label'] || 'Endereço:'}
            </p>
            <p className="font-mono text-sm font-medium">
              {formatAddress(address)}
            </p>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(address)}
            className="p-2 hover:bg-gray-200 rounded-md transition-colors"
            title={texts?.dashboard?.['wallet-info']?.['copy-address'] || 'Copiar endereço'}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Network Info */}
      <div className="mb-4 flex items-center gap-3">
        <span className="text-sm" style={{ color: secondaryTextColor }}>
          {texts?.dashboard?.['wallet-info']?.['network-label'] || 'Rede:'}
        </span>
        <span className="px-3 py-1.5 rounded-full text-sm font-semibold" style={{ backgroundColor: '#DBEAFE', color: '#1E40AF' }}>
          {getNetworkName(chainId)}
        </span>
      </div>

      {/* Balance */}
      {showDetails && (
        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center">
            <span style={{ color: secondaryTextColor }}>{texts?.dashboard?.['wallet-info']?.['balance-label'] || 'Saldo nativo:'}</span>
            <div className="text-right">
              <div className="font-medium">
                {balance ? `${balanceInEth.toFixed(4)} ${balance.symbol}` : '0.0000 ETH'}
              </div>
              {!isLoadingPrice && ethPriceUSD > 0 && (
                <div className="text-sm" style={{ color: secondaryTextColor }}>
                  $ {balanceInUSD.toFixed(2)}
                </div>
              )}
            </div>
          </div>

          {/* User wallet consistency check */}
          {user?.walletAddress && user.walletAddress !== address && (
            <div 
              className="p-3 rounded-md border-l-4 bg-yellow-50"
              style={{ borderLeftColor: warningColor }}
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5"
                    style={{ color: warningColor }}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm" style={{ color: warningColor }}>
                    <strong>Atenção:</strong> A carteira conectada é diferente da cadastrada no seu perfil.
                  </p>
                  <p className="text-xs mt-1" style={{ color: secondaryTextColor }}>
                    Cadastrada: {formatAddress(user.walletAddress)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => window.open(`https://etherscan.io/address/${address}`, '_blank')}
          className="flex-1 px-4 py-2 text-sm font-medium rounded-md border hover:bg-gray-50 transition-colors"
          style={{ borderColor, color: textColor }}
        >
          Ver no Etherscan
        </button>
      </div>
    </div>
  )
}