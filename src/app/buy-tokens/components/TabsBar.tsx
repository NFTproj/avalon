// app/buy-tokens/components/TabsBar.tsx
'use client'
import { useContext } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'

export type TabKey = 'buy' | 'benefits' | 'orders'

type Props = {
  active: TabKey
  onChange: (k: TabKey) => void
  labels: { buy: string; benefits: string; orders: string }
  accentColor?: string
}

export default function TabsBar({ active, onChange, labels, accentColor }: Props) {
  const { colors } = useContext(ConfigContext)
  const accent = accentColor || colors?.colors['color-primary'] || '#19C3F0'

  const items: { key: TabKey; label: string }[] = [
    { key: 'buy', label: labels.buy },
    { key: 'benefits', label: labels.benefits },
    { key: 'orders', label: labels.orders },
  ]

  return (
    <div className="flex gap-10 mt-6 mb-2">
      {items.map(({ key, label }) => {
        const isActive = key === active
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className="relative pb-2"
            style={{ color: isActive ? '#111827' : '#4B5563' }} // text-gray-900 / text-gray-600
          >
            <span className={`text-[15px] ${isActive ? 'font-semibold' : ''}`}>{label}</span>
            {isActive && (
              <div
                className="absolute left-0 right-0 bottom-0 h-[3px] rounded-full"
                style={{ backgroundColor: accent }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
