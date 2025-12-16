'use client'

import { useContext, useState, useEffect, useCallback } from 'react'
import { ConfigContext } from '@/contexts/ConfigContext'
import { useAuth } from '@/contexts/AuthContext'
import CustomButton from '@/components/core/Buttons/CustomButton'
import { FaEye, FaPlus, FaSync } from 'react-icons/fa'
import { useRouter, useSearchParams } from 'next/navigation'
import { getAllCards, Card } from '@/lib/api/cards'
import Header from '@/components/landingPage/Header'
import Footer from '@/components/common/footer'
import AllTokensModal from './AllTokensModal'

export default function DashboardComponent() {
  const { colors, texts } = useContext(ConfigContext)
  const { user, logout } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const adminTexts = (texts as any)?.admin
  const getAdminText = (key: string, fallback: string) => {
    const keys = key.split('.')
    let value = adminTexts
    for (const k of keys) {
      value = value?.[k]
    }
    return value || fallback
  }

  // Estados para dados reais de tokens
  const [tokens, setTokens] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [totalTokens, setTotalTokens] = useState(0)
  const [isAllTokensModalOpen, setIsAllTokensModalOpen] = useState(false)

  // Função para buscar tokens (reutilizável)
  const fetchTokens = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getAllCards()

      if (response.data && Array.isArray(response.data)) {
        // Ordenar por data de criação (mais recentes primeiro)
        const sortedTokens = [...response.data].sort((a, b) => {
          const dateA = new Date(a.createdAt || a.updatedAt || 0).getTime()
          const dateB = new Date(b.createdAt || b.updatedAt || 0).getTime()
          return dateB - dateA
        })

        // Pegar apenas os 5 mais recentes e marcar como ativo
        const recentTokens = sortedTokens.slice(0, 5).map((token) => ({
          ...token,
          status: 'active', // Marcar todos os recentes como ativo
        }))

        setTokens(recentTokens)
        setTotalTokens(response.meta?.totalItems || response.data.length)
      }
    } catch (error) {
      console.error('Erro ao buscar tokens:', error)
      setTokens([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Buscar tokens quando o componente monta ou quando a página/refresh muda
  useEffect(() => {
    fetchTokens()
  }, [fetchTokens, searchParams.get('page'), searchParams.get('refresh')])

  // Dados mockados apenas para KYCs (mantido)
  const dashboardData = {
    kycsAprovados: 85,
    kycsRecentes: [
      { nome: 'João Carlos', status: 'approved' },
      { nome: 'Miguel Souza Santos', status: 'approved' },
      { nome: 'Mario Fernandes', status: 'approved' },
    ],
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-blue-50 py-8 px-4">
        <div className="w-full mx-auto max-w-7xl">
          <div className="flex justify-center items-center mb-12">
            <h1 className="text-3xl font-bold text-black text-center">
              {getAdminText('dashboard.title', 'Área do Administrador')}
            </h1>
          </div>

          {/* Métricas principais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Tokens Criados */}
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h3 className="text-lg font-bold text-black mb-4">
                {getAdminText(
                  'dashboard.metrics.total-tokens',
                  'Tokens Criados',
                )}
              </h3>
              {loading ? (
                <p className="text-4xl font-bold text-gray-400">...</p>
              ) : (
                <p className="text-4xl font-bold text-black">{totalTokens}</p>
              )}
            </div>

            {/* KYCs Aprovados */}
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h3 className="text-lg font-bold text-black mb-4">
                {getAdminText(
                  'dashboard.metrics.pending-kyc',
                  'KYCs Aprovados',
                )}
              </h3>
              <p className="text-4xl font-bold text-black">
                {dashboardData.kycsAprovados}
              </p>
            </div>

            {/* Criar Novo Token */}
            <div className="bg-white rounded-xl p-8 shadow-sm flex items-center justify-center">
              <CustomButton
                text={getAdminText(
                  'dashboard.create-token-button',
                  '+ Criar Novo Token',
                )}
                onClick={() => {
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
                <h3 className="text-lg font-bold text-black">
                  {getAdminText(
                    'dashboard.kycs-tokens.title',
                    'Tokens Recentes',
                  )}
                </h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => fetchTokens()}
                    disabled={loading}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm transition-colors duration-200 disabled:opacity-50 cursor-pointer"
                    title="Atualizar lista"
                  >
                    <FaSync
                      className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                    />
                  </button>
                  <button
                    onClick={() => setIsAllTokensModalOpen(true)}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm transition-colors duration-200 cursor-pointer"
                  >
                    <FaEye className="w-4 h-4" />
                    {getAdminText(
                      'dashboard.recent-tokens.view-all',
                      'Ver Todos',
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8 text-gray-500">
                    {getAdminText('dashboard.loading', 'Carregando...')}
                  </div>
                ) : tokens.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {getAdminText(
                      'dashboard.no-tokens',
                      'Nenhum token criado ainda',
                    )}
                  </div>
                ) : (
                  tokens.map((token) => (
                    <div
                      key={token.id}
                      className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-gray-700 block truncate">
                          {token.name}
                          {token.ticker && ` (${token.ticker})`}
                        </span>
                        {token.description && (
                          <span className="text-xs text-gray-500 block truncate mt-1">
                            {token.description}
                          </span>
                        )}
                      </div>
                      <span className="px-3 py-2 rounded-full text-xs font-medium ml-4 flex-shrink-0 bg-blue-100 text-blue-800">
                        {getAdminText('dashboard.token-status.active', 'Ativo')}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* KYCs Recentes */}
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-black">
                  {getAdminText('dashboard.recent-kycs.title', 'KYCs Recentes')}
                </h3>
                <button
                  onClick={() => console.log('Ver todos os KYCs')}
                  className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm transition-colors duration-200 cursor-pointer"
                >
                  <FaEye className="w-4 h-4" />
                  {getAdminText('dashboard.recent-kycs.view-all', 'Ver Todos')}
                </button>
              </div>
              <div className="space-y-4">
                {dashboardData.kycsRecentes.map((kyc, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm text-gray-700">{kyc.nome}</span>
                    <span className="px-3 py-2 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getAdminText(
                        `dashboard.kyc-status.${kyc.status}`,
                        kyc.status,
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Modal de Todos os Tokens */}
      <AllTokensModal
        isOpen={isAllTokensModalOpen}
        onClose={() => setIsAllTokensModalOpen(false)}
      />
    </div>
  )
}
