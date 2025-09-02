'use client'

import * as React from 'react'
import { ArrowLeft, Clipboard } from 'lucide-react'

export type PixPaymentData = {
  paymentLink?: string
  qrCodeImage?: string            // URL http(s) ou base64
  brCode?: string
  amountInBRL?: string | number   // CENTAVOS (564 => R$ 5,64)
  tokenQuantity?: number
  buyerAddress?: string
}

type Props = {
  data: PixPaymentData
  onBack: () => void
  accentColor?: string
  borderColor?: string
  expiresInMs?: number
}

/* helpers */
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

export default function PixPaymentSheet({
  data,
  onBack,
  accentColor = '#19C3F0',
  borderColor = '#19C3F0',
  expiresInMs = 15 * 60 * 1000,
}: Props) {
  const [deadline] = React.useState(Date.now() + expiresInMs)
  const [now, setNow] = React.useState(Date.now())
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id) }, [])

  const secLeft = Math.max(0, Math.floor((deadline - now) / 1000))
  const mm = String(Math.floor(secLeft / 60)).padStart(2, '0')
  const ss = String(secLeft % 60).padStart(2, '0')

  const imgSrc = resolveQrSrc(data.qrCodeImage)
  const amountNum = brlFromMinor(data.amountInBRL)
  const amountText = amountNum ? formatBRL(amountNum) : ''
  const brDisplay = middleEllipsis(data.brCode, 24)

  async function copy(txt: string) {
    try { await navigator.clipboard.writeText(txt); setCopied(true); setTimeout(() => setCopied(false), 1200) } catch {}
  }

  return (
    <div className="rounded-2xl bg-white p-5 border-2" style={{ borderColor }}>
      {/* header */}
      <div className="mb-4 flex items-start justify-between">
        <h3 className="text-lg font-semibold" style={{ color: accentColor }}>Pague com PIX</h3>
        <button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800">
          <ArrowLeft size={16} /> Voltar
        </button>
      </div>

      {/* esquerda fixa (320px) / direita fluida */}
      <div className="grid grid-cols-1 sm:grid-cols-[320px_minmax(0,1fr)] gap-6">
        {/* QR + valor + timer */}
        <div className="flex flex-col items-center">
          <div className="rounded-xl border bg-white p-3" style={{ borderColor, width: QR_SIZE + 24, height: QR_SIZE + 24 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {imgSrc
              ? <img src={imgSrc} alt="QR Code PIX" style={{ width: QR_SIZE, height: QR_SIZE }} className="object-contain" />
              : <div className="grid place-items-center text-gray-400" style={{ width: QR_SIZE, height: QR_SIZE }}>QR indisponível</div>}
          </div>

          <div className="mt-3 text-center">
            {!!amountText && <p className="text-sm text-gray-800">Valor: <strong>{amountText}</strong></p>}
            <p className="text-xs text-gray-500 mt-1">Expira em <span className="font-medium">{mm}:{ss}</span></p>
          </div>
        </div>

        {/* BR Code + detalhes */}
        <div className="flex flex-col">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">PIX copia e cola</label>

            {/* "botão" texto — não tem fundo, não tem como ficar preto */}
            <button
              type="button"
              onClick={() => data.brCode && copy(data.brCode)}
              disabled={!data.brCode}
              className="copy-link"
              aria-label="Copiar código PIX"
            >
              <Clipboard size={16} />
              <span>{copied ? 'Copiado!' : 'Copiar código'}</span>
            </button>
          </div>

          <div
            className="w-full rounded-lg border bg-gray-50 p-3 text-sm text-gray-800 font-mono break-all select-all"
            style={{ borderColor }}
            title={data.brCode || ''}
          >
            {brDisplay || '—'}
          </div>

          {/* detalhes (valor + quantidade) */}
          <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            {(data.tokenQuantity !== undefined && data.tokenQuantity !== null) && (
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
        </div>
      </div>

      {/* CSS escopado: link de copiar SEM fundo, SEM borda, não herda nada */}
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
