import { JsonRpcProvider } from 'ethers';

export function getProvider(chainId: number): JsonRpcProvider {
  switch (chainId) {
    case 1: // Ethereum mainnet
      return new JsonRpcProvider(process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL || process.env.RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/demo');
    case 137: // Polygon mainnet
      return new JsonRpcProvider(process.env.NEXT_PUBLIC_POLYGON_RPC_URL || process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com');
    case 42161: // Arbitrum mainnet
      return new JsonRpcProvider(process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL || process.env.BASE_RPC_URL || 'https://arb1.arbitrum.io/rpc');
    case 11155111: // Sepolia testnet
      return new JsonRpcProvider(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || process.env.SEPOLIA_RPC_URL || 'https://rpc.sepolia.org');
    default:
      // Fallback para Polygon se não reconhecer a rede
      console.warn(`RPC não configurado para chain ${chainId}, usando Polygon como fallback`);
      return new JsonRpcProvider(process.env.NEXT_PUBLIC_POLYGON_RPC_URL || process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com');
  }
}
