'use client'
import * as React from 'react'
import { useContext } from 'react'
import { QrCode, Wallet, CircleDollarSign } from 'lucide-react'
import { ConfigContext } from '@/contexts/ConfigContext'

type Method = 'pix' | 'usdc'

export default function PaymentMethods({
  method,
  setMethod,
  borderColor,
  txtPayWithPix,
  txtPayWithUsdc,
  onSelectUsdcPrepare,
  accentColor,               // opcional: sobrescreve cor do tema
  disabled = false,
}: {
  method: Method
  setMethod: (m: Method) => void
  borderColor: string
  txtPayWithPix: string
  txtPayWithUsdc: string
  onSelectUsdcPrepare?: () => Promise<void>
  accentColor?: string
  disabled?: boolean
}) {
  const { colors } = useContext(ConfigContext)
  const themeAccent =
    accentColor ??
    colors?.colors?.['color-primary'] ??
    (colors?.border as any)?.['border-primary'] ??
    '#19C3F0'

  const [preparing, setPreparing] = React.useState(false)
  const [err, setErr] = React.useState<string | null>(null)

  const onPixClick = () => {
    if (disabled || preparing) return
    setErr(null)
    setMethod('pix')
  }

  const onUsdcClick = async () => {
    if (disabled || preparing) return
    setErr(null)
    setPreparing(true)
    try {
      await onSelectUsdcPrepare?.()
      setMethod('usdc')
    } catch (e: any) {
      setMethod('pix')
      setErr(e?.shortMessage ?? e?.message ?? 'Ação cancelada.')
    } finally {
      setPreparing(false)
    }
  }

  return (
    <fieldset role="radiogroup" aria-label="Método de pagamento" className="flex flex-col gap-3">
      <MethodCard
        selected={method === 'pix'}
        onClick={onPixClick}
        disabled={disabled || preparing}
        borderColor={borderColor}
        accentColor={themeAccent}
        left={
          <span className="flex items-center gap-3">
            <QrCode className="h-5 w-5 text-gray-800" aria-hidden />
            <span className="text-sm text-gray-800">{txtPayWithPix}</span>
          </span>
        }
        label="PIX"
      />

      <MethodCard
        selected={method === 'usdc'}
        onClick={onUsdcClick}
        disabled={disabled || preparing}
        borderColor={borderColor}
        accentColor={themeAccent}
        left={
          <span className="flex items-center gap-3">
            <span className="relative inline-flex h-5 w-5 items-center justify-center text-gray-800">
              <Wallet className="h-5 w-5" aria-hidden />
              <CircleDollarSign className="absolute -bottom-1 -right-1 h-3 w-3" aria-hidden />
            </span>
            <span className="text-sm text-gray-800">{preparing ? 'Conectando…' : txtPayWithUsdc}</span>
          </span>
        }
        label="USDC"
      />

      {!!err && <p className="mt-1 text-xs text-red-600" role="alert">{err}</p>}
    </fieldset>
  )
}

function MethodCard({
  selected,
  onClick,
  disabled,
  borderColor,
  accentColor,
  left,
  label,
}: {
  selected: boolean
  onClick: () => void
  disabled: boolean
  borderColor: string
  accentColor: string
  left: React.ReactNode
  label: string
}) {
  const style: React.CSSProperties = {
    borderColor: selected ? accentColor : borderColor,
    backgroundColor: selected ? withAlpha(accentColor, 0.06) : '#FFFFFF',
    // ring do Tailwind com a mesma cor do tema
    ['--tw-ring-color' as any]: accentColor,
  }

  return (
    <label className="block">
      <button
        type="button"
        role="radio"
        aria-checked={selected}
        onClick={onClick}
        disabled={disabled}
        className={`w-full rounded-xl border-2 px-4 py-3 text-left flex items-center justify-between
                    transition hover:shadow-sm focus:outline-none focus:ring-2
                    ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
        style={style}
        aria-label={label}
      >
        {left}

        <span
          className="relative h-5 w-5 rounded-full border-2 shrink-0"
          style={{ borderColor: selected ? accentColor : '#D1D5DB' }}
          aria-hidden
        >
          {selected && <span className="absolute inset-1 rounded-full" style={{ backgroundColor: accentColor }} />}
        </span>
      </button>
    </label>
  )
}

function withAlpha(hex?: string, alpha = 0.08) {
  const h = hex?.trim() || '#19C3F0'
  const m = h.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
  if (!m) return `rgba(25,195,240,${alpha})`
  const r = parseInt(m[1], 16), g = parseInt(m[2], 16), b = parseInt(m[3], 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
