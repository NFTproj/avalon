'use client'

import { useContext } from 'react'
import Header from '@/components/landingPage/Header'
import Footer from '@/components/common/footer'
import DashboardWrapper from '@/components/dashboard/DashboardWrapper'
import { ConfigContext } from '@/contexts/ConfigContext'

export default function DashboardPage() {
  const { colors } = useContext(ConfigContext)

  const pageBgColor = colors?.dashboard?.background?.page ?? '#e6f1ee'

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ backgroundColor: pageBgColor }}
    >
      <Header />
      <main className="flex-1">
        <DashboardWrapper />
      </main>
      <Footer />
    </div>
  )
}
