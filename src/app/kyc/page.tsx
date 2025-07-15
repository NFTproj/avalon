'use client'

import { useContext } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ConfigContext } from '@/contexts/ConfigContext'
import Header from '@/components/landingPage/Header'
import Footer from '@/components/common/footer'
import LoadingOverlay from '@/components/common/LoadingOverlay'
import KycSteps from './components/KycSteps'

export default function Kyc() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const { colors } = useContext(ConfigContext)

  /*
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [loading, user, router])

  if (loading || !user) return <LoadingOverlay />
  */

  return (
    <div className="bg-[#f0fcff] min-h-screen">
      <Header />
      <KycSteps onFinish={() => router.push('/verificacao-didit')} />
      <Footer />
    </div>
  )
}