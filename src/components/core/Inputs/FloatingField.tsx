'use client'
import * as React from 'react'

type Props = {
  id?: string
  label: string
  value?: string
  onChange?: (v: string) => void
  type?: React.HTMLInputTypeAttribute
  placeholder?: string
  accent?: string
  rightSlot?: React.ReactNode
  readOnly?: boolean
  className?: string // espaçamento externo
}

export default function FloatingField({
  id,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  accent = '#19C3F0',
  rightSlot,
  readOnly,
  className = '',
}: Props) {
  return (
    <div className={`relative w-full ${className}`}>
      {/* rótulo pequeno dentro da caixa, sem linha */}
      <label
        htmlFor={id}
        className="absolute left-4 top-2 z-10 text-xs font-semibold text-gray-700"
      >
        {label}
      </label>

      <div
        className="flex items-center justify-between rounded-2xl border-2 bg-white px-4 pt-6 pb-3 focus-within:ring-2"
        style={{ borderColor: accent, // ring usa tailwind var de cor
                 // @ts-ignore
                 '--tw-ring-color': accent }}
      >
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          className="w-full bg-transparent text-[16px] text-gray-900 placeholder:text-gray-400 outline-none"
        />
        {rightSlot && <span className="ml-3 shrink-0">{rightSlot}</span>}
      </div>
    </div>
  )
}
