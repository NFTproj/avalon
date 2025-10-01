'use client'

import { useContext } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'

interface TokenMetricsProps {
  className?: string
}

type Trend = 'positive' | 'negative' | 'neutral'

export default function TokenMetrics({ className = '' }: TokenMetricsProps) {
  const { colors, texts } = useContext(ConfigContext)

  // ===== MOCK =====
  const stats = {
    totalTokenTypes: 3,
    totalValue: 1250000,       // ex.: valor total (numérico)
    averageGrowth: 0.123456,   // tokens/h
    growthTrend: 'positive' as Trend,
    bestPerforming: 'TMN',
    worstPerforming: '—',
  }

  // ===== estilos básicos (mantive as cores do seu card) =====
  const cardBgColor = '#FFFFFF'
  const textColor = '#1F2937'
  const secondaryTextColor = '#6B7280'
  const borderColor = '#E5E7EB'
  const successColor = '#10B981'
  const errorColor = '#EF4444'
  const warningColor = '#F59E0B'

  const getTrendColor = (trend: Trend) => {
    switch (trend) {
      case 'positive': return successColor
      case 'negative': return errorColor
      default: return warningColor
    }
  }

  const getTrendIcon = (trend: Trend) => {
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
          <h3 className="text-lg font-semibold">
            {texts?.dashboard?.['token-metrics']?.title || 'Tokens de Ativos'}
          </h3>
          <p className="text-xs" style={{ color: secondaryTextColor }}>
            Tokens de tokenização (fazendas, imóveis, etc.)
          </p>
        </div>
      </div>

      {/* Resumo Principal */}
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#F0F9FF' }}>
            <p className="text-sm font-medium mb-1" style={{ color: secondaryTextColor }}>
              {texts?.dashboard?.['token-metrics']?.['total-tokens'] || 'Total de Tokens'}
            </p>
            <p className="text-2xl font-bold" style={{ color: textColor }}>
              {stats.totalTokenTypes}
            </p>
          </div>

          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#F0F9FF' }}>
            <p className="text-sm font-medium mb-1" style={{ color: secondaryTextColor }}>
              {texts?.dashboard?.['token-metrics']?.['total-value'] || 'Valor Total'}
            </p>
            <p className="text-2xl font-bold" style={{ color: textColor }}>
              {stats.totalValue.toLocaleString('pt-BR')}
            </p>
          </div>
        </div>

        {/* Crescimento Médio */}
        <div
          className="text-center p-4 rounded-xl border-2 bg-gradient-to-br from-white to-gray-50"
          style={{ borderColor: getTrendColor(stats.growthTrend) }}
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <span style={{ color: getTrendColor(stats.growthTrend) }}>
              {getTrendIcon(stats.growthTrend)}
            </span>
            <p className="text-sm" style={{ color: secondaryTextColor }}>
              Crescimento Médio por Hora
            </p>
          </div>
          <p className="text-2xl font-bold" style={{ color: getTrendColor(stats.growthTrend) }}>
            {stats.averageGrowth > 0 ? '+' : ''}
            {stats.averageGrowth.toFixed(6)} tokens/h
          </p>
        </div>
      </div>

      {/* Performance dos Tokens */}
      {stats.bestPerforming && (
        <div className="space-y-3">
          <div
            className="flex items-center justify-between p-4 rounded-lg"
            style={{ backgroundColor: '#DCFCE7', border: '1px solid #86EFAC' }}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm">Melhor Performance:</span>
            </div>
            <span className="font-semibold text-green-700">{stats.bestPerforming}</span>
          </div>

          {stats.worstPerforming && stats.worstPerforming !== stats.bestPerforming && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-200">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-sm">Menor Performance:</span>
              </div>
              <span className="font-semibold text-red-700">{stats.worstPerforming}</span>
            </div>
          )}
        </div>
      )}

      {/* Rodapé (mock) */}
      <div className="mt-4 pt-4 border-t" style={{ borderColor }}>
        <p className="text-xs text-center" style={{ color: secondaryTextColor }}>
          Última atualização: —:—:—
        </p>
        <p className="text-xs text-center mt-1" style={{ color: secondaryTextColor }}>
          * Dados mockados para layout
        </p>
      </div>
    </div>
  )
}
