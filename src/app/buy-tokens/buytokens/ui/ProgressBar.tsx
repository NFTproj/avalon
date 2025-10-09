// app/buy-tokens/components/ProgressBar.tsx
'use client'
import * as React from 'react'

type Props = {
  /** 0–100; null/undefined => indeterminado (sem dados) */
  value?: number | null
  showLabel?: boolean
  zeroLabel?: string
  emptyLabel?: string
  /** cor de preenchimento (ex.: colors.colors['color-primary']) */
  color?: string
  /** cor do trilho (fundo da barra) */
  trackColor?: string
  /** cor/borda do trilho */
  trackBorderColor?: string
  trackBorderWidth?: number
  /** ativa sombras para dar mais destaque na borda */
  trackShadow?: boolean
  /** altura da barra em px */
  thickness?: number
  className?: string
}

export default function ProgressBar({
  value,
  showLabel = true,
  zeroLabel = '0%',
  emptyLabel = '',
  color = '#19C3F0',
  trackColor = '#ffffff',
  trackBorderColor = '#94a3b8', // slate-400
  trackBorderWidth = 1.8,
  trackShadow = true,
  thickness = 14,
  className,
}: Props) {
  const hasValue = Number.isFinite(value as number)

  const rawPct: number | null = hasValue
    ? Math.max(0, Math.min(100, Number(value)))
    : null

  const displayPct: number | null =
    rawPct === null ? null : rawPct >= 100 ? 100 : rawPct > 0 && rawPct < 1 ? 1 : rawPct

  const label =
    displayPct === null ? emptyLabel : displayPct === 0 ? zeroLabel : `${Math.round(displayPct)}%`

  const minFillPx = Math.max(8, Math.round(thickness * 0.8))
  const radius = thickness / 2

  return (
    <div className={`flex items-center gap-3 ${className ?? ''}`}>
      <div
        className="relative w-full overflow-hidden"
        role="progressbar"
        aria-valuemin={hasValue ? 0 : undefined}
        aria-valuemax={hasValue ? 100 : undefined}
        aria-valuenow={hasValue ? Math.round(displayPct ?? 0) : undefined}
        style={{
          height: thickness,
          backgroundColor: trackColor,
          border: `${trackBorderWidth}px solid ${trackBorderColor}`,
          borderRadius: radius,
          boxShadow: trackShadow
            ? `0 0 0 2px rgba(17,24,39,.06), inset 0 1px 2px rgba(0,0,0,.04)` // aro externo + leve relevo interno
            : undefined,
        }}
      >
        {displayPct === null ? (
          <div
            className="absolute inset-0 animate-pulse"
            style={{
              background:
                'linear-gradient(90deg, rgba(255,255,255,.6), rgba(255,255,255,.85), rgba(255,255,255,.6))',
            }}
          />
        ) : displayPct === 0 ? (
          <div
            className="h-full"
            style={{ width: minFillPx, backgroundColor: color, borderRadius: radius }}
          />
        ) : (
          <div
            className="h-full transition-[width] duration-500"
            style={{
              width: `${displayPct}%`,
              minWidth: displayPct > 0 && displayPct < 2 ? minFillPx : undefined,
              backgroundColor: color,
              borderRadius: radius,
            }}
          />
        )}
      </div>

      {showLabel && (
        <span className="w-20 text-right text-lg font-extrabold text-gray-900">
          {label}
        </span>
      )}
    </div>
  )
}
