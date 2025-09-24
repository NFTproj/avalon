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
  className?: string
}

export default function ProgressBar({
  value,
  showLabel = true,
  zeroLabel = '0%',
  emptyLabel = '',
  color = '#19C3F0',
  trackColor = 'rgba(255,255,255,0.7)',
  className,
}: Props) {
  const hasValue = Number.isFinite(value as number)
  const pct = hasValue ? Math.max(0, Math.min(100, Number(value))) : null

  return (
    <div className={`flex items-center gap-3 ${className ?? ''}`}>
      <div
        className="relative h-2 w-full rounded-full overflow-hidden"
        role="progressbar"
        aria-valuemin={hasValue ? 0 : undefined}
        aria-valuemax={hasValue ? 100 : undefined}
        aria-valuenow={hasValue ? pct ?? 0 : undefined}
        style={{ backgroundColor: trackColor }}
      >
        {pct === null ? (
          <div className="absolute inset-0 animate-pulse"
               style={{
                 background: 'linear-gradient(90deg, rgba(255,255,255,.6), rgba(255,255,255,.85), rgba(255,255,255,.6))'
               }} />
        ) : pct === 0 ? (
          <div className="h-full rounded-full" style={{ width: 8, backgroundColor: color }} />
        ) : (
          <div className="h-full rounded-full transition-[width] duration-500"
               style={{ width: `${pct}%`, backgroundColor: color }} />
        )}
      </div>

      {showLabel && (
        <span className="text-sm font-medium text-gray-600 w-16 text-right">
          {pct === null ? emptyLabel : `${pct.toFixed(0)}%`}
        </span>
      )}
    </div>
  )
}
