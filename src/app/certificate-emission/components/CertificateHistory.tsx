'use client'

import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api/fetcher'

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
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    year: 'all',
    token: 'all',
    status: 'all',
  })

  const accentColor = '#08CEFF'

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoading(true)
        // TODO: Implementar API real
        // const response = await apiFetch('/api/certificates/history')
        
        // Mock data por enquanto - dados mais variados para testar filtros
        const mockData: Certificate[] = [
          {
            id: '1',
            cardId: cardId || 'mock-id',
            cardName: 'Fazenda Eliane - Mato Grosso (TBIO1)',
            cardLogoUrl: 'https://picsum.photos/200',
            quantity: 1299,
            status: 'emitido',
            certificateId: 'CARD-2023-0012387',
            emittedAt: '15/03/2025 às 20:34:45',
          },
          {
            id: '2',
            cardId: cardId || 'mock-id',
            cardName: 'Fazenda Eliane - Mato Grosso (TBIO1)',
            cardLogoUrl: 'https://picsum.photos/200',
            quantity: 800,
            status: 'pendente',
            certificateId: 'CARD-2023-0012387',
            emittedAt: '15/03/2025 às 20:34:45',
          },
          {
            id: '3',
            cardId: cardId || 'mock-id',
            cardName: 'Fazenda Eliane - Mato Grosso (TBIO1)',
            cardLogoUrl: 'https://picsum.photos/200',
            quantity: 500,
            status: 'falha',
            certificateId: 'CARD-2023-0012387',
            emittedAt: '15/03/2025 às 20:34:45',
          },
          {
            id: '4',
            cardId: cardId || 'mock-id',
            cardName: 'Fazenda Solar - São Paulo (TBIO2)',
            cardLogoUrl: 'https://picsum.photos/201',
            quantity: 1500,
            status: 'emitido',
            certificateId: 'CARD-2024-0015432',
            emittedAt: '10/02/2024 às 14:20:30',
          },
          {
            id: '5',
            cardId: cardId || 'mock-id',
            cardName: 'Projeto Amazônia - Amazonas (TBIO1)',
            cardLogoUrl: 'https://picsum.photos/202',
            quantity: 950,
            status: 'pendente',
            certificateId: 'CARD-2023-0009876',
            emittedAt: '05/12/2023 às 09:15:22',
          },
        ]
        
        setCertificates(mockData)
      } catch (err) {
        console.error('Erro ao buscar histórico:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCertificates()
  }, [cardId])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'emitido':
        return {
          bg: '#E8F5E9',
          text: '#2E7D32',
          label: 'Emitido'
        }
      case 'pendente':
        return {
          bg: '#F5F5F5',
          text: '#616161',
          label: 'Em validação'
        }
      case 'falha':
        return {
          bg: '#FFEBEE',
          text: '#C62828',
          label: 'Falha na validação'
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
    console.log('Download certificado:', cert.id)
    alert('Download do certificado em desenvolvimento')
  }

  const handleReemit = (cert: Certificate) => {
    // TODO: Implementar reemissão
    console.log('Reemitir certificado:', cert.id)
    alert('Reemissão em desenvolvimento')
  }

  // Filtrar certificados
  const filteredCertificates = certificates.filter((cert) => {
    // Filtro por ano
    if (filters.year !== 'all') {
      const certYear = cert.emittedAt.split('/')[2]?.split(' ')[0]
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
        <p className="text-gray-600">Carregando histórico...</p>
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
        <h2 className="text-3xl font-bold text-gray-900">
          Histórico de certificados
        </h2>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-8">
        {/* Filtro Ano */}
        <div className="relative">
          <select
            value={filters.year}
            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
            className="appearance-none px-4 py-2 pr-10 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium focus:outline-none cursor-pointer border-2"
            style={{ borderColor: accentColor }}
          >
            <option value="all">Ano:</option>
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
            className="appearance-none px-4 py-2 pr-10 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium focus:outline-none cursor-pointer border-2"
            style={{ borderColor: accentColor }}
          >
            <option value="all">Token:</option>
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
            className="appearance-none px-4 py-2 pr-10 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium focus:outline-none cursor-pointer border-2"
            style={{ borderColor: accentColor }}
          >
            <option value="all">Status:</option>
            <option value="emitido">Emitido</option>
            <option value="pendente">Pendente</option>
            <option value="falha">Falha</option>
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
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <p className="text-gray-600">Nenhum certificado encontrado</p>
          </div>
        ) : (
          filteredCertificates.map((cert) => {
            const statusBadge = getStatusBadge(cert.status)
            
            return (
              <div
                key={cert.id}
                className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6 hover:shadow-lg transition-shadow"
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
                      Emitido em: {cert.emittedAt}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-2 mb-1 md:mb-2">
                      <span className="text-xs md:text-sm text-gray-600">Status:</span>
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
                        ID: {cert.certificateId}
                      </p>
                    )}
                    
                    <p className="text-xs md:text-sm text-gray-600">
                      Quantidade usada: {cert.quantity.toLocaleString('pt-BR')}
                    </p>
                  </div>

                  {/* Ações - Desktop */}
                  <div className="hidden md:block md:flex-shrink-0">
                    {cert.status === 'emitido' && (
                      <button
                        onClick={() => handleDownload(cert)}
                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white text-base font-medium transition-all hover:shadow-lg whitespace-nowrap"
                        style={{ backgroundColor: accentColor }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                        </svg>
                        Solicitar Reenvio
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
                        Pendente
                      </button>
                    )}
                    {cert.status === 'falha' && (
                      <button
                        onClick={() => handleReemit(cert)}
                        className="px-6 py-3 border-2 rounded-xl text-base font-medium transition-all hover:bg-cyan-50"
                        style={{ 
                          borderColor: accentColor,
                          color: accentColor
                        }}
                      >
                        Reemitir
                      </button>
                    )}
                  </div>
                </div>

                {/* Ações - Mobile (abaixo do conteúdo) */}
                <div className="mt-3 flex justify-end md:hidden">
                  {cert.status === 'emitido' && (
                    <button
                      onClick={() => handleDownload(cert)}
                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium transition-all hover:shadow-lg"
                      style={{ backgroundColor: accentColor }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                      </svg>
                      Solicitar Reenvio
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
                      Pendente
                    </button>
                  )}
                  {cert.status === 'falha' && (
                    <button
                      onClick={() => handleReemit(cert)}
                      className="px-4 py-2 border-2 rounded-xl text-sm font-medium transition-all hover:bg-cyan-50"
                      style={{ 
                        borderColor: accentColor,
                        color: accentColor
                      }}
                    >
                      Reemitir
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
