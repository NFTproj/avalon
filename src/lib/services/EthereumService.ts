import { ethers } from 'ethers'
import { BlockchainService, BlockchainTransaction, ERC20Config } from './BlockchainService'
import { Network, WalletData, TokenBalance, Transaction } from '@/types/wallet'

// Configuração específica para Ethereum
export interface EthereumConfig {
  rpcUrl: string
  chainId: number
  name: string
  etherscanApiKey?: string
  etherscanBaseUrl: string
}

// Tokens ERC-20 conhecidos na Ethereum Mainnet
export const KNOWN_ETHEREUM_TOKENS: ERC20Config[] = [
  {
    contractAddress: '0xA0b86a33E6441b8c4C8D8d8c8c8c8c8c8c8c8c8', // USDC
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
  },
  {
    contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
  },
  {
    contractAddress: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    decimals: 8,
  },
  {
    contractAddress: '0x514910771AF9Ca656af840dff83E8264EcF986CA', // LINK
    symbol: 'LINK',
    name: 'Chainlink',
    decimals: 18,
  },
]

export class EthereumService extends BlockchainService {
  private etherscanApiKey?: string
  private etherscanBaseUrl: string

  constructor(network: Network, config?: Partial<EthereumConfig>) {
    super(network)
    
    this.etherscanBaseUrl = config?.etherscanBaseUrl || 'https://api.etherscan.io/api'
    this.etherscanApiKey = config?.etherscanApiKey
  }

  // Implementação específica para Ethereum
  async getWalletBalance(address: string): Promise<WalletData> {
    try {
      // Validar endereço
      if (!this.validateAddress(address)) {
        throw new Error('Invalid Ethereum address')
      }

      // Buscar saldo nativo (ETH)
      const nativeBalance = await this.getNativeBalance(address)
      
      // Buscar saldos de tokens ERC-20
      const tokenBalances = await this.getTokenBalances(address)
      
      // Buscar histórico de transações
      const transactions = await this.getTransactionHistory(address, 50)
      
      // Calcular valor total em USD
      const totalValueUSD = tokenBalances.reduce(
        (sum, token) => sum + token.valueUSD,
        parseFloat(nativeBalance) * 0 // Preço do ETH será implementado no PriceService
      )

      return {
        address,
        network: this.network,
        balance: {
          native: nativeBalance,
          usd: parseFloat(nativeBalance) * 0, // Preço do ETH será implementado no PriceService
        },
        tokens: tokenBalances,
        transactions,
        lastUpdated: new Date(),
        totalValueUSD,
      }
    } catch (error) {
      console.error('[EthereumService] Error getting wallet balance:', error)
      throw new Error(`Failed to get Ethereum wallet balance: ${error}`)
    }
  }

  async getTokenBalances(address: string): Promise<TokenBalance[]> {
    try {
      if (!this.validateAddress(address)) {
        throw new Error('Invalid Ethereum address')
      }

      const tokenBalances: TokenBalance[] = []

      // Buscar saldos de tokens conhecidos
      for (const tokenConfig of KNOWN_ETHEREUM_TOKENS) {
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
          console.warn(`[EthereumService] Error getting ${tokenConfig.symbol} balance:`, error)
        }
      }

      // TODO: Implementar busca de outros tokens ERC-20 via eventos
      // Por enquanto, retornamos apenas os tokens conhecidos

      return tokenBalances
    } catch (error) {
      console.error('[EthereumService] Error getting token balances:', error)
      throw new Error(`Failed to get Ethereum token balances: ${error}`)
    }
  }

  async getTransactionHistory(address: string, limit: number = 50): Promise<Transaction[]> {
    try {
      if (!this.validateAddress(address)) {
        throw new Error('Invalid Ethereum address')
      }

      // Se temos API key do Etherscan, usar ela para buscar transações
      if (this.etherscanApiKey) {
        return await this.getTransactionsFromEtherscan(address, limit)
      }

      // Caso contrário, buscar apenas transações recentes via provider
      return await this.getRecentTransactions(address, limit)
    } catch (error) {
      console.error('[EthereumService] Error getting transaction history:', error)
      throw new Error(`Failed to get Ethereum transaction history: ${error}`)
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
      console.error('[EthereumService] Error estimating gas:', error)
      throw new Error(`Failed to estimate gas: ${error}`)
    }
  }

  // Método específico para buscar transações via Etherscan
  private async getTransactionsFromEtherscan(address: string, limit: number): Promise<Transaction[]> {
    try {
      const response = await fetch(
        `${this.etherscanBaseUrl}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=${limit}&sort=desc&apikey=${this.etherscanApiKey}`
      )

      if (!response.ok) {
        throw new Error(`Etherscan API error: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.status !== '1') {
        throw new Error(`Etherscan API error: ${data.message}`)
      }

      return data.result.map((tx: any) => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: ethers.formatEther(tx.value),
        tokenSymbol: undefined, // Etherscan não fornece símbolo do token para transações nativas
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
      console.error('[EthereumService] Error fetching from Etherscan:', error)
      // Fallback para método local
      return await this.getRecentTransactions(address, limit)
    }
  }

  // Método para buscar transações recentes via provider
  private async getRecentTransactions(address: string, limit: number): Promise<Transaction[]> {
    try {
      const currentBlock = await this.getBlockNumber()
      const transactions: Transaction[] = []
      
      // Buscar nos últimos 100 blocos (aproximadamente 20 minutos)
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
                console.warn(`[EthereumService] Error getting transaction details for ${tx}:`, error)
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
          console.warn(`[EthereumService] Error processing block ${blockNumber}:`, error)
          continue
        }
      }

      return transactions
    } catch (error) {
      console.error('[EthereumService] Error getting recent transactions:', error)
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

  // Método específico para buscar preço do ETH
  async getETHPrice(): Promise<number> {
    try {
      // TODO: Implementar busca de preço via CoinGecko ou similar
      // Por enquanto, retornar 0
      return 0
    } catch (error) {
      console.error('[EthereumService] Error getting ETH price:', error)
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
      console.error('[EthereumService] Error getting ERC20 info:', error)
      return null
    }
  }
}
