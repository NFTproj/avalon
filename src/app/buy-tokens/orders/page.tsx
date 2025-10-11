'use client'

import * as React from 'react'
import { useContext } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'
import { useOrders } from '@/lib/hooks/useOrders'
import Header from '@/components/landingPage/Header'
import Footer from '@/components/common/footer'

// ---------- Helpers de status ----------
type CanonicalStatus = 'WAITING_PAYMENT' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'

// Mapeamento pelos CÓDIGOS (sua tabela)
const CODE_TO_CANON: Record<number, CanonicalStatus> = {
  100: 'PROCESSING',        // PENDING_TRANSFER
  200: 'COMPLETED',         // TRANSFERRED
  300: 'FAILED',            // FAILED
  400: 'WAITING_PAYMENT',   // WAITING_PAYMENT
  500: 'PROCESSING',        // PENDING_TRANSFER_RETRY
  600: 'WAITING_PAYMENT',   // PENDING_PAYMENT
}

// Mapeamento por NOMES (fallbacks)
const NAME_TO_CANON: Record<string, CanonicalStatus> = {
  PENDING_TRANSFER:        'PROCESSING',
  TRANSFERRED:             'COMPLETED',
  FAILED:                  'FAILED',
  WAITING_PAYMENT:         'WAITING_PAYMENT',
  PENDING_TRANSFER_RETRY:  'PROCESSING',
  PENDING_PAYMENT:         'WAITING_PAYMENT',

  // variações genéricas
  WAITING:                 'WAITING_PAYMENT',
  PENDING:                 'WAITING_PAYMENT',
  AWAITING_PAYMENT:        'WAITING_PAYMENT',
  PROCESSING:              'PROCESSING',
  IN_PROGRESS:             'PROCESSING',
  COMPLETED:               'COMPLETED',
  PAID:                    'COMPLETED',
  CONFIRMED:               'COMPLETED',
  SUCCESS:                 'COMPLETED',
  ERROR:                   'FAILED',
  DENIED:                  'FAILED',
  CANCELLED:               'CANCELLED',
  CANCELED:                'CANCELLED',
  VOID:                    'CANCELLED',
}

function normalizeStatus(raw?: string | number | null): CanonicalStatus {
  if (raw === null || raw === undefined) return 'PROCESSING'
  const n = Number(raw)
  if (!Number.isNaN(n) && CODE_TO_CANON[n]) return CODE_TO_CANON[n]
  const s = String(raw).trim().toUpperCase()
  return NAME_TO_CANON[s] ?? 'PROCESSING'
}

function StatusChip({ status }: { status?: string | number }) {
  const norm = normalizeStatus(status)
  const map: Record<CanonicalStatus, { dot: string; label: string }> = {
    WAITING_PAYMENT: { dot: '#f59e0b', label: 'Aguardando pagamento' },
    PROCESSING:      { dot: '#9ca3af', label: 'Processando' },
    COMPLETED:       { dot: '#10b981', label: 'Concluída' },
    FAILED:          { dot: '#ef4444', label: 'Falhou' },
    CANCELLED:       { dot: '#ef4444', label: 'Cancelada' },
  }
  const sty = map[norm]
  return (
    <span className="inline-flex items-center gap-2 text-xs font-medium">
      <span aria-hidden className="inline-block rounded-full" style={{ width: 10, height: 10, backgroundColor: sty.dot }} />
      {sty.label}
    </span>
  )
}

// ---------- Página ----------
export default function OrdersPage() {
  const { colors } = useContext(ConfigContext)
  const theme = colors as any
  const accent      = theme?.colors?.['color-primary']  || '#19C3F0'
  const borderColor = theme?.border?.['border-primary'] || accent
  const textMain    = theme?.text?.['text-primary']     ?? '#0b1a2b'
  const textMuted   = theme?.text?.['text-secondary']   ?? '#6B7280'

  const [page, setPage]   = React.useState(1)
  const [limit, setLimit] = React.useState(10)

  // apenas DOIS filtros: Todas / Concluídas
  const [statusFilter, setStatusFilter] = React.useState<CanonicalStatus | 'ALL'>('COMPLETED')


  const { data: orders, pagination, loading, error, refresh } = useOrders({ page, limit })

  const normalizedOrders = React.useMemo(
    () => orders.map((o: any) => ({ ...o, _normStatus: normalizeStatus(o?.status) as CanonicalStatus })),
    [orders]
  )

  const filteredOrders = React.useMemo(
    () => statusFilter === 'ALL'
      ? normalizedOrders
      : normalizedOrders.filter((o: any) => o._normStatus === statusFilter),
    [normalizedOrders, statusFilter]
  )

  const filters: Array<{ id: CanonicalStatus | 'ALL'; label: string }> = [
    { id: 'ALL',       label: 'Todas' },
    { id: 'COMPLETED', label: 'Concluídas' },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4 gap-4">
            <h1 className="text-2xl font-bold" style={{ color: accent }}>
              Histórico de ordens
            </h1>

            <div className="flex items-center gap-2">
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
                className="ml-2 text-sm underline"
                style={{ color: accent }}
                onClick={() => refresh()}
              >
                Atualizar
              </button>
            </div>
          </div>

          {/* Filtros por status (apenas 2) */}
          <div className="mb-4 flex flex-wrap gap-2">
            {filters.map(f => {
              const active = statusFilter === f.id
              return (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition ${active ? 'font-semibold' : ''}`}
                  style={{
                    borderColor,
                    color: active ? textMain : textMuted,
                    backgroundColor: active ? `${accent}1A` : 'white',
                  }}
                >
                  {f.label}
                </button>
              )
            })}
          </div>

          <div className="rounded-2xl border bg-white" style={{ borderColor }}>
            {/* Cabeçalho */}
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
            {!loading && !error && filteredOrders.length === 0 && (
              <div className="px-4 py-6 text-sm" style={{ color: textMuted }}>
                Nenhuma ordem {statusFilter !== 'ALL' ? 'para este filtro' : ''} nesta página.
              </div>
            )}

            <ul className="divide-y">
              {filteredOrders.map((o: any) => {
                const dt   = o.createdAt ? new Date(o.createdAt) : null
                const dia  = dt ? dt.toLocaleDateString('pt-BR') : '—'
                const hora = dt ? dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '—'

                return (
                  <li
                    key={o.id}
                    className="px-4 py-3 grid grid-cols-[140px_1fr_1fr_1fr_1fr] gap-4 text-sm"
                    style={{ color: textMain }}
                  >
                    <div>
                      <div className="font-semibold">{dia}</div>
                      <div className="text-xs" style={{ color: textMuted }}>{hora}</div>
                    </div>

                    <div className="font-mono">
                      {o.amount ?? '—'}
                    </div>

                    <div className="font-mono">
                      {(o as any).tokenAmount ?? '—'}
                    </div>

                    <div className="uppercase" style={{ color: textMuted }}>
                      {o.network ?? '—'}
                    </div>

                    <div>
                      <StatusChip status={o._normStatus} />
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Paginação */}
          <div className="mt-4 flex items-center justify-between">
            <button
              className="text-sm px-3 py-2 rounded border disabled:opacity-50"
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
              className="text-sm px-3 py-2 rounded border disabled:opacity-50"
              style={{ borderColor, color: textMain }}
              onClick={() => setPage((p) => p + 1)}
              disabled={pagination ? page >= (pagination.totalPages || 1) : false}
            >
              Próxima
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
