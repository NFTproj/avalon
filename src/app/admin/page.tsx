'use client'

import React from 'react'
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
import CreateSuccessComponent from './components/createtoken/CreateSuccess'
import CreateErrorComponent from './components/createtoken/CreateError'
import EditTokenComponent from './components/EditToken'

function AdminContent() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const page = searchParams.get('page')

  // Mock de usuário admin para desenvolvimento (verifica sessionStorage)
  // Usar useState para evitar problemas de hidratação
  const [isAdminMock, setIsAdminMock] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      const adminMockValue = sessionStorage.getItem('adminMock') === 'true'
      setIsAdminMock(adminMockValue)
    }
  }, [])

  const adminMockUser =
    isAdminMock && mounted
      ? {
          id: 'admin-1',
          userId: 'admin-1',
          name: 'Administrador',
          email: 'admin@admin',
          walletAddress:
            '0x0000000000000000000000000000000000000000' as `0x${string}`,
          kycStatus: 'approved' as const,
          kycStatusCode: 200,
          permissions: ['admin', 'create_tokens', 'manage_users'],
          balances: [],
        }
      : null

  // Usar mock admin se disponível, senão usar user do AuthContext
  const currentUser = adminMockUser || user

  // Se não há usuário logado, mostrar login
  if (!currentUser) {
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
    case 'success':
      return <CreateSuccessComponent />
    case 'error':
      return <CreateErrorComponent />
    case 'edittoken':
      return <EditTokenComponent />
    case 'dashboard':
    default:
      return <DashboardComponent />
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
