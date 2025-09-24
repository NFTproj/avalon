import { useEffect, useState, useCallback } from 'react'
import { 
  UserTokenMetrics, 
  ConversionStructure,
  getTokenHourlyMetrics,
  getConversionRates,
  formatTokenMetricsForDisplay
} from '@/lib/api/tokenMetrics'

interface UseTokenMetricsOptions {
  userId?: string
  walletAddress?: string
  timeframe?: '24h' | '7d' | '30d'
  enableConversion?: boolean
  autoRefresh?: boolean
  refreshInterval?: number // em milissegundos
}

export function useTokenMetrics({
  userId,
  walletAddress,
  timeframe = '24h',
  enableConversion = false,
  autoRefresh = true,
  refreshInterval = 60000 // 1 minuto
}: UseTokenMetricsOptions) {
  const [metrics, setMetrics] = useState<UserTokenMetrics | null>(null)
  const [conversionRates, setConversionRates] = useState<ConversionStructure | null>(null)
  const [formattedData, setFormattedData] = useState<ReturnType<typeof formatTokenMetricsForDisplay> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Função para buscar dados das métricas
  const fetchMetrics = useCallback(async () => {
    if (!userId || !walletAddress) {
      setMetrics(null)
      setFormattedData(null)
      setLoading(false)
      return
    }

    try {
      setError(null)
      
      const [metricsData, conversionData] = await Promise.allSettled([
        getTokenHourlyMetrics(userId, walletAddress, timeframe),
        enableConversion ? getConversionRates() : Promise.resolve(null)
      ])

      if (metricsData.status === 'fulfilled') {
        setMetrics(metricsData.value)
        setFormattedData(formatTokenMetricsForDisplay(metricsData.value))
        setLastUpdated(new Date())
      } else {
        throw new Error('Erro ao buscar métricas de tokens')
      }

      if (conversionData.status === 'fulfilled' && conversionData.value) {
        setConversionRates(conversionData.value)
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao buscar métricas'
      setError(errorMessage)
      console.error('Erro ao buscar métricas de tokens:', err)
    } finally {
      setLoading(false)
    }
  }, [userId, walletAddress, timeframe, enableConversion])

  // Efeito principal para buscar dados
  useEffect(() => {
    setLoading(true)
    fetchMetrics()
  }, [fetchMetrics])

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh || !userId || !walletAddress) return

    const interval = setInterval(() => {
      fetchMetrics()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, fetchMetrics, refreshInterval, userId, walletAddress])

  // Função para refresh manual
  const refresh = useCallback(() => {
    setLoading(true)
    fetchMetrics()
  }, [fetchMetrics])

  // Função para alternar conversão
  const toggleConversion = () => {
    // Esta função será implementada quando as conversões estiverem ativadas
    console.log('Conversão será implementada na próxima versão')
  }

  // Calcular estatísticas resumidas
  const stats = formattedData ? {
    totalTokenTypes: formattedData.summary.totalTokens,
    totalValue: formattedData.summary.totalValue,
    averageGrowth: formattedData.summary.averageGrowth,
    bestPerforming: formattedData.summary.bestPerformingToken,
    worstPerforming: formattedData.summary.worstPerformingToken,
    hasPositiveGrowth: formattedData.summary.averageGrowth > 0,
    growthTrend: formattedData.summary.averageGrowth > 0 ? 'positive' : 
                 formattedData.summary.averageGrowth < 0 ? 'negative' : 'stable'
  } : null

  return {
    // Dados
    metrics,
    formattedData,
    conversionRates,
    stats,
    
    // Estado
    loading,
    error,
    lastUpdated,
    
    // Ações
    refresh,
    toggleConversion,
    
    // Configurações
    timeframe,
    enableConversion,
    autoRefresh
  }
}

// Hook simplificado para usar apenas dados básicos
export function useSimpleTokenMetrics(userId?: string, walletAddress?: string) {
  const {
    stats,
    loading,
    error,
    refresh,
    lastUpdated
  } = useTokenMetrics({
    userId,
    walletAddress,
    timeframe: '24h',
    enableConversion: false,
    autoRefresh: true,
    refreshInterval: 120000 // 2 minutos
  })

  return {
    stats,
    loading,
    error,
    refresh,
    lastUpdated,
    hasData: stats !== null
  }
}