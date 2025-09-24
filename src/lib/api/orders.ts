// src/lib/api/orders.ts

export type Order = {
  id: string
  type?: string | number
  amount?: string
  status: string | number  // pode vir "300" etc
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
  // …qualquer “additionalProp” que o back envie
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
}

/** Monta ?query=string */
function toQuery(q?: OrdersQuery) {
  const sp = new URLSearchParams()
  if (!q) return ''
  Object.entries(q).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v) !== '') sp.append(k, String(v))
  })
  const s = sp.toString()
  return s ? `?${s}` : ''
}

/** Lista ordens via rota protegida do Next */
export async function listOrders(q?: OrdersQuery): Promise<OrdersResponse> {
  const res = await fetch(`/api/orders${toQuery(q)}`, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json?.error || json?.message || 'Falha ao listar ordens')
  return json
}

/** Detalhe da ordem */
export async function getOrder(id: string): Promise<Order> {
  const res = await fetch(`/api/orders/${encodeURIComponent(id)}`, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json?.error || json?.message || 'Falha ao carregar ordem')
  return json?.data || json
}
