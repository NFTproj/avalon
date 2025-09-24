// app/buy-tokens/orders/page.tsx
'use client'

import * as React from 'react'
import { useContext } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'
import { useOrders } from '@/lib/hooks/useOrders'
import Header from '@/components/landingPage/Header'
import Footer from '@/components/common/footer'

// Chip de status
function StatusChip({ status }: { status?: string | number }) {
  const v = String(status ?? '').trim()
  const code = Number(v)
  const norm =
    !Number.isNaN(code)
      ? (code === 100 ? 'PENDING'
        : code === 200 ? 'PROCESSING'
        : code === 300 ? 'COMPLETED'
        : code === 400 ? 'FAILED'
        : code === 500 ? 'CANCELLED'
        : 'PROCESSING')
      : v.toUpperCase()

  const map: Record<string, { dot: string; label: string }> = {
    PENDING:   { dot: '#f59e0b', label: 'Pendente' },
    PROCESSING:{ dot: '#9ca3af', label: 'Processando' },
    COMPLETED: { dot: '#10b981', label: 'Concluída' },
    CONFIRMED: { dot: '#10b981', label: 'Confirmada' },
    FAILED:    { dot: '#ef4444', label: 'Falhou' },
    CANCELLED: { dot: '#ef4444', label: 'Cancelada' },
  }
  const sty = map[norm] || map.PROCESSING

  return (
    <span className="inline-flex items-center gap-2 text-xs font-medium">
      <span aria-hidden className="inline-block rounded-full" style={{ width: 10, height: 10, backgroundColor: sty.dot }} />
      {sty.label}
    </span>
  )
}

export default function OrdersPage() {
  const { colors } = useContext(ConfigContext)

  const theme = colors as any
const accent      = theme?.colors?.['color-primary']  || '#19C3F0'
const borderColor = theme?.border?.['border-primary'] || accent
const textMain    = theme?.text?.['text-primary']     ?? '#0b1a2b' // fallback
const textMuted   = theme?.text?.['text-secondary']   ?? '#6B7280' // fallback

  const [page, setPage]   = React.useState(1)
  const [limit, setLimit] = React.useState(10)

  const { data: orders, pagination, loading, error, refresh } = useOrders({ page, limit })

  return (
    <div className="flex min-h-screen flex-col">
      {/* HEADER */}
      <Header />

      {/* MAIN */}
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-4" style={{ color: accent }}>
            Histórico de ordens
          </h1>

          <div className="mb-4 flex items-center gap-2">
            <label className="text-sm" style={{ color: textMuted }}>
              Itens por página:
            </label>
            <select
              className="border rounded px-2 py-1 text-sm bg-white"
              style={{ borderColor, color: textMain }}
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1) }}
            >
              {[10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <button
              className="ml-auto text-sm underline"
              style={{ color: accent }}
              onClick={() => refresh()}
            >
              Atualizar
            </button>
          </div>

          <div className="rounded-2xl border bg-white" style={{ borderColor }}>
            {/* Cabeçalho da tabela */}
            <div
              className="grid grid-cols-[140px_1fr_1fr_1fr_1fr] gap-4 px-4 py-3 text-xs font-semibold"
              style={{ color: textMuted }}
            >
              <div>Data</div>
              <div>Valor</div>
              <div>Quantidade</div>
              <div>Rede</div>
              <div>Status</div>
            </div>

            {loading && <div className="px-4 py-6 text-sm" style={{ color: textMuted }}>Carregando…</div>}
            {error   && <div className="px-4 py-6 text-sm" style={{ color: '#DC2626' }}>{error}</div>}
            {!loading && !error && orders.length === 0 && (
              <div className="px-4 py-6 text-sm" style={{ color: textMuted }}>Nenhuma ordem encontrada.</div>
            )}

            <ul className="divide-y">
              {orders.map((o) => {
                const dt   = o.createdAt ? new Date(o.createdAt) : null
                const dia  = dt ? dt.toLocaleDateString('pt-BR') : '—'
                const hora = dt ? dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '—'

                return (
                  <li
                    key={o.id}
                    className="px-4 py-3 grid grid-cols-[140px_1fr_1fr_1fr_1fr] gap-4 text-sm"
                    style={{ color: textMain }}   // ⬅ garante legibilidade das linhas
                  >
                    <div>
                      <div className="font-semibold">{dia}</div>
                      <div className="text-xs" style={{ color: textMuted }}>{hora}</div>
                    </div>
                    <div className="font-mono">{o.amount ?? '—'}</div>
                    <div className="font-mono">{(o as any).tokenAmount ?? '—'}</div>
                    <div className="uppercase" style={{ color: textMuted }}>{o.network ?? '—'}</div>
                    <div><StatusChip status={o.status} /></div>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Paginação */}
          <div className="mt-4 flex items-center justify-between">
            <button
              className="text-sm px-3 py-2 rounded border"
              style={{ borderColor, color: textMain }}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Anterior
            </button>
            <div className="text-sm" style={{ color: textMuted }}>
              Página {pagination?.currentPage ?? page} / {pagination?.totalPages ?? '—'}
            </div>
            <button
              className="text-sm px-3 py-2 rounded border"
              style={{ borderColor, color: textMain }}
              onClick={() => setPage((p) => p + 1)}
              disabled={pagination ? page >= (pagination.totalPages || 1) : false}
            >
              Próxima
            </button>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  )
}
