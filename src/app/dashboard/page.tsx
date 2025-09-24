'use client'

import MainLayout from '@/components/layout/MainLayout'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import DashboardWrapper from '@/app/dashboard/components/DashboardWrapper'
import LoadingOverlay from '@/components/common/LoadingOverlay'

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

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
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">
          <DashboardWrapper />
        </main>
      </div>
    </MainLayout>
  )
}
