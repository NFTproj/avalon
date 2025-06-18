'use client'

import MainLayout from '@/components/layout/MainLayout'
import { useEffect, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import DashboardWrapper from '@/app/dashboard/components/DashboardWrapper'
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
    <MainLayout>
      <div
        className="flex flex-col min-h-screen"
        style={{ backgroundColor: pageBgColor }}
      >
        <main className="flex-1">
          <DashboardWrapper />
        </main>
      </div>
    </MainLayout>
  )
}
