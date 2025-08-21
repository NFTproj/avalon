import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals'
import { TransactionService } from '../TransactionService'
import { Network, Transaction, TransactionHistoryResponse } from '@/types/wallet'

// Mock das APIs externas
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>
global.fetch = mockFetch

// Helper function to create mock Response objects
const createMockResponse = (data: any, options: { ok: boolean; status?: number; statusText?: string } = { ok: true }) => {
  return {
    ok: options.ok,
    status: options.status || 200,
    statusText: options.statusText || 'OK',
    json: async () => data,
    headers: new Headers(),
    redirected: false,
    type: 'default' as ResponseType,
    url: '',
    clone: jest.fn(),
    arrayBuffer: jest.fn(),
    blob: jest.fn(),
    formData: jest.fn(),
    text: jest.fn(),
    body: null,
    bodyUsed: false,
    bytes: jest.fn(),
  } as any
}

// Mock de dados de teste
const mockNetwork: Network = {
  id: 1,
  name: 'Ethereum',
  chainId: '0x1',
  rpcUrl: 'https://mainnet.infura.io/v3/test',
  explorerUrl: 'https://etherscan.io',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
}

const mockTransactions: Transaction[] = [
  {
    hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    from: '0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6',
    to: '0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6',
    value: '0.1',
    tokenSymbol: 'ETH',
    type: 'send',
    timestamp: Date.now() - 3600000, // 1 hora atrás
    status: 'confirmed',
    network: mockNetwork,
    gasUsed: '21000',
    gasPrice: '20000000000',
    blockNumber: 12345678,
    confirmations: 12,
  },
  {
    hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    from: '0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6',
    to: '0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6',
    value: '100',
    tokenSymbol: 'USDC',
    type: 'receive',
    timestamp: Date.now() - 7200000, // 2 horas atrás
    status: 'confirmed',
    network: mockNetwork,
    gasUsed: '65000',
    gasPrice: '25000000000',
    blockNumber: 12345677,
    confirmations: 13,
  },
]

describe('TransactionService', () => {
  let transactionService: TransactionService
  let mockEtherscanApiKey: string
  let mockPolygonscanApiKey: string
  let mockArbiscanApiKey: string

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()
    
    // Configuração de teste
    mockEtherscanApiKey = 'test-etherscan-key'
    mockPolygonscanApiKey = 'test-polygonscan-key'
    mockArbiscanApiKey = 'test-arbiscan-key'
    
    transactionService = new TransactionService({
      etherscanApiKey: mockEtherscanApiKey,
      polygonscanApiKey: mockPolygonscanApiKey,
      arbiscanApiKey: mockArbiscanApiKey,
    })
  })

  afterEach(() => {
    // Limpar cache após cada teste
    transactionService.clearCache()
  })

  describe('Constructor', () => {
    it('should initialize with correct configuration', () => {
      expect(transactionService).toBeInstanceOf(TransactionService)
      expect(transactionService['etherscanApiKey']).toBe(mockEtherscanApiKey)
      expect(transactionService['polygonscanApiKey']).toBe(mockPolygonscanApiKey)
      expect(transactionService['arbiscanApiKey']).toBe(mockArbiscanApiKey)
    })

    it('should initialize without API keys', () => {
      const serviceWithoutKeys = new TransactionService({})
      expect(serviceWithoutKeys['etherscanApiKey']).toBeUndefined()
      expect(serviceWithoutKeys['polygonscanApiKey']).toBeUndefined()
      expect(serviceWithoutKeys['arbiscanApiKey']).toBeUndefined()
    })
  })

  describe('getTransactionHistory', () => {
    const testAddress = '0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6'



    it('should return cached data when available and not expired', async () => {
      // Simular cache válido com a estrutura correta
      const cacheKey = `transactions_${testAddress}_50_1`
      transactionService['cache'].set(cacheKey, {
        data: {
          transactions: mockTransactions,
          pagination: {
            page: 1,
            limit: 50,
            total: mockTransactions.length,
          },
        },
        timestamp: Date.now(),
        ttl: 5 * 60 * 1000, // 5 minutos
      })
      
      const result = await transactionService.getTransactionHistory(testAddress, 50, 1)
      
      expect(result.success).toBe(true)
      expect(result.data.transactions).toEqual(mockTransactions)
      expect(result.data.pagination.page).toBe(1)
      expect(result.data.pagination.limit).toBe(50)
      expect(result.data.pagination.total).toBe(2)
      
      // Verificar que não foi feita chamada para API
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should fetch fresh data when cache is expired', async () => {
      // Simular cache expirado
      const cacheKey = `transactions_${testAddress}_50_1`
      transactionService['cache'].set(cacheKey, {
        data: mockTransactions,
        timestamp: Date.now() - 6 * 60 * 1000, // 6 minutos atrás
        ttl: 5 * 60 * 1000, // 5 minutos
      })

      // Mock da resposta da API
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: '1',
          message: 'OK',
          result: [
            {
              hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
              from: '0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6',
              to: '0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6',
              value: '100000000000000000', // 0.1 ETH em wei
              gasUsed: '21000',
              gasPrice: '20000000000',
              blockNumber: '12345678',
              timeStamp: Math.floor((Date.now() - 3600000) / 1000),
              isError: '0',
            },
          ],
        }),
      } as any)

      const result = await transactionService.getTransactionHistory(testAddress, 50, 1)
      
      expect(result.success).toBe(true)
      expect(result.data.transactions).toHaveLength(1)
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('should handle API errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as any)

      const result = await transactionService.getTransactionHistory(testAddress, 50, 1)
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('API error: 500')
      expect(result.data.transactions).toEqual([])
    })

    it('should handle invalid API responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: '0',
          message: 'Invalid API key',
          result: [],
        }),
      } as any)

      const result = await transactionService.getTransactionHistory(testAddress, 50, 1)
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('API error: Invalid API key')
      expect(result.data.transactions).toEqual([])
    })

    it('should respect pagination parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: '1',
          message: 'OK',
          result: mockTransactions.slice(0, 1), // Apenas 1 transação
        }),
      } as any)

      const result = await transactionService.getTransactionHistory(testAddress, 1, 2)
      
      expect(result.data.pagination.page).toBe(2)
      expect(result.data.pagination.limit).toBe(1)
      expect(result.data.transactions).toHaveLength(1)
    })

    it('should validate address format', async () => {
      const invalidAddress = 'invalid-address'
      
      const result = await transactionService.getTransactionHistory(invalidAddress, 50, 1)
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid address format')
      expect(result.data.transactions).toEqual([])
    })
  })

  describe('getTransactionsByType', () => {
    const testAddress = '0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6'

    it('should filter transactions by type correctly', async () => {
      // Mock da resposta da API para getTransactionHistory (chamado internamente)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: '1',
          message: 'OK',
          result: [
            {
              hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
              from: '0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6',
              to: '0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6',
              value: '100000000000000000',
              gasUsed: '21000',
              gasPrice: '20000000000',
              blockNumber: '12345678',
              timeStamp: Math.floor((Date.now() - 3600000) / 1000),
              isError: '0',
            },
            {
              hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
              from: '0x1234567890abcdef1234567890abcdef1234567890ab',
              to: '0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6',
              value: '100000000000000000',
              gasUsed: '65000',
              gasPrice: '25000000000',
              blockNumber: '12345677',
              timeStamp: Math.floor((Date.now() - 7200000) / 1000),
              isError: '0',
            },
          ],
        }),
      } as any)

      const result = await transactionService.getTransactionsByType(testAddress, 'receive', 50, 1)
      
      expect(result.success).toBe(true)
      expect(result.data.transactions).toHaveLength(1)
      expect(result.data.transactions[0].type).toBe('receive')
    })

    it('should return empty array for unknown transaction type', async () => {
      const result = await transactionService.getTransactionsByType(testAddress, 'unknown' as any, 50, 1)
      
      expect(result.success).toBe(true)
      expect(result.data.transactions).toEqual([])
    })
  })

  describe('getTransactionsByDateRange', () => {
    const testAddress = '0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6'
    const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 horas atrás
    const endDate = new Date()

    it('should filter transactions by date range correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: '1',
          message: 'OK',
          result: [
            {
              hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
              from: '0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6',
              to: '0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6',
              value: '100000000000000000',
              gasUsed: '21000',
              gasPrice: '20000000000',
              blockNumber: '12345678',
              timeStamp: Math.floor((Date.now() - 3600000) / 1000), // 1 hora atrás
              isError: '0',
            },
          ],
        }),
      } as any)

      const result = await transactionService.getTransactionsByDateRange(
        testAddress,
        startDate,
        endDate,
        50,
        1
      )
      
      expect(result.success).toBe(true)
      expect(result.data.transactions).toHaveLength(1)
    })

    it('should handle invalid date range', async () => {
      const invalidStartDate = new Date()
      const invalidEndDate = new Date(Date.now() - 24 * 60 * 60 * 1000) // Start > End

      const result = await transactionService.getTransactionsByDateRange(
        testAddress,
        invalidStartDate,
        invalidEndDate,
        50,
        1
      )
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid date range')
    })
  })

  describe('getTransactionDetails', () => {
    const testHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'

    it('should return transaction details when found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: '1',
          message: 'OK',
          result: {
            hash: testHash,
            from: '0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6',
            to: '0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6',
            value: '100000000000000000',
            gasUsed: '21000',
            gasPrice: '20000000000',
            blockNumber: '12345678',
            timeStamp: Math.floor((Date.now() - 3600000) / 1000),
            isError: '0',
          },
        }),
      } as any)

      const result = await transactionService.getTransactionDetails(testHash, mockNetwork)
      
      expect(result.success).toBe(true)
      expect(result.data?.hash).toBe(testHash)
      expect(result.data?.status).toBe('confirmed')
    })

    it('should return null for non-existent transaction', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: '0',
          message: 'No transactions found',
          result: null,
        }),
      } as any)

      const result = await transactionService.getTransactionDetails(testHash, mockNetwork)
      
      expect(result.success).toBe(true)
      expect(result.data).toBeNull()
    })

    it('should handle API errors for transaction details', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as any)

      const result = await transactionService.getTransactionDetails(testHash, mockNetwork)
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('API error: 404')
      expect(result.data).toBeNull()
    })
  })

  describe('Cache Management', () => {
    it('should clear expired cache entries', async () => {
      const testAddress = '0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6'
      
      // Adicionar entradas de cache expiradas e válidas
      const expiredKey = `transactions_${testAddress}_50_1`
      const validKey = `transactions_${testAddress}_25_1`
      
      transactionService['cache'].set(expiredKey, {
        data: mockTransactions,
        timestamp: Date.now() - 6 * 60 * 1000, // 6 minutos atrás
        ttl: 5 * 60 * 1000, // 5 minutos
      })
      
      transactionService['cache'].set(validKey, {
        data: mockTransactions.slice(0, 1),
        timestamp: Date.now(),
        ttl: 5 * 60 * 1000, // 5 minutos
      })

      // Verificar cache antes da limpeza
      expect(transactionService['cache'].size).toBe(2)
      
      // Limpar cache expirado
      transactionService.clearExpiredCache()
      
      // Verificar que apenas entradas válidas permanecem
      expect(transactionService['cache'].size).toBe(1)
      expect(transactionService['cache'].has(validKey)).toBe(true)
      expect(transactionService['cache'].has(expiredKey)).toBe(false)
    })

    it('should clear all cache', () => {
      const testAddress = '0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6'
      
      // Adicionar algumas entradas de cache
      transactionService['cache'].set(`transactions_${testAddress}_50_1`, {
        data: mockTransactions,
        timestamp: Date.now(),
        ttl: 5 * 60 * 1000,
      })
      
      expect(transactionService['cache'].size).toBeGreaterThan(0)
      
      // Limpar todo o cache
      transactionService.clearCache()
      
      expect(transactionService['cache'].size).toBe(0)
    })

    it('should get cache statistics correctly', () => {
      const testAddress = '0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6'
      
      // Adicionar entradas de cache mistas
      transactionService['cache'].set(`transactions_${testAddress}_50_1`, {
        data: mockTransactions,
        timestamp: Date.now(),
        ttl: 5 * 60 * 1000,
      })
      
      transactionService['cache'].set(`transactions_${testAddress}_25_1`, {
        data: mockTransactions.slice(0, 1),
        timestamp: Date.now() - 6 * 60 * 1000, // 6 minutos atrás
        ttl: 5 * 60 * 1000,
      })

      const stats = transactionService.getCacheStats()
      
      expect(stats.totalEntries).toBe(2)
      expect(stats.expiredEntries).toBe(1)
      expect(stats.validEntries).toBe(1)
      expect(stats.hitRate).toBe(0.5)
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))
      
      const result = await transactionService.getTransactionHistory(
        '0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6',
        50,
        1
      )
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('Network error')
      expect(result.data.transactions).toEqual([])
    })

    it('should handle JSON parsing errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON')
        },
      } as any)

      const result = await transactionService.getTransactionHistory(
        '0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6',
        50,
        1
      )
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid JSON')
      expect(result.data.transactions).toEqual([])
    })

    it('should handle timeout errors', async () => {
      // Simular timeout
      mockFetch.mockImplementationOnce(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 100)
        )
      )

      const result = await transactionService.getTransactionHistory(
        '0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6',
        50,
        1
      )
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('Request timeout')
      expect(result.data.transactions).toEqual([])
    })
  })

  describe('Data Validation', () => {
    it('should validate transaction hash format', () => {
      const validHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      const invalidHash = 'invalid-hash'
      
      expect(transactionService['validateTransactionHash'](validHash)).toBe(true)
      expect(transactionService['validateTransactionHash'](invalidHash)).toBe(false)
    })

    it('should validate address format', () => {
      const validAddress = '0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6'
      const invalidAddress = 'invalid-address'
      
      expect(transactionService['validateAddress'](validAddress)).toBe(true)
      expect(transactionService['validateAddress'](invalidAddress)).toBe(false)
    })

    it('should sanitize transaction data', () => {
      const testAddress = '0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6'
      const rawTransaction = {
        hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        from: '0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6',
        to: '0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6',
        value: '100000000000000000',
        gasUsed: '21000',
        gasPrice: '20000000000',
        blockNumber: '12345678',
        timeStamp: Math.floor((Date.now() - 3600000) / 1000).toString(),
        isError: '0',
      }

      const sanitized = transactionService['sanitizeTransactionData'](rawTransaction, mockNetwork, testAddress)
      
      expect(sanitized.hash).toBe(rawTransaction.hash)
      expect(sanitized.from).toBe(rawTransaction.from)
      expect(sanitized.to).toBe(rawTransaction.to)
      expect(sanitized.value).toBe('0.1') // Convertido de wei para ETH
      expect(sanitized.status).toBe('confirmed')
      expect(sanitized.network).toBe(mockNetwork)
    })
  })
})
