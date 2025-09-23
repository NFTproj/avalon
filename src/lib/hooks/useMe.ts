'use client'
import * as React from 'react'

export type MeUser = {
  id?: string
  email?: string
  name?: string
  walletAddress?: string
  // adicione outros campos que o /api/auth/me retorna
}

export function useMe() {
  const [user, setUser] = React.useState<MeUser | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        setLoading(true)
        const r = await fetch('/api/auth/me', { credentials: 'include', cache: 'no-store' })
        if (!r.ok) throw new Error(`status ${r.status}`)
        const j = await r.json().catch(() => ({}))
        if (alive) setUser(j?.user ?? j ?? null)
      } catch (e:any) {
        if (alive) setError(e?.message || 'Erro ao buscar usuário')
        if (alive) setUser(null)
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [])

  return { user, loading, error }
}
