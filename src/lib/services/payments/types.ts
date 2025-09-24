export type PixPaymentData = {
  paymentLink?: string
  qrCodeImage?: string
  brCode?: string
  amountInBRL?: string | number // centavos
  tokenQuantity?: number
  buyerAddress?: string
  sessionId?: string
}
