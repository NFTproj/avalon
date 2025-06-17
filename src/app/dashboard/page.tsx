'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/landingPage/Header'
import Footer from '@/components/common/footer'
import DashboardWrapper from '@/app/dashboard/components/DashboardWrapper'
import { useContext } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'
import LoadingOverlay from '@/components/common/LoadingOverlay'

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const { colors } = useContext(ConfigContext)

  const pageBgColor = colors?.dashboard?.background?.page ?? '#e6f1ee'

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [loading, user, router])

  if (loading || (!user && typeof window !== 'undefined')) {
    return <LoadingOverlay />
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: pageBgColor }}>
      <Header />
      <main className="flex-1">
        <DashboardWrapper />
      </main>
      <Footer />
    </div>
  )
}
