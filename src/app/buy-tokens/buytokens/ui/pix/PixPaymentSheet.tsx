'use client'

import * as React from 'react'
import { ArrowLeft, Clipboard } from 'lucide-react'
import PixPaymentStatement from './PixPaymentStatement'

export type PixPaymentData = {
  paymentLink?: string
  qrCodeImage?: string
  brCode?: string
  amountInBRL?: string | number   // CENTAVOS
  tokenQuantity?: number
  buyerAddress?: string
  sessionId?: string
}

type Props = {
  data: PixPaymentData
  onBack: () => void
  accentColor?: string
  borderColor?: string
  expiresInMs?: number
  onViewOrders?: () => void
  onNewPurchase?: () => void
  ctaBgEnabled?: string
  ctaTextEnabled?: string
}

const QR_SIZE = 320
const resolveQrSrc = (v?: string) =>
  !v ? '' : v.startsWith('data:image') || /^https?:\/\//i.test(v) ? v : `data:image/png;base64,${v}`

function brlFromMinor(v?: string | number) {
  if (typeof v === 'number') return v / 100
  if (typeof v === 'string') {
    if (/^\d+$/.test(v.trim())) return Number(v) / 100
    const n = Number(v.replace(',', '.')); return Number.isFinite(n) ? n : 0
  }
  return 0
}
const formatBRL = (n: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)
const middleEllipsis = (s = '', keep = 24) => (s.length <= keep * 2 ? s : `${s.slice(0, keep)} *** ${s.slice(-keep)}`)

/** Normaliza status vindo do back (numérico ou textual) */
function normalizeStatus(input?: unknown) {
  const raw = input ?? ''
  // 1) Se vier número ou string numérica, usa o mapa por código
  const num = typeof raw === 'number' ? raw : Number(String(raw).trim())
  if (!Number.isNaN(num)) {
    switch (num) {
      case 100: return 'WAITING_PAYMENT' // PENDING
      case 200: return 'PROCESSING'
      case 300: return 'CONFIRMED'      // COMPLETED
      case 400: return 'FAILED'
      case 500: return 'CANCELLED'
      default:  break
    }
  }
  // 2) Aliases textuais (fallback)
  const v = String(raw).trim().toUpperCase()
  if (['WAITING_PAYMENT', 'PENDING', 'AWAITING', 'UNPAID', 'CREATED', 'PENDING_PAYMENT'].includes(v)) return 'WAITING_PAYMENT'
  if (['PROCESSING', 'IN_PROCESS', 'IN_PROGRESS'].includes(v)) return 'PROCESSING'
  if (['PAID', 'SETTLED', 'RECEIVED'].includes(v)) return 'PAID'
  if (['CONFIRMED', 'SUCCESS', 'COMPLETED', 'CONFIRMED_ONCHAIN'].includes(v)) return 'CONFIRMED'
  if (['FAILED', 'ERROR,', 'DENIED', 'REJECTED'].includes(v)) return 'FAILED'
  if (['CANCELLED', 'CANCELED', 'VOIDED'].includes(v)) return 'CANCELLED'
  return 'PROCESSING'
}

/** Extrai o "payment" independente do wrapper do payload */
function extractPayment(json: any) {
  if (json?.data && typeof json.data === 'object' && !Array.isArray(json.data)) return json.data
  if (json?.payment && typeof json.payment === 'object') return json.payment
  if (json?.order && typeof json.order === 'object') return json.order
  return json || {}
}

export default function PixPaymentSheet({
  data,
  onBack,
  accentColor = '#19C3F0',
  borderColor = '#19C3F0',
  expiresInMs = 15 * 60 * 1000,
  onViewOrders,
  onNewPurchase,
  ctaBgEnabled = '#19C3F0',
  ctaTextEnabled = '#0b1a2b',
}: Props) {
  const [view, setView] = React.useState<'pix' | 'statement'>('pix')

  const [deadline] = React.useState(() => Date.now() + expiresInMs)
  const [now, setNow] = React.useState(() => Date.now())
  const [copied, setCopied] = React.useState(false)

  const enableCheckAt = React.useRef(Date.now() + 30_000)
  const canCheckTime = now >= enableCheckAt.current

  const [order, setOrder] = React.useState<any | null>(null)
  const [checking, setChecking] = React.useState(false)
  const [checkError, setCheckError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const secLeft = Math.max(0, Math.floor((deadline - now) / 1000))
  const isExpired = secLeft <= 0
  const mm = String(Math.floor(secLeft / 60)).padStart(2, '0')
  const ss = String(secLeft % 60).padStart(2, '0')

  const imgSrc = resolveQrSrc(data.qrCodeImage)
  const amountNum = brlFromMinor(data.amountInBRL)
  const amountText = amountNum ? formatBRL(amountNum) : ''

  async function copy(txt: string) {
    try { await navigator.clipboard.writeText(txt); setCopied(true); setTimeout(() => setCopied(false), 1200) } catch {}
  }

  async function checkStatus() {
    if (!data.sessionId) { setCheckError('Sem sessionId para verificar.'); return }
    try {
      setChecking(true)
      setCheckError(null)

      const url = `/api/payments/status?identifier=${encodeURIComponent(data.sessionId)}`
      const res = await fetch(url, { method: 'GET', credentials: 'include', cache: 'no-store' })
      const json = await res.json().catch(() => ({}))

      const payment = extractPayment(json)

      console.log('[PIX status raw]', payment?.status, payment)

      if (!res.ok) {
        throw new Error(json?.error || json?.message || `Falha ao consultar (${res.status})`)
      }

      setOrder(payment)
      setView('statement')
    } catch (e: any) {
      setCheckError(e?.message || 'Não foi possível verificar o pagamento.')
    } finally {
      setChecking(false)
    }
  }

  async function cancelAndNew() {
    onNewPurchase?.()
  }

  /* ======= VIEW: EXTRATO ======= */
  if (view === 'statement' && order) {
    const statusNorm = normalizeStatus(order?.status)
    const waiting = statusNorm === 'WAITING_PAYMENT'

    return (
      <PixPaymentStatement
        item={{
          createdAt: order.createdAt || order.updatedAt || order.created_at || order.updated_at,
          amountInBRLCents:
            order.amountInBRL ?? order.amount_in_brl_cents ?? order.amount ?? order.valueInCents ?? data.amountInBRL,
          tokenAmount:
            order.tokenAmount ?? order.tokenQuantity ?? order.qty ?? order.quantity ?? data.tokenQuantity,
          status: statusNorm,
          ticker: order.ticker ?? order.tokenTicker ?? order.tickerSymbol ?? 'UND',
        }}
        accentColor={accentColor}
        borderColor={borderColor}
        onViewOrders={!waiting ? onViewOrders : undefined}
        onNewPurchase={!waiting ? (onNewPurchase ?? onBack) : undefined}
        onShowPixDetails={waiting ? () => setView('pix') : undefined}
        onCancelPendingPayment={waiting ? cancelAndNew : undefined}
        ctaBg={ctaBgEnabled}
        ctaText={ctaTextEnabled}
      />
    )
  }

  /* ======= VIEW: PIX/QR ======= */
  const ctaEnabled = !isExpired && canCheckTime && !checking

  return (
    <div className="rounded-2xl bg-white p-5 border-2" style={{ borderColor }}>
      <div className="mb-4 flex items-start justify-between">
        <h3 className="text-lg font-semibold" style={{ color: accentColor }}>Pague com PIX</h3>
        <button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800">
          <ArrowLeft size={16} /> Voltar
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[320px_minmax(0,1fr)] gap-6">
        <div className="flex flex-col items-center">
          <div className="rounded-xl border bg-white p-3" style={{ borderColor, width: QR_SIZE + 24, height: QR_SIZE + 24 }}>
            {imgSrc
              ? <img src={imgSrc} alt="QR Code PIX" style={{ width: QR_SIZE, height: QR_SIZE }} className="object-contain" />
              : <div className="grid place-items-center text-gray-400" style={{ width: QR_SIZE, height: QR_SIZE }}>QR indisponível</div>}
          </div>

          <div className="mt-3 text-center">
            {!!amountText && <p className="text-sm text-gray-800">Valor: <strong>{amountText}</strong></p>}
            <p className="text-xs text-gray-500 mt-1" aria-live="polite">
              {isExpired ? 'Expirado' : <>Expira em <span className="font-medium">{mm}:{ss}</span></>}
            </p>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">PIX copia e cola</label>
            <button
              type="button"
              onClick={() => data.brCode && copy(data.brCode)}
              disabled={!data.brCode}
              className="copy-link"
              aria-label="Copiar código PIX"
            >
              <Clipboard size={16} />
              <span aria-live="polite">{copied ? 'Copiado!' : 'Copiar código'}</span>
            </button>
          </div>

          <div
            className="w-full rounded-lg border bg-gray-50 p-3 text-sm text-gray-800 font-mono break-all select-all"
            style={{ borderColor }}
            title={data.brCode || ''}
          >
            {middleEllipsis(data.brCode, 24) || '—'}
          </div>

          <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            {(data.tokenQuantity ?? null) !== null && (
              <>
                <dt className="text-gray-600">Quantidade (tokens)</dt>
                <dd className="text-gray-900 font-semibold">{data.tokenQuantity}</dd>
              </>
            )}
            {!!amountText && (
              <>
                <dt className="text-gray-600">Valor a pagar</dt>
                <dd className="text-gray-900 font-semibold">{amountText}</dd>
              </>
            )}
          </dl>

          <div className="mt-4">
            <button
              type="button"
              onClick={checkStatus}
              disabled={!ctaEnabled}
              className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold transition"
              style={{
                backgroundColor: ctaEnabled ? ctaBgEnabled : '#e5e7eb',
                color: ctaEnabled ? ctaTextEnabled : '#6b7280',
                border: `2px solid ${borderColor}`,
                opacity: checking ? .6 : 1,
                cursor: ctaEnabled ? 'pointer' : 'not-allowed'
              }}
              aria-disabled={!ctaEnabled}
            >
              {checking ? 'Verificando…' : (isExpired ? 'Expirado' : 'Já paguei, verificar')}
            </button>
            {!canCheckTime && !isExpired && (
              <p className="mt-1 text-xs text-gray-500">
                Aguarde {Math.ceil((enableCheckAt.current - now) / 1000)}s para verificar.
              </p>
            )}
            {!!checkError && <p className="mt-2 text-xs text-red-600">{checkError}</p>}
          </div>
        </div>
      </div>

      <style jsx>{`
        .copy-link, .copy-link::before, .copy-link::after { all: unset; }
        .copy-link {
          display: inline-flex;
          align-items: center;
          gap: .35rem;
          cursor: pointer;
          color: ${accentColor} !important;
          font-weight: 700;
          font-size: .9rem;
        }
        .copy-link[disabled] { opacity: .5; cursor: not-allowed; }
        .copy-link:hover { text-decoration: underline; }
      `}</style>
    </div>
  )
}
