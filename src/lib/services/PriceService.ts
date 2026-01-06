import { TokenPriceResponse, RateLimitConfig } from '@/types/wallet'

// Interface para configuração de API de preços
export interface PriceApiConfig {
  baseUrl: string
  apiKey?: string
  rateLimit: RateLimitConfig
}

// Interface para dados de preço de token
export interface TokenPriceData {
  price: number
  priceChange24h: number
  marketCap: number
  volume24h: number
  lastUpdated: Date
}

// Interface para resposta da API CoinGecko
interface CoinGeckoResponse {
  [contractAddress: string]: {
    usd: number
    usd_24h_change: number
    usd_market_cap: number
    usd_24h_vol: number
  }
}

// Interface para resposta da API CoinMarketCap
interface CoinMarketCapResponse {
  data: {
    [contractAddress: string]: {
      quote: {
        USD: {
          price: number
          percent_change_24h: number
          market_cap: number
          volume_24h: number
        }
      }
    }
  }
}

// Classe para gerenciar rate limiting
class RateLimiter {
  private requests = new Map<string, number[]>()
  private readonly limit: number
  private readonly window: number

  constructor(config: RateLimitConfig) {
    this.limit = config.limit
    this.window = config.window
  }

  canMakeRequest(key: string): boolean {
    const now = Date.now()
    const userRequests = this.requests.get(key) || []
    
    // Remove requests antigas
    const recentRequests = userRequests.filter(time => now - time < this.window)
    
    if (recentRequests.length >= this.limit) {
      return false
    }
    
    recentRequests.push(now)
    this.requests.set(key, recentRequests)
    return true
  }

  getRemainingRequests(key: string): number {
    const now = Date.now()
    const userRequests = this.requests.get(key) || []
    const recentRequests = userRequests.filter(time => now - time < this.window)
    
    return Math.max(0, this.limit - recentRequests.length)
  }

  getTimeUntilReset(key: string): number {
    const now = Date.now()
    const userRequests = this.requests.get(key) || []
    
    if (userRequests.length === 0) return 0
    
    const oldestRequest = Math.min(...userRequests)
    const resetTime = oldestRequest + this.window
    
    return Math.max(0, resetTime - now)
  }
}

export class PriceService {
  private coinGeckoConfig: PriceApiConfig
  private coinMarketCapConfig: PriceApiConfig
  private rateLimiter: RateLimiter
  private cache = new Map<string, { data: TokenPriceData; timestamp: number }>()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutos

  constructor(
    coinGeckoConfig: PriceApiConfig,
    coinMarketCapConfig: PriceApiConfig
  ) {
    this.coinGeckoConfig = coinGeckoConfig
    this.coinMarketCapConfig = coinMarketCapConfig
    this.rateLimiter = new RateLimiter(coinGeckoConfig.rateLimit)
  }

  // Método principal para buscar preços de tokens
  async getTokenPrices(contractAddresses: string[]): Promise<TokenPriceResponse> {
    try {
      // Filtrar endereços únicos
      const uniqueAddresses = [...new Set(contractAddresses)]
      
      // Verificar cache primeiro
      const cachedData = this.getCachedPrices(uniqueAddresses)
      const uncachedAddresses = uniqueAddresses.filter(addr => !cachedData[addr])
      
      let freshData: { [key: string]: TokenPriceData } = {}
      
      // Buscar dados frescos para endereços não cacheados
      if (uncachedAddresses.length > 0) {
        freshData = await this.fetchFreshPrices(uncachedAddresses)
        
        // Atualizar cache com novos dados
        Object.entries(freshData).forEach(([address, data]) => {
          this.cache.set(address, { data, timestamp: Date.now() })
        })
      }

      // Combinar dados cacheados e frescos
      const allData = { ...cachedData, ...freshData }
      
      // Converter para formato de resposta
      const response: TokenPriceResponse = {
        success: true,
        data: {},
        error: undefined,
      }

      Object.entries(allData).forEach(([address, data]) => {
        response.data[address] = {
          price: data.price,
          priceChange24h: data.priceChange24h,
          marketCap: data.marketCap,
          volume24h: data.volume24h,
        }
      })

      return response

    } catch (error) {
      return {
        success: false,
        data: {},
        error: `Failed to get token prices: ${error}`,
      }
    }
  }

  // Método para buscar preço de um token específico
  async getTokenPrice(contractAddress: string): Promise<TokenPriceData | null> {
    try {
      const response = await this.getTokenPrices([contractAddress])
      
      if (!response.success || !response.data[contractAddress]) {
        return null
      }

      const priceData = response.data[contractAddress]
      return {
        price: priceData.price,
        priceChange24h: priceData.priceChange24h,
        marketCap: priceData.marketCap,
        volume24h: priceData.volume24h,
        lastUpdated: new Date(),
      }
    } catch (error) {
      return null
    }
  }

  // Método para buscar preços via CoinGecko (API gratuita)
  private async fetchPricesFromCoinGecko(contractAddresses: string[]): Promise<{ [key: string]: TokenPriceData }> {
    try {
      // Verificar rate limiting
      if (!this.rateLimiter.canMakeRequest('coingecko')) {
        const remaining = this.rateLimiter.getRemainingRequests('coingecko')
        const timeUntilReset = this.rateLimiter.getTimeUntilReset('coingecko')
        throw new Error(`Rate limit exceeded. Remaining: ${remaining}, Reset in: ${Math.ceil(timeUntilReset / 1000)}s`)
      }

      // CoinGecko aceita até 100 endereços por request
      const chunks = this.chunkArray(contractAddresses, 100)
      const allData: { [key: string]: TokenPriceData } = {}

      for (const chunk of chunks) {
        const addressesParam = chunk.join(',')
        const url = `${this.coinGeckoConfig.baseUrl}/simple/token_price/ethereum?contract_addresses=${addressesParam}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`

        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json',
            ...(this.coinGeckoConfig.apiKey && { 'X-CG-API-Key': this.coinGeckoConfig.apiKey }),
          },
        })

        if (!response.ok) {
          throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`)
        }

        const data: CoinGeckoResponse = await response.json()

        // Processar resposta
        Object.entries(data).forEach(([address, priceInfo]) => {
          allData[address.toLowerCase()] = {
            price: priceInfo.usd || 0,
            priceChange24h: priceInfo.usd_24h_change || 0,
            marketCap: priceInfo.usd_market_cap || 0,
            volume24h: priceInfo.usd_24h_vol || 0,
            lastUpdated: new Date(),
          }
        })

        // Aguardar um pouco entre requests para respeitar rate limits
        if (chunks.length > 1) {
          await this.delay(1000)
        }
      }

      return allData

    } catch (error) {
      throw error
    }
  }

  // Método para buscar preços via CoinMarketCap (API paga, fallback)
  private async fetchPricesFromCoinMarketCap(contractAddresses: string[]): Promise<{ [key: string]: TokenPriceData }> {
    try {
      if (!this.coinMarketCapConfig.apiKey) {
        throw new Error('CoinMarketCap API key not configured')
      }

      // Verificar rate limiting
      if (!this.rateLimiter.canMakeRequest('coinmarketcap')) {
        throw new Error('CoinMarketCap rate limit exceeded')
      }

      const addressesParam = contractAddresses.join(',')
      const url = `${this.coinMarketCapConfig.baseUrl}/v2/cryptocurrency/quotes/latest?address=${addressesParam}`

      const response = await fetch(url, {
        headers: {
          'X-CMC_PRO_API_KEY': this.coinMarketCapConfig.apiKey,
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`CoinMarketCap API error: ${response.status} ${response.statusText}`)
      }

      const data: CoinMarketCapResponse = await response.json()
      const result: { [key: string]: TokenPriceData } = {}

      Object.entries(data.data).forEach(([address, tokenData]) => {
        const quote = tokenData.quote.USD
        result[address.toLowerCase()] = {
          price: quote.price || 0,
          priceChange24h: quote.percent_change_24h || 0,
          marketCap: quote.market_cap || 0,
          volume24h: quote.volume_24h || 0,
          lastUpdated: new Date(),
        }
      })

      return result

    } catch (error) {
      throw error
    }
  }

  // Método para buscar preços com fallback
  private async fetchFreshPrices(contractAddresses: string[]): Promise<{ [key: string]: TokenPriceData }> {
    try {
      // Tentar CoinGecko primeiro (gratuito)
      return await this.fetchPricesFromCoinGecko(contractAddresses)
    } catch (error) {
      
      try {
        // Fallback para CoinMarketCap
        return await this.fetchPricesFromCoinMarketCap(contractAddresses)
      } catch (fallbackError) {
        
        // Retornar dados mock como último recurso
        return this.getMockPrices(contractAddresses)
      }
    }
  }

  // Método para obter dados do cache
  private getCachedPrices(contractAddresses: string[]): { [key: string]: TokenPriceData } {
    const now = Date.now()
    const cachedData: { [key: string]: TokenPriceData } = {}

    contractAddresses.forEach(address => {
      const cached = this.cache.get(address.toLowerCase())
      if (cached && (now - cached.timestamp) < this.CACHE_TTL) {
        cachedData[address] = cached.data
      }
    })

    return cachedData
  }

  // Método para limpar cache expirado
  clearExpiredCache(): void {
    const now = Date.now()
    const expiredKeys: string[] = []

    this.cache.forEach((value, key) => {
      if ((now - value.timestamp) >= this.CACHE_TTL) {
        expiredKeys.push(key)
      }
    })

    expiredKeys.forEach(key => this.cache.delete(key))
  }

  // Método para limpar todo o cache
  clearCache(): void {
    this.cache.clear()
  }

  // Método para obter estatísticas do cache
  getCacheStats(): {
    totalEntries: number
    expiredEntries: number
    validEntries: number
    hitRate: number
  } {
    const now = Date.now()
    let expiredCount = 0
    let validCount = 0

    this.cache.forEach((value) => {
      if ((now - value.timestamp) >= this.CACHE_TTL) {
        expiredCount++
      } else {
        validCount++
      }
    })

    return {
      totalEntries: this.cache.size,
      expiredEntries: expiredCount,
      validEntries: validCount,
      hitRate: this.cache.size > 0 ? validCount / this.cache.size : 0,
    }
  }

  // Método para obter dados mock (fallback final)
  private getMockPrices(contractAddresses: string[]): { [key: string]: TokenPriceData } {
    const mockData: { [key: string]: TokenPriceData } = {}
    
    contractAddresses.forEach(address => {
      mockData[address.toLowerCase()] = {
        price: 0,
        priceChange24h: 0,
        marketCap: 0,
        volume24h: 0,
        lastUpdated: new Date(),
      }
    })

    return mockData
  }

  // Método para dividir array em chunks
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }

  // Método para delay
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Método para buscar preços de tokens nativos (ETH, MATIC, etc.)
  async getNativeTokenPrices(symbols: string[]): Promise<{ [key: string]: TokenPriceData }> {
    try {
      const symbolsParam = symbols.join(',')
      const url = `${this.coinGeckoConfig.baseUrl}/simple/price?ids=${symbolsParam}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          ...(this.coinGeckoConfig.apiKey && { 'X-CG-API-Key': this.coinGeckoConfig.apiKey }),
        },
      })

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`)
      }

      const data = await response.json()
      const result: { [key: string]: TokenPriceData } = {}

      Object.entries(data).forEach(([symbol, priceInfo]: [string, any]) => {
        result[symbol] = {
          price: priceInfo.usd || 0,
          priceChange24h: priceInfo.usd_24h_change || 0,
          marketCap: priceInfo.usd_market_cap || 0,
          volume24h: priceInfo.usd_24h_vol || 0,
          lastUpdated: new Date(),
        }
      })

      return result

    } catch (error) {
      return this.getMockPrices(symbols)
    }
  }
}
