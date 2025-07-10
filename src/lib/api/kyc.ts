/** Chama a rota interna que cria a sessão no Didit */
export async function createKycSession (userId: string): Promise<{
  session_id: string
  url: string
}> {
  const res = await fetch('/api/user/session', {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify({
      vendor_data: userId,
      callback   : `${window.location.origin}/dashboard`,
      features   : 'OCR + FACE',
    }),
  })

  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: 'Erro' }))
    throw new Error(error ?? 'Erro ao criar sessão de KYC')
  }

  return res.json()
}
