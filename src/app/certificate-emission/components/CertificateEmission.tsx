'use client'

import { useContext, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/landingPage/Header'
import Footer from '@/components/common/footer'
import { ConfigContext } from '@/contexts/ConfigContext'
import { useAuth } from '@/contexts/AuthContext'
import LoadingOverlay from '@/components/common/LoadingOverlay'
import { apiFetch } from '@/lib/api/fetcher'
import EmissionCard from './EmissionCard'
import CertificateHistory from './CertificateHistory'

export default function CertificateEmission() {
  const { colors, texts } = useContext(ConfigContext)
  const { user, loading: authLoading } = useAuth()
  const searchParams = useSearchParams()
  const cardId = searchParams.get('cardId')

  const [card, setCard] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Buscar dados do card
  useEffect(() => {
    if (!cardId) {
      setError(
        texts?.certificateEmission?.['error-card-id-missing'] ??
          'ID do card não fornecido'
      )
      setLoading(false)
      return
    }

    const fetchCard = async () => {
      try {
        setLoading(true)
        const response = await apiFetch<any>('/api/cards')
        const foundCard = response.data?.find((c: any) => c.id === cardId)

        if (!foundCard) {
          setError(
            texts?.certificateEmission?.['error-card-not-found'] ??
              'Token não encontrado'
          )
        } else {
          setCard(foundCard)
        }
      } catch (err) {
        console.error('Erro ao buscar card:', err)
        setError(
          texts?.certificateEmission?.['error-loading'] ??
            'Erro ao carregar dados do token'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchCard()
  }, [cardId])

  // Buscar saldo do usuário
  const userBalance = user?.balances?.find((b: any) => b.id === cardId)?.balance || 0

  return (
    <div className="min-h-dvh flex flex-col bg-[#f0fcff]">
      <Header />

      <main className="flex-1">
        {(authLoading || loading) && <LoadingOverlay />}

        <div className="mx-auto max-w-4xl px-4 py-8">
          {/* Título */}
          <div className="text-center mb-8">
            <h1
              className="mb-4 px-4"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                fontSize: 'clamp(32px, 8vw, 65px)',
                lineHeight: 'clamp(36px, 9vw, 72px)',
                letterSpacing: '-1px',
                textAlign: 'center',
                color: colors?.colors?.['color-primary'] || '#19C3F0'
              }}
            >
              {texts?.certificateEmission?.['page-title'] ??
                'Emissão de certificado'}
            </h1>
            <p
              className="text-gray-600 px-4"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 'clamp(16px, 4vw, 36px)',
                lineHeight: 'clamp(24px, 5vw, 32px)',
                letterSpacing: '0px',
                textAlign: 'center'
              }}
            >
              {texts?.certificateEmission?.['page-subtitle'] ??
                'Registre sua compensação ambiental e receba seu certificado digital com selo de verificação.'}
            </p>
          </div>

          {/* Card de Emissão */}
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-600">{error}</p>
            </div>
          ) : card ? (
            <EmissionCard
              card={card}
              userBalance={userBalance}
              onSuccess={() => {
                // Recarregar histórico
                window.location.reload()
              }}
            />
          ) : null}

          {/* Histórico de Certificados */}
          <div className="mt-12">
            <CertificateHistory cardId={cardId} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
