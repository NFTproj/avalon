// src/lib/validation/auth.ts

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface VerifyCodeRequest {
  email: string;
  otp_code: string;
}

export interface MetamaskRequest {
  walletAddress: string;
  signature: string;
}

/**
 * Validates login request structure and data types
 */
export function validateLoginRequest(body: any): LoginRequest {
  if (!body || typeof body !== 'object') {
    throw new Error('Corpo da requisição inválido');
  }
  
  if (!body.email || typeof body.email !== 'string') {
    throw new Error('Email é obrigatório');
  }
  
  if (!body.password || typeof body.password !== 'string') {
    throw new Error('Senha é obrigatória');
  }
  
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(body.email)) {
    throw new Error('Formato de email inválido');
  }
  
  // Password strength validation
  if (body.password.length < 6) {
    throw new Error('Senha deve ter pelo menos 6 caracteres');
  }
  
  return { email: body.email.toLowerCase().trim(), password: body.password };
}

/**
 * Validates register request structure and data types
 */
export function validateRegisterRequest(body: any): RegisterRequest {
  if (!body || typeof body !== 'object') {
    throw new Error('Corpo da requisição inválido');
  }
  
  if (!body.email || typeof body.email !== 'string') {
    throw new Error('Email é obrigatório');
  }
  
  if (!body.password || typeof body.password !== 'string') {
    throw new Error('Senha é obrigatória');
  }
  
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(body.email)) {
    throw new Error('Formato de email inválido');
  }
  
  // Password strength validation
  if (body.password.length < 8) {
    throw new Error('Senha deve ter pelo menos 8 caracteres');
  }
  
  return { email: body.email.toLowerCase().trim(), password: body.password };
}

/**
 * Validates verify code request structure and data types
 */
export function validateVerifyCodeRequest(body: any): VerifyCodeRequest {
  if (!body || typeof body !== 'object') {
    throw new Error('Corpo da requisição inválido');
  }
  
  if (!body.email || typeof body.email !== 'string') {
    throw new Error('Email é obrigatório');
  }
  
  if (!body.otp_code || typeof body.otp_code !== 'string') {
    throw new Error('Código OTP é obrigatório');
  }
  
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(body.email)) {
    throw new Error('Formato de email inválido');
  }
  
  // OTP code format validation (assuming 6 digits)
  if (!/^\d{6}$/.test(body.otp_code)) {
    throw new Error('Código OTP deve ter 6 dígitos');
  }
  
  return { email: body.email.toLowerCase().trim(), otp_code: body.otp_code };
}

/**
 * Validates metamask request structure and data types
 */
export function validateMetamaskRequest(body: any): MetamaskRequest {
  if (!body || typeof body !== 'object') {
    throw new Error('Corpo da requisição inválido');
  }
  
  if (!body.walletAddress || typeof body.walletAddress !== 'string') {
    throw new Error('Endereço da carteira é obrigatório');
  }
  
  if (!body.signature || typeof body.signature !== 'string') {
    throw new Error('Assinatura é obrigatória');
  }
  
  // Basic wallet address format validation (Ethereum address)
  if (!/^0x[a-fA-F0-9]{40}$/.test(body.walletAddress)) {
    throw new Error('Formato de endereço da carteira inválido');
  }
  
  // Basic signature format validation
  if (!/^0x[a-fA-F0-9]+$/.test(body.signature)) {
    throw new Error('Formato de assinatura inválido');
  }
  
  return { walletAddress: body.walletAddress.toLowerCase(), signature: body.signature };
}

/**
 * Sanitizes input data to prevent injection attacks
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes that could be used for injection
    .substring(0, 255); // Limit length
}

/**
 * Validates and sanitizes email input
 */
export function validateAndSanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    throw new Error('Email é obrigatório');
  }
  
  const sanitized = email.toLowerCase().trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(sanitized)) {
    throw new Error('Formato de email inválido');
  }
  
  return sanitized;
}

/**
 * Type guard to check if an object has the required properties
 */
export function hasRequiredProperties<T>(obj: any, properties: (keyof T)[]): obj is T {
  if (!obj || typeof obj !== 'object') return false;
  
  return properties.every(prop => 
    obj.hasOwnProperty(prop) && 
    obj[prop] !== null && 
    obj[prop] !== undefined && 
    obj[prop] !== ''
  );
}