'use client'

import { ConfigProvider } from '@/contexts/ConfigContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { useAuth } from '@/contexts/AuthContext'
import { useSearchParams } from 'next/navigation'
import LoginComponent from './components/login'
import DashboardComponent from './components/dashboard'
import CriarTokensComponent from './components/createtoken/home'
import CreateStep1Component from './components/createtoken/CreateStep1'
import CreateStep2Component from './components/createtoken/CreateStep2'
import CreateStep3Component from './components/createtoken/CreateStep3'
import CreateStep4Component from './components/createtoken/CreateStep4'
import MainLayout from '@/components/layout/MainLayout'

function AdminContent() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const page = searchParams.get('page')

  // Se não há usuário logado, mostrar login
  if (!user) {
    return <LoginComponent />
  }

  // Se há usuário logado, mostrar conteúdo baseado na página
  switch (page) {
    case 'criartokens':
      return <CriarTokensComponent />
    case 'createstep1':
      return <CreateStep1Component />
    case 'createstep2':
      return <CreateStep2Component />
    case 'createstep3':
      return <CreateStep3Component />
    case 'createstep4':
      return <CreateStep4Component />
    case 'dashboard':
    default:
      return (
        <MainLayout>
          <DashboardComponent />
        </MainLayout>
      )
  }
}

export default function AdminPage() {
  return (
    <ConfigProvider config={null}>
      <AuthProvider>
        <AdminContent />
      </AuthProvider>
    </ConfigProvider>
  )
}
