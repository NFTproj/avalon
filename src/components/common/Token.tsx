'use client'

import { useContext } from 'react'
import Link from 'next/link'
import { ConfigContext } from '@/contexts/ConfigContext'
import ProgressBar from './ProgressBar'

interface TokenProps {
  name: string
  subtitle: string
  price: string
  launchDate?: string
  tokensAvailable?: string
  identifierCode?: string
  image?: string
  labels?: { name: string }[]
  sold: number
  total: number
  href?: string
}

/* ---------- helpers ---------- */
const resolveSrc = (src?: string | null) => {
  if (!src) return null
  if (/^https?:\/\//i.test(src)) return src
  if (src.startsWith('/')) return src
  return `/${src.replace(/^\/+/, '')}`
}

function getLocale(texts: any): string {
  const fromTexts =
    texts?.locale ||
    texts?.i18n?.locale ||
    texts?.language ||
    texts?.lang ||
    null
  if (typeof fromTexts === 'string' && fromTexts.trim()) return fromTexts

  if (typeof document !== 'undefined') {
    const htmlLang = document.documentElement?.lang
    if (htmlLang && htmlLang.trim()) return htmlLang
  }

  if (typeof window !== 'undefined') {
    const m = window.location.pathname.toLowerCase().match(/^\/([a-z-]{2,5})\b/)
    const seg = m?.[1]
    if (seg === 'en' || seg === 'en-us') return 'en-US'
    if (seg === 'pt' || seg === 'pt-br') return 'pt-BR'
  }

  if (typeof navigator !== 'undefined') {
    const nav = navigator.language || (navigator as any).userLanguage
    if (nav && nav.trim()) return nav
  }

  return 'pt-BR'
}

function formatLaunchDate(iso?: string, locale: string = 'pt-BR') {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(d)
}

function formatMoneyUSD(value: number, locale: string) {
  const n = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
  return `$ ${n}`
}

/* ---------- component ---------- */
export default function Token({
  name,
  subtitle,
  price,
  launchDate,
  tokensAvailable,
  identifierCode,
  image,
  labels,
  sold,
  total,
  href,
}: Readonly<TokenProps>) {
  const { colors, texts } = useContext(ConfigContext)
  const locale = getLocale(texts)

  const priceNumber = Number(price)
  const formattedPrice = formatMoneyUSD(
    Number.isFinite(priceNumber) ? priceNumber : 0,
    locale
  )

  const labelColors = ['#8B7355', '#00D4AA', '#4CAF50']
  const token = texts?.['token']
  const imgSrc = resolveSrc(image)

  const Card = (
    <div
      className="rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:scale-[1.02] h-full"
      style={{
        backgroundColor: colors?.token['background'] ?? '#FFFFFF',
        borderColor: colors?.token['border'] ?? '#E5E5E5',
        borderWidth: '1px',
      }}
    >
      {/* Header */}
      <div
        className="flex items-start justify-between w-full border-b border-gray-200 p-6 rounded-t-xl"
        style={{ backgroundColor: colors?.token['header'] ?? '#FBFBFB' }}
      >
        <div className="flex justify-between gap-3 w-full">
          <div className="flex flex-col justify-end gap-2">
            <h3 className="font-bold text-lg leading-tight min-h-[3.5rem] line-clamp-2" style={{ color: colors?.token['text'] ?? '#000' }}>
              {name}
            </h3>
            <p className="font-bold text-sm leading-relaxed" style={{ color: colors?.token['text'] ?? '#000' }}>
              {subtitle}
            </p>

            {!!labels?.length && (
              <div className="flex gap-2">
                {labels.map((label, index) => (
                  <span
                    key={label.name}
                    className="text-[10px] font-bold px-2 py-1 rounded-full border-2 border-black text-black"
                    style={{ backgroundColor: labelColors[index % labelColors.length] }}
                  >
                    {label.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="w-20">
            {imgSrc ? (
              <img
                src={imgSrc}
                alt={name}
                width={108}
                height={108}
                loading="lazy"
                className="rounded-full w-full h-auto object-cover ring-1 ring-black/5"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="rounded-full w-full aspect-square bg-gray-200" />
            )}
          </div>
        </div>
      </div>

      {/* Infos */}
      <div className="flex flex-col gap-6 p-6">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium" style={{ color: colors?.colors?.['color-tertiary'] ?? '#555859' }}>
            {token?.['token-price']}
          </span>
          <span className="font-bold text-sm" style={{ color: colors?.colors?.['color-primary'] ?? '#202020' }}>
            {formattedPrice}
          </span>
        </div>

        {!!launchDate && (
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium" style={{ color: colors?.colors?.['color-tertiary'] ?? '#555859' }}>
              {token?.['launch-date']}
            </span>
            <span className="font-semibold text-sm capitalize" style={{ color: colors?.colors?.['color-primary'] ?? '#202020' }}>
              {formatLaunchDate(launchDate, locale)}
            </span>
          </div>
        )}

        {!!tokensAvailable && (
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium" style={{ color: colors?.colors?.['color-tertiary'] ?? '#555859' }}>
              {token?.['sold']}
            </span>
            <span className="font-semibold text-sm" style={{ color: colors?.colors?.['color-primary'] ?? '#202020' }}>
              {new Intl.NumberFormat(locale, { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(Number(tokensAvailable))}
            </span>
          </div>
        )}

        {!!identifierCode && (
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium" style={{ color: colors?.colors?.['color-tertiary'] ?? '#555859' }}>
              {token?.['available']}
            </span>
            <span className="font-bold text-sm" style={{ color: colors?.colors?.['color-primary'] ?? '#202020' }}>
              {identifierCode}
            </span>
          </div>
        )}
      </div>

      <div className="w-full h-px" style={{ backgroundColor: colors?.colors?.['color-quintenary'] ?? '#e5e3e3' }} />

      <div className="flex flex-col gap-2 p-6 text-black">
        <div className="flex justify-between items-center">
          <span className="text-sm font-black" style={{ color: colors?.colors?.['color-tertiary'] ?? '#555859' }}>
            <span className="font-bold ">{token?.['progress-bar']['sold']}:</span>{' '}
            <span className="font-bold text-sm text-black">{sold}</span>
          </span>
        </div>
        <ProgressBar sold={sold} total={total} />
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold" style={{ color: colors?.colors?.['color-tertiary'] ?? '#555859' }}>
            {token?.['progress-bar']['available']}: <span className="font-bold text-sm text-black">{total - sold}</span>
          </span>
        </div>
      </div>
    </div>
  )

  return href ? (
    <Link
      href={href}
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 rounded-xl"
      aria-label={`Abrir detalhes de ${name}`}
    >
      {Card}
    </Link>
  ) : (
    Card
  )
}
