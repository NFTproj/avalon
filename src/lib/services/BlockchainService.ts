import { ethers } from 'ethers'
import { Network, WalletData, TokenBalance, Transaction } from '@/types/wallet'

// Interface para configuração de provider
export interface ProviderConfig {
  rpcUrl: string
  chainId: number
  name: string
}

// Interface para configuração de token ERC-20
export interface ERC20Config {
  contractAddress: string
  symbol: string
  name: string
  decimals: number
}

// Interface para transação de blockchain
export interface BlockchainTransaction {
  hash: string
  from: string
  to: string
  value: string
  data?: string
  gasLimit?: string
  gasPrice?: string
  nonce?: number
}

// Classe base abstrata para serviços de blockchain
export abstract class BlockchainService {
  protected network: Network
  protected provider: ethers.Provider
  protected signer?: ethers.Signer

  constructor(network: Network) {
    this.network = network
    this.provider = new ethers.JsonRpcProvider(network.rpcUrl)
  }

  // Métodos abstratos que devem ser implementados pelas classes filhas
  abstract getWalletBalance(address: string): Promise<WalletData>
  abstract getTokenBalances(address: string): Promise<TokenBalance[]>
  abstract getTransactionHistory(address: string, limit?: number): Promise<Transaction[]>
  abstract estimateGas(transaction: BlockchainTransaction): Promise<bigint>

  // Métodos base que podem ser sobrescritos se necessário
  async getNativeBalance(address: string): Promise<string> {
    try {
      const balance = await this.provider.getBalance(address)
      return ethers.formatEther(balance)
    } catch (error) {
      console.error(`[BlockchainService] Error getting native balance:`, error)
      throw new Error(`Failed to get native balance: ${error}`)
    }
  }

  async getTokenBalance(
    contractAddress: string,
    walletAddress: string,
    config: ERC20Config
  ): Promise<TokenBalance> {
    try {
      // Criar instância do contrato ERC-20
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

      // Buscar saldo do token
      const balanceRaw = await contract.balanceOf(walletAddress)
      const balance = ethers.formatUnits(balanceRaw, config.decimals)

      // Por enquanto, preço mock - será implementado no PriceService
      const price = 0
      const valueUSD = parseFloat(balance) * price

      return {
        contractAddress,
        symbol: config.symbol,
        name: config.name,
        decimals: config.decimals,
        balance,
        balanceRaw,
        price,
        valueUSD,
        network: this.network,
      }
    } catch (error) {
      console.error(`[BlockchainService] Error getting token balance:`, error)
      throw new Error(`Failed to get token balance: ${error}`)
    }
  }

  async getTransactionReceipt(hash: string): Promise<ethers.TransactionReceipt | null> {
    try {
      return await this.provider.getTransactionReceipt(hash)
    } catch (error) {
      console.error(`[BlockchainService] Error getting transaction receipt:`, error)
      return null
    }
  }

  async getBlockNumber(): Promise<number> {
    try {
      return await this.provider.getBlockNumber()
    } catch (error) {
      console.error(`[BlockchainService] Error getting block number:`, error)
      throw new Error(`Failed to get block number: ${error}`)
    }
  }

  async getGasPrice(): Promise<bigint> {
    try {
      return await this.provider.getFeeData().then(data => data.gasPrice || BigInt(0))
    } catch (error) {
      console.error(`[BlockchainService] Error getting gas price:`, error)
      throw new Error(`Failed to get gas price: ${error}`)
    }
  }

  // Método para validar endereço
  validateAddress(address: string): boolean {
    try {
      return ethers.isAddress(address)
    } catch {
      return false
    }
  }

  // Método para formatar endereço
  formatAddress(address: string): string {
    if (!this.validateAddress(address)) {
      throw new Error('Invalid address')
    }
    return ethers.getAddress(address)
  }

  // Método para obter informações da rede
  getNetworkInfo(): Network {
    return this.network
  }

  // Método para verificar se a rede está funcionando
  async isNetworkHealthy(): Promise<boolean> {
    try {
      await this.provider.getBlockNumber()
      return true
    } catch {
      return false
    }
  }

  // Método para obter provider
  getProvider(): ethers.Provider {
    return this.provider
  }

  // Método para definir signer (para transações)
  setSigner(signer: ethers.Signer): void {
    this.signer = signer
    // Atualizar provider com signer
    this.provider = signer.provider || this.provider
  }

  // Método para obter signer
  getSigner(): ethers.Signer | undefined {
    return this.signer
  }

  // Método para converter wei para ether
  formatEther(wei: bigint): string {
    return ethers.formatEther(wei)
  }

  // Método para converter ether para wei
  parseEther(ether: string): bigint {
    return ethers.parseEther(ether)
  }

  // Método para converter unidades de token
  formatUnits(value: bigint, decimals: number): string {
    return ethers.formatUnits(value, decimals)
  }

  // Método para converter string para unidades de token
  parseUnits(value: string, decimals: number): bigint {
    return ethers.parseUnits(value, decimals)
  }

  // Método para obter timestamp do bloco
  async getBlockTimestamp(blockNumber: number): Promise<number> {
    try {
      const block = await this.provider.getBlock(blockNumber)
      return block?.timestamp || 0
    } catch (error) {
      console.error(`[BlockchainService] Error getting block timestamp:`, error)
      return 0
    }
  }

  // Método para obter confirmações de uma transação
  async getTransactionConfirmations(hash: string): Promise<number> {
    try {
      const receipt = await this.getTransactionReceipt(hash)
      if (!receipt) return 0

      const currentBlock = await this.getBlockNumber()
      return currentBlock - receipt.blockNumber + 1
    } catch (error) {
      console.error(`[BlockchainService] Error getting confirmations:`, error)
      return 0
    }
  }

  // Método para verificar se uma transação foi confirmada
  async isTransactionConfirmed(hash: string, confirmations: number = 12): Promise<boolean> {
    try {
      const currentConfirmations = await this.getTransactionConfirmations(hash)
      return currentConfirmations >= confirmations
    } catch (error) {
      console.error(`[BlockchainService] Error checking confirmation:`, error)
      return false
    }
  }

  // Método para obter status de uma transação
  async getTransactionStatus(hash: string): Promise<'pending' | 'confirmed' | 'failed'> {
    try {
      const receipt = await this.getTransactionReceipt(hash)
      if (!receipt) return 'pending'

      if (receipt.status === 1) {
        return 'confirmed'
      } else {
        return 'failed'
      }
    } catch (error) {
      console.error(`[BlockchainService] Error getting transaction status:`, error)
      return 'pending'
    }
  }

  // Método para limpar recursos
  async cleanup(): Promise<void> {
    // Implementar limpeza de recursos se necessário
    // Por exemplo, fechar conexões WebSocket
  }
}
