// src/lib/api/token.ts

/**
 * Payload para criação de um novo card/token
 */
export interface CreateTokenPayload {
  name: string // Obrigatório
  description?: string
  longDescription?: string
  metadata?: Array<{ field: string; value: string }>
  ticker?: string
  tags?: string[]
  socialLinks?: Record<string, string> | string // Objeto ou JSON string
  blockchainPlatform?: string
  launchDate?: string // ISO 8601
  logoFile?: File
  cardBackgroundFile?: File
}

/**
 * Cria um novo card/token na plataforma Bloxify
 */
export async function createToken(payload: CreateTokenPayload) {
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

  // NÃO usar apiFetch com FormData - usar fetch direto
  const res = await fetch('/api/token', {
    method: 'POST',
    credentials: 'include',
    body: form,
    // NÃO definir Content-Type - o navegador define automaticamente com boundary
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data?.error || data?.message || 'Erro ao criar token')
  }

  return res.json()
}
