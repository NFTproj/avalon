'use client'

import { useEffect, useMemo, useState, useContext } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { KycContainer } from '@/components/common/FormsBackground'
import CustomButton from '@/components/core/Buttons/CustomButton'
import { ConfigContext } from '@/contexts/ConfigContext'
import { CheckCircle2, Clock3, XCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/landingPage/Header'
import Footer from '@/components/common/footer'
import LoadingOverlay from '@/components/common/LoadingOverlay'
import KycStepStartVerification from '../components/KycStepStartVerification' // <-- importe o step

type Variant = 'success' | 'pending' | 'error'

const mapCodeToVariant = (code: number): Variant => {
  if (code === 300) return 'success'
  if ([400, 600, 700, 800].includes(code)) return 'error'
  return 'pending'
}

// lê o código mesmo que venha como string/objeto
function getKycCode(user: any): number {
  const v: any = user?.kycStatusCode ?? user?.kycStatus
  if (typeof v === 'number') return v
  if (typeof v === 'string') return Number(v) || 200
  if (v && typeof v === 'object' && 'code' in v) return Number((v as any).code) || 200
  return 200
}

export default function KycStatusPage() {
  const router = useRouter()
  const params = useSearchParams()
  const { colors, texts } = useContext(ConfigContext)
  const { user, loading } = useAuth()

  const kycTexts: any = (texts as any)?.kyc ?? {}
  const t = (key: string, fallback: string) => kycTexts?.[key] ?? fallback

  const codeFromQuery = params.get('code')
  const code = useMemo(() => {
    if (codeFromQuery && !Number.isNaN(Number(codeFromQuery))) return Number(codeFromQuery)
    return getKycCode(user)
  }, [codeFromQuery, user])

  const [variant, setVariant] = useState<Variant>('pending')
  const [showStart, setShowStart] = useState(false) // <-- alterna para o passo da Didit

  useEffect(() => {
    setVariant(mapCodeToVariant(code))
    setShowStart(false) // toda vez que o code mudar, volta para o card de status
  }, [code])

  const copy = useMemo(() => {
    if (variant === 'success') {
      return {
        title: t('status-title', 'Status de verificação'),
        headline: t('status-success-headline', 'Sua conta foi verificada com sucesso'),
        description: t('status-success-description', 'Sua conta foi verificada com sucesso'),
        cta: t('status-success-cta', 'Voltar ao início'),
      }
    }
    if (variant === 'error') {
      return {
        title: t('status-title', 'Status de verificação'),
        headline: t('status-error-headline', 'A verificação da sua conta falhou'),
        description: t('status-error-description', 'A verificação da sua conta falhou'),
        cta: t('status-error-cta', 'Tentar novamente'),
      }
    }
    return {
      title: t('status-title', 'Status de verificação'),
      headline: t('status-pending-headline', 'Sua conta está com a verificação em processamento'),
      description: t('status-pending-description', 'Acompanhe como vai seu processo de verificação KYC.'),
      cta: t('status-pending-cta', 'Cancelar'),
    }
  }, [variant, kycTexts]) // eslint-disable-line

  const Icon = variant === 'success' ? CheckCircle2 : variant === 'pending' ? Clock3 : XCircle
  const ring =
    variant === 'success'
      ? 'bg-green-100 text-green-600'
      : variant === 'pending'
      ? 'bg-yellow-100 text-yellow-600'
      : 'bg-red-100 text-red-600'

  // ação do CTA
  const onPrimary = () => {
    if (variant === 'error') {
      // em erro: mostra o passo de start da Didit dentro desta página
      setShowStart(true)
      return
    }
    // success/pending → vai para dashboard (ajuste se quiser outra rota)
    router.push('/dashboard')
  }

  return (
    <div className="bg-[#f0fcff] min-h-screen">
      <Header />

      <div className="relative">
        {loading && <LoadingOverlay />}

        {showStart ? (
          // Passo "Start Verification" embutido na tela de status
          <KycStepStartVerification
            onBack={() => setShowStart(false)}
            onVerify={() => {
              // opcional: após clicar em "Continuar" (redireciona para Didit),
              // você pode setar algo ou deixar vazio.
            }}
          />
        ) : (
          <KycContainer className="max-w-[520px] mx-auto pt-8 pb-10 text-center">
            <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${ring}`}>
              <Icon className="h-12 w-12" aria-hidden />
            </div>

            <h1
              className="text-[22px] sm:text-2xl font-semibold mb-2"
              style={{ color: colors?.colors['color-primary'] }}
            >
              {copy.title}
            </h1>

            <p className="text-gray-600 mb-6 leading-snug">{copy.description}</p>
            <p className="font-semibold mb-8 max-w-[420px] mx-auto">{copy.headline}</p>

            <div className="flex justify-center">
              <CustomButton
                text={copy.cta}
                onClick={onPrimary}
                className="px-6"
                color={colors?.buttons['button-third']}
                borderColor={colors?.border['border-primary']}
                textColor={colors?.colors['color-primary']}
              />
            </div>
          </KycContainer>
        )}
      </div>

      <Footer />
    </div>
  )
}
