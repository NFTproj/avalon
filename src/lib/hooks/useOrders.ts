// src/lib/hooks/useOrders.ts
'use client'
import * as React from 'react'

type Params = { page?: number; limit?: number }

export function useOrders({ page = 1, limit = 10 }: Params) {
  const [data, setData] = React.useState<any[]>([])
  const [pagination, setPagination] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const fetchIt = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const qs = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        mock: '1', // ⬅️ remove quando ligar a integração
      })
      const res = await fetch(`/api/orders?${qs}`, { credentials: 'include', cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Falha ao listar ordens')

      setData(Array.isArray(json?.data) ? json.data : [])
      setPagination(json?.pagination ?? null)
    } catch (e: any) {
      setError(e?.message ?? 'Erro ao carregar ordens')
    } finally {
      setLoading(false)
    }
  }, [page, limit])

  React.useEffect(() => { fetchIt() }, [fetchIt])

  return { data, pagination, loading, error, refresh: fetchIt }
}
