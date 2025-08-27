// app/buy-tokens/components/BuyPanel.tsx
'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useContext } from 'react'
import { TokenItem } from './TokenList'
import { ConfigContext } from '@/contexts/ConfigContext'

type Props = {
  token: TokenItem
  min?: number         // mínimo em moeda fiduciária (ex.: BRL)
  max?: number         // máximo em moeda fiduciária
  defaultFiat?: string // ex.: 'BRL'
  onSuccessNavigateTo?: string
}

/** pequeno helper p/ usar a ring color do Tailwind via custom property */
type WithRingVar = React.CSSProperties & { ['--tw-ring-color']?: string }

/* utils */
function toNumber(v: string): number {
  if (!v) return NaN
  const n = Number(v.replace(',', '.'))
  return Number.isFinite(n) ? n : NaN
}
function fmt(v: number, currency: string, locale = 'pt-BR') {
  try { return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(v || 0) }
  catch { return (v || 0).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }
}
function formatQty(q: number) {
  if (!Number.isFinite(q) || q <= 0) return '0'
  return (Math.floor(q * 1e6) / 1e6).toString()
}

/* UI auxiliares */
function CurrencyPill({ label }: { label: string }) {
  return (
    <span className="shrink-0 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold text-gray-800 bg-white/80">
      {/* “ícone” simples para dar vida */}
      <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
      {label}
      <svg width="12" height="12" viewBox="0 0 20 20" className="ml-1 opacity-60">
        <path d="M7 6l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    </span>
  )
}

function FieldBox({
  label,
  children,
  accent,
}: {
  label: string
  children: React.ReactNode
  accent: string
}) {
  const ringStyle: WithRingVar = { ['--tw-ring-color']: accent }
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div
        className="flex items-center justify-between rounded-xl border-2 bg-white px-4 py-3 focus-within:ring-2"
        style={{ borderColor: accent, ...ringStyle }}
      >
        {children}
      </div>
    </div>
  )
}

export default function BuyPanel({
  token,
  min = 100,
  max = 99_999,
  defaultFiat = 'BRL',
  onSuccessNavigateTo = '/dashboard',
}: Props) {
  const router = useRouter()
  const { colors, texts } = useContext(ConfigContext)

  const panelTexts: any = (texts as any)?.buyTokens?.panel ?? {}
  const t = (k: string, fb: string) => panelTexts?.[k] ?? fb

  // cores do tema
  const accent       = colors?.colors?.['color-primary'] || '#19C3F0'
  const panelBorder  = colors?.border?.['border-primary'] || accent
  const ctaBg        = colors?.buttons?.['button-primary'] || accent
  const ctaText      = '#0b1a2b' // texto escuro como no Figma

  // state
  const [amount, setAmount] = React.useState<string>('') // valor em FIAT
  const [submitting, setSubmitting] = React.useState(false)
  const [methodOpen, setMethodOpen] = React.useState(false)
  const [method, setMethod] = React.useState<'pix' | 'ted' | 'card'>('pix')

  // cálculo
  const amountNum = toNumber(amount)
  const unitPrice = token.price || 0
  const canCalc = unitPrice > 0 && Number.isFinite(amountNum) && amountNum > 0
  const qty = canCalc ? amountNum / unitPrice : 0

  const error =
    amount !== '' && Number.isFinite(amountNum)
      ? amountNum < min
        ? t('error-min', `Valor mínimo é ${fmt(min, defaultFiat)}`)
        : amountNum > max
        ? t('error-max', `Valor máximo é ${fmt(max, defaultFiat)}`)
        : undefined
      : undefined

  const disabled = submitting || !canCalc || !!error

  async function handleBuy() {
    try {
      setSubmitting(true)
      // TODO: integrar checkout/ordem aqui
      router.push(onSuccessNavigateTo)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-2xl bg-white p-5 border-2" style={{ borderColor: panelBorder }}>
      {/* header pequeno, unit price */}
      <header className="mb-4">
        <h3 className="text-lg font-semibold" style={{ color: accent }}>
          {t('title', 'Comprar')}
        </h3>
        <p className="text-xs text-gray-600">
          {t('unit-price', 'Preço unitário')}: <strong>{fmt(unitPrice, defaultFiat)}</strong> {t('per-unit', '/ und')}
        </p>
      </header>

      {/* PAGAR */}
      <FieldBox label={t('label-pay', 'Pagar')} accent={accent}>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          placeholder={t('placeholder-amount', '100–99.999')}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full outline-none text-[15px] placeholder:text-gray-400"
        />
        <CurrencyPill label={defaultFiat} />
      </FieldBox>

      {/* RECEBER */}
      <div className="mt-5">
        <FieldBox label={t('label-receive', 'Receber')} accent={accent}>
          <span className="text-[15px] text-gray-800">{formatQty(qty)}</span>
          <CurrencyPill label={(token.ticker || 'UND').toUpperCase()} />
        </FieldBox>
      </div>

      {/* MÉTODO DE PAGAMENTO */}
      <div className="mt-6">
        <p className="mb-2 text-sm font-medium text-gray-700">
          {t('payment-method', 'Método de pagamento')}
        </p>

        <button
          type="button"
          aria-expanded={methodOpen}
          onClick={() => setMethodOpen((v) => !v)}
          className="w-full rounded-xl border-2 bg-white px-4 py-3 text-left flex items-center justify-between focus:outline-none focus:ring-2"
          style={{ borderColor: panelBorder, ['--tw-ring-color' as any]: accent } as WithRingVar}
        >
          <span className="flex items-center gap-3">
            {/* “ícone” PIX simplificado */}
            <span className="inline-grid place-items-center h-7 w-7 rounded-lg bg-emerald-100 border border-emerald-300">
              <span className="h-3 w-3 rotate-45 rounded-[2px] bg-emerald-500" />
            </span>
            <span className="text-sm text-gray-800">
              {method === 'pix'
                ? t('pix', 'Transferência Bancária (PIX)')
                : method === 'ted'
                ? t('ted', 'Transferência TED')
                : t('card', 'Cartão de crédito')}
            </span>
          </span>

          <svg width="18" height="18" viewBox="0 0 20 20" className="opacity-70">
            <path d="M7 8l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>

        {methodOpen && (
          <div className="mt-2 rounded-lg border bg-white overflow-hidden">
            {[
              { key: 'pix' as const, label: t('pix', 'Transferência Bancária (PIX)') },
              { key: 'ted' as const, label: t('ted', 'Transferência TED') },
              { key: 'card' as const, label: t('card', 'Cartão de crédito') },
            ].map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => { setMethod(m.key); setMethodOpen(false) }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
              >
                {m.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={handleBuy}
        disabled={disabled}
        className={`mt-6 w-full h-[50px] rounded-xl font-bold border-2 transition
          ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90'}`}
        style={{ backgroundColor: ctaBg, borderColor: panelBorder, color: ctaText }}
      >
        {submitting ? t('processing', 'Processando…') : t('buy-token', 'Comprar Token')}
      </button>

      <p className="text-[11px] text-gray-500 mt-3">
        {t('min', 'Mín.')}: {fmt(min, defaultFiat)} &nbsp;·&nbsp; {t('max', 'Máx.')}: {fmt(max, defaultFiat)}
      </p>
    </div>
  )
}
