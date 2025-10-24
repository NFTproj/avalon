// src/lib/api/orders.ts

import { apiFetch } from './fetcher'

export type Order = {
  id: string
  type?: string | number
  amount?: string
  status: string | number
  txHash?: string
  toAddress?: string
  fromAddress?: string
  network?: string
  tokenAddress?: string
  clientId?: string
  userId?: string
  createdAt?: string
  updatedAt?: string
  completedAt?: string
}

export type Pagination = {
  total: number
  totalPages: number
  currentPage: number
  limit: number
}

export type OrdersResponse = {
  data: Order[]
  pagination?: Pagination
}

export type OrdersQuery = {
  page?: number
  limit?: number
  status?: string | number
  type?: string | number
  network?: string
  from?: string // ISO
  to?: string   // ISO
  search?: string
  sort?: string // ex.: "createdAt:desc"
  userId?: string
}

/** Monta ?query=string */
function toQuery(q?: OrdersQuery) {
  const sp = new URLSearchParams()
  if (!q) return ''
  Object.entries(q).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v) !== '') {
      sp.append(k, String(v))
    }
  })
  const s = sp.toString()
  return s ? `?${s}` : ''
}

/** Normaliza o shape vindo da API (data|transactions) */
function normalizeOrdersJson(json: any, fallback: {page: number; limit: number}): OrdersResponse {
  const list =
    Array.isArray(json?.data) ? json.data :
    Array.isArray(json?.transactions) ? json.transactions :
    []

  const pagination: Pagination | undefined =
    json?.pagination ?? (json?.total != null
      ? {
          total: Number(json.total) || list.length,
          limit: Number(fallback.limit),
          currentPage: Number(fallback.page),
          totalPages: Math.max(1, Math.ceil((Number(json.total) || list.length) / Number(fallback.limit))),
        }
      : undefined)

  return { data: list as Order[], pagination }
}

/** Lista ordens via rota protegida do Next */
export async function listOrders(q?: OrdersQuery): Promise<OrdersResponse> {
  const page = Number(q?.page ?? 1)
  const limit = Number(q?.limit ?? 10)

  const json = await apiFetch(`/api/orders${toQuery(q)}`)
  return normalizeOrdersJson(json, { page, limit })
}

/** Detalhe da ordem */
export async function getOrder(id: string): Promise<Order> {
  const json = await apiFetch(`/api/orders/${encodeURIComponent(id)}`)
  return (json?.data || json) as Order
}
