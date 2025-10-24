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

  const pageBg = colors?.certificateEmission?.background?.page || '#FFFFFF'
  const titleColor = colors?.certificateEmission?.colors?.title || '#1F2937'
  const subtitleColor = colors?.certificateEmission?.colors?.subtitle || '#6B7280'
  const errorBg = colors?.certificateEmission?.background?.error || '#FEF2F2'
  const errorBorder = colors?.certificateEmission?.border?.error || '#FCA5A5'
  const errorText = colors?.certificateEmission?.colors?.['error-text'] || '#DC2626'

  return (
    <div className="min-h-dvh flex flex-col" style={{ backgroundColor: pageBg }}>
      <Header />

      <main className="flex-1">
        {(authLoading || loading) && <LoadingOverlay />}

        <div className="mx-auto max-w-4xl px-4 py-8">
          {/* Título */}
          <div className="text-center mb-8">
            <h1 
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 px-4"
              style={{ color: titleColor }}
            >
              {texts?.certificateEmission?.['page-title'] ??
                'Emissão de certificado'}
            </h1>
            <p 
              className="text-base md:text-lg px-4 max-w-3xl mx-auto"
              style={{ color: subtitleColor }}
            >
              {texts?.certificateEmission?.['page-subtitle'] ??
                'Registre sua compensação ambiental e receba seu certificado digital com selo de verificação.'}
            </p>
          </div>

          {/* Card de Emissão */}
          {error ? (
            <div 
              className="border-2 rounded-2xl p-6 text-center shadow-md"
              style={{ 
                backgroundColor: errorBg,
                borderColor: errorBorder
              }}
            >
              <p className="font-medium" style={{ color: errorText }}>{error}</p>
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
