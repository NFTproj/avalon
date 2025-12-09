// src/lib/api/cards.ts

import { apiFetch } from './fetcher'

export interface CardBlockchainData {
  tokenName: string
  tokenSymbol: string
  tokenAddress: string
  network: string
}

export interface Card {
  id: string
  name: string
  description: string
  image: string
  status: string
  clientId: string
  cardBlockchainData: CardBlockchainData
  createdAt?: string
  updatedAt?: string
  ticker?: string
}

export interface GetCardsResponse {
  data: Card[]
  meta?: {
    currentPage: number
    itemsPerPage: number
    totalItems: number
    totalPages: number
  }
}

export async function getAllCards(): Promise<GetCardsResponse> {
  return apiFetch<GetCardsResponse>('/api/cards')
}
