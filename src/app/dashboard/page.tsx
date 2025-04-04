'use client'

import Header from '@/components/landingPage/Header'
import Footer from '@/components/commom/footer'
import DashboardWrapper from '@/components/dashboard/DashboardWrapper'

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <DashboardWrapper />
      </main>
      <Footer />
    </div>
  )
}
