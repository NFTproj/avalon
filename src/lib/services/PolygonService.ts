import { ethers } from 'ethers'
import { BlockchainService, BlockchainTransaction, ERC20Config } from './BlockchainService'
import { Network, WalletData, TokenBalance, Transaction } from '@/types/wallet'

// Configuração específica para Polygon
export interface PolygonConfig {
  rpcUrl: string
  chainId: number
  name: string
  polygonscanApiKey?: string
  polygonscanBaseUrl: string
}

// Tokens ERC-20 conhecidos na rede Polygon
export const KNOWN_POLYGON_TOKENS: ERC20Config[] = [
  {
    contractAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
  },
  {
    contractAddress: '0xc2132D05D31c914a87C6611C10748AEb04B58e8Fc', // USDT
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
  },
  {
    contractAddress: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6', // WBTC
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    decimals: 8,
  },
  {
    contractAddress: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', // WMATIC
    symbol: 'WMATIC',
    name: 'Wrapped MATIC',
    decimals: 18,
  },
  {
    contractAddress: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', // WETH
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
  },
]

export class PolygonService extends BlockchainService {
  private polygonscanApiKey?: string
  private polygonscanBaseUrl: string

  constructor(network: Network, config?: Partial<PolygonConfig>) {
    super(network)
    
    this.polygonscanBaseUrl = config?.polygonscanBaseUrl || 'https://api.polygonscan.com/api'
    this.polygonscanApiKey = config?.polygonscanApiKey
  }

  // Implementação específica para Polygon
  async getWalletBalance(address: string): Promise<WalletData> {
    try {
      // Validar endereço
      if (!this.validateAddress(address)) {
        throw new Error('Invalid Polygon address')
      }

      // Buscar saldo nativo (MATIC)
      const nativeBalance = await this.getNativeBalance(address)
      
      // Buscar saldos de tokens ERC-20
      const tokenBalances = await this.getTokenBalances(address)
      
      // Buscar histórico de transações
      const transactions = await this.getTransactionHistory(address, 50)
      
      // Calcular valor total em USD
      const totalValueUSD = tokenBalances.reduce(
        (sum, token) => sum + token.valueUSD,
        parseFloat(nativeBalance) * 0 // Preço do MATIC será implementado no PriceService
      )

      return {
        address,
        network: this.network,
        balance: {
          native: nativeBalance,
          usd: parseFloat(nativeBalance) * 0, // Preço do MATIC será implementado no PriceService
        },
        tokens: tokenBalances,
        transactions,
        lastUpdated: new Date(),
        totalValueUSD,
      }
    } catch (error) {
      console.error('[PolygonService] Error getting wallet balance:', error)
      throw new Error(`Failed to get Polygon wallet balance: ${error}`)
    }
  }

  async getTokenBalances(address: string): Promise<TokenBalance[]> {
    try {
      if (!this.validateAddress(address)) {
        throw new Error('Invalid Polygon address')
      }

      const tokenBalances: TokenBalance[] = []

      // Buscar saldos de tokens conhecidos
      for (const tokenConfig of KNOWN_POLYGON_TOKENS) {
        try {
          const balance = await this.getTokenBalance(
            tokenConfig.contractAddress,
            address,
            tokenConfig
          )
          
          // Só incluir tokens com saldo > 0
          if (parseFloat(balance.balance) > 0) {
            tokenBalances.push(balance)
          }
        } catch (error) {
          // Token pode não existir ou ter erro - continuar com o próximo
          console.warn(`[PolygonService] Error getting ${tokenConfig.symbol} balance:`, error)
        }
      }

      // TODO: Implementar busca de outros tokens ERC-20 via eventos
      // Por enquanto, retornamos apenas os tokens conhecidos

      return tokenBalances
    } catch (error) {
      console.error('[PolygonService] Error getting token balances:', error)
      throw new Error(`Failed to get Polygon token balances: ${error}`)
    }
  }

  async getTransactionHistory(address: string, limit: number = 50): Promise<Transaction[]> {
    try {
      if (!this.validateAddress(address)) {
        throw new Error('Invalid Polygon address')
      }

      // Se temos API key do Polygonscan, usar ela para buscar transações
      if (this.polygonscanApiKey) {
        return await this.getTransactionsFromPolygonscan(address, limit)
      }

      // Caso contrário, buscar apenas transações recentes via provider
      return await this.getRecentTransactions(address, limit)
    } catch (error) {
      console.error('[PolygonService] Error getting transaction history:', error)
      throw new Error(`Failed to get Polygon transaction history: ${error}`)
    }
  }

  async estimateGas(transaction: BlockchainTransaction): Promise<bigint> {
    try {
      const txRequest: ethers.TransactionRequest = {
        from: transaction.from,
        to: transaction.to,
        value: transaction.value ? ethers.parseEther(transaction.value) : undefined,
        data: transaction.data,
      }

      return await this.provider.estimateGas(txRequest)
    } catch (error) {
      console.error('[PolygonService] Error estimating gas:', error)
      throw new Error(`Failed to estimate gas: ${error}`)
    }
  }

  // Método específico para buscar transações via Polygonscan
  private async getTransactionsFromPolygonscan(address: string, limit: number): Promise<Transaction[]> {
    try {
      const response = await fetch(
        `${this.polygonscanBaseUrl}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=${limit}&sort=desc&apikey=${this.polygonscanApiKey}`
      )

      if (!response.ok) {
        throw new Error(`Polygonscan API error: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.status !== '1') {
        throw new Error(`Polygonscan API error: ${data.message}`)
      }

      return data.result.map((tx: any) => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: ethers.formatEther(tx.value),
        tokenSymbol: undefined, // Polygonscan não fornece símbolo do token para transações nativas
        type: this.determineTransactionType(tx.from, tx.to, address),
        timestamp: parseInt(tx.timeStamp) * 1000, // Converter para milissegundos
        status: tx.isError === '1' ? 'failed' : 'confirmed',
        network: this.network,
        gasUsed: tx.gasUsed,
        gasPrice: ethers.formatUnits(tx.gasPrice, 'wei'),
        blockNumber: parseInt(tx.blockNumber),
        confirmations: 0, // Será calculado separadamente se necessário
      }))
    } catch (error) {
      console.error('[PolygonService] Error fetching from Polygonscan:', error)
      // Fallback para método local
      return await this.getRecentTransactions(address, limit)
    }
  }

  // Método para buscar transações recentes via provider
  private async getRecentTransactions(address: string, limit: number): Promise<Transaction[]> {
    try {
      const currentBlock = await this.getBlockNumber()
      const transactions: Transaction[] = []
      
      // Buscar nos últimos 100 blocos (aproximadamente 2 minutos na Polygon)
      const startBlock = Math.max(0, currentBlock - 100)
      
      for (let blockNumber = currentBlock; blockNumber >= startBlock && transactions.length < limit; blockNumber--) {
        try {
          const block = await this.provider.getBlock(blockNumber, true)
          if (!block) continue

          for (const tx of block.transactions) {
            if (transactions.length >= limit) break
            
            // Verificar se tx é um objeto com propriedades from/to ou apenas um hash
            if (typeof tx === 'string') {
              // Se for apenas um hash, buscar detalhes da transação
              try {
                const txDetails = await this.provider.getTransaction(tx)
                if (txDetails && (txDetails.from === address || txDetails.to === address)) {
                  const receipt = await this.getTransactionReceipt(tx)
                  
                  transactions.push({
                    hash: tx,
                    from: txDetails.from || '',
                    to: txDetails.to || '',
                    value: ethers.formatEther(txDetails.value || 0),
                    tokenSymbol: undefined,
                    type: this.determineTransactionType(txDetails.from || '', txDetails.to || '', address),
                    timestamp: (block.timestamp || 0) * 1000,
                    status: receipt?.status === 1 ? 'confirmed' : 'failed',
                    network: this.network,
                    gasUsed: receipt?.gasUsed?.toString(),
                    gasPrice: txDetails.gasPrice ? ethers.formatUnits(txDetails.gasPrice, 'wei') : undefined,
                    blockNumber: blockNumber,
                    confirmations: currentBlock - blockNumber + 1,
                  })
                }
              } catch (error) {
                console.warn(`[PolygonService] Error getting transaction details for ${tx}:`, error)
                continue
              }
            } else if (tx && typeof tx === 'object' && 'from' in tx && 'to' in tx && 'hash' in tx) {
              // Se for um objeto com propriedades from/to/hash
              const txObj = tx as { from: string; to: string; hash: string; value?: any; gasPrice?: any }
              if (txObj.from === address || txObj.to === address) {
                const receipt = await this.getTransactionReceipt(txObj.hash)
                
                transactions.push({
                  hash: txObj.hash,
                  from: txObj.from || '',
                  to: txObj.to || '',
                  value: ethers.formatEther(txObj.value || 0),
                  tokenSymbol: undefined,
                  type: this.determineTransactionType(txObj.from || '', txObj.to || '', address),
                  timestamp: (block.timestamp || 0) * 1000,
                  status: receipt?.status === 1 ? 'confirmed' : 'failed',
                  network: this.network,
                  gasUsed: receipt?.gasUsed?.toString(),
                  gasPrice: txObj.gasPrice ? ethers.formatUnits(txObj.gasPrice, 'wei') : undefined,
                  blockNumber: blockNumber,
                  confirmations: currentBlock - blockNumber + 1,
                })
              }
            }
          }
        } catch (error) {
          console.warn(`[PolygonService] Error processing block ${blockNumber}:`, error)
          continue
        }
      }

      return transactions
    } catch (error) {
      console.error('[PolygonService] Error getting recent transactions:', error)
      return []
    }
  }

  // Método para determinar o tipo de transação
  private determineTransactionType(from: string, to: string, walletAddress: string): Transaction['type'] {
    if (from.toLowerCase() === walletAddress.toLowerCase()) {
      return 'send'
    } else if (to.toLowerCase() === walletAddress.toLowerCase()) {
      return 'receive'
    }
    return 'send' // Fallback
  }

  // Método específico para buscar preço do MATIC
  async getMATICPrice(): Promise<number> {
    try {
      // TODO: Implementar busca de preço via CoinGecko ou similar
      // Por enquanto, retornar 0
      return 0
    } catch (error) {
      console.error('[PolygonService] Error getting MATIC price:', error)
      return 0
    }
  }

  // Método para verificar se um contrato é um token ERC-20 válido
  async isERC20Token(contractAddress: string): Promise<boolean> {
    try {
      const contract = new ethers.Contract(
        contractAddress,
        [
          'function balanceOf(address owner) view returns (uint256)',
          'function symbol() view returns (string)',
          'function name() view returns (string)',
          'function decimals() view returns (uint8)',
        ],
        this.provider
      )

      // Tentar chamar métodos básicos do ERC-20
      await Promise.all([
        contract.symbol(),
        contract.name(),
        contract.decimals(),
      ])

      return true
    } catch {
      return false
    }
  }

  // Método para buscar informações de um token ERC-20
  async getERC20Info(contractAddress: string): Promise<ERC20Config | null> {
    try {
      if (!(await this.isERC20Token(contractAddress))) {
        return null
      }

      const contract = new ethers.Contract(
        contractAddress,
        [
          'function symbol() view returns (string)',
          'function name() view returns (string)',
          'function decimals() view returns (uint8)',
        ],
        this.provider
      )

      const [symbol, name, decimals] = await Promise.all([
        contract.symbol(),
        contract.name(),
        contract.decimals(),
      ])

      return {
        contractAddress,
        symbol,
        name,
        decimals,
      }
    } catch (error) {
      console.error('[PolygonService] Error getting ERC20 info:', error)
      return null
    }
  }

  // Método específico para buscar transações de tokens (ERC-20 transfers)
  async getTokenTransfers(address: string, limit: number = 50): Promise<Transaction[]> {
    try {
      if (!this.polygonscanApiKey) {
        return [] // Sem API key, não podemos buscar transferências de tokens
      }

      const response = await fetch(
        `${this.polygonscanBaseUrl}?module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&page=1&offset=${limit}&sort=desc&apikey=${this.polygonscanApiKey}`
      )

      if (!response.ok) {
        throw new Error(`Polygonscan API error: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.status !== '1') {
        throw new Error(`Polygonscan API error: ${data.message}`)
      }

      return data.result.map((tx: any) => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: ethers.formatUnits(tx.value, parseInt(tx.tokenDecimal)),
        tokenSymbol: tx.tokenSymbol,
        type: this.determineTransactionType(tx.from, tx.to, address),
        timestamp: parseInt(tx.timeStamp) * 1000,
        status: 'confirmed', // Transações de tokens são sempre confirmadas quando aparecem na API
        network: this.network,
        gasUsed: tx.gasUsed,
        gasPrice: ethers.formatUnits(tx.gasPrice, 'wei'),
        blockNumber: parseInt(tx.blockNumber),
        confirmations: 0,
      }))
    } catch (error) {
      console.error('[PolygonService] Error getting token transfers:', error)
      return []
    }
  }

  // Método para buscar informações de gas da rede Polygon
  async getGasInfo(): Promise<{
    gasPrice: bigint
    maxFeePerGas: bigint
    maxPriorityFeePerGas: bigint
  }> {
    try {
      const feeData = await this.provider.getFeeData()
      
      return {
        gasPrice: feeData.gasPrice || BigInt(0),
        maxFeePerGas: feeData.maxFeePerGas || BigInt(0),
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || BigInt(0),
      }
    } catch (error) {
      console.error('[PolygonService] Error getting gas info:', error)
      throw new Error(`Failed to get gas info: ${error}`)
    }
  }
}
