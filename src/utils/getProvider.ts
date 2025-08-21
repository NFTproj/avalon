import { JsonRpcProvider } from 'ethers';

export function getProvider(chainId: number): JsonRpcProvider {
  switch (chainId) {
    case 137: // Polygon mainnet
      return new JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_POLYGON!);
    // acrescente outras redes conforme precisar
    default:
      throw new Error(`RPC não configurado para chain ${chainId}`);
  }
}
