'use client'
export type PanelTabKey = 'buy' | 'benefits'

export default function PanelTabs({
  active,
  onChange,
  labels = { buy: 'Comprar', benefits: 'Benefícios' },
  accentColor = '#19C3F0',
}: {
  active: PanelTabKey
  onChange: (t: PanelTabKey) => void
  labels?: { buy?: string; benefits?: string }
  accentColor?: string
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
                <span
                  aria-hidden
                  className="absolute left-0 right-0 -bottom-1 mx-auto block h-1 w-11/12 rounded-full"
                  style={{ backgroundColor: accentColor }}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
