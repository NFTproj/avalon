'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useContext } from 'react'
import { TokenItem } from './TokenList'
import { ConfigContext } from '@/contexts/ConfigContext'
import FloatingField from '@/components/core/Inputs/FloatingField'

type Props = {
  token: TokenItem
  min?: number
  max?: number
  fiat?: 'USD' | 'BRL' | 'EUR'
  activeTab?: 'buy' | 'benefits'
  onTabChange?: (tab: 'buy' | 'benefits') => void
  onSuccessNavigateTo?: string
}

type WithRingVar = React.CSSProperties & { ['--tw-ring-color']?: string }

const currencyLocale: Record<string, string> = { USD: 'en-US', BRL: 'pt-BR', EUR: 'de-DE' }

function fmtMoney(v: number, currency: string) {
  const loc = currencyLocale[currency] ?? 'en-US'
  try { return new Intl.NumberFormat(loc, { style: 'currency', currency }).format(v || 0) }
  catch { return (v || 0).toLocaleString(loc, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }
}

function fmtRange(min: number, max: number, currency: string) {
  const loc = currencyLocale[currency] ?? 'en-US'
  const nf = new Intl.NumberFormat(loc)
  return `${nf.format(min)}–${nf.format(max)}`
}

function toNumber(v: string): number {
  if (!v) return NaN
  let s = v.trim().replace(/\s/g, '')
  if (s.includes(',') && s.includes('.')) s = s.replace(/\./g, '').replace(',', '.')
  else if (s.includes(',')) s = s.replace(',', '.')
  const n = Number(s)
  return Number.isFinite(n) ? n : NaN
}

function formatQty(q: number) {
  if (!Number.isFinite(q) || q <= 0) return '0'
  return (Math.floor(q * 1e6) / 1e6).toString()
}

/* ===== sub-UI ===== */
function CurrencyPill({ label }: { label: string }) {
  return (
    <span className="shrink-0 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold text-gray-800 bg-white/90">
      <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
      {label}
      <svg width="12" height="12" viewBox="0 0 20 20" className="ml-1 opacity-60" aria-hidden>
        <path d="M7 6l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    </span>
  )
}

function BenefitsPanel() {
  return (
    <div className="space-y-3 text-sm text-gray-700">
      <p>• Acesso a relatórios do projeto</p>
      <p>• Atualizações de impacto ambiental</p>
      <p>• Comunidade e provas de rastreabilidade</p>
    </div>
  )
}

type PanelTabKey = 'buy' | 'benefits'
function PanelTabs({
  active, onChange, labels = { buy: 'Comprar', benefits: 'Benefícios' }, accentColor = '#19C3F0',
}: {
  active: PanelTabKey; onChange: (t: PanelTabKey) => void; labels?: { buy?: string; benefits?: string }; accentColor?: string
}) {
  const tabs: Array<{ key: PanelTabKey; label: string }> = [
    { key: 'buy', label: labels.buy ?? 'Comprar' },
    { key: 'benefits', label: labels.benefits ?? 'Benefícios' },
  ]
  return (
    <div role="tablist" aria-label="Painel de compra" className="mb-7 flex w-full justify-center">
      <div className="grid w-full max-w-[520px] grid-cols-2 gap-6">
        {tabs.map(({ key, label }) => {
          const isActive = active === key
          return (
            <button
              key={key}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${key}`}
              type="button"
              onClick={() => onChange(key)}
              className={[
                'relative h-10 w-full rounded-md px-2 text-center font-semibold',
                isActive ? 'text-gray-900 cursor-default' : 'text-gray-400 hover:text-gray-600',
              ].join(' ')}
            >
              {label}
              {isActive && (
                <span aria-hidden className="absolute left-0 right-0 -bottom-1 mx-auto block h-1 w-11/12 rounded-full" style={{ backgroundColor: accentColor }} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ===== componente principal ===== */
export default function BuyPanel({
  token, min = 100, max = 99_999, fiat = 'BRL', activeTab, onTabChange, onSuccessNavigateTo = '/dashboard',
}: Props) {
  const router = useRouter()
  const { colors, texts } = useContext(ConfigContext)

  const T: any = (texts as any)?.buyTokens?.panel ?? {}
  const t = (k: string, fb: string) => T?.[k] ?? fb

  const accent      = colors?.colors?.['color-primary'] || '#19C3F0'
  const borderColor = colors?.border?.['border-primary'] || accent
  const ctaBg       = colors?.buttons?.['button-primary'] || accent
  const ctaText     = '#0b1a2b'

  const [tab, setTab] = React.useState<PanelTabKey>(activeTab ?? 'buy')
  React.useEffect(() => { if (activeTab) setTab(activeTab) }, [activeTab])
  const changeTab = (v: PanelTabKey) => { setTab(v); onTabChange?.(v) }

  // ===== estados dos campos (two-way binding) =====
  const [amount, setAmount] = React.useState<string>('')   // em moeda fiduciária
  const [qtyStr, setQtyStr] = React.useState<string>('')   // em tokens

  const unitPrice = token.price || 0

  // ao editar "Pagar"
  const onAmountChange = (v: string) => {
    setAmount(v)
    const n = toNumber(v)
    if (unitPrice > 0 && Number.isFinite(n) && n > 0) setQtyStr(formatQty(n / unitPrice))
    else setQtyStr('')
  }

  // ao editar "Receber"
  const onQtyChange = (v: string) => {
    setQtyStr(v)
    const q = toNumber(v)
    if (unitPrice > 0 && Number.isFinite(q) && q > 0) {
      const a = q * unitPrice
      setAmount(a.toFixed(2))
    } else {
      setAmount('')
    }
  }

  const amountNum = toNumber(amount)
  const canCalc = unitPrice > 0 && Number.isFinite(amountNum) && amountNum > 0

  const error =
    amount !== '' && Number.isFinite(amountNum)
      ? amountNum < min
        ? t('error-min', `Valor mínimo é ${fmtMoney(min, fiat)}`)
        : amountNum > max
        ? t('error-max', `Valor máximo é ${fmtMoney(max, fiat)}`)
        : undefined
      : undefined

  const disabled = !canCalc || !!error

  async function handleBuy() {
    // TODO integrar checkout real
    router.push(onSuccessNavigateTo ?? '/dashboard')
  }

  const amountErrorId = 'amount-error'

  return (
    <div className="rounded-2xl bg-white p-5 border-2" style={{ borderColor }}>
      <PanelTabs
        active={tab}
        onChange={(v) => changeTab(v)}
        accentColor={accent}
        labels={{ buy: t('tab-buy', 'Comprar'), benefits: t('tab-benefits', 'Benefícios') }}
      />

      {tab === 'benefits' ? (
        <BenefitsPanel />
      ) : (
        <>
          {/* Pagar — mais espaçamento do topo */}
          <FloatingField
            className="mt-2"
            id="fiat-amount"
            label={t('label-pay', 'Pagar')}
            type="number"
            value={amount}
            onChange={onAmountChange}
            placeholder={t('placeholder-amount', fmtRange(min, max, fiat))}
            accent={accent}
            rightSlot={<CurrencyPill label={fiat} />}
          />

          {error && (
            <p id={amountErrorId} className="mt-1 text-xs text-red-600" role="alert">
              {error}
            </p>
          )}

          {/* Receber — agora digitável, com bom espaçamento */}
          <FloatingField
            className="mt-6"
            label={t('label-receive', 'Receber')}
            value={qtyStr}
            onChange={onQtyChange}
            placeholder="0"
            accent={accent}
            rightSlot={<CurrencyPill label={(token.ticker || 'UND').toUpperCase()} />}
          />

          {/* Método de pagamento — mais respiro */}
          <div className="mt-8">
            <p className="mb-3 text-sm font-medium text-gray-700">
              {t('payment-method', 'Método de pagamento')}
            </p>

            <button
              type="button"
              className="w-full rounded-xl border-2 bg-white px-4 py-3 text-left flex items-center justify-between focus:outline-none focus:ring-2"
              style={{ borderColor, '--tw-ring-color': accent } as WithRingVar}
            >
              <span className="flex items-center gap-3">
                <span className="inline-grid place-items-center h-7 w-7 rounded-lg bg-emerald-100 border border-emerald-300">
                  <span className="h-3 w-3 rotate-45 rounded-[2px] bg-emerald-500" />
                </span>
                <span className="text-sm text-gray-800">
                  {t('pix', 'Transferência Bancária (PIX)')}
                </span>
              </span>
              <svg width="18" height="18" viewBox="0 0 20 20" className="opacity-70" aria-hidden>
                <path d="M7 8l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={handleBuy}
            disabled={disabled}
            className={`mt-8 w-full h-[50px] rounded-xl font-bold border-2 transition
              ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90'}`}
            style={{ backgroundColor: ctaBg, borderColor, color: ctaText }}
            aria-disabled={disabled}
          >
            {t('buy-token', 'Comprar Token')}
          </button>

          <p className="text-[11px] text-gray-500 mt-3">
            {t('min', 'Mín.')}: {fmtMoney(min, fiat)} &nbsp;·&nbsp; {t('max', 'Máx.')}: {fmtMoney(max, fiat)}
          </p>
        </>
      )}
    </div>
  )
}
