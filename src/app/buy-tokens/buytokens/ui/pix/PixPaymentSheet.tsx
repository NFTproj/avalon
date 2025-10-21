'use client'

import * as React from 'react'
import { useContext } from 'react'
import { ArrowLeft, Clipboard } from 'lucide-react'
import PixPaymentStatement from './PixPaymentStatement'
import { ConfigContext } from '@/contexts/ConfigContext'

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
    const n = Number(v.replace(',', '.'))
    return Number.isFinite(n) ? n : 0
  }
  return 0
}
const formatBRL = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)
const middleEllipsis = (s = '', keep = 24) =>
  (s.length <= keep * 2 ? s : `${s.slice(0, keep)} *** ${s.slice(-keep)}`)

/** Cor de texto legível para um fundo dado (fallbacks inclusos) */
function readableTextOn(bg?: string, dark = '#0b1a2b', light = '#FFFFFF') {
  const h = (bg || '').trim()
  const m = h.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
  if (!m) return dark
  const r = parseInt(m[1], 16), g = parseInt(m[2], 16), b = parseInt(m[3], 16)
  const yiq = (r * 299 + g * 587 + b * 114) / 1000
  return yiq >= 180 ? dark : light
}

/** Normaliza status vindo do back (numérico ou textual) p/ UI */
function normalizeStatus(input?: unknown) {
  const raw = input ?? ''
  const num = typeof raw === 'number' ? raw : Number(String(raw).trim())

  if (!Number.isNaN(num)) {
    switch (num) {
      case 400:
      case 600:
        return 'WAITING_PAYMENT'
      case 100:
      case 500:
        return 'PROCESSING'
      case 200:
        return 'CONFIRMED'
      case 300:
        return 'FAILED'
    }
  }

  const v = String(raw).trim().toUpperCase()
  if (['WAITING_PAYMENT','PENDING','AWAITING','UNPAID','CREATED','PENDING_PAYMENT','600'].includes(v)) return 'WAITING_PAYMENT'
  if (['PENDING_TRANSFER','PENDING_TRANSFER_RETRY','PAID','SETTLED','IN_PROCESS','IN_PROGRESS','100','500'].includes(v)) return 'PROCESSING'
  if (['TRANSFERRED','CONFIRMED','SUCCESS','COMPLETED','CONFIRMED_ONCHAIN','200'].includes(v)) return 'CONFIRMED'
  if (['FAILED','ERROR','DENIED','REJECTED','300'].includes(v)) return 'FAILED'
  if (['CANCELLED','CANCELED','VOIDED'].includes(v)) return 'CANCELLED'
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
  ctaBgEnabled,
  ctaTextEnabled,
}: Props) {
  // textos do contexto (buyPanel com fallback em buyTokens)
  const { colors, texts } = useContext(ConfigContext)
  const TX = (texts as any) ?? {}
  const TP = TX.buyPanel ?? {}
  const TT = TX.buyTokens ?? {}
  const t = (key: string, fb: string) => (TP?.[key] ?? TT?.[key] ?? fb)

  const L = {
    title:         t('pay-with-pix', 'Pague com PIX'),
    back:          t('back', 'Voltar'),
    pixCopiaCola:  t('pix-copia-cola', 'PIX copia e cola'),
    copy:          t('pix-copy', 'Copiar código'),
    copied:        t('pix-copied', 'Copiado!'),
    value:         t('value-label','Valor'),
    amountToPay:   t('pix-amount-to-pay', 'Valor a pagar'),
    expiresIn:     t('pix-expires-in', 'Expira em {mm}:{ss}'),
    expired:       t('pix-expired', 'Expirado'),
    verify:        t('pix-verify', 'Já paguei, verificar'),
    verifying:     t('pix-verifying', 'Verificando…'),
    waitToCheck:   t('pix-wait-to-check', 'Aguarde {s}s para verificar.'),
    errNoSession:  t('error-no-session', 'Sem sessionId para verificar.'),
    errFetchStatus:t('error-fetch-status', 'Falha ao consultar ({status})'),
    errGeneric:    t('error-generic', 'Não foi possível verificar o pagamento.'),
    qtyLabel:      t('qty-label','Quantidade (tokens)'),
  }

  // tema (com overrides por props)
  const themeAccent  = colors?.colors?.['color-primary'] ?? '#19C3F0'
  const themeBorder  = colors?.border?.['border-primary'] ?? themeAccent
  const themeBtnBg   = (colors?.buttons as Record<string, string> | undefined)?.['button-primary'] ?? themeAccent

  const usedAccent   = accentColor ?? themeAccent
  const usedBorder   = borderColor ?? themeBorder
  const usedCtaBg    = ctaBgEnabled ?? themeBtnBg
  const usedCtaText  = ctaTextEnabled ?? readableTextOn(usedCtaBg)

  // estado local
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
    try {
      await navigator.clipboard.writeText(txt)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {}
  }

  async function checkStatus() {
    if (!data.sessionId) { setCheckError(L.errNoSession); return }
    try {
      setChecking(true)
      setCheckError(null)

      const url = `/api/payments/status?identifier=${encodeURIComponent(data.sessionId)}`
      const res = await fetch(url, { method: 'GET', credentials: 'include', cache: 'no-store' })
      const json = await res.json().catch(() => ({}))
      const payment = extractPayment(json)

      if (!res.ok) {
        const msg = (L.errFetchStatus || 'Falha ao consultar ({status})').replace('{status}', String(res.status))
        throw new Error(json?.error || json?.message || msg)
      }

      setOrder(payment)
      setView('statement')
    } catch (e: any) {
      setCheckError(e?.message || L.errGeneric)
    } finally {
      setChecking(false)
    }
  }

  async function cancelAndNew() {
    onNewPurchase?.()
  }

  // ======= VIEW: EXTRATO =======
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
        accentColor={usedAccent}
        borderColor={usedBorder}
        onViewOrders={!waiting ? onViewOrders : undefined}
        onNewPurchase={!waiting ? (onNewPurchase ?? onBack) : undefined}
        onShowPixDetails={waiting ? () => setView('pix') : undefined}
        onCancelPendingPayment={waiting ? cancelAndNew : undefined}
        ctaBg={usedCtaBg}
        ctaText={usedCtaText}
      />
    )
  }

  // ======= VIEW: PIX/QR =======
  const ctaEnabled = !isExpired && canCheckTime && !checking
  const expiresText = isExpired
    ? L.expired
    : (L.expiresIn || 'Expira em {mm}:{ss}').replace('{mm}', mm).replace('{ss}', ss)

  return (
    <div className="rounded-2xl bg-white p-5 border-2" style={{ borderColor: usedBorder }}>
      <div className="mb-4 flex items-start justify-between">
        <h3 className="text-lg font-semibold" style={{ color: usedAccent }}>{L.title}</h3>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 cursor-pointer"
        >
          <ArrowLeft size={16} /> {L.back}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[320px_minmax(0,1fr)] gap-6">
        <div className="flex flex-col items-center">
          <div
            className="rounded-xl border bg-white p-3 grid place-items-center"
            style={{ borderColor: usedBorder, width: QR_SIZE + 24, height: QR_SIZE + 24 }}
          >
            {imgSrc ? (
              <img
                src={imgSrc}
                alt="QR Code PIX"
                style={{ width: QR_SIZE, height: QR_SIZE }}
                className="object-contain"
              />
            ) : (
              <div className="text-gray-400" style={{ width: QR_SIZE, height: QR_SIZE }}>
                QR indisponível
              </div>
            )}
          </div>

          <div className="mt-3 text-center">
            {!!amountText && (
              <p className="text-sm text-gray-800">
                {L.value}: <strong>{amountText}</strong>
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1" aria-live="polite">{expiresText}</p>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">{L.pixCopiaCola}</label>
            <button
              type="button"
              onClick={() => data.brCode && copy(data.brCode)}
              disabled={!data.brCode}
              className="inline-flex items-center gap-2 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:underline"
              style={{ color: usedAccent }}
              aria-label={L.copy}
            >
              <Clipboard size={16} />
              <span aria-live="polite">{copied ? L.copied : L.copy}</span>
            </button>
          </div>

          <div
            className="w-full rounded-lg border bg-gray-50 p-3 text-sm text-gray-800 font-mono break-all select-all"
            style={{ borderColor: usedBorder }}
            title={data.brCode || ''}
          >
            {middleEllipsis(data.brCode, 24) || '—'}
          </div>

          <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            {(data.tokenQuantity ?? null) !== null && (
              <>
                <dt className="text-gray-600">{L.qtyLabel}</dt>
                <dd className="text-gray-900 font-semibold">{data.tokenQuantity}</dd>
              </>
            )}
            {!!amountText && (
              <>
                <dt className="text-gray-600">{L.amountToPay}</dt>
                <dd className="text-gray-900 font-semibold">{amountText}</dd>
              </>
            )}
          </dl>

          <div className="mt-4">
            <button
              type="button"
              onClick={checkStatus}
              disabled={!ctaEnabled}
              className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold transition border
                         cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                backgroundColor: ctaEnabled ? usedCtaBg : '#e5e7eb',
                color: ctaEnabled ? usedCtaText : '#6b7280',
                borderColor: usedBorder,
                opacity: checking ? .6 : 1,
              }}
              aria-disabled={!ctaEnabled}
            >
              {checking ? L.verifying : (isExpired ? L.expired : L.verify)}
            </button>
            {!canCheckTime && !isExpired && (
              <p className="mt-1 text-xs text-gray-500">
                {(L.waitToCheck || 'Aguarde {s}s para verificar.').replace(
                  '{s}',
                  String(Math.ceil((enableCheckAt.current - now) / 1000))
                )}
              </p>
            )}
            {!!checkError && <p className="mt-2 text-xs text-red-600">{checkError}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
