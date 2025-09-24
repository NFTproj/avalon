// app/buy-tokens/components/ui/BuyPanel.tsx
'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useContext } from 'react'
import { QrCode, Wallet } from 'lucide-react'

import { TokenItem } from './TokenList'
import { ConfigContext } from '@/contexts/ConfigContext'
import PixPaymentSheet from './pix/PixPaymentSheet'

import { useMe } from '@/lib/hooks/useMe'
import { useUsdBrl } from '@/lib/hooks/useUsdBrl'
import { usePixFlow } from '@/lib/services/payments/usePixFlow'
import { useUsdcBuy } from '@/lib/services/payments/useUsdcBuy'
import { fmtMoney, toNumber, formatQty, fmt2 } from '@/utils/format'
import type { PixPaymentData } from '@/lib/services/payments/types'
import { useWallet } from '@/contexts/WalletContext'
import LoadingOverlay from '@/components/common/LoadingOverlay'
import { useBanner } from '@/components/common/GlobalBanner' // ⬅️ usar banner global

import {
  BuyForm,
  PaymentMethods,
  QuoteSummary,
  PanelTabs,
  BenefitsPanel,
  type PanelTabKey,
} from './components'

type Props = {
  token: TokenItem
  min?: number
  max?: number
  fiat?: 'USD' | 'BRL' | 'EUR'
  activeTab?: 'buy' | 'benefits'
  onTabChange?: (tab: 'buy' | 'benefits') => void
  onSuccessNavigateTo?: string
  forcedChainId?: number
  forcedSaleAddress?: `0x${string}`
}

function resolveSaleAddress(t: any): `0x${string}` | undefined {
  const addr =
    t?.CardBlockchainData?.intermediaryContractAddress ??
    t?.cardBlockchainData?.intermediaryContractAddress ??
    t?.intermediaryContractAddress ??
    t?.saleContractAddress

  const a = typeof addr === 'string' ? addr.trim() : ''
  return /^0x[a-fA-F0-9]{40}$/.test(a) ? (a as `0x${string}`) : undefined
}

export default function BuyPanel({
  token,
  min = 0,
  max = Number.POSITIVE_INFINITY,
  fiat = 'BRL',
  activeTab,
  onTabChange,
  onSuccessNavigateTo = '/dashboard',
  forcedChainId,
  forcedSaleAddress,
}: Props) {
  const router = useRouter()
  const { colors, texts } = useContext(ConfigContext)
  const { showBanner } = useBanner() // ⬅️ hook do banner global

  // Wallet
  const {
    connector,
    isConnected,
    address,
    chainId: walletChainId,
    ensureChain,
    ensureConnected,
  } = useWallet()

  // Me / preços
  const { user, loading: meLoading, error: meError } = useMe()
  const usdBrl = useUsdBrl()

  // PIX / USDC
  const {
    loading: pixLoading,
    error: pixError,
    data: pixData,
    setData: setPixData,
    createPix,
  } = usePixFlow()
  const { buyWithUsdc, loading: usdcLoading, error: usdcError } = useUsdcBuy()

  // Textos
  const TX = (texts as any) ?? {}
  const TT = TX.buyTokens ?? {}
  const TP = TX.buyPanel ?? {}
  const t = (key: string, fb: string) => (TP?.[key] ?? TT?.[key] ?? fb)

  // Cores
  const accent      = colors?.colors?.['color-primary'] || '#19C3F0'
  const borderColor = colors?.border?.['border-primary'] || accent
  const ctaBg       = colors?.buttons?.['button-primary'] || accent
  const ctaText     = '#0b1a2b'

  // Tabs
  const [tab, setTab] = React.useState<PanelTabKey>(activeTab ?? 'buy')
  React.useEffect(() => { if (activeTab) setTab(activeTab) }, [activeTab])

  // Detector metamask (informativo)
  const [isMetaMask, setIsMetaMask] = React.useState(false)
  React.useEffect(() => {
    let alive = true
    ;(async () => {
      if (!isConnected || !connector) { if (alive) setIsMetaMask(false); return }
      if ((connector as any).id === 'metaMask' || (connector as any).name?.toLowerCase?.().includes('metamask')) {
        if (alive) setIsMetaMask(true); return
      }
      try {
        const provider: any = await (connector as any)?.getProvider?.()
        if (alive) setIsMetaMask(!!provider?.isMetaMask)
      } catch { if (alive) setIsMetaMask(false) }
    })()
    return () => { alive = false }
  }, [connector, isConnected])

  // Amount (USD) ↔ qty
  const unitPrice = token.price || 0
  const [amount, setAmount] = React.useState<string>('') // USD a pagar
  const [qtyStr, setQtyStr] = React.useState<string>('') // quantidade de tokens

  // estimativa BRL local
  const [brlEstimate, setBrlEstimate] = React.useState<number>(0)
  React.useEffect(() => {
    const a = toNumber(amount)
    if (unitPrice <= 0 || !Number.isFinite(a) || a <= 0) return setBrlEstimate(0)
    const rate = usdBrl ?? 0
    setBrlEstimate(a * (rate + 0.2))
  }, [amount, unitPrice, usdBrl])

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

  const amountNum = toNumber(amount)
  const canCalc   = unitPrice > 0 && Number.isFinite(amountNum) && amountNum > 0
  const hasInvalidAmount = !(Number.isFinite(amountNum) && amountNum > 0)

  const [method, setMethod] = React.useState<'pix' | 'usdc'>('pix')
  const [view, setView] = React.useState<'form' | 'pix'>('form')

  // ---------- On-chain data ----------
  const inferredChainId =
    typeof (token as any)?.CardBlockchainData?.tokenChainId === 'number'
      ? (token as any).CardBlockchainData.tokenChainId
      : (String((token as any)?.blockchainPlatform || '').toLowerCase() === 'polygon'
          ? 137
          : undefined)

  const targetChainId: number | undefined =
    typeof forcedChainId === 'number' ? forcedChainId : inferredChainId

  const saleAddressResolved: `0x${string}` | undefined =
    forcedSaleAddress ?? resolveSaleAddress(token)

  if (process.env.NODE_ENV !== 'production') {
    console.debug('[BuyPanel] props/onchain', {
      tokenId: (token as any)?.id,
      forcedChainId,
      inferredChainId,
      targetChainId,
      forcedSaleAddress,
      saleAddressResolved,
      walletChainId,
    })
  }

  // ======== overlay ========
  const [busyMsg, setBusyMsg] = React.useState<string | null>(null)

  // ========== USDC flow (approve -> buyTokens) ==========
  const [usdcLocalError, setUsdcLocalError] = React.useState<string | null>(null)

  async function handleUsdcBuy() {
    setUsdcLocalError(null)

    const usdAmount = Number(amount)
    if (!Number.isFinite(usdAmount) || usdAmount <= 0) return

    try {
      // 1) Conexão
      if (!address) {
        setBusyMsg('Conectando carteira…')
        await ensureConnected()
      }

      // 2) Validar chain/endereço
      if (typeof targetChainId !== 'number') throw new Error('Configuração on-chain ausente (chainId).')
      if (!saleAddressResolved) throw new Error('Endereço do contrato de venda ausente.')

      // 3) Trocar de rede se necessário
      setBusyMsg('Trocando de rede…')
      await ensureChain(targetChainId)

      // 4) Address do comprador
      const buyer = (address || user?.walletAddress)?.trim() as `0x${string}` | undefined
      if (!buyer) throw new Error('Endereço da carteira não encontrado.')

      // 5) Execução (approve + buyTokens dentro do hook)
      setBusyMsg('Aprovando USDC e executando compra…')
      await buyWithUsdc({
        buyer,
        chainId: targetChainId,
        usdAmount,
        saleAddress: saleAddressResolved,
        // usdcAddress: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359' as `0x${string}`, // se quiser forçar
      })

      setBusyMsg(null)
      showBanner({ type: 'success', text: 'Transação confirmada! 🎉' }, { timeout: 7000 }) // ⬅️ 7s
      // router.push(onSuccessNavigateTo) // opcional
    } catch (e: any) {
      setBusyMsg(null)
      const msg = e?.shortMessage ?? e?.message ?? 'Falha ao comprar com USDC.'
      setUsdcLocalError(msg)
      showBanner({ type: 'error', text: msg }, { timeout: 7000 }) // ⬅️ 7s
    }
  }

  // ========== CTA principal ==========
  async function handleCTA() {
    if (method === 'usdc') {
      await handleUsdcBuy()
      return
    }

    // ===== fluxo PIX =====
    const buyer = user?.walletAddress?.trim()
    if (meLoading) return
    if (!buyer) return

    const qty = unitPrice > 0 && Number.isFinite(amountNum) && amountNum > 0
      ? Number(((amountNum / unitPrice)).toFixed(6))
      : 0

    if (qty <= 0) return

    setBusyMsg('Gerando cobrança PIX…')
    try {
      await createPix({ cardId: (token as any).id, tokenQuantity: qty, buyerAddress: buyer })
      setView('pix')
      // se quiser banner também ao gerar o PIX:
      // showBanner({ type: 'success', text: 'PIX gerado com sucesso.' }, { timeout: 7000 })
    } catch (e: any) {
      const msg = e?.shortMessage ?? e?.message ?? 'Falha ao gerar PIX.'
      showBanner({ type: 'error', text: msg }, { timeout: 7000 })
    } finally {
      setBusyMsg(null)
    }
  }

  // ========== View PIX ==========
  if (view === 'pix' && pixData) {
    return (
      <PixPaymentSheet
        data={pixData as PixPaymentData}
        onBack={() => { setView('form'); setPixData(null) }}
        accentColor={accent}
        borderColor={borderColor}
      />
    )
  }

  // Textos de UI
  const ctaBase = method === 'usdc'
    ? t('cta-usdc', 'Comprar com USDC')
    : t('cta-pix',  'Comprar com PIX')

  const ctaLabel   = (pixLoading || meLoading || usdcLoading) ? 'Carregando…' : ctaBase
  const disableCTA = pixLoading || meLoading || usdcLoading || hasInvalidAmount || !!busyMsg

  return (
    <div className="relative rounded-2xl bg-white p-5 border-2" style={{ borderColor }}>
      {(busyMsg || usdcLoading || pixLoading) && (
        <LoadingOverlay overrideMessage={busyMsg ?? (method === 'usdc' ? 'Processando compra…' : 'Gerando cobrança PIX…')} />
      )}

      <PanelTabs
        active={tab}
        onChange={(v) => { setTab(v); onTabChange?.(v) }}
        accentColor={accent}
        labels={{ buy: t('tab-buy', 'Comprar'), benefits: t('tab-benefits', 'Benefícios') }}
      />

      {tab === 'benefits' ? (
        <BenefitsPanel />
      ) : (
        <>
          <BuyForm
            amount={amount}
            qty={qtyStr}
            tokenTicker={(token.ticker || 'UND').toUpperCase()}
            accent={accent}
            onAmountChange={onAmountChange}
            onQtyChange={onQtyChange}
            payLabel={t('label-pay', 'Pagar')}
            receiveLabel={t('label-receive', 'Receber')}
            placeholderAmount={t('placeholder-amount', '0.00')}
          />

          <QuoteSummary
            show={canCalc}
            pixPrefix={t('quote-prefix-pix', 'Você pagará (PIX):')}
            usdcPrefix={t('quote-prefix-usdc', 'Você pagará (USDC):')}
            pixText={usdBrl ? fmtMoney(brlEstimate || 0, 'BRL') : 'calculando…'}
            usdcText={`${fmt2(amountNum)} USDC`}
          />

          <div className="mt-8">
            <p className="mb-3 text-sm font-medium text-gray-700">{t('payment-method', 'Método de pagamento')}</p>
            <PaymentMethods
              method={method}
              setMethod={setMethod}
              borderColor={borderColor}
              txtPayWithPix={t('pay-with-pix', 'Comprar com PIX')}
              txtPayWithUsdc={t('pay-with-usdc', 'Comprar com USDC')}
            />
          </div>

          {(pixError || meError) && (
            <p className="mt-3 text-xs text-red-600" role="alert">
              {pixError || meError}
            </p>
          )}
          {(usdcError || usdcLocalError) && (
            <p className="mt-3 text-xs text-red-600" role="alert">
              {usdcLocalError || usdcError}
            </p>
          )}
          {!meLoading && !user?.walletAddress && (
            <p className="mt-2 text-xs text-amber-600">
              Faça login para continuar (carteira não encontrada).
            </p>
          )}

          <button
            type="button"
            onClick={handleCTA}
            disabled={disableCTA}
            className={`mt-8 w-full h-[50px] rounded-xl font-bold border-2 transition
              ${disableCTA ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90'}`}
            style={{ backgroundColor: ctaBg, borderColor, color: ctaText }}
            aria-disabled={disableCTA}
          >
            <span className="inline-flex items-center justify-center gap-2">
              {method === 'usdc' ? <Wallet className="h-5 w-5" aria-hidden /> : <QrCode className="h-5 w-5" aria-hidden />}
              <span>{ctaLabel}</span>
            </span>
          </button>
        </>
      )}
    </div>
  )
}
