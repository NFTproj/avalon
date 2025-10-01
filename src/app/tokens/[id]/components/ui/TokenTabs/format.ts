// ui/TokenTabs/format.ts
'use client'

/** dd/mm/aaaa a partir do ISO SEM fuso (UTC) */
export function isoToBRDateUTC(iso?: string) {
  if (!iso) return 'N/A'
  const [yyyy, mm, dd] = (iso.split('T')[0] || '').split('-')
  if (!yyyy || !mm || !dd) return 'N/A'
  return `${dd}/${mm}/${yyyy}`
}

export function shortAddr(addr?: string) {
  return addr ? `${addr.slice(0, 8)}...${addr.slice(-6)}` : 'N/A'
}

/** normaliza "1.000.000", "1,000,000", "$ 1.000.000" -> 1000000 */
export function toNumberSafe(v?: string | number) {
  if (v === undefined || v === null || v === '') return undefined
  if (typeof v === 'number') return Number.isFinite(v) ? v : undefined
  const clean = String(v).replace(/[^\d.-]/g, '') // remove tudo menos dígitos, ponto e hífen
  const n = Number(clean)
  return Number.isFinite(n) ? n : undefined
}

/** micro-USD (6 casas) -> $ X.Y */
export function formatUSD6(v?: string | number) {
  const n = toNumberSafe(v)
  if (n === undefined) return 'N/A'
  const usd = n / 1e6
  return `$ ${usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`
}

export function formatBRNumber(v?: string | number) {
  const n = toNumberSafe(v)
  if (n === undefined) return 'N/A'
  return n.toLocaleString('pt-BR')
}

/** tenta várias chaves possíveis no objeto (para lidar com variações da API) */
export function pick<T = any>(obj: any, keys: string[]): T | undefined {
  for (const k of keys) {
    const parts = k.split('.')
    let cur = obj
    for (const p of parts) {
      if (cur == null) break
      cur = cur[p]
    }
    if (cur !== undefined && cur !== null && cur !== '') return cur as T
  }
  return undefined
}

export function toNum(v: any): number {
  if (v === null || v === undefined) return 0
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0
  const s = String(v).replace(/[.,](?=\d{3}\b)/g, '').replace(',', '.')
  const n = Number(s)
  return Number.isFinite(n) ? n : 0
}

/** base do explorer por rede */
export function getExplorerBaseUrl(net?: string) {
  const n = (net || '').toLowerCase()
  if (['polygon', 'matic'].includes(n)) return 'https://polygonscan.com'
  if (['mumbai', 'maticmum'].includes(n)) return 'https://mumbai.polygonscan.com'
  if (['amoy'].includes(n)) return 'https://amoy.polygonscan.com'
  if (['sepolia'].includes(n)) return 'https://sepolia.etherscan.io'
  if (['holesky'].includes(n)) return 'https://holesky.etherscan.io'
  return 'https://etherscan.io'
}

export function formatLaunchDateUTC(iso?: string, locale: string = 'pt-BR') {
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