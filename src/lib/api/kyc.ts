import { apiFetch } from './fetcher'

/** Chama a rota interna que cria a sessão no Didit */
export async function createKycSession (userId: string): Promise<{
  session_id: string
  url: string
}> {
  return apiFetch('/api/user/session', {
    method: 'POST',
    body: JSON.stringify({
      vendor_data: userId,
      callback   : `${window.location.origin}/dashboard`,
      features   : 'OCR + FACE',
    }),
  })
}
