'use client'

import * as React from 'react'

export type PixStatementItem = {
  createdAt?: string
  amountInBRLCents?: string | number
  tokenAmount?: string | number
  status?: string
  ticker?: string
}

type Props = {
  item: PixStatementItem
  accentColor?: string
  borderColor?: string
  // ações
  onViewOrders?: () => void
  onNewPurchase?: () => void
  onShowPixDetails?: () => void                    // usado quando WAITING_PAYMENT
  onCancelPendingPayment?: () => void | Promise<void> // idem
  // estilos CTA
  ctaBg?: string
  ctaText?: string
}

const fmtBRL = (cents?: string | number) => {
  const n = typeof cents === 'string' ? Number(cents) : cents
  const v = Number.isFinite(n) ? Number(n) / 100 : 0
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function StatusChip({ status }: { status?: string }) {
  const s = String(status || 'PROCESSING').toUpperCase()
  const map: Record<string, { dot: string; label: string }> = {
    WAITING_PAYMENT: { dot: '#f59e0b', label: 'Aguardando pagamento' },
    PROCESSING:     { dot: '#9ca3af', label: 'Processando' },
    PAID:           { dot: '#10b981', label: 'Pago' },
    CONFIRMED:      { dot: '#10b981', label: 'Confirmado' },
    FAILED:         { dot: '#ef4444', label: 'Falhou' },
    CANCELLED:      { dot: '#ef4444', label: 'Cancelado' },
  }
  const sty = map[s] || map.PROCESSING
  return (
    <span className="inline-flex items-center gap-2 text-xs font-medium whitespace-nowrap text-black">
      <span aria-hidden className="inline-block rounded-full" style={{ width: 10, height: 10, backgroundColor: sty.dot }} />
      {sty.label}
    </span>
  )
}

export default function PixPaymentStatement({
  item,
  accentColor = '#19C3F0',
  borderColor = '#19C3F0',
  onViewOrders,
  onNewPurchase,
  onShowPixDetails,
  onCancelPendingPayment,
  ctaBg = '#19C3F0',
  ctaText = '#0b1a2b',
}: Props) {
  const dt = item.createdAt ? new Date(item.createdAt) : null
  const dia  = dt ? dt.toLocaleDateString('pt-BR') : '—'
  const hora = dt ? dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '—'
  const monthHeader = dt ? dt.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : 'Movimentações'

  const amountText = fmtBRL(item.amountInBRLCents)
  const qtyText = `${item.tokenAmount ?? '—'} ${item.ticker ?? 'UND'}`
  const waiting = String(item.status || '').toUpperCase() === 'WAITING_PAYMENT'

  return (
    <div className="rounded-2xl bg-white p-5 border-2" style={{ borderColor }}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold" style={{ color: accentColor }}>Pagamento</h3>
      </div>

      <h4 className="text-sm font-semibold text-gray-700 mb-3 capitalize">{monthHeader}</h4>

      <div className="rounded-2xl border" style={{ borderColor }}>
        <div className="flex items-center justify-between px-4 py-4 gap-8">
          <div className="min-w-[120px]">
            <div className="text-sm font-semibold text-gray-900">{dia}</div>
            <div className="text-xs text-gray-500">{hora}</div>
          </div>

          <div className="flex-1 grid grid-cols-3 lg:grid-cols-4 gap-8">
            <div className="text-sm">
              <div className="text-gray-500">Valor</div>
              <div className="font-semibold text-emerald-600">{amountText}</div>
            </div>

            <div className="text-sm">
              <div className="text-gray-500">Quantidade</div>
              <div className="font-semibold text-gray-900">{qtyText}</div>
            </div>

            <div className="text-sm lg:col-span-2 lg:justify-self-end">
              <div className="text-gray-500 mb-1">Status</div>
              <StatusChip status={item.status} />
            </div>
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="mt-6 flex flex-wrap gap-3">
        {waiting ? (
          <>
            <button
              type="button"
              onClick={onShowPixDetails}
              className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold shadow-sm transition hover:opacity-90 focus:outline-none"
              style={{ backgroundColor: ctaBg, color: ctaText, border: `2px solid ${borderColor}` }}
            >
              Ver detalhes do PIX
            </button>
            <button
              type="button"
              onClick={onCancelPendingPayment ?? onNewPurchase}
              className="inline-flex items-center justify-center rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-gray-50"
              style={{ borderColor, color: '#0b1a2b' }}
            >
              Cancelar e fazer nova compra
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onViewOrders}
              className="inline-flex items-center justify-center rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-gray-50"
              style={{ borderColor, color: '#0b1a2b' }}
            >
              Ver todas as ordens
            </button>
            <button
              type="button"
              onClick={onNewPurchase}
              className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold shadow-sm transition hover:opacity-90 focus:outline-none"
              style={{ backgroundColor: ctaBg, color: ctaText, border: `2px solid ${borderColor}` }}
            >
              Realizar nova compra
            </button>
          </>
        )}
      </div>
    </div>
  )
}
