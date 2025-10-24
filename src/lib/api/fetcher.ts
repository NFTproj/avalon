import { refreshAccess } from './auth'

export async function apiFetch<T = any>(
  input: RequestInfo,
  init?: RequestInit & { _isRetry?: boolean },
): Promise<T> {
  const url = typeof input === 'string' ? input : input.url;
  
  const res = await fetch(input, {
    ...init,
    credentials: 'include',      // cookies sempre
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
  })

  if ((res.status === 401 || res.status === 403) && !init?._isRetry) {
    console.log(`[apiFetch] Token expirado (${res.status}) em ${url}, tentando refresh...`);
    
    // tenta refresh
    try {
      await refreshAccess()
      console.log(`[apiFetch] Refresh bem-sucedido, retentando ${url}`);
      
      // repete a chamada original marcando como retry
      return apiFetch<T>(input, { ...init, _isRetry: true })
    } catch (error) {
      console.error(`[apiFetch] Refresh falhou para ${url}:`, error);
      // refresh falhou → propaga 401
      throw new Error(`Autenticação falhou: ${error}`)
    }
  }

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`[apiFetch] Erro ${res.status} em ${url}:`, errorText);
    throw new Error(errorText || `HTTP ${res.status}`)
  }
  
  return res.json()
}
