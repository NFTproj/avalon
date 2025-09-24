'use client'
export default function CurrencyPill({ label }: { label: string }) {
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
