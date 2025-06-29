/**
 * Cria uma nova sessão de verificação KYC.
 * Retorna { sessionId, redirectUrl }
 */
export async function createKycSession(): Promise<{
  sessionId: string;
  redirectUrl: string;
}> {
  const res = await fetch('/api/user/session', {
    method: 'POST',
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? 'Erro ao criar sessão de KYC');
  }

  return res.json();
}
