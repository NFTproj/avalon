export interface CardBlockchainData {
  tokenAddress: `0x${string}`;
  tokenNetwork: 'matic' | 'ethereum' | string;
  tokenChainId: number;
  tokenPrice: string;          // em centavos / wei / gwei? veja com a API
}

export interface Card {
  id: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
  CardBlockchainData: CardBlockchainData;
}

export interface WalletAsset {
  card: Card;
  symbol: string;
  decimals: number;
  balanceRaw: bigint;
}
