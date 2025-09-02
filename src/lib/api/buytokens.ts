// src/lib/api/payments.ts

/** Payload que vamos enviar para a rota interna /api/payments/pix */
export interface PixPaymentPayload {
  cardId: string;            // id do card
  tokenQuantity: number;     // inteiro >= 1
  buyerAddress: string;      // carteira EVM do comprador (vinda do /auth/me no CLIENT)
  /** opcional — se não vier, a rota tenta inferir a partir do card */
  network?: string;          // ex.: 'polygon', 'amoy', 'sepolia'
}

export interface PixPaymentResponse {
  correlationID?: string;
  paymentLink?: string;
  qrCodeImage?: string;
  brCode?: string;
  amountInBRL?: string;
  tokenQuantity?: number;
  intermediaryContractAddress?: string;
  buyerAddress?: string;
  internalUserId?: string;
  additionalProp1?: Record<string, unknown>;
  [k: string]: any;
}

export async function buyWithPix(payload: PixPaymentPayload): Promise<PixPaymentResponse> {
  const body = {
    cardId: payload.cardId,
    tokenQuantity: Math.max(1, Math.floor(Number(payload.tokenQuantity || 0))),
    buyerAddress: (payload.buyerAddress || '').trim(),   // ← garante sem espaços
    ...(payload.network ? { network: payload.network } : {}),
  };

  // ← ajuste AQUI para bater com a pasta pix/route.ts
  const res = await fetch('/api/payments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',    // mantém cookies (accessToken)
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || data?.message || `Falha ao gerar PIX (${res.status})`);
  }
  return data as PixPaymentResponse;
}

export function qrBase64ToDataUrl(b64?: string) {
  if (!b64) return '';
  return b64.startsWith('data:') ? b64 : `data:image/png;base64,${b64}`;
}
