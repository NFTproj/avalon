// src/lib/api/cards.ts

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
    const res = await fetch('/api/cards', {
      method: 'GET',
      credentials: 'include',
    })
  
    if (!res.ok) throw new Error('Erro ao buscar cards')
    return await res.json()
  }
  