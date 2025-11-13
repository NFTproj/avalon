import { ethers } from 'ethers'
import { BlockchainService, BlockchainTransaction, ERC20Config } from './BlockchainService'
import { Network, WalletData, TokenBalance, Transaction } from '@/types/wallet'

// Configuração específica para Arbitrum
export interface ArbitrumConfig {
  rpcUrl: string
  chainId: number
  name: string
  arbitrumApiKey?: string
  arbitrumBaseUrl: string
}

// Tokens ERC-20 conhecidos na rede Arbitrum
export const KNOWN_ARBITRUM_TOKENS: ERC20Config[] = [
  {
    contractAddress: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', // USDC
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
  },
  {
    contractAddress: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', // USDT
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
  },
  {
    contractAddress: '0x2f2a2543B76A416d9c0b0d2f2d2cD6f4a4b4a4b4', // WBTC
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    decimals: 8,
  },
  {
    contractAddress: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // WETH
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
  },
  {
    contractAddress: '0x912CE59144191C1204E64559FE8253a0e49E6548', // ARB
    symbol: 'ARB',
    name: 'Arbitrum',
    decimals: 18,
  },
]

export class ArbitrumService extends BlockchainService {
  private arbitrumApiKey?: string
  private arbitrumBaseUrl: string

  constructor(network: Network, config?: Partial<ArbitrumConfig>) {
    super(network)
    
    this.arbitrumBaseUrl = config?.arbitrumBaseUrl || 'https://api.arbiscan.io/api'
    this.arbitrumApiKey = config?.arbitrumApiKey
  }

  // Implementação específica para Arbitrum
  async getWalletBalance(address: string): Promise<WalletData> {
    try {
      // Validar endereço
      if (!this.validateAddress(address)) {
        throw new Error('Invalid Arbitrum address')
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
      throw new Error(`Failed to get Arbitrum wallet balance: ${error}`)
    }
  }

  async getTokenBalances(address: string): Promise<TokenBalance[]> {
    try {
      if (!this.validateAddress(address)) {
        throw new Error('Invalid Arbitrum address')
      }

      const tokenBalances: TokenBalance[] = []

      // Buscar saldos de tokens conhecidos
      for (const tokenConfig of KNOWN_ARBITRUM_TOKENS) {
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
        }
      }

      // TODO: Implementar busca de outros tokens ERC-20 via eventos
      // Por enquanto, retornamos apenas os tokens conhecidos

      return tokenBalances
    } catch (error) {
      throw new Error(`Failed to get Arbitrum token balances: ${error}`)
    }
  }

  async getTransactionHistory(address: string, limit: number = 50): Promise<Transaction[]> {
    try {
      if (!this.validateAddress(address)) {
        throw new Error('Invalid Arbitrum address')
      }

      // Se temos API key do Arbiscan, usar ela para buscar transações
      if (this.arbitrumApiKey) {
        return await this.getTransactionsFromArbiscan(address, limit)
      }

      // Caso contrário, buscar apenas transações recentes via provider
      return await this.getRecentTransactions(address, limit)
    } catch (error) {
      throw new Error(`Failed to get Arbitrum transaction history: ${error}`)
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
      throw new Error(`Failed to estimate gas: ${error}`)
    }
  }

  // Método específico para buscar transações via Arbiscan
  private async getTransactionsFromArbiscan(address: string, limit: number): Promise<Transaction[]> {
    try {
      const response = await fetch(
        `${this.arbitrumBaseUrl}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=${limit}&sort=desc&apikey=${this.arbitrumApiKey}`
      )

      if (!response.ok) {
        throw new Error(`Arbiscan API error: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.status !== '1') {
        throw new Error(`Arbiscan API error: ${data.message}`)
      }

      return data.result.map((tx: any) => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: ethers.formatEther(tx.value),
        tokenSymbol: undefined, // Arbiscan não fornece símbolo do token para transações nativas
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
      // Fallback para método local
      return await this.getRecentTransactions(address, limit)
    }
  }

  // Método para buscar transações recentes via provider
  private async getRecentTransactions(address: string, limit: number): Promise<Transaction[]> {
    try {
      const currentBlock = await this.getBlockNumber()
      const transactions: Transaction[] = []
      
      // Buscar nos últimos 100 blocos (aproximadamente 10 minutos na Arbitrum)
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
          continue
        }
      }

      return transactions
    } catch (error) {
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

  // Método específico para buscar preço do ETH na Arbitrum
  async getETHPrice(): Promise<number> {
    try {
      // TODO: Implementar busca de preço via CoinGecko ou similar
      // Por enquanto, retornar 0
      return 0
    } catch (error) {
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
      return null
    }
  }

  // Método específico para buscar transações de tokens (ERC-20 transfers)
  async getTokenTransfers(address: string, limit: number = 50): Promise<Transaction[]> {
    try {
      if (!this.arbitrumApiKey) {
        return [] // Sem API key, não podemos buscar transferências de tokens
      }

      const response = await fetch(
        `${this.arbitrumBaseUrl}?module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&page=1&offset=${limit}&sort=desc&apikey=${this.arbitrumApiKey}`
      )

      if (!response.ok) {
        throw new Error(`Arbiscan API error: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.status !== '1') {
        throw new Error(`Arbiscan API error: ${data.message}`)
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
      return []
    }
  }

  // Método para buscar informações de gas da rede Arbitrum
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
      throw new Error(`Failed to get gas info: ${error}`)
    }
  }

  // Método específico para buscar informações de L1 gas (Arbitrum é L2)
  async getL1GasInfo(): Promise<{
    l1GasPrice: bigint
    l1GasUsed: bigint
    l1Fee: bigint
  }> {
    try {
      // Arbitrum é uma L2, então não temos L1 gas diretamente
      // Mas podemos implementar lógica específica para L2 se necessário
      return {
        l1GasPrice: BigInt(0),
        l1GasUsed: BigInt(0),
        l1Fee: BigInt(0),
      }
    } catch (error) {
      throw new Error(`Failed to get L1 gas info: ${error}`)
    }
  }

  // Método para buscar informações de sequencer (específico da Arbitrum)
  async getSequencerInfo(): Promise<{
    sequencerAddress: string
    sequencerStatus: string
  }> {
    try {
      // Implementar lógica específica para buscar informações do sequencer da Arbitrum
      // Por enquanto, retornar dados mock
      return {
        sequencerAddress: '0x0000000000000000000000000000000000000000',
        sequencerStatus: 'active',
      }
    } catch (error) {
      throw new Error(`Failed to get sequencer info: ${error}`)
    }
  }
}
