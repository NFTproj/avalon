'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useContext } from 'react'
import { TokenItem } from './TokenList'
import { ConfigContext } from '@/contexts/ConfigContext'
import FloatingField from '@/components/core/Inputs/FloatingField'
import { useAccount } from 'wagmi'
import { QrCode, Wallet, CircleDollarSign } from 'lucide-react'

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
function fmt2(n: number) {
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0)
}

/** USD→BRL via AwesomeAPI (público, sem API key) */
async function fetchUsdToBrlRate(): Promise<number> {
  try {
    const res = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL', { cache: 'no-store' })
    const data = await res.json()
    const bid = parseFloat(data?.USDBRL?.bid)
    return Number.isFinite(bid) ? bid : NaN
  } catch { return NaN }
}

/* UI auxiliar */
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

  /* ====== resolver de textos (corrigido) ====== */
  const TX = (texts as any) ?? {}
  const TT = TX.buyTokens ?? {}   // ex.: "tab-buy", "tab-benefits", etc.
  const TP = TX.buyPanel  ?? {}   // ex.: "pay-with-pix", "limits", etc.
  const t = (key: string, fb: string) => (TP?.[key] ?? TT?.[key] ?? fb)
  const tpl = (s: string, vars: Record<string, string | number>) =>
    String(s ?? '').replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''))

  const accent      = colors?.colors?.['color-primary'] || '#19C3F0'
  const borderColor = colors?.border?.['border-primary'] || accent
  const ctaBg       = colors?.buttons?.['button-primary'] || accent
  const ctaText     = '#0b1a2b'

  const [tab, setTab] = React.useState<PanelTabKey>(activeTab ?? 'buy')
  React.useEffect(() => { if (activeTab) setTab(activeTab) }, [activeTab])
  const changeTab = (v: PanelTabKey) => { setTab(v); onTabChange?.(v) }

  // wagmi: conectado e é MetaMask?
  const { connector, isConnected } = useAccount()
  const [isMetaMask, setIsMetaMask] = React.useState(false)
  React.useEffect(() => {
    let alive = true
    ;(async () => {
      if (!isConnected || !connector) { if (alive) setIsMetaMask(false); return }
      if (connector.id === 'metaMask' || connector.name?.toLowerCase().includes('metamask')) {
        if (alive) setIsMetaMask(true); return
      }
      try {
        const provider: any = await connector.getProvider?.()
        if (alive) setIsMetaMask(!!provider?.isMetaMask)
      } catch { if (alive) setIsMetaMask(false) }
    })()
    return () => { alive = false }
  }, [connector, isConnected])
  const canShowUSDC = isConnected && isMetaMask

  // valores
  const [amount, setAmount] = React.useState<string>('')
  const [qtyStr, setQtyStr] = React.useState<string>('')
  const unitPrice = token.price || 0
  const [usdBrl, setUsdBrl] = React.useState<number | null>(null)
  const [brlEstimate, setBrlEstimate] = React.useState<number>(0)

  React.useEffect(() => {
    let mounted = true
    fetchUsdToBrlRate().then((rate) => { if (mounted) setUsdBrl(Number.isFinite(rate) ? rate : null) })
    return () => { mounted = false }
  }, [])

  const onAmountChange = (v: string) => {
    setAmount(v)
    const n = toNumber(v)
    if (unitPrice > 0 && Number.isFinite(n) && n > 0) setQtyStr(formatQty(n / unitPrice))
    else setQtyStr('')
  }
  const onQtyChange = (v: string) => {
    setQtyStr(v)
    const q = toNumber(v)
    if (unitPrice > 0 && Number.isFinite(q) && q > 0) setAmount((q * unitPrice).toFixed(2))
    else setAmount('')
  }

  React.useEffect(() => {
    const a = toNumber(amount)
    if (unitPrice <= 0 || !Number.isFinite(a) || a <= 0) return setBrlEstimate(0)
    const rate = usdBrl ?? 0
    setBrlEstimate(a * (rate + 0.2))
  }, [amount, unitPrice, usdBrl])

  const amountNum = toNumber(amount)
  const canCalc = unitPrice > 0 && Number.isFinite(amountNum) && amountNum > 0

  const error =
    amount !== '' && Number.isFinite(amountNum)
      ? amountNum < min ? t('error-min', `Valor mínimo é ${fmtMoney(min, 'USD')}`)
      : amountNum > max ? t('error-max', `Valor máximo é ${fmtMoney(max, 'USD')}`)
      : undefined
      : undefined

  // método de pagamento (empilhado)
  const [method, setMethod] = React.useState<'pix' | 'usdc'>('pix')
  React.useEffect(() => {
    if (!canShowUSDC && method === 'usdc') setMethod('pix')
  }, [canShowUSDC, method])

  const showPixQuote = method === 'pix' && canCalc
  const showUsdcQuote = method === 'usdc' && canCalc
  const usdcToPay = amountNum > 0 ? amountNum : 0 // 1 USDC ~ 1 USD

  const disabled = !canCalc || !!error
  async function handleBuy() { router.push(onSuccessNavigateTo ?? '/dashboard') }

  const amountErrorId = 'amount-error'

  // textos do JSON (fallbacks)
  const txtPayWithPix  = t('pay-with-pix',  'Comprar com PIX')
  const txtPayWithUsdc = t('pay-with-usdc', 'Comprar com USDC')
  const txtQuotePix    = t('quote-prefix-pix',  'Você pagará (PIX):')
  const txtQuoteUsdc   = t('quote-prefix-usdc', 'Você pagará (USDC):')
  const ctaLabel       = method === 'usdc' ? t('cta-usdc', 'Comprar com USDC') : t('cta-pix', 'Comprar com PIX')

  // limits vindo do JSON com interpolação
  const limitsText = tpl(
    t('limits', 'Mín.: {min} · Máx.: {max}'),
    { min: fmtMoney(min!, 'USD'), max: fmtMoney(max!, 'USD') }
  )

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
          {/* Pagar */}
          <FloatingField
            className="mt-2"
            id="fiat-amount"
            label={t('label-pay', 'Pagar')}
            type="number"
            value={amount}
            onChange={onAmountChange}
            placeholder={t('placeholder-amount', fmtRange(min!, max!, 'USD'))}
            accent={accent}
            rightSlot={<CurrencyPill label="USD" />}
          />
          {error && <p id={amountErrorId} className="mt-1 text-xs text-red-600" role="alert">{error}</p>}

          {/* Receber */}
          <FloatingField
            className="mt-6"
            label={t('label-receive', 'Receber')}
            value={qtyStr}
            onChange={onQtyChange}
            placeholder="0"
            accent={accent}
            rightSlot={<CurrencyPill label={(token.ticker || 'UND').toUpperCase()} />}
          />

          {/* COTAÇÃO — logo abaixo do input de RECEBER */}
          {showPixQuote && (
            <p className="mt-2 text-sm text-gray-700">
              {txtQuotePix} <strong>{usdBrl ? fmtMoney(brlEstimate || 0, 'BRL') : 'calculando…'}</strong>
            </p>
          )}
          {showUsdcQuote && (
            <p className="mt-2 text-sm text-gray-700">
              {txtQuoteUsdc} <strong>{fmt2(usdcToPay)} USDC</strong>
            </p>
          )}

          {/* Método de pagamento — EMPILHADO */}
          <div className="mt-8">
            <p className="mb-3 text-sm font-medium text-gray-700">
              {t('payment-method', 'Método de pagamento')}
            </p>

            <div className="flex flex-col gap-3">
              {/* PIX */}
              <button
                type="button"
                onClick={() => setMethod('pix')}
                className={`rounded-xl border-2 px-4 py-3 text-left flex items-center justify-between
                            ${method === 'pix' ? 'bg-gray-50' : 'bg-white'}`}
                style={{ borderColor }}
              >
                <span className="flex items-center gap-3">
                  <QrCode className="h-5 w-5 text-gray-800" strokeWidth={2} aria-hidden />
                  <span className="text-sm text-gray-800">{txtPayWithPix}</span>
                </span>
              </button>

              {/* USDC (só com MetaMask conectada) */}
              {canShowUSDC && (
                <button
                  type="button"
                  onClick={() => setMethod('usdc')}
                  className={`rounded-xl border-2 px-4 py-3 text-left flex items-center justify-between
                              ${method === 'usdc' ? 'bg-gray-50' : 'bg-white'}`}
                  style={{ borderColor }}
                >
                  <span className="flex items-center gap-3">
                    <span className="relative inline-flex h-5 w-5 items-center justify-center text-gray-800">
                      <Wallet className="h-5 w-5" strokeWidth={2} aria-hidden />
                      <CircleDollarSign className="absolute -bottom-1 -right-1 h-3 w-3" strokeWidth={2} aria-hidden />
                    </span>
                    <span className="text-sm text-gray-800">{txtPayWithUsdc}</span>
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={handleBuy}
            disabled={!canCalc || !!error}
            className={`mt-8 w-full h-[50px] rounded-xl font-bold border-2 transition
              ${(!canCalc || !!error) ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90'}`}
            style={{ backgroundColor: ctaBg, borderColor, color: ctaText }}
            aria-disabled={!canCalc || !!error}
          >
            <span className="inline-flex items-center justify-center gap-2">
              {method === 'usdc' ? <Wallet className="h-5 w-5" aria-hidden /> : <QrCode className="h-5 w-5" aria-hidden />}
              <span>{ctaLabel}</span>
            </span>
          </button>

          <p className="text-[11px] text-gray-500 mt-3">{limitsText}</p>
        </>
      )}
    </div>
  )
}
