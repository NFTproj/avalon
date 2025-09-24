export const currencyLocale: Record<string,string> = { USD:'en-US', BRL:'pt-BR', EUR:'de-DE' }

export const fmtMoney = (v:number, currency:string) => {
  const loc = currencyLocale[currency] ?? 'en-US'
  try { return new Intl.NumberFormat(loc, { style:'currency', currency }).format(v || 0) }
  catch { return (v||0).toLocaleString(loc,{ minimumFractionDigits:2, maximumFractionDigits:2 }) }
}

export const fmtRange = (min:number, max:number, currency:string) => {
  const loc = currencyLocale[currency] ?? 'en-US'
  const nf = new Intl.NumberFormat(loc); return `${nf.format(min)}–${nf.format(max)}`
}

export const toNumber = (v:string) => {
  if (!v) return NaN
  let s = v.trim().replace(/\s/g,'')
  if (s.includes(',') && s.includes('.')) s = s.replace(/\./g,'').replace(',', '.')
  else if (s.includes(',')) s = s.replace(',', '.')
  const n = Number(s)
  return Number.isFinite(n) ? n : NaN
}

export const formatQty = (q:number) =>
  (!Number.isFinite(q) || q <= 0 ? '0' : (Math.floor(q * 1e6) / 1e6).toString())

export const fmt2 = (n:number) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits:2, maximumFractionDigits:2 }).format(n || 0)
