'use client'

import { useState, useEffect, useContext } from 'react'
import { apiFetch } from '@/lib/api/fetcher'
import { ConfigContext } from '@/contexts/ConfigContext'

interface Certificate {
  id: string
  cardId: string
  cardName: string
  cardLogoUrl?: string
  quantity: number
  status: 'emitido' | 'pendente' | 'falha'
  certificateId?: string
  emittedAt: string
}

interface CertificateHistoryProps {
  cardId: string | null
}

export default function CertificateHistory({ cardId }: CertificateHistoryProps) {
  const { texts, locale, colors } = useContext(ConfigContext)
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [limit] = useState(10)
  const [filters, setFilters] = useState({
    year: 'all',
    token: 'all',
    status: 'all',
  })

  // Cores dinâmicas do tema
  const accentColor = colors?.certificateEmission?.colors?.accent || '#08CEFF'
  const cardBg = colors?.certificateEmission?.history?.['card-bg'] || '#FFFFFF'
  const cardBorder = colors?.certificateEmission?.history?.['card-border'] || '#E5E7EB'
  const filterBg = colors?.certificateEmission?.history?.['filter-bg'] || '#F3F4F6'
  const filterBorder = colors?.certificateEmission?.history?.['filter-border'] || '#08CEFF'
  const filterText = colors?.certificateEmission?.history?.['filter-text'] || '#4B5563'
  const titleColor = colors?.certificateEmission?.colors?.title || '#1F2937'
  const subtitleColor = colors?.certificateEmission?.colors?.subtitle || '#6B7280'

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoading(true)

        // Buscar transações do tipo 500 (BURN/certificado) com paginação
        // Tipos de transação:
        // 100 = PURCHASE, 200 = TRANSFER, 300 = WITHDRAW, 400 = DEPOSIT, 500 = BURN
        const url = cardId
          ? `/api/transactions?cardId=${cardId}&transactionType=500&page=${page}&limit=${limit}`
          : `/api/transactions?transactionType=500&page=${page}&limit=${limit}`

        const response = await apiFetch<any>(url)

        if (!response.transactions || response.transactions.length === 0) {
          setCertificates([])
          setLoading(false)
          return
        }

        // Filtrar apenas sessões de burn (sessionId começa com "burn-")
        const validTransactions = response.transactions.filter((tx: any) =>
          typeof tx.sessionId === 'string' && tx.sessionId.startsWith('burn-')
        )

        if (validTransactions.length === 0) {
          setCertificates([])
          setLoading(false)
          return
        }

        // Buscar dados de todos os cards únicos
        const uniqueCardIds = [...new Set(validTransactions.map((t: any) => t.cardId))]
        const cardsResponse = await apiFetch<any>('/api/cards')
        const cardsMap = new Map(cardsResponse.data?.map((c: any) => [c.id, c]) || [])

        // Mapear transações para certificados
        const mappedCertificates: Certificate[] = validTransactions.map((tx: any) => {
          const card = cardsMap.get(tx.cardId) as any

          // Mapear status baseado nos códigos do backend:
          // 100 = PENDING_TRANSFER (pendente)
          // 200 = TRANSFERRED (emitido/sucesso)
          // 300 = FAILED (falha)
          // 400 = WAITING_PAYMENT (pendente)
          // 500 = PENDING_TRANSFER_RETRY (pendente)
          // 600 = PENDING_PAYMENT (pendente)
          let status: 'emitido' | 'pendente' | 'falha' = 'falha'
          if (tx.status === 200) {
            status = 'emitido' // TRANSFERRED
          } else if ([100, 400, 500, 600].includes(tx.status)) {
            status = 'pendente' // PENDING_*
          } else if (tx.status === 300) {
            status = 'falha' // FAILED
          }

          // Formatar data
          const date = new Date(tx.createdAt)
          const emittedAt = date.toLocaleString(locale || 'pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })

          return {
            id: tx.id,
            cardId: tx.cardId,
            cardName: card?.name || 'Token desconhecido',
            cardLogoUrl: card?.logoUrl,
            quantity: parseFloat(tx.tokenAmount) || 0,
            status,
            certificateId: tx.txHash || tx.sessionId,
            emittedAt,
          }
        })

        setCertificates(mappedCertificates)
        setTotal(response.total || 0)
      } catch (err) {
        setCertificates([])
        setTotal(0)
      } finally {
        setLoading(false)
      }
    }

    fetchCertificates()
  }, [cardId, locale, page, limit])



  // Evita erro de indexação tipada em objetos gerados a partir de JSON
  const ceTexts = texts?.certificateEmission as Record<string, string> | undefined
  const t = (key: string, fallback: string) => ceTexts?.[key] ?? fallback

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'emitido':
        return {
          bg: '#E8F5E9',
          text: '#2E7D32',
          label: t('status-emitido', 'Emitido')
        }
      case 'pendente':
        return {
          bg: '#F5F5F5',
          text: '#616161',
          label: t('status-pendente', 'Em validação')
        }
      case 'falha':
        return {
          bg: '#FFEBEE',
          text: '#C62828',
          label: t('status-falha', 'Falha na validação')
        }
      default:
        return {
          bg: '#F5F5F5',
          text: '#616161',
          label: status
        }
    }
  }

  const handleDownload = (cert: Certificate) => {
    // TODO: Implementar download real
    alert('Download do certificado em desenvolvimento')
  }

  const handleReemit = (cert: Certificate) => {
    // TODO: Implementar reemissão
    alert('Reemissão em desenvolvimento')
  }

  // Reset página quando filtros mudarem
  useEffect(() => {
    setPage(1)
  }, [filters.year, filters.token, filters.status])

  // Filtrar certificados
  const filteredCertificates = certificates.filter((cert) => {
    // Filtro por ano - ajustado para formato brasileiro
    if (filters.year !== 'all') {
      const dateMatch = cert.emittedAt.match(/(\d{2})\/(\d{2})\/(\d{4})/)
      const certYear = dateMatch ? dateMatch[3] : null
      if (certYear !== filters.year) return false
    }

    // Filtro por token (busca no nome do card)
    if (filters.token !== 'all') {
      if (!cert.cardName.toUpperCase().includes(filters.token.toUpperCase())) {
        return false
      }
    }

    // Filtro por status
    if (filters.status !== 'all') {
      if (cert.status !== filters.status) return false
    }

    return true
  })

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">{t('history-loading', 'Carregando histórico...')}</p>
      </div>
    )
  }

  return (
    <div>
      {/* Título */}
      <div className="flex items-center gap-3 mb-6">
        <svg 
          className="w-8 h-8 text-gray-700" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
        <h2 className="text-3xl font-bold" style={{ color: titleColor }}>
          {t('history-title', 'Histórico de certificados')}
        </h2>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-8">
        {/* Filtro Ano */}
        <div className="relative">
          <select
            value={filters.year}
            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
            className="appearance-none px-4 py-2 pr-10 rounded-lg text-sm font-medium focus:outline-none cursor-pointer border-2"
            style={{ 
              backgroundColor: filterBg,
              color: filterText,
              borderColor: filterBorder
            }}
          >
            <option value="all">{t('filter-year', 'Ano:')}</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>
          <svg 
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Filtro Token */}
        <div className="relative">
          <select
            value={filters.token}
            onChange={(e) => setFilters({ ...filters, token: e.target.value })}
            className="appearance-none px-4 py-2 pr-10 rounded-lg text-sm font-medium focus:outline-none cursor-pointer border-2"
            style={{ 
              backgroundColor: filterBg,
              color: filterText,
              borderColor: filterBorder
            }}
          >
            <option value="all">{t('filter-token', 'Token:')}</option>
            <option value="TBIO1">TBIO1</option>
            <option value="TBIO2">TBIO2</option>
          </select>
          <svg 
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Filtro Status */}
        <div className="relative">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="appearance-none px-4 py-2 pr-10 rounded-lg text-sm font-medium focus:outline-none cursor-pointer border-2"
            style={{ 
              backgroundColor: filterBg,
              color: filterText,
              borderColor: filterBorder
            }}
          >
            <option value="all">{t('filter-status', 'Status:')}</option>
            <option value="emitido">{t('status-emitido', 'Emitido')}</option>
            <option value="pendente">{t('status-pendente', 'Pendente')}</option>
            <option value="falha">{t('status-falha', 'Falha')}</option>
          </select>
          <svg 
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Lista de certificados */}
      <div className="space-y-4">
        {filteredCertificates.length === 0 ? (
          <div 
            className="text-center py-12 rounded-2xl border shadow-sm"
            style={{ 
              backgroundColor: cardBg,
              borderColor: cardBorder
            }}
          >
            <p style={{ color: subtitleColor }}>{t('history-empty', 'Nenhum certificado encontrado')}</p>
          </div>
        ) : (
          filteredCertificates.map((cert) => {
            const statusBadge = getStatusBadge(cert.status)
            
            return (
              <div
                key={cert.id}
                className="rounded-2xl border p-4 md:p-6 shadow-md hover:shadow-xl transition-all"
                style={{
                  backgroundColor: cardBg,
                  borderColor: cardBorder
                }}
              >
                {/* Título do Card - Mobile */}
                <h3 className="text-base md:text-lg font-semibold text-gray-700 mb-3 md:hidden">
                  {cert.cardName}
                </h3>

                {/* Conteúdo Principal */}
                <div className="flex gap-4 md:gap-6 md:items-center">
                  {/* Logo */}
                  <div className="flex-shrink-0">
                    {cert.cardLogoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cert.cardLogoUrl}
                        alt={cert.cardName}
                        className="w-20 h-20 md:w-32 md:h-24 object-cover rounded-xl"
                      />
                    ) : (
                      <div className="w-20 h-20 md:w-32 md:h-24 bg-gray-200 rounded-xl" />
                    )}
                  </div>

                  {/* Informações */}
                  <div className="flex-1 min-w-0">
                    {/* Título - Desktop */}
                    <h3 className="hidden md:block text-lg font-semibold text-gray-900 mb-2">
                      {cert.cardName}
                    </h3>

                    <p className="text-xs md:text-sm text-gray-600 mb-1 md:mb-2">
                      {t('emitted-at', 'Emitido em:')} {cert.emittedAt}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-2 mb-1 md:mb-2">
                      <span className="text-xs md:text-sm text-gray-600">{t('filter-status', 'Status:')}</span>
                      <span
                        className="inline-block px-2 md:px-3 py-1 rounded-md text-xs font-medium"
                        style={{
                          backgroundColor: statusBadge.bg,
                          color: statusBadge.text
                        }}
                      >
                        {statusBadge.label}
                      </span>
                    </div>

                    {cert.certificateId && (
                      <p className="text-xs md:text-sm text-gray-600 mb-1">
                        {t('certificate-id', 'ID:')} {cert.certificateId}
                      </p>
                    )}
                    
                    <p className="text-xs md:text-sm text-gray-600">
                      {t('quantity-used', 'Quantidade usada:')} {cert.quantity.toLocaleString(locale || 'pt-BR')}
                    </p>
                  </div>

                  {/* Ações - Desktop */}
                  <div className="hidden md:block md:flex-shrink-0">
                    {cert.status === 'emitido' && (
                      <button
                        onClick={() => handleDownload(cert)}
                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-base font-medium transition-all hover:shadow-lg whitespace-nowrap"
                        style={{ 
                          backgroundColor: accentColor,
                          color: '#FFFFFF'
                        }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                        </svg>
                        {t('button-resend', 'Solicitar Reenvio')}
                      </button>
                    )}
                    {cert.status === 'pendente' && (
                      <button
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-600 rounded-xl text-base font-medium cursor-not-allowed"
                        disabled
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {t('button-pending', 'Pendente')}
                      </button>
                    )}
                    {cert.status === 'falha' && (
                      <button
                        onClick={() => handleReemit(cert)}
                        className="px-6 py-3 border-2 rounded-xl text-base font-medium transition-all"
                        style={{ 
                          borderColor: accentColor,
                          color: accentColor,
                          backgroundColor: 'transparent'
                        }}
                      >
                        {t('button-reemit', 'Reemitir')}
                      </button>
                    )}
                  </div>
                </div>

                {/* Ações - Mobile (abaixo do conteúdo) */}
                <div className="mt-3 flex justify-end md:hidden">
                  {cert.status === 'emitido' && (
                    <button
                      onClick={() => handleDownload(cert)}
                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:shadow-lg"
                      style={{ 
                        backgroundColor: accentColor,
                        color: '#FFFFFF'
                      }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                      </svg>
                      {t('button-resend', 'Solicitar Reenvio')}
                    </button>
                  )}
                  {cert.status === 'pendente' && (
                    <button
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-600 rounded-xl text-sm font-medium cursor-not-allowed"
                      disabled
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {t('button-pending', 'Pendente')}
                    </button>
                  )}
                  {cert.status === 'falha' && (
                    <button
                      onClick={() => handleReemit(cert)}
                      className="px-4 py-2 border-2 rounded-xl text-sm font-medium transition-all"
                      style={{ 
                        borderColor: accentColor,
                        color: accentColor,
                        backgroundColor: 'transparent'
                      }}
                    >
                      {t('button-reemit', 'Reemitir')}
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Paginação */}
      {total > limit && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg border-2 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              borderColor: accentColor,
              color: page === 1 ? '#9CA3AF' : accentColor,
              backgroundColor: 'transparent'
            }}
          >
            {t('pagination-previous', 'Anterior')}
          </button>

          <span className="px-4 py-2 text-sm font-medium" style={{ color: subtitleColor }}>
            {t('pagination-page', 'Página')} {page} {t('pagination-of', 'de')} {Math.ceil(total / limit)}
          </span>

          <button
            onClick={() => setPage(p => Math.min(Math.ceil(total / limit), p + 1))}
            disabled={page >= Math.ceil(total / limit)}
            className="px-4 py-2 rounded-lg border-2 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              borderColor: accentColor,
              color: page >= Math.ceil(total / limit) ? '#9CA3AF' : accentColor,
              backgroundColor: 'transparent'
            }}
          >
            {t('pagination-next', 'Próxima')}
          </button>
        </div>
      )}
    </div>
  )
}
