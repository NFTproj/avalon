import { refreshAccess } from './auth'

export async function apiFetch<T = any>(
  input: RequestInfo,
  init?: RequestInit & { _isRetry?: boolean },
): Promise<T> {
  const res = await fetch(input, {
    ...init,
    credentials: 'include',      // cookies sempre
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
  })

  if (res.status === 401 && !init?._isRetry) {
    // tenta refresh
    try {
      await refreshAccess()
      // repete a chamada original marcando como retry
      return apiFetch<T>(input, { ...init, _isRetry: true })
    } catch {
      // refresh falhou → propaga 401
    }
  }

  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
