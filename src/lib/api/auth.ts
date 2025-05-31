// src/lib/api/auth.ts
export interface RegisterPayload {
  email: string;
  password: string;
  
}

export interface VerifyCodePayload {
  email: string;
  otp_code: string;
  
}

export interface LoginPayload {
  email: string
  password: string
}

export interface ResendCodePayload {
  email: string
}

/**
 * Registro do usuário via rota protegida do Next.js
 */
export async function registerUser(payload: RegisterPayload) {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error('Erro ao registrar usuário');
  return await res.json();
}

/**
 * Verificação do código OTP via rota protegida do Next.js
 */
export async function verifyCode(payload: VerifyCodePayload) {
  const res = await fetch('/api/auth/code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error('Código inválido ou expirado');
  return await res.json();
}

/**
 * Login do usuário via rota protegida do Next.js
 */
/**
 * Login do usuário via rota protegida do Next.js
 * – não mandamos clientId nem lidamos com tokens: eles serão gravados como
 *   cookies HTTP-only pela rota /api/auth/login.
 */
export async function loginUser(payload: LoginPayload) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',          // garante envio/recebimento de cookies
    body: JSON.stringify(payload),   // { email, password }
  })

  if (!res.ok) throw new Error('Falha ao fazer login')
  return await res.json()            // { success: true }
}

/**
 * Reenvio do código OTP via rota protegida do Next.js
 */
export async function resendCode(payload: ResendCodePayload) {
  const res = await fetch('/api/auth/resend', {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify(payload),          // { email }
  })
  if (!res.ok) throw new Error('Erro ao reenviar código')
  return res.json()
}
