// src/lib/api/cards.ts

import { apiFetch } from './fetcher'

// ============================================================================
// INTERFACES
// ============================================================================

export interface CardBlockchainData {
  tokenName: string
  tokenSymbol: string
  tokenAddress: string
  network: string
  tokenPrice?: string
  tokenChainId?: number
  purchasedQuantity?: string
  depositedSupply?: string
}

export interface Card {
  id: string
  name: string
  description?: string
  longDescription?: string
  image?: string
  status: string
  clientId: string
  cardBlockchainData?: CardBlockchainData
  createdAt?: string
  updatedAt?: string
  ticker?: string
  tags?: string[]
  logoUrl?: string
  launchDate?: string
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

// ============================================================================
// FUNÇÕES DE LISTAGEM
// ============================================================================

/**
 * Busca todos os cards/tokens
 * @param page - Número da página (opcional, padrão: 1)
 * @param limit - Itens por página (opcional, padrão: 20)
 */
export async function getAllCards(
  page?: number,
  limit?: number,
): Promise<GetCardsResponse> {
  const params = new URLSearchParams()
  if (page) params.append('page', page.toString())
  if (limit) params.append('limit', limit.toString())

  const url = params.toString()
    ? `/api/cards?${params.toString()}`
    : '/api/cards'

  return apiFetch<GetCardsResponse>(url)
}

/**
 * Busca um card específico por ID
 * @param cardId - ID do card a ser buscado
 */
export async function getCardById(cardId: string): Promise<Card> {
  return apiFetch<Card>(`/api/card/${cardId}`)
}

// ============================================================================
// FUNÇÕES DE CRIAÇÃO
// ============================================================================

/**
 * Payload para criação de um novo card/token
 */
export interface CreateCardPayload {
  name: string // Obrigatório
  description?: string
  longDescription?: string
  metadata?: Array<{ field: string; value: string }>
  ticker?: string
  tags?: string[]
  socialLinks?: Record<string, string> | string
  blockchainPlatform?: string
  launchDate?: string // ISO 8601
  logoFile?: File
  cardBackgroundFile?: File
}

/**
 * Cria um novo card/token na plataforma
 */
export async function createCard(payload: CreateCardPayload) {
  const form = new FormData()

  // Campo obrigatório
  form.append('name', payload.name)

  // Campos opcionais de texto
  if (payload.description) form.append('description', payload.description)
  if (payload.longDescription)
    form.append('longDescription', payload.longDescription)
  if (payload.ticker) form.append('ticker', payload.ticker)
  if (payload.blockchainPlatform)
    form.append('blockchainPlatform', payload.blockchainPlatform)
  if (payload.launchDate) form.append('launchDate', payload.launchDate)

  // Arrays e objetos - converter para JSON string
  if (payload.metadata && payload.metadata.length > 0) {
    form.append('metadata', JSON.stringify(payload.metadata))
  }
  if (payload.tags && payload.tags.length > 0) {
    form.append('tags', JSON.stringify(payload.tags))
  }
  if (payload.socialLinks) {
    const linksStr =
      typeof payload.socialLinks === 'string'
        ? payload.socialLinks
        : JSON.stringify(payload.socialLinks)
    form.append('socialLinks', linksStr)
  }

  // Arquivos
  if (payload.logoFile) {
    form.append('logoFile', payload.logoFile, payload.logoFile.name)
  }
  if (payload.cardBackgroundFile) {
    form.append(
      'cardBackgroundFile',
      payload.cardBackgroundFile,
      payload.cardBackgroundFile.name,
    )
  }

  const res = await fetch('/api/cards', {
    method: 'POST',
    credentials: 'include',
    body: form,
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data?.error || data?.message || 'Erro ao criar card')
  }

  return res.json()
}

// ============================================================================
// FUNÇÕES DE DEPLOY (BLOCKCHAIN)
// ============================================================================

/**
 * Payload para deploy do token na blockchain
 * Nota: clientId é adicionado automaticamente no servidor
 */
export interface DeployTokenPayload {
  cardId: string
  tokenName: string
  tokenSymbol: string
  initialSupply: string
  burnable: boolean
  network: string
}

/**
 * Faz o deploy do token ERC-20 na blockchain
 */
export async function deployTokenContract(payload: DeployTokenPayload) {
  const res = await fetch('/api/cards/deploy', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(
      data?.error || data?.message || 'Erro ao fazer deploy do token',
    )
  }

  return res.json()
}

/**
 * Payload para deploy do contrato intermediário (sale contract)
 * Nota: clientId é adicionado automaticamente no servidor
 */
export interface DeployIntermediaryPayload {
  cardId: string
  tokenAddress: string
  stablecoinAddress: string
  tokenPrice: number
  network: string
}

/**
 * Faz o deploy do contrato intermediário (sale contract)
 */
export async function deploySaleContract(payload: DeployIntermediaryPayload) {
  const res = await fetch('/api/cards/intermediary/deploy', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(
      data?.error ||
        data?.message ||
        'Erro ao fazer deploy do contrato intermediário',
    )
  }

  return res.json()
}

// ============================================================================
// FUNÇÕES DE ATUALIZAÇÃO
// ============================================================================

/**
 * Atualiza um card/token existente
 * @param cardId - ID do card a ser atualizado
 * @param payload - Dados a serem atualizados (apenas os campos alterados)
 */
export async function updateCard(
  cardId: string,
  payload: Partial<CreateCardPayload>,
) {
  const form = new FormData()

  // Adicionar apenas campos que foram fornecidos
  if (payload.name !== undefined) form.append('name', payload.name)
  if (payload.description !== undefined)
    form.append('description', payload.description)
  if (payload.longDescription !== undefined)
    form.append('longDescription', payload.longDescription)
  if (payload.ticker !== undefined) form.append('ticker', payload.ticker)
  if (payload.blockchainPlatform !== undefined)
    form.append('blockchainPlatform', payload.blockchainPlatform)
  if (payload.launchDate !== undefined)
    form.append('launchDate', payload.launchDate)

  // Arrays e objetos - converter para JSON string
  if (payload.metadata !== undefined) {
    form.append('metadata', JSON.stringify(payload.metadata))
  }
  if (payload.tags !== undefined) {
    form.append('tags', JSON.stringify(payload.tags))
  }
  if (payload.socialLinks !== undefined) {
    const linksStr =
      typeof payload.socialLinks === 'string'
        ? payload.socialLinks
        : JSON.stringify(payload.socialLinks)
    form.append('socialLinks', linksStr)
  }

  // Arquivos
  if (payload.logoFile) {
    form.append('logoFile', payload.logoFile, payload.logoFile.name)
  }
  if (payload.cardBackgroundFile) {
    form.append(
      'cardBackgroundFile',
      payload.cardBackgroundFile,
      payload.cardBackgroundFile.name,
    )
  }

  const res = await fetch(`/api/card/${cardId}`, {
    method: 'PUT',
    credentials: 'include',
    body: form,
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data?.error || data?.message || 'Erro ao atualizar card')
  }

  return res.json()
}
