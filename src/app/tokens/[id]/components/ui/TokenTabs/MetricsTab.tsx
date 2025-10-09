'use client'

import { useContext } from 'react'
import { AlertCircle } from 'lucide-react'
import { ConfigContext } from '@/contexts/ConfigContext'

export type Stats =
  | {
      totalTokenTypes?: number
      totalValue?: number | string
      hasPositiveGrowth?: boolean
      averageGrowth?: number
      bestPerforming?: string
    }
  | null

export default function MetricsTab({
  stats,
  loading,
  error,
  onRefresh,
}: {
  stats: Stats
  loading: boolean
  error: string | null
  onRefresh: () => void
}) {
  const { colors } = useContext(ConfigContext)

  return (
    <div className="space-y-6">
      <div
        className="rounded-xl shadow-lg border p-6"
        style={{
          backgroundColor: colors?.token['background'],
          borderColor: colors?.token['border'],
          borderWidth: '1px',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ color: colors?.colors['color-primary'] }}>
            Métricas do Token (24h)
          </h3>
          <button
            onClick={onRefresh}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            disabled={loading}
            title="Atualizar métricas"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Carregando métricas...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-yellow-100 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <p className="text-sm text-gray-600 mb-2">Métricas não disponíveis</p>
            <p className="text-xs text-gray-500">{String(error)}</p>
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-gray-50 text-center">
              <p className="text-sm text-gray-600 mb-1">Total de Tokens</p>
              <p className="text-xl font-bold" style={{ color: colors?.colors['color-primary'] }}>
                {stats.totalTokenTypes}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 text-center">
              <p className="text-sm text-gray-600 mb-1">Valor Total</p>
              <p className="text-xl font-bold" style={{ color: colors?.colors['color-primary'] }}>
                {stats.totalValue}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 text-center">
              <p className="text-sm text-gray-600 mb-1">Crescimento/Hora</p>
              <p
                className="text-xl font-bold"
                style={{ color: stats.hasPositiveGrowth ? '#10B981' : '#EF4444' }}
              >
                {stats.hasPositiveGrowth ? '+' : ''}
                {stats.averageGrowth?.toFixed(6) || '0'}
                <span className="text-sm ml-1">tokens/h</span>
              </p>
            </div>

            {stats.bestPerforming && (
              <div className="sm:col-span-2 lg:col-span-3">
                <div className="flex justify-between items-center p-4 rounded-lg bg-green-50 border border-green-200">
                  <span className="text-sm">Melhor Performance:</span>
                  <span className="font-semibold text-green-700">{stats.bestPerforming}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-gray-600">
              Nenhuma métrica disponível para este token ainda.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              As métricas começarão a ser coletadas após você adquirir o token.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
