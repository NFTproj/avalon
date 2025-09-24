'use client'

import { useContext, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ConfigContext } from '@/contexts/ConfigContext'
import Header from '@/components/landingPage/Header'
import Footer from '@/components/common/footer'
import LoadingOverlay from '@/components/common/LoadingOverlay'
import KycSteps from './components/KycSteps'
import KycStepStartVerification from './components/KycStepStartVerification'

// helper simples; troque por getKycCode() se já criou
function getKycCode(user: any): number {
  const v: any = user?.kycStatusCode ?? user?.kycStatus
  if (typeof v === 'number') return v
  if (typeof v === 'string') return Number(v) || 100
  if (v && typeof v === 'object' && 'code' in v) return Number(v.code) || 100
  return 100
}

export default function KycPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  useContext(ConfigContext) // se precisar de cores/textos, use a variável

  const code = getKycCode(user)

  // Hook sempre chamado (antes de qualquer return)
  useEffect(() => {
    if (!loading && user && code >= 300) {
      router.replace(`/kyc/status?code=${code}`)
    }
  }, [loading, user, code, router])

  // Decida o que mostrar sem "early return" antes dos hooks
  const view = useMemo(() => {
    if (loading || !user) return <LoadingOverlay />

    if (code === 100) {
      return <KycSteps onFinish={() => router.push('/verificacao-didit')} />
    }

    if (code === 200) {
      return (
        <KycStepStartVerification
          onVerify={() => router.push('/kyc/status?code=200')}
          onBack={() => router.push('/kyc')}
        />
      )
    }

    // 300+ -> status (o useEffect acima vai redirecionar); mostramos um loading enquanto isso
    return <LoadingOverlay />
  }, [loading, user, code, router])

  return (
    <div className="bg-[#f0fcff] min-h-screen">
      <Header />
      {view}
      <Footer />
    </div>
  )
}
