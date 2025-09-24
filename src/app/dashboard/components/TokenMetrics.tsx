'use client'

import { useContext } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'
import { useAuth } from '@/contexts/AuthContext'
import { useSimpleTokenMetrics } from '@/hooks/useTokenMetrics'

interface TokenMetricsProps {
  className?: string
}

export default function TokenMetrics({ className = '' }: TokenMetricsProps) {
  const { colors, texts } = useContext(ConfigContext)
  const { user } = useAuth()
  
  const {
    stats,
    loading,
    error,
    refresh,
    lastUpdated,
    hasData
  } = useSimpleTokenMetrics(user?.id, user?.walletAddress)

  const cardBgColor = '#FFFFFF'
  const textColor = '#1F2937'
  const secondaryTextColor = '#6B7280'
  const borderColor = '#E5E7EB'
  const successColor = '#10B981'
  const errorColor = '#EF4444'
  const warningColor = '#F59E0B'

  if (loading) {
    return (
      <div
        className={`bg-white rounded-xl shadow-lg border-2 p-6 ${className}`}
        style={{ backgroundColor: cardBgColor, borderColor, color: textColor }}
      >
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-gray-300 rounded w-32"></div>
            <div className="h-4 bg-gray-300 rounded w-16"></div>
          </div>
          <div className="space-y-3">
            <div className="h-8 bg-gray-300 rounded w-full"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={`bg-white rounded-xl shadow-lg border-2 p-6 ${className}`}
        style={{ backgroundColor: cardBgColor, borderColor, color: textColor }}
      >
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Erro ao Carregar Métricas</h3>
          <p className="text-sm mb-4" style={{ color: secondaryTextColor }}>
            {error}
          </p>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  if (!hasData || !stats) {
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
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Métricas de Tokens</h3>
          <p className="text-sm" style={{ color: secondaryTextColor }}>
            Nenhum dado de métricas disponível ainda. As métricas começarão a ser coletadas após você adquirir tokens.
          </p>
        </div>
      </div>
    )
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'positive': return successColor
      case 'negative': return errorColor
      default: return warningColor
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'positive':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        )
      case 'negative':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 112 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        )
    }
  }

  return (
    <div
      className={`bg-white rounded-lg shadow-md border p-6 ${className}`}
      style={{ backgroundColor: cardBgColor, borderColor, color: textColor }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">{texts?.dashboard?.['token-metrics']?.title || 'Tokens de Ativos'}</h3>
          <p className="text-xs" style={{ color: secondaryTextColor }}>
            Tokens de tokenização (fazendas, imóveis, etc.)
          </p>
        </div>
        <button
          onClick={refresh}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          title="Atualizar métricas"
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
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {/* Resumo Principal */}
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#F0F9FF' }}>
            <p className="text-sm font-medium mb-1" style={{ color: secondaryTextColor }}>
              {texts?.dashboard?.['token-metrics']?.['total-tokens'] || 'Total de Tokens'}
            </p>
            <p className="text-2xl font-bold" style={{ color: textColor }}>{stats.totalTokenTypes}</p>
          </div>
          
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#F0F9FF' }}>
            <p className="text-sm font-medium mb-1" style={{ color: secondaryTextColor }}>
              {texts?.dashboard?.['token-metrics']?.['total-value'] || 'Valor Total'}
            </p>
            <p className="text-2xl font-bold" style={{ color: textColor }}>{stats.totalValue}</p>
          </div>
        </div>

        {/* Crescimento Médio */}
        <div className="text-center p-4 rounded-xl border-2 bg-gradient-to-br from-white to-gray-50" 
             style={{ borderColor: getTrendColor(stats.growthTrend) }}>
          <div className="flex items-center justify-center gap-2 mb-1">
            <span style={{ color: getTrendColor(stats.growthTrend) }}>
              {getTrendIcon(stats.growthTrend)}
            </span>
            <p className="text-sm" style={{ color: secondaryTextColor }}>
              Crescimento Médio por Hora
            </p>
          </div>
          <p 
            className="text-2xl font-bold"
            style={{ color: getTrendColor(stats.growthTrend) }}
          >
            {stats.averageGrowth > 0 ? '+' : ''}{stats.averageGrowth.toFixed(6)} tokens/h
          </p>
        </div>
      </div>

      {/* Performance dos Tokens */}
      {stats.bestPerforming && (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: '#DCFCE7', border: '1px solid #86EFAC' }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm">Melhor Performance:</span>
            </div>
            <span className="font-semibold text-green-700">{stats.bestPerforming}</span>
          </div>

          {stats.worstPerforming && stats.worstPerforming !== stats.bestPerforming && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-200">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-sm">Menor Performance:</span>
              </div>
              <span className="font-semibold text-red-700">{stats.worstPerforming}</span>
            </div>
          )}
        </div>
      )}

      {/* Informações adicionais */}
      {lastUpdated && (
        <div className="mt-4 pt-4 border-t" style={{ borderColor }}>
          <p className="text-xs text-center" style={{ color: secondaryTextColor }}>
            Última atualização: {lastUpdated.toLocaleTimeString('pt-BR')}
          </p>
          <p className="text-xs text-center mt-1" style={{ color: secondaryTextColor }}>
            * Tokens de ativos reais tokenizados (separado do saldo da carteira)
          </p>
        </div>
      )}
    </div>
  )
}