// src/lib/api/cards.ts

import { apiFetch } from './fetcher'

export interface CardMetadata {
  field: string
  value: string
}

export interface CardBlockchainData {
  id: string
  cardId: string
  tokenAddress: string
  tokenTxHash: string
  tokenNetwork: string
  tokenChainId: number
  intermediaryContractAddress: string
  intermediaryContractTxHash: string
  tokenPrice: string
  signedBy: string
  initialSupply: string
  depositedSupply: string
  purchasedQuantity: string
  createdAt: string
  updatedAt: string
}

export interface Card {
  id: string
  name: string
  description: string
  longDescription: string
  ticker: string
  tags: string[]
  socialLinks: string
  blockchainPlatform: string
  launchDate: string
  cardBackgroundUrl: string
  logoUrl: string
  cardBackgroundPublicId: string
  logoPublicId: string
  userId: string
  status: string
  clientId: string
  createdAt: string
  updatedAt: string
  metadata: CardMetadata[]
  CardBlockchainData: CardBlockchainData | null
}

export interface Pagination {
  total: number
  totalPages: number
  currentPage: number
  limit: number
}

export interface GetCardsResponse {
  data: Card[]
  pagination: Pagination
}

export async function getAllCards(): Promise<GetCardsResponse> {
  return apiFetch<GetCardsResponse>('/api/cards')
}
  