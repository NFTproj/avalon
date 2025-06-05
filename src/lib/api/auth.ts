// src/lib/api/auth.ts

import { mutateUser } from "@/contexts/AuthContext";


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


export async function refreshAccess() {
  const res = await fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Falha no refresh')

  await res.json()
  mutateUser()               // revalida /api/auth/me
}

export interface MetamaskRegisterPayload {
  walletAddress: string
  signature: string
}

export async function registerWithMetamask(payload: MetamaskRegisterPayload) {
  const res = await fetch('/api/auth/metamask', {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Para cookie de sessão
    body   : JSON.stringify(payload),
  })

  if (!res.ok) throw new Error('Erro ao registrar com Metamask')
  return await res.json()
}

