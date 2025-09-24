// lib/api/tokenMetrics.ts

export interface TokenHourlyData {
  tokenId: string
  tokenSymbol: string
  tokenAddress: string
  timestamp: string
  balance: string
  balanceRaw: bigint
  decimals: number
  hourlyChange: string
  percentageChange: number
}

export interface TokenMetrics {
  tokenId: string
  tokenSymbol: string
  tokenAddress: string
  currentBalance: string
  currentBalanceRaw: bigint
  decimals: number
  hourlyData: TokenHourlyData[]
  last24HoursChange: string
  last24HoursPercentage: number
  totalEarnings: string
  averageHourlyGrowth: number
  peakHour: string
  lowestHour: string
}

export interface UserTokenMetrics {
  userId: string
  walletAddress: string
  totalTokens: number
  totalValueNative: string // Em tokens, sem conversão fiduciária
  tokens: TokenMetrics[]
  lastUpdated: string
  trackingStartDate: string
}

export interface CurrencyConversionRate {
  currency: string
  symbol: string
  rate: number
  lastUpdated: string
}

export interface ConversionStructure {
  supportedCurrencies: CurrencyConversionRate[]
  defaultCurrency: string
  conversionEnabled: boolean
}

// Função para buscar métricas de tokens por hora
export async function getTokenHourlyMetrics(
  userId: string,
  walletAddress: string,
  timeframe: '24h' | '7d' | '30d' = '24h'
): Promise<UserTokenMetrics> {
  const res = await fetch(`/api/tokens/metrics/hourly?userId=${userId}&wallet=${walletAddress}&timeframe=${timeframe}`, {
    method: 'GET',
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error('Erro ao buscar métricas horárias dos tokens')
  }

  return await res.json()
}

// Função para buscar taxas de conversão (preparação para futuro)
export async function getConversionRates(): Promise<ConversionStructure> {
  const res = await fetch('/api/tokens/conversion-rates', {
    method: 'GET',
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error('Erro ao buscar taxas de conversão')
  }

  return await res.json()
}

// Função para converter valor de token para moeda fiduciária
export function convertTokenValue(
  tokenBalance: string,
  tokenPrice: number,
  conversionRate: number
): {
  originalValue: string
  convertedValue: string
  currency: string
} {
  const balance = parseFloat(tokenBalance)
  const nativeValue = balance * tokenPrice
  const convertedValue = nativeValue * conversionRate

  return {
    originalValue: balance.toString(),
    convertedValue: convertedValue.toFixed(2),
    currency: 'BRL' // Default to BRL for now
  }
}

// Função para calcular crescimento por hora
export function calculateHourlyGrowth(hourlyData: TokenHourlyData[]): {
  totalGrowth: string
  averageHourlyGrowth: number
  hourlyGrowthData: Array<{
    hour: string
    growth: string
    percentage: number
  }>
} {
  if (hourlyData.length < 2) {
    return {
      totalGrowth: '0',
      averageHourlyGrowth: 0,
      hourlyGrowthData: []
    }
  }

  const growthData = []
  let totalGrowthValue = 0

  for (let i = 1; i < hourlyData.length; i++) {
    const current = parseFloat(hourlyData[i].balance)
    const previous = parseFloat(hourlyData[i - 1].balance)
    const growth = current - previous
    const percentage = previous > 0 ? (growth / previous) * 100 : 0

    growthData.push({
      hour: hourlyData[i].timestamp,
      growth: growth.toString(),
      percentage: percentage
    })

    totalGrowthValue += growth
  }

  const averageHourlyGrowth = totalGrowthValue / (hourlyData.length - 1)

  return {
    totalGrowth: totalGrowthValue.toString(),
    averageHourlyGrowth,
    hourlyGrowthData: growthData
  }
}

// Função para formatar dados para exibição (sem conversão fiduciária)
export function formatTokenMetricsForDisplay(metrics: UserTokenMetrics): {
  summary: {
    totalTokens: number
    totalValue: string
    averageGrowth: number
    bestPerformingToken: string
    worstPerformingToken: string
  }
  tokens: Array<{
    name: string
    symbol: string
    balance: string
    hourlyGrowth: number
    last24hChange: string
    trend: 'up' | 'down' | 'stable'
  }>
} {
  let bestPerforming = ''
  let worstPerforming = ''
  let maxGrowth = -Infinity
  let minGrowth = Infinity

  const formattedTokens = metrics.tokens.map(token => {
    const growth = token.averageHourlyGrowth
    
    if (growth > maxGrowth) {
      maxGrowth = growth
      bestPerforming = token.tokenSymbol
    }
    
    if (growth < minGrowth) {
      minGrowth = growth
      worstPerforming = token.tokenSymbol
    }

    return {
      name: token.tokenSymbol,
      symbol: token.tokenSymbol,
      balance: token.currentBalance,
      hourlyGrowth: token.averageHourlyGrowth,
      last24hChange: token.last24HoursChange,
      trend: (token.last24HoursPercentage > 0 ? 'up' : 
              token.last24HoursPercentage < 0 ? 'down' : 'stable') as 'up' | 'down' | 'stable'
    }
  })

  const averageGrowth = metrics.tokens.reduce((sum, token) => sum + token.averageHourlyGrowth, 0) / metrics.tokens.length

  return {
    summary: {
      totalTokens: metrics.totalTokens,
      totalValue: metrics.totalValueNative,
      averageGrowth,
      bestPerformingToken: bestPerforming,
      worstPerformingToken: worstPerforming
    },
    tokens: formattedTokens
  }
}