'use client'
import * as React from 'react'

/** Retorna a cotação USD→BRL (ou null se indisponível) */
export function useUsdBrl() {
  const [rate, setRate] = React.useState<number | null>(null)
  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL', { cache: 'no-store' })
        const data = await res.json()
        const bid = parseFloat(data?.USDBRL?.bid)
        if (mounted) setRate(Number.isFinite(bid) ? bid : null)
      } catch { if (mounted) setRate(null) }
    })()
    return () => { mounted = false }
  }, [])
  return rate
}
