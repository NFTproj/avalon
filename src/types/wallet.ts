// Tipos para integração das wallets reais
export interface Network {
  id: number;
  name: string;
  chainId: string;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export interface TokenBalance {
  contractAddress: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  balanceRaw: bigint;
  price: number;
  valueUSD: number;
  network: Network;
  logo?: string;
  priceChange24h?: number;
  marketCap?: number;
  volume24h?: number;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  tokenSymbol?: string;
  type: 'send' | 'receive' | 'swap' | 'stake' | 'buy' | 'sell';
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  network: Network;
  gasUsed?: string;
  gasPrice?: string;
  blockNumber?: number;
  confirmations?: number;
}

export interface WalletData {
  address: string;
  network: Network;
  balance: {
    native: string;
    usd: number;
  };
  tokens: TokenBalance[];
  transactions: Transaction[];
  lastUpdated: Date;
  totalValueUSD: number;
}

export interface WalletBalanceResponse {
  success: boolean;
  data: {
    address: string;
    balances: TokenBalance[];
    totalValueUSD: number;
    lastUpdated: string;
  };
  error?: string;
}

export interface TokenPriceResponse {
  success: boolean;
  data: {
    [contractAddress: string]: {
      price: number;
      priceChange24h: number;
      marketCap: number;
      volume24h: number;
    };
  };
  error?: string;
}

export interface TransactionHistoryResponse {
  success: boolean;
  data: {
    transactions: Transaction[];
    pagination: {
      page: number;
      limit: number;
      total: number;
    };
  };
  error?: string;
}

export interface WalletError {
  message: string;
  code: string;
  network?: Network;
  retryable: boolean;
}

// Tipos para configuração de redes blockchain
export const SUPPORTED_NETWORKS: Network[] = [
  {
    id: 1,
    name: 'Ethereum',
    chainId: '0x1',
    rpcUrl: process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/YOUR_KEY',
    explorerUrl: 'https://etherscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  {
    id: 137,
    name: 'Polygon',
    chainId: '0x89',
    rpcUrl: process.env.NEXT_PUBLIC_POLYGON_RPC_URL || 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
  },
  {
    id: 42161,
    name: 'Arbitrum',
    chainId: '0xa4b1',
    rpcUrl: process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ARB',
      decimals: 18,
    },
  },
  {
    id: 11155111,
    name: 'Sepolia',
    chainId: '0xaa36a7',
    rpcUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_KEY',
    explorerUrl: 'https://sepolia.etherscan.io',
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  {
    id: 80001,
    name: 'Mumbai',
    chainId: '0x13881',
    rpcUrl: process.env.NEXT_PUBLIC_MUMBAI_RPC_URL || 'https://rpc-mumbai.maticvigil.com',
    explorerUrl: 'https://mumbai.polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
  },
];

// Tipos para cache
export interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Tipos para rate limiting
export interface RateLimitConfig {
  limit: number;
  window: number;
}

// Tipos para configuração de APIs externas
export interface ApiConfig {
  coinGecko: {
    baseUrl: string;
    apiKey?: string;
    rateLimit: RateLimitConfig;
  };
  etherscan: {
    baseUrl: string;
    apiKey?: string;
    rateLimit: RateLimitConfig;
  };
  infura: {
    baseUrl: string;
    apiKey?: string;
    rateLimit: RateLimitConfig;
  };
}
