'use client'

import { useContext } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'
import { useAuth } from '@/contexts/AuthContext'
import CustomButton from '@/components/core/Buttons/CustomButton'
import { FaEye, FaPlus } from 'react-icons/fa'
import { KycContainer } from '@/components/common/FormsBackground'
import { useRouter } from 'next/navigation'


export default function DashboardComponent() {
  const { colors, texts } = useContext(ConfigContext)
  const { user, logout } = useAuth()
  const router = useRouter()
  
  const adminTexts = (texts as any)?.admin
  const getAdminText = (key: string, fallback: string) => {
    const keys = key.split('.')
    let value = adminTexts
    for (const k of keys) {
      value = value?.[k]
    }
    return value || fallback
  }
  

  
  // Debug: verificar se as traduções estão carregando
  console.log('Admin texts:', adminTexts)
  console.log('All texts:', texts)

  // Dados mockados para o dashboard
  const dashboardData = {
    tokensCriados: 120,
    kycsAprovados: 85,
    tokensRecentes: [
      { nome: 'Token Fazenda Eliane (TBIO1)', status: 'active', cor: 'bg-blue-100 text-blue-800' },
      { nome: 'Token Fazenda Eliane (TBIO1)', status: 'pending', cor: 'bg-orange-100 text-orange-800' },
      { nome: 'Token Fazenda Eliane (TBIO1)', status: 'inactive', cor: 'bg-red-100 text-red-800' }
    ],
    kycsRecentes: [
      { nome: 'João Carlos', status: 'approved' },
      { nome: 'Miguel Souza Santos', status: 'approved' },
      { nome: 'Mario Fernandes', status: 'approved' }
    ]
  }

  return (
    <KycContainer className="min-h-screen w-full max-w-none">
      <div className="w-full mx-auto py-8 px-4">
          <div className="flex justify-center items-center mb-12">
            <h1 className="text-3xl font-bold text-black text-center">{getAdminText('dashboard.title', 'Área do Administrador')}</h1>
          </div>

        {/* Métricas principais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Tokens Criados */}
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <h3 className="text-lg font-bold text-black mb-4">{getAdminText('dashboard.metrics.total-tokens', 'Tokens Criados')}</h3>
            <p className="text-4xl font-bold text-black">{dashboardData.tokensCriados}</p>
          </div>

          {/* KYCs Aprovados */}
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <h3 className="text-lg font-bold text-black mb-4">{getAdminText('dashboard.metrics.pending-kyc', 'KYCs Aprovados')}</h3>
            <p className="text-4xl font-bold text-black">{dashboardData.kycsAprovados}</p>
          </div>

          {/* Criar Novo Token */}
          <div className="bg-white rounded-xl p-8 shadow-sm flex items-center justify-center">
            <CustomButton
              text={getAdminText('dashboard.create-token-button', '+ Criar Novo Token')}
              onClick={() => {
                console.log('Criar novo token')
                router.push('/admin?page=criartokens')
              }}
              className="w-full h-16 text-lg font-semibold hover:opacity-90 transition-opacity duration-200"
              color={colors?.buttons['button-primary'] || '#3b82f6'}
              textColor="white"
            />
          </div>
        </div>

                {/* Atividades recentes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tokens Recentes */}
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-black">{getAdminText('dashboard.kycs-tokens.title', 'Tokens Recentes')}</h3>
              <button 
                onClick={() => console.log('Ver todos os tokens')}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm transition-colors duration-200"
              >
                <FaEye className="w-4 h-4" />
                {getAdminText('dashboard.recent-tokens.view-all', 'Ver Todos')}
              </button>
            </div>
            <div className="space-y-4">
              {dashboardData.tokensRecentes.map((token, index) => (
                <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">{token.nome}</span>
                  <span className={`px-3 py-2 rounded-full text-xs font-medium ${token.cor}`}>
                    {getAdminText(`dashboard.token-status.${token.status}`, token.status)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* KYCs Recentes */}
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-black">{getAdminText('dashboard.recent-kycs.title', 'KYCs Recentes')}</h3>
              <button 
                onClick={() => console.log('Ver todos os KYCs')}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm transition-colors duration-200"
              >
                <FaEye className="w-4 h-4" />
                {getAdminText('dashboard.recent-kycs.view-all', 'Ver Todos')}
              </button>
            </div>
            <div className="space-y-4">
              {dashboardData.kycsRecentes.map((kyc, index) => (
                <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">{kyc.nome}</span>
                  <span className="px-3 py-2 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {getAdminText(`dashboard.kyc-status.${kyc.status}`, kyc.status)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        </div>
      </KycContainer>
  )
}
