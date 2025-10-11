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
  }
  
  export interface GetCardsResponse {
    data: Card[]
  }
  
  export async function getAllCards(): Promise<GetCardsResponse> {
    return apiFetch<GetCardsResponse>('/api/cards')
  }
  